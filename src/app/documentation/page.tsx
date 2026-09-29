"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    generateRichFileExplanation,
    generateRichModuleExplanation,
    generateRichProjectOverview,
    generateFunctionExplanation,
} from "@/core/use-cases/explanations";

interface ProjectSummaryItem {
    id: string;
    repoName: string;
    createdAt: string;
}

interface FunctionDef {
    name: string;
    signature?: string;
    docString?: string;
    startLine: number;
    endLine: number;
}

interface CodeModule {
    id: string;
    filePath: string;
    fileName: string;
    fileType: "file" | "directory";
    summary: string | null;
    codeContent: string | null;
    startingPoint: boolean;
    functions: FunctionDef[];
    language?: string;
    category?: string;
    imports?: string[];
}

interface ProjectArea {
    name: string;
    description: string;
    modulePaths: string[];
}

interface ModuleDependency {
    sourcePath: string;
    targetPath: string;
    importSpecifier: string;
    status: "confirmed" | "inferred";
}

interface DetectedApiRoute {
    path: string;
    method?: string;
    handlerFile: string;
    status: "confirmed" | "inferred";
}

interface DatabaseInteraction {
    type: string;
    files: string[];
    evidence: string;
    status: "confirmed" | "inferred";
}

interface AuthInteraction {
    type: string;
    files: string[];
    evidence: string;
    status: "confirmed" | "inferred";
}

interface FrontendBackendLink {
    frontendFile: string;
    apiEndpoint: string;
    status: "confirmed" | "inferred";
}

interface ExternalService {
    name: string;
    files: string[];
    evidence: string;
    status: "confirmed" | "inferred";
}

interface ProjectUnderstanding {
    areas: ProjectArea[];
    dependencies: ModuleDependency[];
    entryWorkflow: {
        entryFile: string | null;
        evidence: string;
        connectedModules: string[];
    };
    apiRoutes: DetectedApiRoute[];
    database: DatabaseInteraction | null;
    authentication: AuthInteraction | null;
    frontendBackendLinks: FrontendBackendLink[];
    externalServices: ExternalService[];
    summary: {
        architectureText: string;
        dataFlowText: string;
        authFlowText: string;
        apiSummaryText: string;
    };
}

interface FullProjectAnalysis {
    id: string;
    repoName: string;
    architecture: string | null;
    dataFlow: string | null;
    authFlow: string | null;
    apiSummary: string | null;
    modules: CodeModule[];
    detectedTechnologies: string[];
    detectedEntryPoint: string | null;
    understanding: ProjectUnderstanding;
    createdAt: string;
    updatedAt: string;
}

