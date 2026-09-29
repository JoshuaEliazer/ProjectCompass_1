import { NextResponse } from "next/server";
import { prisma } from "@/infrastructure/db/client";
import { getSessionUser } from "@/infrastructure/auth";
import { analyzeProjectUnderstanding } from "@/core/use-cases/understanding";
import * as path from "path";

// Helper to detect language from file extension
function detectLanguageFromExt(fileName: string): string | null {
    const ext = path.extname(fileName).toLowerCase();
    const lName = fileName.toLowerCase();

    if (lName === "dockerfile") return "Docker";
    if (lName === "makefile") return "Makefile";

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
        case ".htm":
            return "HTML";
        case ".css":
        case ".scss":
            return "CSS";
        case ".json":
            return "JSON";
        case ".yaml":
        case ".yml":
            return "YAML";
        case ".sql":
            return "SQL";
        default:
            return null;
    }
}

export async function GET() {
    try {
        let user = await getSessionUser();
        if (!user) {
            user = await prisma.user.findFirst({
                where: { email: "student@projectcompass.io" },
            });
        }

        if (!user) {
            return NextResponse.json({ projects: [] });
        }

        const rawAnalyses = await prisma.repoAnalysis.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: "desc" },
            include: {
                modules: {
                    include: {
                        functions: true,
                    },
                },
            },
        });

        const projects = rawAnalyses.map((analysis) => {
            let architectureText = analysis.architecture || "";
            let detectedTechnologies: string[] = [];
            let detectedEntryPoint: string | null = null;
            let understanding: any = null;

            if (analysis.architecture) {
                try {
                    const parsed = JSON.parse(analysis.architecture);
                    if (parsed && typeof parsed === "object") {
                        architectureText = parsed.architectureText || analysis.architecture;
                        detectedTechnologies = parsed.detectedTechnologies || [];
                        detectedEntryPoint = parsed.detectedEntryPoint || null;
                        understanding = parsed.understanding || null;
                    }
                } catch {
                    architectureText = analysis.architecture;
                }
            }

            const fileModules = analysis.modules.filter((m) => m.fileType === "file");
            const dirModules = analysis.modules.filter((m) => m.fileType === "directory");

            const languagesSet = new Set<string>();
            fileModules.forEach((m) => {
                const lang = detectLanguageFromExt(m.fileName);
                if (lang) languagesSet.add(lang);
            });
            const languages = Array.from(languagesSet);

            // Compute function count
            let functionCount = 0;
            analysis.modules.forEach((m) => {
                functionCount += m.functions.length;
            });

            // Entry point display fallback
            if (!detectedEntryPoint) {
                const startingMod = fileModules.find((m) => m.startingPoint);
                if (startingMod) {
                    detectedEntryPoint = startingMod.filePath;
                } else if (fileModules.length > 0) {
                    detectedEntryPoint = fileModules[0].filePath;
                }
            }

            // Technologies fallback
            if (!detectedTechnologies || detectedTechnologies.length === 0) {
                detectedTechnologies = languages.length > 0 ? languages : ["Software Project"];
            }

            return {
                id: analysis.id,
                repoName: analysis.repoName,
                createdAt: analysis.createdAt,
                updatedAt: analysis.updatedAt,
                architectureText,
                detectedTechnologies,
                detectedEntryPoint,
                languages,
                fileCount: fileModules.length,
                moduleCount: dirModules.length > 0 ? dirModules.length : Math.ceil(fileModules.length / 4),
                functionCount,
                status: "Analyzed",
            };
        });

        return NextResponse.json({ projects });
    } catch (error: any) {
        console.error("Fetch projects API error:", error);
        return NextResponse.json(
            { error: "Failed to fetch projects", details: error.message },
            { status: 500 }
        );
    }
}
