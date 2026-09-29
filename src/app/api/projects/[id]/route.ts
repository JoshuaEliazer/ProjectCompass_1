import { NextResponse } from "next/server";
import { prisma } from "@/infrastructure/db/client";
import { getSessionUser } from "@/infrastructure/auth";
import { analyzeProjectUnderstanding } from "@/core/use-cases/understanding";
import * as path from "path";

function detectLanguageFromExt(fileName: string): string | null {
    const ext = path.extname(fileName).toLowerCase();
    switch (ext) {
        case ".js":
        case ".jsx":
            return "JavaScript";
        case ".ts":
        case ".tsx":
            return "TypeScript";
        case ".py":
            return "Python";
        case ".java":
            return "Java";
        case ".go":
            return "Go";
        case ".c":
        case ".h":
            return "C";
        case ".cpp":
        case ".hpp":
            return "C++";
        case ".cs":
            return "C#";
        case ".rb":
            return "Ruby";
        case ".php":
            return "PHP";
        case ".html":
            return "HTML";
        case ".css":
            return "CSS";
        default:
            return null;
    }
}

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        let user = await getSessionUser();
        if (!user) {
            user = await prisma.user.findFirst({
                where: { email: "student@projectcompass.io" },
            });
        }

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const rawAnalysis = await prisma.repoAnalysis.findFirst({
            where: {
                id,
                userId: user.id,
            },
            include: {
                modules: {
                    include: {
                        functions: true,
                    },
                },
            },
        });

        if (!rawAnalysis) {
            return NextResponse.json({ error: "Project not found" }, { status: 404 });
        }

        let architectureText = rawAnalysis.architecture || "";
        let detectedTechnologies: string[] = [];
        let detectedEntryPoint: string | null = null;
        let understanding: any = null;

        if (rawAnalysis.architecture) {
            try {
                const parsed = JSON.parse(rawAnalysis.architecture);
                if (parsed && typeof parsed === "object") {
                    architectureText = parsed.architectureText || rawAnalysis.architecture;
                    detectedTechnologies = parsed.detectedTechnologies || [];
                    detectedEntryPoint = parsed.detectedEntryPoint || null;
                    understanding = parsed.understanding || null;
                }
            } catch {
                architectureText = rawAnalysis.architecture;
            }
        }

        const fileModules = rawAnalysis.modules.map((m) => ({
            filePath: m.filePath,
            fileName: m.fileName,
            fileType: m.fileType as "file" | "directory",
            summary: m.summary || "",
            codeContent: m.codeContent || undefined,
            functions: m.functions.map((f) => ({
                name: f.name,
                signature: f.signature || undefined,
                docString: f.docString || undefined,
                startLine: f.startLine,
                endLine: f.endLine,
            })),
            startingPoint: m.startingPoint,
        }));

        if (!detectedTechnologies || detectedTechnologies.length === 0) {
            const languagesSet = new Set<string>();
            fileModules.forEach((m) => {
                const lang = detectLanguageFromExt(m.fileName);
                if (lang) languagesSet.add(lang);
            });
            detectedTechnologies = Array.from(languagesSet);
            if (detectedTechnologies.length === 0) detectedTechnologies = ["Software Project"];
        }

        if (!detectedEntryPoint) {
            const startMod = fileModules.find((m) => m.startingPoint);
            detectedEntryPoint = startMod ? startMod.filePath : (fileModules[0]?.filePath || null);
        }

        if (!understanding) {
            understanding = analyzeProjectUnderstanding(
                fileModules,
                detectedTechnologies,
                detectedEntryPoint,
                "Derived from scanned database project analysis"
            );
        }

        return NextResponse.json({
            id: rawAnalysis.id,
            repoName: rawAnalysis.repoName,
            architecture: architectureText,
            dataFlow: rawAnalysis.dataFlow,
            authFlow: rawAnalysis.authFlow,
            apiSummary: rawAnalysis.apiSummary,
            modules: rawAnalysis.modules,
            detectedTechnologies,
            detectedEntryPoint,
            understanding,
            createdAt: rawAnalysis.createdAt,
            updatedAt: rawAnalysis.updatedAt,
        });
    } catch (error: any) {
        console.error("Fetch single project API error:", error);
        return NextResponse.json(
            { error: "Failed to fetch project analysis", details: error.message },
            { status: 500 }
        );
    }
}
