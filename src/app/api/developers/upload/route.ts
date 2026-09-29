import { NextResponse } from "next/server";
import { prisma } from "@/infrastructure/db/client";
import { getSessionUser } from "@/infrastructure/auth";
import { scanDirectory } from "@/core/use-cases/scanner";
import * as path from "path";
import * as fs from "fs";
import * as os from "os";
import AdmZip from "adm-zip";

// Maximum allowed ZIP file size: 50MB
const MAX_FILE_SIZE = 50 * 1024 * 1024;

export async function POST(request: Request) {
    try {
        const contentType = request.headers.get("content-type") || "";
        let targetPath = "";
        let customRepoName: string | undefined = undefined;

        if (contentType.includes("multipart/form-data")) {
            const formData = await request.formData();
            const file = (formData.get("file") || formData.get("zip") || formData.get("archive")) as File | null;

            if (!file) {
                return NextResponse.json(
                    { error: "No file uploaded", details: "Please select a valid .zip project archive to upload." },
                    { status: 400 }
                );
            }

            // Validate file size limit
            if (file.size > MAX_FILE_SIZE) {
                return NextResponse.json(
                    { error: "File too large", details: `Maximum allowed archive size is 50MB. Received ${(file.size / (1024 * 1024)).toFixed(2)}MB.` },
                    { status: 400 }
                );
            }

            // Validate extension
            const fileName = file.name || "project.zip";
            if (!fileName.toLowerCase().endsWith(".zip")) {
                return NextResponse.json(
                    { error: "Invalid File Type", details: "Uploaded file must be a .zip archive." },
                    { status: 400 }
                );
            }

            const arrayBuffer = await file.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            // Validate magic header bytes (PK\x03\x04)
            if (buffer.length < 4 || buffer[0] !== 0x50 || buffer[1] !== 0x4B || buffer[2] !== 0x03 || buffer[3] !== 0x04) {
                return NextResponse.json(
                    { error: "Corrupted ZIP", details: "The uploaded file is not a valid ZIP archive." },
                    { status: 400 }
                );
            }

            // Create temporary working directory safely
            const tempBase = fs.mkdtempSync(path.join(os.tmpdir(), "compass-zip-"));

            let zip: AdmZip;
            try {
                zip = new AdmZip(buffer);
            } catch (err: any) {
                return NextResponse.json(
                    { error: "Extraction Failed", details: `Failed to unpack ZIP archive: ${err.message}` },
                    { status: 400 }
                );
            }

            const zipEntries = zip.getEntries();
            const resolvedTempBase = path.resolve(tempBase);

            for (const entry of zipEntries) {
                const entryName = entry.entryName.replace(/\\/g, "/");

                // Security Check: Path Traversal Prevention (e.g. "../../malicious_file")
                const resolvedEntryPath = path.resolve(resolvedTempBase, entryName);
                if (!resolvedEntryPath.startsWith(resolvedTempBase)) {
                    return NextResponse.json(
                        { error: "Security Violation", details: "ZIP file contains unauthorized path traversal sequences." },
                        { status: 400 }
                    );
                }

                // Security Check: Ignore sensitive configuration / credential files
                const baseName = path.basename(entryName).toLowerCase();
                if (
                    baseName.startsWith(".env") ||
                    baseName.endsWith(".pem") ||
                    baseName.endsWith(".key") ||
                    baseName === "credentials" ||
                    baseName === "secrets" ||
                    baseName === "id_rsa" ||
                    baseName === "id_ed25519"
                ) {
                    console.log(`Security Notice: Skipping extraction of sensitive file: ${entryName}`);
                    continue;
                }

                if (entry.isDirectory) {
                    fs.mkdirSync(resolvedEntryPath, { recursive: true });
                } else {
                    fs.mkdirSync(path.dirname(resolvedEntryPath), { recursive: true });
                    fs.writeFileSync(resolvedEntryPath, entry.getData());
                }
            }

            // Dynamically determine extracted project root
            const extractedItems = fs.readdirSync(resolvedTempBase).filter(
                (name) => name !== "__MACOSX" && name !== ".DS_Store"
            );

            if (
                extractedItems.length === 1 &&
                fs.statSync(path.join(resolvedTempBase, extractedItems[0])).isDirectory()
            ) {
                targetPath = path.join(resolvedTempBase, extractedItems[0]);
            } else {
                targetPath = resolvedTempBase;
            }

            customRepoName = path.basename(fileName, ".zip");

        } else {
            // Local folder path JSON payload fallback (preserve existing functionality)
            const body = await request.json().catch(() => ({}));
            targetPath = body.path || "";

            // Default to mapping current workspace root if empty
            if (!targetPath) {
                targetPath = path.resolve(".");
            }
        }

        console.log(`AST Scanner scanning directory path: ${targetPath}`);
        const scanResult = await scanDirectory(targetPath);

        if (customRepoName) {
            scanResult.repoName = customRepoName;
        }

        // Save scan results to Database
        let user = await getSessionUser();
        if (!user) {
            user = await prisma.user.findFirst({
                where: { email: "student@projectcompass.io" },
            });
        }
        if (!user) {
            user = await prisma.user.create({
                data: {
                    email: "student@projectcompass.io",
                    name: "Mentor Student",
                    role: "DEVELOPER",
                },
            });
        }

        const architectureMetaData = {
            architectureText: scanResult.architecture,
            detectedTechnologies: scanResult.detectedTechnologies,
            detectedEntryPoint: scanResult.detectedEntryPoint,
            understanding: scanResult.understanding,
        };

        const repoAnalysis = await prisma.repoAnalysis.create({
            data: {
                userId: user.id,
                repoName: scanResult.repoName,
                architecture: JSON.stringify(architectureMetaData),
                dataFlow: scanResult.dataFlow,
                authFlow: scanResult.authFlow,
                apiSummary: scanResult.apiSummary,
            },
        });

        for (const mod of scanResult.modules) {
            const dbModule = await prisma.codeModule.create({
                data: {
                    analysisId: repoAnalysis.id,
                    filePath: mod.filePath,
                    fileName: mod.fileName,
                    fileType: mod.fileType,
                    codeContent: mod.codeContent || null,
                    summary: mod.summary,
                    startingPoint: mod.startingPoint,
                },
            });

            if (mod.functions.length > 0) {
                await prisma.functionDefinition.createMany({
                    data: mod.functions.map((fn) => ({
                        moduleId: dbModule.id,
                        name: fn.name,
                        signature: fn.signature || null,
                        docString: fn.docString || null,
                        startLine: fn.startLine,
                        endLine: fn.endLine,
                    })),
                });
            }
        }

        const finalAnalysis = await prisma.repoAnalysis.findUnique({
            where: { id: repoAnalysis.id },
            include: {
                modules: {
                    include: {
                        functions: true,
                    },
                },
            },
        });

        return NextResponse.json({
            ...finalAnalysis,
            understanding: scanResult.understanding,
            detectedTechnologies: scanResult.detectedTechnologies,
            detectedEntryPoint: scanResult.detectedEntryPoint,
        });
    } catch (error: any) {
        console.error("Repository scan failed:", error);
        return NextResponse.json(
            { error: "Scan Failed", details: error.message },
            { status: 500 }
        );
    }
}

