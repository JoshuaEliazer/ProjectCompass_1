import { NextResponse } from "next/server";
import { prisma } from "@/infrastructure/db/client";
import { scanDirectory } from "@/core/use-cases/scanner";
import * as path from "path";

export async function POST(request: Request) {
    try {
        const body = await request.json().catch(() => ({}));
        let targetPath = body.path || "";

        // Default to mapping the current workspace root if no path is passed
        if (!targetPath) {
            targetPath = path.resolve(".");
        }

        console.log(`AST Scanner scanning directory path: ${targetPath}`);
        const scanResult = await scanDirectory(targetPath);

        // Save scan results to Database
        // 1. Create or retrieve default user
        let user = await prisma.user.findFirst({
            where: { email: "student@projectcompass.io" },
        });
        if (!user) {
            user = await prisma.user.create({
                data: {
                    email: "student@projectcompass.io",
                    name: "Mentor Student",
                    role: "DEVELOPER",
                },
            });
        }

        // 2. Insert RepoAnalysis
        const repoAnalysis = await prisma.repoAnalysis.create({
            data: {
                userId: user.id,
                repoName: scanResult.repoName,
                repoUrl: body.repoUrl || null,
                architecture: scanResult.architecture,
                dataFlow: scanResult.dataFlow,
                authFlow: scanResult.authFlow,
                apiSummary: scanResult.apiSummary,
            },
        });

        // 3. Insert Modules & functions in transaction to ensure speed and completeness
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

        // 4. Retrieve complete analysis with relations to output to UI
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

        return NextResponse.json(finalAnalysis);
    } catch (error: any) {
        console.error("Repository scan failed:", error);
        return NextResponse.json(
            { error: "Scan Failed", details: error.message },
            { status: 500 }
        );
    }
}