export default function DocumentationPage() {
    const router = useRouter();
    const [projectList, setProjectList] = useState<ProjectSummaryItem[]>([]);
    const [selectedProjectId, setSelectedProjectId] = useState<string>("");
    const [analysis, setAnalysis] = useState<FullProjectAnalysis | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [errorText, setErrorText] = useState("");
    const [activeSection, setActiveSection] = useState<string>("overview");

    // Load available projects and initial project analysis
    useEffect(() => {
        async function loadData() {
            try {
                setIsLoading(true);
                setErrorText("");

                // 1. Fetch user projects list
                const listRes = await fetch("/api/projects");
                if (!listRes.ok) {
                    throw new Error("Failed to load project list");
                }
                const listData = await listRes.json();
                const projects: ProjectSummaryItem[] = listData.projects || [];
                setProjectList(projects);

                if (projects.length === 0) {
                    setIsLoading(false);
                    return;
                }

                // 2. Determine target project ID from URL parameter or default to first project
                const searchParams = new URLSearchParams(window.location.search);
                let targetId = searchParams.get("id");
                if (!targetId || !projects.some((p) => p.id === targetId)) {
                    targetId = projects[0].id;
                }

                setSelectedProjectId(targetId);

                // 3. Fetch full project analysis
                const singleRes = await fetch(`/api/projects/${targetId}`);
                if (!singleRes.ok) {
                    throw new Error("Failed to fetch project analysis");
                }
                const singleData: FullProjectAnalysis = await singleRes.json();
                setAnalysis(singleData);
            } catch (err: any) {
                console.error(err);
                setErrorText(err.message || "Failed to load documentation");
            } finally {
                setIsLoading(false);
            }
        }
        loadData();
    }, []);

    // Handle switching project from dropdown
    const handleSelectProject = async (newId: string) => {
        setSelectedProjectId(newId);
        setIsLoading(true);
        setErrorText("");
        router.push(`/documentation?id=${newId}`);

        try {
            const res = await fetch(`/api/projects/${newId}`);
            if (!res.ok) {
                throw new Error("Failed to load project analysis");
            }
            const data: FullProjectAnalysis = await res.json();
            setAnalysis(data);
        } catch (err: any) {
            console.error(err);
            setErrorText(err.message || "Failed to switch project");
        } finally {
            setIsLoading(false);
        }
    };

    // Derived Rich Documentation Content
    const docContent = useMemo(() => {
        if (!analysis) return null;

        const fileModules = analysis.modules.filter((m) => m.fileType === "file");
        const understanding = analysis.understanding;
        const entryPoint = analysis.detectedEntryPoint;
        const technologies = analysis.detectedTechnologies || [];

        // 1. Rich Project Overview
        const entryEvidence = understanding?.entryWorkflow?.evidence || "Static module analysis";
        const richOverview = generateRichProjectOverview(
            understanding,
            fileModules,
            technologies,
            entryPoint,
            entryEvidence
        );

        // 2. Categorized Technologies
        const techCategories = {
            languages: technologies.filter((t) =>
                ["TypeScript", "JavaScript", "Python", "Java", "C++", "C", "C#", "Go", "Rust", "PHP", "Ruby", "Dart", "HTML", "CSS"].includes(t)
            ),
            frameworks: technologies.filter((t) =>
                ["Next.js", "React", "Spring Boot", "Express", "Flask", "FastAPI", "Gin", "Flutter", "Django", "Angular", "Vue"].includes(t)
            ),
            libraries: technologies.filter((t) =>
                ["Tailwind CSS", "Redux", "Prisma", "Hibernate", "Axios", "AdmZip", "ts-morph"].includes(t)
            ),
            database: technologies.filter((t) =>
                ["PostgreSQL", "SQLite", "MongoDB", "MySQL", "Redis", "Cloud Firestore"].includes(t)
            ),
            other: technologies.filter(
                (t) =>
                    !["TypeScript", "JavaScript", "Python", "Java", "C++", "C", "C#", "Go", "Rust", "PHP", "Ruby", "Dart", "HTML", "CSS", "Next.js", "React", "Spring Boot", "Express", "Flask", "FastAPI", "Gin", "Flutter", "Django", "Angular", "Vue", "Tailwind CSS", "Redux", "Prisma", "Hibernate", "Axios", "AdmZip", "ts-morph", "PostgreSQL", "SQLite", "MongoDB", "MySQL", "Redis", "Cloud Firestore"].includes(t)
            ),
        };

        // 3. Rich Module Explanations
        const moduleDocs = (understanding?.areas || []).map((area) => {
            const richMod = generateRichModuleExplanation(
                area,
                fileModules,
                understanding.dependencies,
                understanding.apiRoutes,
                understanding.database,
                understanding.authentication
            );

            const modFiles = fileModules.filter((m) => area.modulePaths.includes(m.filePath));

            // Parsed functions in this module
            const modFunctions: Array<{ name: string; signature?: string; filePath: string }> = [];
            modFiles.forEach((f) => {
                (f.functions || []).forEach((fn) => {
                    modFunctions.push({ name: fn.name, signature: fn.signature, filePath: f.filePath });
                });
            });

            // Connected modules
            const connectedSet = new Set<string>();
            understanding.dependencies.forEach((dep) => {
                if (area.modulePaths.includes(dep.sourcePath) && !area.modulePaths.includes(dep.targetPath)) {
                    connectedSet.add(dep.targetPath);
                }
                if (area.modulePaths.includes(dep.targetPath) && !area.modulePaths.includes(dep.sourcePath)) {
                    connectedSet.add(dep.sourcePath);
                }
            });

            return {
                areaName: area.name,
                description: area.description,
                role: richMod.role,
                explanation: richMod.explanation,
                fitsIntoProject: richMod.fitsIntoProject,
                whatToUnderstand: richMod.whatToUnderstand,
                files: modFiles,
                functions: modFunctions,
                connectedPaths: Array.from(connectedSet),
            };
        });

        // 4. Module Relationships Text Explanation
        let relationshipsText = "";
        if (understanding?.dependencies && understanding.dependencies.length > 0) {
            const relationshipSentences: string[] = [];
            if (entryPoint) {
                relationshipSentences.push(
                    `Application execution originates at the entry point \`${entryPoint}\`, which establishes foundational control flow.`
                );
            }
            if (understanding.areas.length > 0) {
                relationshipSentences.push(
                    `Control and data flow pass sequentially across the ${understanding.areas.length} mapped structural area(s): ${understanding.areas.map((a) => `\`${a.name}\``).join(", ")}.`
                );
            }
            if (understanding.apiRoutes.length > 0) {
                relationshipSentences.push(
                    `Client requests are routed through static API endpoints into target controller handlers.`
                );
            }
            if (understanding.database) {
                relationshipSentences.push(
                    `Data processing layers interface directly with the ${understanding.database.type} storage layer for persistence.`
                );
            }
            relationshipSentences.push(
                `A total of ${understanding.dependencies.length} import dependency link(s) connect internal modules together.`
            );
            relationshipsText = relationshipSentences.join(" ");
        } else {
            relationshipsText = "The codebase consists of decoupled modules with minimal cross-file import dependencies.";
        }

        // 5. Curated Important Files (Top 8 most connected / key role files)
        const sortedFiles = [...fileModules].sort((a, b) => {
            if (a.startingPoint) return -1;
            if (b.startingPoint) return 1;
            const countA = (a.functions?.length || 0) + (a.imports?.length || 0);
            const countB = (b.functions?.length || 0) + (b.imports?.length || 0);
            return countB - countA;
        });

        const importantFiles = sortedFiles.slice(0, 10).map((f) => {
            const richFile = generateRichFileExplanation(
                f,
                fileModules,
                understanding.dependencies,
                understanding.apiRoutes,
                understanding.database,
                understanding.authentication
            );
            return {
                file: f,
                richFile,
            };
        });

        // 6. Curated Important Functions / Classes
        const importantFunctions: Array<{ name: string; signature?: string; filePath: string; startLine: number; endLine: number; explanation: string }> = [];
        fileModules.forEach((f) => {
            (f.functions || []).forEach((fn) => {
                if (importantFunctions.length < 12) {
                    const exp = generateFunctionExplanation(fn, f.fileName);
                    importantFunctions.push({
                        name: fn.name,
                        signature: fn.signature,
                        filePath: f.filePath,
                        startLine: fn.startLine,
                        endLine: fn.endLine,
                        explanation: exp,
                    });
                }
            });
        });

        return {
            richOverview,
            techCategories,
            moduleDocs,
            relationshipsText,
            importantFiles,
            importantFunctions,
            fileModulesCount: fileModules.length,
            totalFunctionsCount: fileModules.reduce((acc, m) => acc + (m.functions?.length || 0), 0),
        };
    }, [analysis]);

    const scrollToSection = (id: string) => {
        setActiveSection(id);
        const elem = document.getElementById(id);
        if (elem) {
            elem.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    };

    return (
        <div
                style={{
                    background: "#ffffff",
                    minHeight: "100vh",
                    color: "#0f172a",
                    padding: "2rem 2rem 4rem 2rem",
                    fontFamily: "var(--font-sans, system-ui, sans-serif)",
                }}
            >
                {/* Header & Control Bar */}
                <div
                    style={{
                        maxWidth: "1200px",
                        margin: "0 auto 2rem auto",
                        paddingBottom: "1.5rem",
                        borderBottom: "1px solid #e2e8f0",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        flexWrap: "wrap",
                        gap: "1rem",
                    }}
                >
                    <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.4rem" }}>
                            <span style={{ fontSize: "1.75rem" }}>📚</span>
                            <h1 style={{ fontSize: "1.875rem", fontWeight: 700, color: "#0f172a", letterSpacing: "-0.02em", margin: 0 }}>
                                Project Documentation
                            </h1>
                        </div>
                        <p style={{ color: "#64748b", fontSize: "0.95rem", margin: 0 }}>
                            Evidence-based architectural documentation generated from codebase static analysis.
                        </p>
                    </div>

                    {/* Controls */}
                    <div style={{ display: "flex", alignItems: "center", gap: "0.85rem", flexWrap: "wrap" }}>
                        {projectList.length > 0 && (
                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                <label htmlFor="doc-project-select" style={{ fontSize: "0.85rem", fontWeight: 600, color: "#64748b" }}>
                                    Project:
                                </label>
                                <select
                                    id="doc-project-select"
                                    value={selectedProjectId}
                                    onChange={(e) => handleSelectProject(e.target.value)}
                                    style={{
                                        background: "#f8fafc",
                                        border: "1px solid #cbd5e1",
                                        borderRadius: "8px",
                                        padding: "0.55rem 1rem",
                                        fontSize: "0.9rem",
                                        fontWeight: 600,
                                        color: "#0f172a",
                                        cursor: "pointer",
                                        outline: "none",
                                    }}
                                >
                                    {projectList.map((p) => (
                                        <option key={p.id} value={p.id}>
                                            {p.repoName}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {analysis && (
                            <Link
                                href={`/developers?id=${analysis.id}`}
                                style={{
                                    background: "#0284c7",
                                    color: "#ffffff",
                                    padding: "0.55rem 1.15rem",
                                    borderRadius: "8px",
                                    fontWeight: 600,
                                    fontSize: "0.875rem",
                                    textDecoration: "none",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "0.4rem",
                                    boxShadow: "0 2px 6px rgba(2, 132, 199, 0.2)",
                                }}
                            >
                                Open Workspace ➔
                            </Link>
                        )}

                        <Link
                            href="/projects"
                            style={{
                                background: "#f1f5f9",
                                color: "#334155",
                                border: "1px solid #cbd5e1",
                                padding: "0.55rem 1.15rem",
                                borderRadius: "8px",
                                fontWeight: 600,
                                fontSize: "0.875rem",
                                textDecoration: "none",
                            }}
                        >
                            Back to Projects
                        </Link>
                    </div>
                </div>

                {/* Main Body */}
                <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
                    {isLoading ? (
                        <div
                            style={{
                                background: "#ffffff",
                                border: "1px solid #e2e8f0",
                                borderRadius: "12px",
                                padding: "4rem 2rem",
                                textAlign: "center",
                                boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
                            }}
                        >
                            <div
                                style={{
                                    width: "36px",
                                    height: "36px",
                                    border: "3px solid #e2e8f0",
                                    borderTopColor: "#0284c7",
                                    borderRadius: "50%",
                                    margin: "0 auto 1.25rem auto",
                                    animation: "spin 0.8s linear infinite",
                                }}
                            />
                            <p style={{ color: "#64748b", fontSize: "0.95rem", fontWeight: 500, margin: 0 }}>
                                Generating comprehensive project documentation...
                            </p>
                            <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                        </div>
                    ) : errorText ? (
                        <div
                            style={{
                                background: "#fef2f2",
                                border: "1px solid #fecaca",
                                borderRadius: "12px",
                                padding: "2rem",
                                color: "#991b1b",
                            }}
                        >
                            <h3 style={{ margin: "0 0 0.5rem 0" }}>Error Loading Documentation</h3>
                            <p style={{ margin: 0 }}>{errorText}</p>
                        </div>
                    ) : projectList.length === 0 ? (
                        /* Empty State: No Projects */
                        <div
                            style={{
                                background: "#ffffff",
                                border: "1px solid #e2e8f0",
                                borderRadius: "12px",
                                padding: "4.5rem 2rem",
                                textAlign: "center",
                                boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
                            }}
                        >
                            <div
                                style={{
                                    width: "64px",
                                    height: "64px",
                                    background: "#f8fafc",
                                    borderRadius: "50%",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: "2rem",
                                    margin: "0 auto 1.25rem auto",
                                    border: "1px solid #e2e8f0",
                                }}
                            >
                                📖
                            </div>
                            <h2 style={{ fontSize: "1.25rem", fontWeight: 600, color: "#0f172a", marginBottom: "0.5rem" }}>
                                No projects have been analyzed yet.
                            </h2>
                            <p style={{ color: "#64748b", fontSize: "0.95rem", maxWidth: "480px", margin: "0 auto 1.75rem auto", lineHeight: "1.5" }}>
                                Upload and analyze a software repository in the Developer Workspace to generate automated, evidence-grounded project documentation.
                            </p>
                            <Link
                                href="/projects"
                                style={{
                                    background: "#0284c7",
                                    color: "#ffffff",
                                    padding: "0.75rem 1.5rem",
                                    borderRadius: "8px",
                                    fontWeight: 600,
                                    fontSize: "0.95rem",
                                    textDecoration: "none",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "0.5rem",
                                }}
                            >
                                Go to Projects
                            </Link>
                        </div>
                    ) : !analysis || !docContent ? (
                        <div
                            style={{
                                background: "#ffffff",
                                border: "1px solid #e2e8f0",
                                borderRadius: "12px",
                                padding: "4rem 2rem",
                                textAlign: "center",
                            }}
                        >
                            <h2 style={{ fontSize: "1.25rem", color: "#0f172a", marginBottom: "0.5rem" }}>No project selected.</h2>
                            <p style={{ color: "#64748b" }}>Select a project from the dropdown above or return to Projects.</p>
                        </div>
                    ) : (
                        /* Documentation Layout: Side Nav + Document Content */
                        <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: "2rem", alignItems: "start" }}>
                            {/* Sticky Table of Contents */}
                            <nav
                                style={{
                                    position: "sticky",
                                    top: "2rem",
                                    background: "#f8fafc",
                                    border: "1px solid #e2e8f0",
                                    borderRadius: "10px",
                                    padding: "1rem 0.85rem",
                                    maxHeight: "calc(100vh - 4rem)",
                                    overflowY: "auto",
                                }}
                            >
                                <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", padding: "0 0.5rem 0.65rem 0.5rem", borderBottom: "1px solid #e2e8f0", marginBottom: "0.5rem" }}>
                                    Documentation Index
                                </div>
                                <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                                    {[
                                        { id: "overview", label: "Project Overview" },
                                        { id: "organization", label: "Project Organization" },
                                        { id: "tech-stack", label: "Technology Stack" },
                                        { id: "entry-point", label: "Entry Point" },
                                        { id: "modules", label: "Project Areas / Modules" },
                                        { id: "relationships", label: "Module Relationships" },
                                        ...(analysis.understanding?.apiRoutes?.length ? [{ id: "api-flow", label: "API & Request Flow" }] : []),
                                        ...(analysis.understanding?.database ? [{ id: "database", label: "Database Architecture" }] : []),
                                        ...(analysis.understanding?.authentication ? [{ id: "auth", label: "Authentication" }] : []),
                                        ...(analysis.understanding?.frontendBackendLinks?.length ? [{ id: "frontend-backend", label: "Frontend / Backend Links" }] : []),
                                        ...(analysis.understanding?.externalServices?.length ? [{ id: "external-services", label: "External Services" }] : []),
                                        { id: "important-files", label: "Important Files" },
                                        { id: "important-functions", label: "Important Functions / Classes" },
                                        { id: "limitations", label: "Analysis Limitations" },
                                    ].map((item) => (
                                        <li key={item.id}>
                                            <button
                                                onClick={() => scrollToSection(item.id)}
                                                style={{
                                                    width: "100%",
                                                    textAlign: "left",
                                                    background: activeSection === item.id ? "#e0f2fe" : "transparent",
                                                    color: activeSection === item.id ? "#0369a1" : "#475569",
                                                    border: "none",
                                                    borderRadius: "6px",
                                                    padding: "0.45rem 0.65rem",
                                                    fontSize: "0.85rem",
                                                    fontWeight: activeSection === item.id ? 600 : 500,
                                                    cursor: "pointer",
                                                    transition: "all 0.15s ease",
                                                }}
                                            >
                                                {item.label}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </nav>

                            {/* Main Document Body */}
                            <main style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>

                                {/* Section 1: Project Overview */}
                                <section id="overview" style={{ scrollMarginTop: "2rem" }}>
                                    <div
                                        style={{
                                            background: "#ffffff",
                                            border: "1px solid #e2e8f0",
                                            borderRadius: "12px",
                                            padding: "2rem",
                                            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
                                        }}
                                    >
                                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
                                            <span style={{ fontSize: "1.25rem" }}>📌</span>
                                            <h2 style={{ fontSize: "1.35rem", fontWeight: 700, color: "#0f172a", margin: 0 }}>
                                                Project Overview
                                            </h2>
                                        </div>

                                        <p style={{ color: "#334155", fontSize: "1rem", lineHeight: "1.7", margin: "0 0 1.25rem 0" }}>
                                            {docContent.richOverview.overviewText}
                                        </p>

                                        {/* Key Metrics Pill Badges */}
                                        <div style={{ display: "flex", gap: "1.25rem", flexWrap: "wrap", paddingTop: "1rem", borderTop: "1px solid #f1f5f9" }}>
                                            <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", padding: "0.6rem 1rem", borderRadius: "8px" }}>
                                                <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 600, display: "block" }}>PROJECT NAME</span>
                                                <strong style={{ fontSize: "0.95rem", color: "#0f172a" }}>{analysis.repoName}</strong>
                                            </div>
                                            <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", padding: "0.6rem 1rem", borderRadius: "8px" }}>
                                                <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 600, display: "block" }}>TOTAL FILES</span>
                                                <strong style={{ fontSize: "0.95rem", color: "#0f172a" }}>{docContent.fileModulesCount} Files</strong>
                                            </div>
                                            <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", padding: "0.6rem 1rem", borderRadius: "8px" }}>
                                                <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 600, display: "block" }}>PARSED FUNCTIONS</span>
                                                <strong style={{ fontSize: "0.95rem", color: "#0f172a" }}>{docContent.totalFunctionsCount} Declaration(s)</strong>
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                {/* Section 2: How the Project Is Organized */}
                                <section id="organization" style={{ scrollMarginTop: "2rem" }}>
                                    <div
                                        style={{
                                            background: "#ffffff",
                                            border: "1px solid #e2e8f0",
                                            borderRadius: "12px",
                                            padding: "2rem",
                                            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
                                        }}
                                    >
                                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
                                            <span style={{ fontSize: "1.25rem" }}>🏗️</span>
                                            <h2 style={{ fontSize: "1.35rem", fontWeight: 700, color: "#0f172a", margin: 0 }}>
                                                How the Project Is Organized
                                            </h2>
                                        </div>
                                        <p style={{ color: "#334155", fontSize: "1rem", lineHeight: "1.7", margin: 0 }}>
                                            {docContent.richOverview.organizationText}
                                        </p>
                                    </div>
                                </section>

                                {/* Section 3: Technology Stack */}
                                <section id="tech-stack" style={{ scrollMarginTop: "2rem" }}>
                                    <div
                                        style={{
                                            background: "#ffffff",
                                            border: "1px solid #e2e8f0",
                                            borderRadius: "12px",
                                            padding: "2rem",
                                            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
                                        }}
                                    >
                                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.25rem" }}>
                                            <span style={{ fontSize: "1.25rem" }}>⚡</span>
                                            <h2 style={{ fontSize: "1.35rem", fontWeight: 700, color: "#0f172a", margin: 0 }}>
                                                Technology Stack
                                            </h2>
                                        </div>

                                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.25rem" }}>
                                            {docContent.techCategories.languages.length > 0 && (
                                                <div style={{ background: "#f8fafc", border: "1px solid #f1f5f9", borderRadius: "8px", padding: "1rem" }}>
                                                    <h4 style={{ margin: "0 0 0.5rem 0", fontSize: "0.85rem", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.04em" }}>Languages</h4>
                                                    <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                                                        {docContent.techCategories.languages.map((l) => (
                                                            <span key={l} style={{ background: "#e0f2fe", color: "#0369a1", padding: "0.25rem 0.6rem", borderRadius: "6px", fontSize: "0.8rem", fontWeight: 600 }}>{l}</span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {docContent.techCategories.frameworks.length > 0 && (
                                                <div style={{ background: "#f8fafc", border: "1px solid #f1f5f9", borderRadius: "8px", padding: "1rem" }}>
                                                    <h4 style={{ margin: "0 0 0.5rem 0", fontSize: "0.85rem", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.04em" }}>Frameworks</h4>
                                                    <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                                                        {docContent.techCategories.frameworks.map((f) => (
                                                            <span key={f} style={{ background: "#f3e8ff", color: "#7e22ce", padding: "0.25rem 0.6rem", borderRadius: "6px", fontSize: "0.8rem", fontWeight: 600 }}>{f}</span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {docContent.techCategories.database.length > 0 && (
                                                <div style={{ background: "#f8fafc", border: "1px solid #f1f5f9", borderRadius: "8px", padding: "1rem" }}>
                                                    <h4 style={{ margin: "0 0 0.5rem 0", fontSize: "0.85rem", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.04em" }}>Database</h4>
                                                    <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                                                        {docContent.techCategories.database.map((d) => (
                                                            <span key={d} style={{ background: "#dcfce7", color: "#15803d", padding: "0.25rem 0.6rem", borderRadius: "6px", fontSize: "0.8rem", fontWeight: 600 }}>{d}</span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {docContent.techCategories.libraries.length > 0 && (
                                                <div style={{ background: "#f8fafc", border: "1px solid #f1f5f9", borderRadius: "8px", padding: "1rem" }}>
                                                    <h4 style={{ margin: "0 0 0.5rem 0", fontSize: "0.85rem", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.04em" }}>Libraries</h4>
                                                    <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                                                        {docContent.techCategories.libraries.map((lib) => (
                                                            <span key={lib} style={{ background: "#f1f5f9", color: "#334155", padding: "0.25rem 0.6rem", borderRadius: "6px", fontSize: "0.8rem", fontWeight: 600 }}>{lib}</span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </section>

                                {/* Section 4: Entry Point */}
                                <section id="entry-point" style={{ scrollMarginTop: "2rem" }}>
                                    <div
                                        style={{
                                            background: "#ffffff",
                                            border: "1px solid #e2e8f0",
                                            borderRadius: "12px",
                                            padding: "2rem",
                                            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
                                        }}
                                    >
                                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
                                            <span style={{ fontSize: "1.25rem" }}>🚀</span>
                                            <h2 style={{ fontSize: "1.35rem", fontWeight: 700, color: "#0f172a", margin: 0 }}>
                                                Entry Point
                                            </h2>
                                        </div>

                                        {analysis.detectedEntryPoint ? (
                                            <div>
                                                <div
                                                    style={{
                                                        background: "#f0f9ff",
                                                        border: "1px solid #bae6fd",
                                                        borderRadius: "8px",
                                                        padding: "0.85rem 1.15rem",
                                                        marginBottom: "1rem",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "space-between",
                                                        flexWrap: "wrap",
                                                        gap: "0.5rem",
                                                    }}
                                                >
                                                    <div>
                                                        <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#0369a1", textTransform: "uppercase", letterSpacing: "0.04em", display: "block" }}>DETECTED ENTRY FILE</span>
                                                        <code style={{ fontSize: "0.95rem", fontWeight: 700, color: "#0c4a6e" }}>{analysis.detectedEntryPoint}</code>
                                                    </div>
                                                    <span style={{ background: "#0284c7", color: "#ffffff", fontSize: "0.75rem", fontWeight: 600, padding: "0.25rem 0.6rem", borderRadius: "12px" }}>Confirmed Entry</span>
                                                </div>

                                                <p style={{ color: "#334155", fontSize: "1rem", lineHeight: "1.7", margin: 0 }}>
                                                    This file acts as the primary execution starting point for the application. Static analysis verified entry indicators ({analysis.understanding?.entryWorkflow?.evidence || "direct starting point marker"}), establishing runtime initialization and delegating execution to downstream application modules.
                                                </p>
                                            </div>
                                        ) : (
                                            <p style={{ color: "#64748b", margin: 0 }}>
                                                Execution is distributed across multiple entry handlers. No single singular entry file was isolated during static scanning.
                                            </p>
                                        )}
                                    </div>
                                </section>

                                {/* Section 5: Project Areas / Modules */}
                                <section id="modules" style={{ scrollMarginTop: "2rem" }}>
                                    <div
                                        style={{
                                            background: "#ffffff",
                                            border: "1px solid #e2e8f0",
                                            borderRadius: "12px",
                                            padding: "2rem",
                                            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
                                        }}
                                    >
                                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.5rem" }}>
                                            <span style={{ fontSize: "1.25rem" }}>📦</span>
                                            <h2 style={{ fontSize: "1.35rem", fontWeight: 700, color: "#0f172a", margin: 0 }}>
                                                Project Areas & Modules
                                            </h2>
                                        </div>

                                        <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
                                            {docContent.moduleDocs.map((mod, index) => (
                                                <div
                                                    key={index}
                                                    style={{
                                                        background: "#fafafa",
                                                        border: "1px solid #e2e8f0",
                                                        borderRadius: "10px",
                                                        padding: "1.5rem",
                                                    }}
                                                >
                                                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem", flexWrap: "wrap", gap: "0.5rem" }}>
                                                        <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "#0f172a", margin: 0 }}>
                                                            {mod.areaName}
                                                        </h3>
                                                        <span style={{ background: "#e2e8f0", color: "#334155", fontSize: "0.75rem", fontWeight: 600, padding: "0.2rem 0.6rem", borderRadius: "12px" }}>
                                                            {mod.files.length} File(s)
                                                        </span>
                                                    </div>

                                                    <p style={{ color: "#334155", fontSize: "0.95rem", lineHeight: "1.65", margin: "0 0 1rem 0" }}>
                                                        {mod.explanation}
                                                    </p>

                                                    {/* Important Files in Module */}
                                                    {mod.files.length > 0 && (
                                                        <div style={{ marginBottom: "0.85rem" }}>
                                                            <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "0.35rem" }}>
                                                                Key Files in this Module
                                                            </div>
                                                            <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                                                                {mod.files.slice(0, 6).map((f) => (
                                                                    <code key={f.filePath} style={{ background: "#ffffff", border: "1px solid #cbd5e1", color: "#334155", padding: "0.2rem 0.5rem", borderRadius: "4px", fontSize: "0.8rem" }}>
                                                                        {f.fileName}
                                                                    </code>
                                                                ))}
                                                                {mod.files.length > 6 && (
                                                                    <span style={{ fontSize: "0.8rem", color: "#64748b", alignSelf: "center" }}>
                                                                        +{mod.files.length - 6} more
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Connected Modules */}
                                                    {mod.connectedPaths.length > 0 && (
                                                        <div>
                                                            <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "0.35rem" }}>
                                                                Interacts With
                                                            </div>
                                                            <div style={{ fontSize: "0.85rem", color: "#0369a1", fontWeight: 500 }}>
                                                                {mod.connectedPaths.slice(0, 4).join(" • ")}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </section>

                                {/* Section 6: Module Relationships */}
                                <section id="relationships" style={{ scrollMarginTop: "2rem" }}>
                                    <div
                                        style={{
                                            background: "#ffffff",
                                            border: "1px solid #e2e8f0",
                                            borderRadius: "12px",
                                            padding: "2rem",
                                            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
                                        }}
                                    >
                                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
                                            <span style={{ fontSize: "1.25rem" }}>🔗</span>
                                            <h2 style={{ fontSize: "1.35rem", fontWeight: 700, color: "#0f172a", margin: 0 }}>
                                                Module Relationships & Import Flow
                                            </h2>
                                        </div>
                                        <p style={{ color: "#334155", fontSize: "1rem", lineHeight: "1.7", margin: 0 }}>
                                            {docContent.relationshipsText}
                                        </p>
                                    </div>
                                </section>

                                {/* Section 7: API / Request Flow (Conditional) */}
                                {analysis.understanding?.apiRoutes && analysis.understanding.apiRoutes.length > 0 && (
                                    <section id="api-flow" style={{ scrollMarginTop: "2rem" }}>
                                        <div
                                            style={{
                                                background: "#ffffff",
                                                border: "1px solid #e2e8f0",
                                                borderRadius: "12px",
                                                padding: "2rem",
                                                boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
                                            }}
                                        >
                                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
                                                <span style={{ fontSize: "1.25rem" }}>🌐</span>
                                                <h2 style={{ fontSize: "1.35rem", fontWeight: 700, color: "#0f172a", margin: 0 }}>
                                                    API & Request Flow
                                                </h2>
                                            </div>

                                            <p style={{ color: "#334155", fontSize: "0.95rem", lineHeight: "1.65", marginBottom: "1.25rem" }}>
                                                Static analysis detected {analysis.understanding.apiRoutes.length} static REST API route endpoint(s). Incoming HTTP requests hit route handlers, which delegate parameters to core business logic functions before returning responses.
                                            </p>

                                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "0.85rem" }}>
                                                {analysis.understanding.apiRoutes.map((r, i) => (
                                                    <div key={i} style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "0.85rem" }}>
                                                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.35rem" }}>
                                                            <span style={{ background: "#0284c7", color: "#ffffff", fontSize: "0.7rem", fontWeight: 700, padding: "0.15rem 0.45rem", borderRadius: "4px" }}>
                                                                {r.method || "API"}
                                                            </span>
                                                            <code style={{ fontSize: "0.85rem", fontWeight: 700, color: "#0f172a" }}>{r.path}</code>
                                                        </div>
                                                        <div style={{ fontSize: "0.775rem", color: "#64748b" }}>
                                                            Handler: <code style={{ color: "#334155" }}>{r.handlerFile}</code>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </section>
                                )}

                                {/* Section 8: Database Architecture (Conditional) */}
                                {analysis.understanding?.database && (
                                    <section id="database" style={{ scrollMarginTop: "2rem" }}>
                                        <div
                                            style={{
                                                background: "#ffffff",
                                                border: "1px solid #e2e8f0",
                                                borderRadius: "12px",
                                                padding: "2rem",
                                                boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
                                            }}
                                        >
                                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
                                                <span style={{ fontSize: "1.25rem" }}>🗄️</span>
                                                <h2 style={{ fontSize: "1.35rem", fontWeight: 700, color: "#0f172a", margin: 0 }}>
                                                    Database Architecture
                                                </h2>
                                            </div>

                                            <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "8px", padding: "1rem", marginBottom: "1rem" }}>
                                                <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#166534", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "0.25rem" }}>
                                                    STORAGE ENGINE DETECTED
                                                </div>
                                                <strong style={{ fontSize: "1.1rem", color: "#14532d" }}>{analysis.understanding.database.type}</strong>
                                                <div style={{ fontSize: "0.85rem", color: "#166534", marginTop: "0.35rem" }}>
                                                    Evidence: {analysis.understanding.database.evidence}
                                                </div>
                                            </div>

                                            <p style={{ color: "#334155", fontSize: "0.95rem", lineHeight: "1.65", margin: 0 }}>
                                                Data persistence files ({analysis.understanding.database.files.join(", ")}) manage relational schemas, entity mapping, and database queries for persistent application storage.
                                            </p>
                                        </div>
                                    </section>
                                )}

                                {/* Section 9: Authentication (Conditional) */}
                                {analysis.understanding?.authentication && (
                                    <section id="auth" style={{ scrollMarginTop: "2rem" }}>
                                        <div
                                            style={{
                                                background: "#ffffff",
                                                border: "1px solid #e2e8f0",
                                                borderRadius: "12px",
                                                padding: "2rem",
                                                boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
                                            }}
                                        >
                                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
                                                <span style={{ fontSize: "1.25rem" }}>🔒</span>
                                                <h2 style={{ fontSize: "1.35rem", fontWeight: 700, color: "#0f172a", margin: 0 }}>
                                                    Authentication & Access Control
                                                </h2>
                                            </div>

                                            <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: "8px", padding: "1rem", marginBottom: "1rem" }}>
                                                <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#92400e", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "0.25rem" }}>
                                                    AUTH MECHANISM DETECTED
                                                </div>
                                                <strong style={{ fontSize: "1.1rem", color: "#78350f" }}>{analysis.understanding.authentication.type}</strong>
                                                <div style={{ fontSize: "0.85rem", color: "#92400e", marginTop: "0.35rem" }}>
                                                    Evidence: {analysis.understanding.authentication.evidence}
                                                </div>
                                            </div>

                                            <p style={{ color: "#334155", fontSize: "0.95rem", lineHeight: "1.65", margin: 0 }}>
                                                Security routines in files ({analysis.understanding.authentication.files.join(", ")}) enforce credential verification, session validation, and protected route access control.
                                            </p>
                                        </div>
                                    </section>
                                )}

                                {/* Section 10: Important Files */}
                                <section id="important-files" style={{ scrollMarginTop: "2rem" }}>
                                    <div
                                        style={{
                                            background: "#ffffff",
                                            border: "1px solid #e2e8f0",
                                            borderRadius: "12px",
                                            padding: "2rem",
                                            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
                                        }}
                                    >
                                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.5rem" }}>
                                            <span style={{ fontSize: "1.25rem" }}>📄</span>
                                            <h2 style={{ fontSize: "1.35rem", fontWeight: 700, color: "#0f172a", margin: 0 }}>
                                                Important Files
                                            </h2>
                                        </div>

                                        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                                            {docContent.importantFiles.map((item, i) => (
                                                <div key={i} style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "1.25rem" }}>
                                                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem", flexWrap: "wrap", gap: "0.5rem" }}>
                                                        <code style={{ fontSize: "0.95rem", fontWeight: 700, color: "#0284c7" }}>{item.file.filePath}</code>
                                                        <span style={{ background: "#e0f2fe", color: "#0369a1", fontSize: "0.75rem", fontWeight: 600, padding: "0.2rem 0.6rem", borderRadius: "12px" }}>
                                                            {item.richFile.role}
                                                        </span>
                                                    </div>
                                                    <p style={{ color: "#334155", fontSize: "0.925rem", lineHeight: "1.6", margin: 0 }}>
                                                        {item.richFile.explanation}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </section>

                                {/* Section 11: Important Functions / Classes */}
                                <section id="important-functions" style={{ scrollMarginTop: "2rem" }}>
                                    <div
                                        style={{
                                            background: "#ffffff",
                                            border: "1px solid #e2e8f0",
                                            borderRadius: "12px",
                                            padding: "2rem",
                                            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
                                        }}
                                    >
                                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.5rem" }}>
                                            <span style={{ fontSize: "1.25rem" }}>⚙️</span>
                                            <h2 style={{ fontSize: "1.35rem", fontWeight: 700, color: "#0f172a", margin: 0 }}>
                                                Important Functions & Classes
                                            </h2>
                                        </div>

                                        {docContent.importantFunctions.length > 0 ? (
                                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1.25rem" }}>
                                                {docContent.importantFunctions.map((fn, i) => (
                                                    <div key={i} style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "1.15rem" }}>
                                                        <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "#0f172a", fontFamily: "monospace", marginBottom: "0.35rem", wordBreak: "break-word" }}>
                                                            {fn.name}{fn.signature ? `(${fn.signature})` : ""}
                                                        </div>
                                                        <div style={{ fontSize: "0.775rem", color: "#64748b", marginBottom: "0.65rem" }}>
                                                            File: <code style={{ color: "#334155" }}>{fn.filePath}</code> (L{fn.startLine}-L{fn.endLine})
                                                        </div>
                                                        <p style={{ color: "#334155", fontSize: "0.875rem", lineHeight: "1.55", margin: 0 }}>
                                                            {fn.explanation}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p style={{ color: "#64748b", margin: 0 }}>No explicit function or class signatures isolated in static analysis.</p>
                                        )}
                                    </div>
                                </section>

                                {/* Section 12: Analysis Limitations */}
                                <section id="limitations" style={{ scrollMarginTop: "2rem" }}>
                                    <div
                                        style={{
                                            background: "#ffffff",
                                            border: "1px solid #e2e8f0",
                                            borderRadius: "12px",
                                            padding: "2rem",
                                            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
                                        }}
                                    >
                                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
                                            <span style={{ fontSize: "1.25rem" }}>⚠️</span>
                                            <h2 style={{ fontSize: "1.35rem", fontWeight: 700, color: "#0f172a", margin: 0 }}>
                                                Analysis Limitations
                                            </h2>
                                        </div>
                                        <p style={{ color: "#334155", fontSize: "0.95rem", lineHeight: "1.65", margin: 0 }}>
                                            Documentation is generated purely from AST static parsing and structural evidence. Dynamic runtime behavior, environment variable evaluation, external network service dependencies, and dynamic dependency injection resolved only at runtime are not included in static analysis.
                                        </p>
                                    </div>
                                </section>

                            </main>
                        </div>
                    )}
                </div>
            </div>
    );
}
