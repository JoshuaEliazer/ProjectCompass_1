"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
    generateRichFileExplanation,
    generateRichModuleExplanation,
    generateFunctionExplanation,
} from "@/core/use-cases/explanations";

interface FunctionDef {
    id?: string;
    name: string;
    signature: string | null;
    docString: string | null;
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

interface RepoAnalysis {
    id: string;
    repoName: string;
    architecture: string | null;
    dataFlow: string | null;
    authFlow: string | null;
    apiSummary: string | null;
    modules: CodeModule[];
    detectedTechnologies?: string[];
    detectedEntryPoint?: string | null;
    understanding?: ProjectUnderstanding;
}

interface GraphNode {
    id: string;
    title: string;
    subtitle: string;
    icon: string;
    badgeColor: string;
    accentColor: string;
    role: string;
    files: string[];
    evidence: string;
    status: "confirmed" | "inferred" | "unknown";
    functions: Array<{ name: string; signature?: string | null; filePath: string; startLine?: number; endLine?: number }>;
    dependsOn: string[];
    usedBy: string[];
    explanation?: string;
    fitsIntoProject?: string;
    whatToUnderstand?: string[];
}

interface GraphEdge {
    fromId: string;
    toId: string;
    label: string;
}

export default function DevelopersDashboard() {
    const [uploadMode, setUploadMode] = useState<"zip" | "path">("zip");
    const [selectedZip, setSelectedZip] = useState<File | null>(null);
    const [scanPath, setScanPath] = useState("");
    const [isScanning, setIsScanning] = useState(false);
    const [analysis, setAnalysis] = useState<RepoAnalysis | null>(null);
    const [selectedModule, setSelectedModule] = useState<CodeModule | null>(null);
    const [selectedGraphNode, setSelectedGraphNode] = useState<GraphNode | null>(null);
    const [activeTab, setActiveTab] = useState<"arch" | "explorer" | "dataflow" | "apis">("arch");
    const [errorText, setErrorText] = useState("");

    useEffect(() => {
        async function loadInitialAnalysis() {
            try {
                if (typeof window === "undefined") return;
                const searchParams = new URLSearchParams(window.location.search);
                const projectId = searchParams.get("id");

                let targetUrl = "";
                if (projectId) {
                    targetUrl = `/api/projects/${projectId}`;
                } else {
                    const listRes = await fetch("/api/projects");
                    if (listRes.ok) {
                        const listData = await listRes.json();
                        if (listData.projects && listData.projects.length > 0) {
                            targetUrl = `/api/projects/${listData.projects[0].id}`;
                        }
                    }
                }

                if (!targetUrl) return;

                setIsScanning(true);
                const res = await fetch(targetUrl);
                if (res.ok) {
                    const data: RepoAnalysis = await res.json();
                    setAnalysis(data);

                    const targetFileParam = searchParams.get("file");
                    const targetModuleParam = searchParams.get("module");

                    if (targetFileParam) {
                        const fileMod = data.modules.find((m: CodeModule) => m.filePath === targetFileParam);
                        if (fileMod) {
                            setSelectedModule(fileMod);
                            setActiveTab("explorer");
                        }
                    } else {
                        const startPoint = data.modules.find((m: CodeModule) => m.startingPoint && m.fileType === "file");
                        if (startPoint) {
                            setSelectedModule(startPoint);
                        } else {
                            const firstFile = data.modules.find((m: CodeModule) => m.fileType === "file");
                            if (firstFile) {
                                setSelectedModule(firstFile);
                            }
                        }
                    }
                }
            } catch (err) {
                console.error("Failed to load initial project analysis:", err);
            } finally {
                setIsScanning(false);
            }
        }
        loadInitialAnalysis();
    }, []);

    // Helper to trigger bookmark creation from Developer Workspace
    const handleBookmarkItem = async (
        type: "FILE" | "MODULE" | "FUNCTION" | "CLASS",
        title: string,
        targetPath: string,
        description?: string
    ) => {
        if (!analysis) return;
        try {
            const res = await fetch("/api/bookmarks", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    analysisId: analysis.id,
                    type,
                    title,
                    targetPath,
                    description: description || `Bookmarked ${type.toLowerCase()} in ${analysis.repoName}`,
                }),
            });
            if (res.ok) {
                const data = await res.json();
                alert(data.message || `Bookmarked "${title}" successfully!`);
            } else {
                const err = await res.json();
                alert(err.details || err.error || "Failed to bookmark item");
            }
        } catch (err: any) {
            alert(err.message || "Failed to create bookmark");
        }
    };

    const triggerScan = async () => {
        setIsScanning(true);
        setErrorText("");
        setAnalysis(null);
        setSelectedModule(null);
        setSelectedGraphNode(null);

        try {
            let res: Response;
            if (uploadMode === "zip") {
                if (!selectedZip) {
                    throw new Error("Please select a .zip project file to upload.");
                }
                const formData = new FormData();
                formData.append("file", selectedZip);
                res = await fetch("/api/developers/upload", {
                    method: "POST",
                    body: formData,
                });
            } else {
                res = await fetch("/api/developers/upload", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ path: scanPath }),
                });
            }

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.details || err.error || "Scan failed.");
            }

            const data: RepoAnalysis = await res.json();
            setAnalysis(data);

            // Select starting point or first file
            const startPoint = data.modules.find((m: CodeModule) => m.startingPoint && m.fileType === "file");
            if (startPoint) {
                setSelectedModule(startPoint);
            } else {
                const firstFile = data.modules.find((m: CodeModule) => m.fileType === "file");
                if (firstFile) {
                    setSelectedModule(firstFile);
                }
            }
        } catch (err: any) {
            console.error(err);
            setErrorText(err.message || "Something went wrong.");
        } finally {
            setIsScanning(false);
        }
    };

    // Dynamically build graph nodes & rich module explanations from evidence
    const graphData = useMemo(() => {
        if (!analysis) return { nodes: [], edges: [], unconfirmedMessage: null };

        const nodes: GraphNode[] = [];
        const edges: GraphEdge[] = [];
        const understanding = analysis.understanding;
        const fileModules = analysis.modules.filter((m) => m.fileType === "file");

        const getFunctionsForFiles = (paths: string[]) => {
            const list: Array<{ name: string; signature?: string | null; filePath: string; startLine?: number; endLine?: number }> = [];
            paths.forEach((p) => {
                const mod = fileModules.find((m) => m.filePath === p);
                if (mod && mod.functions) {
                    mod.functions.forEach((fn) => {
                        list.push({ name: fn.name, signature: fn.signature, filePath: p, startLine: fn.startLine, endLine: fn.endLine });
                    });
                }
            });
            return list;
        };

        const getDepsForFiles = (paths: string[]) => {
            const dependsOnSet = new Set<string>();
            const usedBySet = new Set<string>();

            if (understanding && understanding.dependencies) {
                understanding.dependencies.forEach((dep) => {
                    if (paths.includes(dep.sourcePath)) {
                        dependsOnSet.add(dep.targetPath);
                    }
                    if (paths.includes(dep.targetPath)) {
                        usedBySet.add(dep.sourcePath);
                    }
                });
            }
            return {
                dependsOn: Array.from(dependsOnSet),
                usedBy: Array.from(usedBySet),
            };
        };

        if (understanding && understanding.areas && understanding.areas.length > 0) {
            // 1. Entry Point Node
            if (understanding.entryWorkflow.entryFile) {
                const entryFile = understanding.entryWorkflow.entryFile;
                const { dependsOn, usedBy } = getDepsForFiles([entryFile]);
                const entryMod = fileModules.find((m) => m.filePath === entryFile);
                const richFile = entryMod
                    ? generateRichFileExplanation(
                        entryMod,
                        fileModules,
                        understanding.dependencies,
                        understanding.apiRoutes,
                        understanding.database,
                        understanding.authentication
                    )
                    : null;

                nodes.push({
                    id: "node-entry",
                    title: "Entry Point",
                    subtitle: entryFile,
                    icon: "🚀",
                    badgeColor: "#0284c7",
                    accentColor: "#0284c7",
                    role: "Application Execution Entry Point",
                    files: [entryFile],
                    evidence: understanding.entryWorkflow.evidence,
                    status: "confirmed",
                    functions: getFunctionsForFiles([entryFile]),
                    dependsOn,
                    usedBy,
                    explanation: richFile?.explanation || `Primary entry file initializes execution flow for ${entryFile}.`,
                    fitsIntoProject: richFile?.fitsIntoProject || "Sits at top of execution tree.",
                    whatToUnderstand: richFile?.whatToUnderstand || ["Bootstraps application runtime."],
                });
            }

            // 2. Project Area Nodes
            understanding.areas.forEach((area, index) => {
                if (area.modulePaths.length === 0) return;

                let icon = "📁";
                let badgeColor = "#64748b";
                let accentColor = "#64748b";

                if (area.name.includes("Frontend")) {
                    icon = "🎨";
                    badgeColor = "#0284c7";
                    accentColor = "#0284c7";
                } else if (area.name.includes("Backend") || area.name.includes("API")) {
                    icon = "⚡";
                    badgeColor = "#0284c7";
                    accentColor = "#0284c7";
                } else if (area.name.includes("Business") || area.name.includes("Services")) {
                    icon = "⚙️";
                    badgeColor = "#7c3aed";
                    accentColor = "#7c3aed";
                } else if (area.name.includes("Database") || area.name.includes("Models")) {
                    icon = "🗄️";
                    badgeColor = "#059669";
                    accentColor = "#059669";
                } else if (area.name.includes("Auth") || area.name.includes("Security")) {
                    icon = "🔒";
                    badgeColor = "#d97706";
                    accentColor = "#d97706";
                } else if (area.name.includes("Config")) {
                    icon = "🛠️";
                    badgeColor = "#9333ea";
                    accentColor = "#9333ea";
                }

                const { dependsOn, usedBy } = getDepsForFiles(area.modulePaths);
                const richModule = generateRichModuleExplanation(
                    area,
                    fileModules,
                    understanding.dependencies,
                    understanding.apiRoutes,
                    understanding.database,
                    understanding.authentication
                );

                nodes.push({
                    id: `node-area-${index}`,
                    title: area.name,
                    subtitle: `${area.modulePaths.length} module(s)`,
                    icon,
                    badgeColor,
                    accentColor,
                    role: richModule.role,
                    files: area.modulePaths,
                    evidence: `Group contains ${area.modulePaths.length} module(s) categorized under ${area.name}.`,
                    status: "confirmed",
                    functions: getFunctionsForFiles(area.modulePaths),
                    dependsOn,
                    usedBy,
                    explanation: richModule.explanation,
                    fitsIntoProject: richModule.fitsIntoProject,
                    whatToUnderstand: richModule.whatToUnderstand,
                });
            });

            // 3. Database Engine Node (ONLY if database detected!)
            if (understanding.database) {
                const db = understanding.database;
                nodes.push({
                    id: "node-db",
                    title: "Database Engine",
                    subtitle: db.type,
                    icon: "💾",
                    badgeColor: "#059669",
                    accentColor: "#059669",
                    role: "Persistent Data Storage Engine",
                    files: db.files,
                    evidence: db.evidence,
                    status: db.status,
                    functions: getFunctionsForFiles(db.files),
                    dependsOn: [],
                    usedBy: db.files,
                    explanation: `This component represents the persistent data store (${db.type}). It handles data persistence, record indexing, and transactional queries across ${db.files.length} database model file(s). It is queried by application service modules whenever data needs to be saved or retrieved.`,
                    fitsIntoProject: "Forms the foundational persistence layer at the bottom of the stack.",
                    whatToUnderstand: [
                        `Database type: ${db.type}.`,
                        `Persists application data for ${db.files.length} model entity file(s).`,
                    ],
                });
            }

            // 4. Authentication Node (ONLY if auth detected!)
            if (understanding.authentication) {
                const auth = understanding.authentication;
                nodes.push({
                    id: "node-auth",
                    title: "Authentication Handler",
                    subtitle: auth.type,
                    icon: "🔑",
                    badgeColor: "#d97706",
                    accentColor: "#d97706",
                    role: "Identity Verification & Session Handler",
                    files: auth.files,
                    evidence: auth.evidence,
                    status: auth.status,
                    functions: getFunctionsForFiles(auth.files),
                    dependsOn: [],
                    usedBy: auth.files,
                    explanation: `This component manages user identity and access security (${auth.type}). It verifies credentials, manages session tokens, and guards protected endpoints across ${auth.files.length} security file(s). It ensures only authorized requests can access protected resources.`,
                    fitsIntoProject: "Guards incoming server traffic to enforce user access permissions.",
                    whatToUnderstand: [
                        `Authentication strategy: ${auth.type}.`,
                        "Verifies user credentials and session tokens.",
                    ],
                });
            }

            // 5. External Services Node (ONLY if external services detected!)
            if (understanding.externalServices && understanding.externalServices.length > 0) {
                const extFiles = Array.from(new Set(understanding.externalServices.flatMap((s) => s.files)));
                const serviceNames = understanding.externalServices.map((s) => s.name).join(", ");
                nodes.push({
                    id: "node-ext",
                    title: "External Services",
                    subtitle: serviceNames,
                    icon: "🌐",
                    badgeColor: "#db2777",
                    accentColor: "#db2777",
                    role: "Third-Party APIs & External SDKs",
                    files: extFiles,
                    evidence: `Integrates ${understanding.externalServices.length} external provider(s).`,
                    status: "confirmed",
                    functions: getFunctionsForFiles(extFiles),
                    dependsOn: [],
                    usedBy: extFiles,
                    explanation: `This component represents third-party external services (${serviceNames}). The application communicates with these remote APIs or SDKs across ${extFiles.length} file(s) to extend core capabilities with external integrations.`,
                    fitsIntoProject: "Acts as an outbound gateway connecting the application to third-party APIs.",
                    whatToUnderstand: [
                        `Integrates ${understanding.externalServices.length} third-party service SDK(s).`,
                        `Connected services: ${serviceNames}.`,
                    ],
                });
            }

            // --- BUILD DYNAMIC EDGES FROM EVIDENCE ---
            const entryNode = nodes.find((n) => n.id === "node-entry");
            if (entryNode && understanding.entryWorkflow.connectedModules.length > 0) {
                nodes.forEach((n) => {
                    if (n.id !== "node-entry" && n.files.some((f) => understanding.entryWorkflow.connectedModules.includes(f))) {
                        edges.push({ fromId: "node-entry", toId: n.id, label: "entry point imports" });
                    }
                });
            }

            const frontendNode = nodes.find((n) => n.title.includes("Frontend"));
            const apiNode = nodes.find((n) => n.title.includes("Backend") || n.title.includes("API"));
            if (frontendNode && apiNode && understanding.frontendBackendLinks.length > 0) {
                edges.push({ fromId: frontendNode.id, toId: apiNode.id, label: `HTTP fetch (${understanding.frontendBackendLinks.length} calls)` });
            }

            const serviceNode = nodes.find((n) => n.title.includes("Business") || n.title.includes("Services"));
            if (apiNode && serviceNode && apiNode.id !== serviceNode.id) {
                edges.push({ fromId: apiNode.id, toId: serviceNode.id, label: "calls service logic" });
            }

            const modelNode = nodes.find((n) => n.title.includes("Database & Data Models"));
            if (serviceNode && modelNode && serviceNode.id !== modelNode.id) {
                edges.push({ fromId: serviceNode.id, toId: modelNode.id, label: "queries models" });
            }

            const dbNode = nodes.find((n) => n.id === "node-db");
            if (dbNode) {
                if (modelNode) {
                    edges.push({ fromId: modelNode.id, toId: dbNode.id, label: "persists data" });
                } else if (serviceNode) {
                    edges.push({ fromId: serviceNode.id, toId: dbNode.id, label: "queries database" });
                } else if (apiNode) {
                    edges.push({ fromId: apiNode.id, toId: dbNode.id, label: "direct DB query" });
                }
            }

            const authNode = nodes.find((n) => n.id === "node-auth");
            if (authNode && apiNode) {
                edges.push({ fromId: apiNode.id, toId: authNode.id, label: "authenticates" });
            }

            const extNode = nodes.find((n) => n.id === "node-ext");
            if (extNode) {
                nodes.forEach((n) => {
                    if (n.id !== "node-ext" && n.files.some((f) => extNode.files.includes(f))) {
                        edges.push({ fromId: n.id, toId: extNode.id, label: "integrates API" });
                    }
                });
            }
        } else {
            // Fallback for weakly structured projects
            const dirMap = new Map<string, string[]>();
            fileModules.forEach((m) => {
                const dir = m.filePath.includes("/") ? m.filePath.split("/")[0] : ".";
                if (!dirMap.has(dir)) dirMap.set(dir, []);
                dirMap.get(dir)!.push(m.filePath);
            });

            let idx = 0;
            dirMap.forEach((files, dir) => {
                nodes.push({
                    id: `node-fallback-${idx++}`,
                    title: dir === "." ? "Root Directory" : `${dir}/`,
                    subtitle: `${files.length} file(s)`,
                    icon: "📁",
                    badgeColor: "#0284c7",
                    accentColor: "#0284c7",
                    role: `Directory module container (${dir})`,
                    files,
                    evidence: `Contains ${files.length} module file(s).`,
                    status: "inferred",
                    functions: getFunctionsForFiles(files),
                    dependsOn: [],
                    usedBy: [],
                    explanation: `This directory (${dir}) groups ${files.length} source file(s). It organizes internal components under a common file system path.`,
                    fitsIntoProject: "Acts as a filesystem directory container.",
                    whatToUnderstand: [`Contains ${files.length} file(s).`],
                });
            });
        }

        const unconfirmedMessage =
            edges.length === 0
                ? "Static analysis could not confirm cross-module relationships automatically. Showing isolated detected components."
                : null;

        return { nodes, edges, unconfirmedMessage };
    }, [analysis]);

    // Compute rich file explanation for selected file in File Insights tab
    const selectedFileRichExplanation = useMemo(() => {
        if (!selectedModule || !analysis) return null;
        if (selectedModule.fileType !== "file") return null;

        const understanding = analysis.understanding;
        return generateRichFileExplanation(
            selectedModule,
            analysis.modules,
            understanding?.dependencies || [],
            understanding?.apiRoutes || [],
            understanding?.database || null,
            understanding?.authentication || null
        );
    }, [selectedModule, analysis]);

    return (
        <div style={{ padding: "2rem 1.5rem", display: "flex", flexDirection: "column", gap: "2rem", maxWidth: "1280px", margin: "0 auto", width: "100%" }}>

            {/* Upload Action / Scan Header */}
            <section style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "1.5rem", boxShadow: "0 1px 3px 0 rgba(0,0,0,0.05)", display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div style={{ display: "flex", gap: "1rem", borderBottom: "1px solid #e2e8f0", paddingBottom: "0.75rem" }}>
                    <button
                        onClick={() => setUploadMode("zip")}
                        style={{
                            fontSize: "0.85rem",
                            fontWeight: "600",
                            color: uploadMode === "zip" ? "#0284c7" : "#64748b",
                            borderBottom: uploadMode === "zip" ? "2px solid #0284c7" : "2px solid transparent",
                            paddingBottom: "0.25rem",
                            cursor: "pointer",
                        }}
                    >
                        📦 Upload .ZIP Archive
                    </button>
                    <button
                        onClick={() => setUploadMode("path")}
                        style={{
                            fontSize: "0.85rem",
                            fontWeight: "600",
                            color: uploadMode === "path" ? "#0284c7" : "#64748b",
                            borderBottom: uploadMode === "path" ? "2px solid #0284c7" : "2px solid transparent",
                            paddingBottom: "0.25rem",
                            cursor: "pointer",
                        }}
                    >
                        📁 Local Workspace Path
                    </button>
                </div>

                <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "flex-end" }}>
                    <div style={{ flex: 1, minWidth: "300px" }}>
                        {uploadMode === "zip" ? (
                            <>
                                <label style={{ display: "block", fontSize: "0.85rem", color: "#475569", marginBottom: "0.5rem", fontWeight: "600" }}>
                                    Select Software Project Archive (.zip)
                                </label>
                                <input
                                    type="file"
                                    accept=".zip"
                                    onChange={(e) => setSelectedZip(e.target.files?.[0] || null)}
                                    style={{ width: "100%", padding: "0.6rem 1rem", fontSize: "0.95rem", background: "#ffffff", border: "1px solid #cbd5e1", borderRadius: "6px", color: "#0f172a" }}
                                    disabled={isScanning}
                                />
                            </>
                        ) : (
                            <>
                                <label style={{ display: "block", fontSize: "0.85rem", color: "#475569", marginBottom: "0.5rem", fontWeight: "600" }}>
                                    Local Repository Folder Path (e.g. C:\MyProjects\cool-app)
                                </label>
                                <input
                                    type="text"
                                    placeholder="Leave blank to analyze Project Compass workspace itself..."
                                    value={scanPath}
                                    onChange={(e) => setScanPath(e.target.value)}
                                    style={{ width: "100%", padding: "0.75rem 1rem", fontSize: "0.95rem", background: "#ffffff", border: "1px solid #cbd5e1", borderRadius: "6px", color: "#0f172a" }}
                                    disabled={isScanning}
                                />
                            </>
                        )}
                    </div>
                    <button
                        onClick={triggerScan}
                        disabled={isScanning}
                        style={{
                            background: "linear-gradient(135deg, #0284c7, #0891b2)",
                            color: "#ffffff",
                            padding: "0.8rem 1.8rem",
                            borderRadius: "6px",
                            fontWeight: "600",
                            fontSize: "0.95rem",
                            boxShadow: isScanning ? "none" : "0 2px 4px rgba(0,0,0,0.1)",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                            opacity: isScanning ? 0.7 : 1,
                            cursor: isScanning ? "not-allowed" : "pointer",
                        }}
                    >
                        {isScanning ? (
                            <>
                                <svg className="spinning" style={{ animation: "spin 1s linear infinite" }} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="2" x2="12" y2="6" /><line x1="12" y1="18" x2="12" y2="22" /><line x1="4.93" y1="4.93" x2="7.76" y2="7.76" /><line x1="16.24" y1="16.24" x2="19.07" y2="19.07" /><line x1="2" y1="12" x2="6" y2="12" /><line x1="18" y1="12" x2="22" y2="12" /><line x1="4.93" y1="19.07" x2="7.76" y2="16.24" /><line x1="16.24" y1="7.76" x2="19.07" y2="4.93" /></svg>
                                Extracting & Scanning...
                            </>
                        ) : (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>
                                Trace Codebase
                            </>
                        )}
                    </button>
                </div>
            </section>

            {errorText && (
                <div style={{ padding: "1.25rem", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "8px", color: "#dc2626" }}>
                    <strong>Scan Failed:</strong> {errorText}
                </div>
            )}

            {/* Workspace Main Grid */}
            {analysis ? (
                <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: "2rem" }}>

                    {/* Left sidebar: File Tree Explorer */}
                    <aside style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "1.25rem", boxShadow: "0 1px 3px 0 rgba(0,0,0,0.05)", display: "flex", flexDirection: "column", gap: "1.25rem", height: "fit-content" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #e2e8f0", paddingBottom: "0.5rem" }}>
                            <h3 style={{ fontSize: "1.05rem", color: "#0f172a", fontWeight: "700" }}>File Explorer</h3>
                            <span style={{ fontSize: "0.75rem", background: "#f1f5f9", color: "#475569", border: "1px solid #e2e8f0", padding: "0.15rem 0.55rem", borderRadius: "12px" }}>
                                {analysis.modules.length} items
                            </span>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem", maxHeight: "550px", overflowY: "auto", paddingRight: "0.25rem" }}>
                            {analysis.modules.map((mod) => {
                                const isSelected = selectedModule?.filePath === mod.filePath;
                                return (
                                    <button
                                        key={mod.id || mod.filePath}
                                        onClick={() => {
                                            setSelectedModule(mod);
                                            setActiveTab("explorer");
                                        }}
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "0.5rem",
                                            padding: "0.55rem 0.75rem",
                                            borderRadius: "6px",
                                            fontSize: "0.85rem",
                                            width: "100%",
                                            textAlign: "left",
                                            background: isSelected ? "#f0f9ff" : "transparent",
                                            border: isSelected ? "1px solid #bae6fd" : "1px solid transparent",
                                            color: isSelected ? "#0284c7" : "#334155",
                                            transition: "all 0.15s ease",
                                            cursor: "pointer",
                                        }}
                                    >
                                        {mod.fileType === "directory" ? (
                                            <svg style={{ color: "#7c3aed", flexShrink: 0 }} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /></svg>
                                        ) : (
                                            <svg style={{ color: "#64748b", flexShrink: 0 }} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                                        )}

                                        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                            {mod.filePath}
                                        </span>

                                        {mod.startingPoint && (
                                            <span style={{ fontSize: "0.65rem", background: "#f5f3ff", color: "#7c3aed", border: "1px solid #ddd6fe", padding: "0.05rem 0.3rem", borderRadius: "4px", marginLeft: "auto", flexShrink: 0, fontWeight: "600" }}>
                                                Start
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </aside>

                    {/* Right main workspace layout */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

                        {/* Tabs controls */}
                        <div style={{ display: "flex", borderBottom: "1px solid #e2e8f0", gap: "0.5rem" }}>
                            <button
                                onClick={() => setActiveTab("arch")}
                                style={{
                                    padding: "0.75rem 1.25rem",
                                    borderBottom: activeTab === "arch" ? "2px solid #0284c7" : "2px solid transparent",
                                    color: activeTab === "arch" ? "#0284c7" : "#64748b",
                                    fontSize: "0.95rem",
                                    fontWeight: "600",
                                    cursor: "pointer",
                                }}
                            >
                                Architecture Map
                            </button>
                            <button
                                onClick={() => setActiveTab("explorer")}
                                style={{
                                    padding: "0.75rem 1.25rem",
                                    borderBottom: activeTab === "explorer" ? "2px solid #0284c7" : "2px solid transparent",
                                    color: activeTab === "explorer" ? "#0284c7" : "#64748b",
                                    fontSize: "0.95rem",
                                    fontWeight: "600",
                                    cursor: "pointer",
                                }}
                            >
                                File Insights
                            </button>
                            <button
                                onClick={() => setActiveTab("dataflow")}
                                style={{
                                    padding: "0.75rem 1.25rem",
                                    borderBottom: activeTab === "dataflow" ? "2px solid #0284c7" : "2px solid transparent",
                                    color: activeTab === "dataflow" ? "#0284c7" : "#64748b",
                                    fontSize: "0.95rem",
                                    fontWeight: "600",
                                    cursor: "pointer",
                                }}
                            >
                                Data Flows
                            </button>
                            <button
                                onClick={() => setActiveTab("apis")}
                                style={{
                                    padding: "0.75rem 1.25rem",
                                    borderBottom: activeTab === "apis" ? "2px solid #0284c7" : "2px solid transparent",
                                    color: activeTab === "apis" ? "#0284c7" : "#64748b",
                                    fontSize: "0.95rem",
                                    fontWeight: "600",
                                    cursor: "pointer",
                                }}
                            >
                                APIs Scan
                            </button>
                        </div>

                        {/* Tab Content rendering */}
                        <div style={{ flex: 1, minHeight: "450px" }}>

                            {/* 1. Architecture Map tab */}
                            {activeTab === "arch" && (
                                <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>

                                    {/* Project Overview Card (White Card, Clear Hierarchy) */}
                                    <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "1.75rem", boxShadow: "0 1px 3px 0 rgba(0,0,0,0.05)" }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem", marginBottom: "1.25rem", borderBottom: "1px solid #f1f5f9", paddingBottom: "1rem" }}>
                                            <div>
                                                <h2 style={{ fontSize: "1.5rem", color: "#0f172a", fontWeight: "700", marginBottom: "0.25rem" }}>
                                                    Project Overview ({analysis.repoName})
                                                </h2>
                                                {analysis.detectedEntryPoint && (
                                                    <span style={{ fontSize: "0.85rem", color: "#0284c7", background: "#f0f9ff", border: "1px solid #bae6fd", padding: "0.2rem 0.65rem", borderRadius: "16px", fontWeight: "500", display: "inline-block", marginTop: "0.25rem" }}>
                                                        Entry Point: {analysis.detectedEntryPoint}
                                                    </span>
                                                )}
                                            </div>
                                            {analysis.detectedTechnologies && analysis.detectedTechnologies.length > 0 && (
                                                <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                                                    {analysis.detectedTechnologies.map((tech) => (
                                                        <span key={tech} style={{ fontSize: "0.75rem", background: "#f8fafc", border: "1px solid #e2e8f0", color: "#334155", padding: "0.2rem 0.65rem", borderRadius: "16px", fontWeight: "500" }}>
                                                            {tech}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        <div style={{ whiteSpace: "pre-line", color: "#334155", lineHeight: "1.75", fontSize: "0.95rem" }}>
                                            {analysis.architecture}
                                        </div>
                                    </div>

                                    {/* DYNAMIC MODULE RELATIONSHIPS (Clean White Container) */}
                                    <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "1.75rem", boxShadow: "0 1px 3px 0 rgba(0,0,0,0.05)" }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", flexWrap: "wrap", gap: "0.5rem" }}>
                                            <div>
                                                <h3 style={{ fontSize: "1.25rem", color: "#0f172a", fontWeight: "700" }}>
                                                    Dynamic Module Relationships
                                                </h3>
                                                <p style={{ fontSize: "0.85rem", color: "#64748b", marginTop: "0.1rem" }}>
                                                    {graphData.nodes.length} detected modules/areas
                                                </p>
                                            </div>
                                            <span style={{ fontSize: "0.75rem", color: "#64748b" }}>
                                                Click any module below to inspect details
                                            </span>
                                        </div>

                                        {graphData.unconfirmedMessage && (
                                            <div style={{ fontSize: "0.85rem", color: "#b45309", background: "#fffbeb", border: "1px solid #fde68a", padding: "0.6rem 1rem", borderRadius: "6px", marginBottom: "1.25rem" }}>
                                                ⚠️ {graphData.unconfirmedMessage}
                                            </div>
                                        )}

                                        {/* Dynamic Graph Nodes Grid */}
                                        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", alignItems: "stretch", gap: "1.25rem", padding: "0.5rem 0" }}>
                                            {graphData.nodes.map((node) => {
                                                const isSelected = selectedGraphNode?.id === node.id;
                                                const isConfirmed = node.status === "confirmed";
                                                return (
                                                    <div
                                                        key={node.id}
                                                        onClick={() => setSelectedGraphNode(node)}
                                                        style={{
                                                            background: "#ffffff",
                                                            border: "1px solid #e2e8f0",
                                                            borderTop: `3px solid ${node.accentColor}`,
                                                            padding: "1.1rem",
                                                            borderRadius: "10px",
                                                            minWidth: "210px",
                                                            maxWidth: "280px",
                                                            flex: "1 1 210px",
                                                            display: "flex",
                                                            flexDirection: "column",
                                                            gap: "0.6rem",
                                                            boxShadow: isSelected ? "0 4px 12px rgba(2, 132, 199, 0.15)" : "0 1px 3px 0 rgba(0,0,0,0.05)",
                                                            borderColor: isSelected ? "#0284c7" : "#e2e8f0",
                                                            cursor: "pointer",
                                                            transition: "all 0.15s ease",
                                                            position: "relative",
                                                        }}
                                                    >
                                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                                            <span style={{ fontSize: "1.3rem" }}>{node.icon}</span>
                                                            <span style={{
                                                                fontSize: "0.65rem",
                                                                fontWeight: "600",
                                                                padding: "0.15rem 0.55rem",
                                                                borderRadius: "12px",
                                                                background: isConfirmed ? "#f0fdf4" : "#fffbeb",
                                                                color: isConfirmed ? "#15803d" : "#b45309",
                                                                border: isConfirmed ? "1px solid #bbf7d0" : "1px solid #fde68a",
                                                            }}>
                                                                {node.status.toUpperCase()}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <h4 style={{ fontSize: "0.95rem", color: "#0f172a", fontWeight: "600", marginBottom: "0.15rem" }}>
                                                                {node.title}
                                                            </h4>
                                                            <p style={{ fontSize: "0.75rem", color: "#64748b", fontFamily: "var(--font-mono)", wordBreak: "break-all" }}>
                                                                {node.subtitle}
                                                            </p>
                                                        </div>
                                                        <div style={{ fontSize: "0.7rem", color: "#64748b", marginTop: "auto", borderTop: "1px solid #f1f5f9", paddingTop: "0.4rem", display: "flex", justifyContent: "space-between" }}>
                                                            <span>{node.files.length} file(s)</span>
                                                            <span>{node.functions.length} fn(s)</span>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {/* Dynamic Edges Connector Badges */}
                                        {graphData.edges.length > 0 && (
                                            <div style={{ marginTop: "1.75rem", paddingTop: "1.25rem", borderTop: "1px solid #e2e8f0", display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                                                <h5 style={{ fontSize: "0.8rem", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: "600" }}>
                                                    Detected Cross-Module Flows ({graphData.edges.length} relationships)
                                                </h5>
                                                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                                                    {graphData.edges.map((edge, idx) => {
                                                        const fromNode = graphData.nodes.find((n) => n.id === edge.fromId);
                                                        const toNode = graphData.nodes.find((n) => n.id === edge.toId);
                                                        return (
                                                            <span
                                                                key={idx}
                                                                style={{
                                                                    fontSize: "0.75rem",
                                                                    background: "#f8fafc",
                                                                    border: "1px solid #e2e8f0",
                                                                    padding: "0.35rem 0.75rem",
                                                                    borderRadius: "8px",
                                                                    color: "#334155",
                                                                    display: "inline-flex",
                                                                    alignItems: "center",
                                                                    gap: "0.4rem",
                                                                }}
                                                            >
                                                                <strong style={{ color: fromNode?.accentColor || "#0284c7" }}>{fromNode?.title || edge.fromId}</strong>
                                                                <span style={{ color: "#0284c7", fontSize: "0.8rem" }}>➔ [{edge.label}] ➔</span>
                                                                <strong style={{ color: toNode?.accentColor || "#7c3aed" }}>{toNode?.title || edge.toId}</strong>
                                                            </span>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}

                                    </div>

                                    {/* SELECTED MODULE DETAIL PANEL (Clean White Card) */}
                                    {selectedGraphNode ? (
                                        <div style={{ background: "#ffffff", border: "1px solid #0284c7", borderRadius: "12px", padding: "1.75rem", boxShadow: "0 4px 12px rgba(0,0,0,0.04)", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem", borderBottom: "1px solid #f1f5f9", paddingBottom: "1rem" }}>
                                                <div>
                                                    <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                                                        <span style={{ fontSize: "1.4rem" }}>{selectedGraphNode.icon}</span>
                                                        <h3 style={{ fontSize: "1.25rem", color: "#0f172a", fontWeight: "700" }}>{selectedGraphNode.title}</h3>
                                                        <span style={{
                                                            fontSize: "0.7option",
                                                            fontWeight: "600",
                                                            padding: "0.15rem 0.55rem",
                                                            borderRadius: "12px",
                                                            background: selectedGraphNode.status === "confirmed" ? "#f0fdf4" : "#fffbeb",
                                                            color: selectedGraphNode.status === "confirmed" ? "#15803d" : "#b45309",
                                                            border: selectedGraphNode.status === "confirmed" ? "1px solid #bbf7d0" : "1px solid #fde68a",
                                                        }}>
                                                            {selectedGraphNode.status.toUpperCase()}
                                                        </span>
                                                    </div>
                                                    <p style={{ fontSize: "0.85rem", color: "#64748b", marginTop: "0.25rem" }}>
                                                        Role: {selectedGraphNode.role}
                                                    </p>
                                                </div>
                                                <div style={{ display: "flex", gap: "0.5rem" }}>
                                                    <button
                                                        onClick={() =>
                                                            handleBookmarkItem(
                                                                "MODULE",
                                                                selectedGraphNode.title,
                                                                selectedGraphNode.subtitle || selectedGraphNode.title,
                                                                selectedGraphNode.explanation || undefined
                                                            )
                                                        }
                                                        style={{
                                                            background: "#f0f9ff",
                                                            border: "1px solid #0284c7",
                                                            color: "#0284c7",
                                                            padding: "0.3rem 0.75rem",
                                                            borderRadius: "6px",
                                                            fontSize: "0.8rem",
                                                            fontWeight: "600",
                                                            cursor: "pointer",
                                                            display: "inline-flex",
                                                            alignItems: "center",
                                                            gap: "0.3rem",
                                                        }}
                                                    >
                                                        🔖 Bookmark Module
                                                    </button>
                                                    <button
                                                        onClick={() => setSelectedGraphNode(null)}
                                                        style={{ background: "#ffffff", border: "1px solid #cbd5e1", color: "#64748b", padding: "0.3rem 0.75rem", borderRadius: "6px", fontSize: "0.8rem", cursor: "pointer" }}
                                                    >
                                                        Close Details ✕
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Module Explanation (4–6 sentences) */}
                                            <div>
                                                <h4 style={{ fontSize: "0.85rem", color: "#0f172a", marginBottom: "0.4rem", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: "700" }}>
                                                    Module Explanation
                                                </h4>
                                                <p style={{ color: "#334155", fontSize: "0.95rem", lineHeight: "1.7" }}>
                                                    {selectedGraphNode.explanation}
                                                </p>
                                            </div>

                                            {/* How This Module Fits Into the Project */}
                                            {selectedGraphNode.fitsIntoProject && (
                                                <div>
                                                    <h4 style={{ fontSize: "0.85rem", color: "#0f172a", marginBottom: "0.4rem", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: "700" }}>
                                                        How This Module Fits Into the Project
                                                    </h4>
                                                    <p style={{ color: "#475569", fontSize: "0.9rem", lineHeight: "1.6" }}>
                                                        {selectedGraphNode.fitsIntoProject}
                                                    </p>
                                                </div>
                                            )}

                                            {/* What You Should Understand */}
                                            {selectedGraphNode.whatToUnderstand && selectedGraphNode.whatToUnderstand.length > 0 && (
                                                <div style={{ background: "#f0f9ff", border: "1px solid #bae6fd", borderRadius: "10px", padding: "1.25rem" }}>
                                                    <h4 style={{ fontSize: "0.85rem", color: "#0369a1", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: "700" }}>
                                                        💡 What You Should Understand
                                                    </h4>
                                                    <ul style={{ paddingLeft: "1.25rem", fontSize: "0.88rem", color: "#0f172a", display: "flex", flexDirection: "column", gap: "0.4rem", lineHeight: "1.6" }}>
                                                        {selectedGraphNode.whatToUnderstand.map((bullet, idx) => (
                                                            <li key={idx}>{bullet}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}

                                            {/* Included Files */}
                                            <div>
                                                <h4 style={{ fontSize: "0.85rem", color: "#0f172a", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: "700" }}>
                                                    Included Module Files ({selectedGraphNode.files.length})
                                                </h4>
                                                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                                                    {selectedGraphNode.files.map((file) => {
                                                        const mod = analysis.modules.find((m) => m.filePath === file);
                                                        return (
                                                            <button
                                                                key={file}
                                                                onClick={() => {
                                                                    if (mod) {
                                                                        setSelectedModule(mod);
                                                                        setActiveTab("explorer");
                                                                    }
                                                                }}
                                                                style={{
                                                                    background: "#ffffff",
                                                                    border: "1px solid #cbd5e1",
                                                                    color: "#0f172a",
                                                                    padding: "0.4rem 0.75rem",
                                                                    borderRadius: "6px",
                                                                    fontSize: "0.8rem",
                                                                    fontFamily: "var(--font-mono)",
                                                                    cursor: "pointer",
                                                                    display: "flex",
                                                                    alignItems: "center",
                                                                    gap: "0.4rem",
                                                                    boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
                                                                }}
                                                            >
                                                                📄 {file}
                                                                {mod?.startingPoint && (
                                                                    <span style={{ fontSize: "0.6rem", background: "#f5f3ff", color: "#7c3aed", border: "1px solid #ddd6fe", padding: "0.05rem 0.25rem", borderRadius: "3px", fontWeight: "600" }}>
                                                                        Start
                                                                    </span>
                                                                )}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>

                                            {/* Decoded AST Functions */}
                                            {selectedGraphNode.functions.length > 0 && (
                                                <div>
                                                    <h4 style={{ fontSize: "0.85rem", color: "#0f172a", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: "700" }}>
                                                        Decoded AST Declarations ({selectedGraphNode.functions.length})
                                                    </h4>
                                                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "0.5rem", maxHeight: "220px", overflowY: "auto" }}>
                                                        {selectedGraphNode.functions.map((fn, i) => (
                                                            <div key={i} style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "6px", padding: "0.6rem", fontSize: "0.75rem", fontFamily: "var(--font-mono)" }}>
                                                                <div style={{ color: "#0284c7", fontWeight: "600" }}>{fn.name}()</div>
                                                                <div style={{ color: "#64748b", fontSize: "0.65rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                                    {fn.filePath} (lines {fn.startLine}-{fn.endLine})
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                        </div>
                                    ) : (
                                        <div style={{ marginTop: "1rem", textAlign: "center", padding: "1rem", background: "#f8fafc", border: "1px dashed #cbd5e1", borderRadius: "8px", fontSize: "0.85rem", color: "#64748b" }}>
                                            💡 Select any module card above to view its constituent files, 4–6 sentence explanation, and key concepts.
                                        </div>
                                    )}

                                </div>
                            )}

                            {/* 2. File Explorer & Insights tab */}
                            {activeTab === "explorer" && (
                                <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "1.75rem", boxShadow: "0 1px 3px 0 rgba(0,0,0,0.05)" }}>
                                    {selectedModule ? (
                                        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

                                            {/* File Header */}
                                            <div style={{ borderBottom: "1px solid #f1f5f9", paddingBottom: "1rem", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "0.5rem" }}>
                                                <div>
                                                    <h2 style={{ fontSize: "1.4rem", fontFamily: "var(--font-mono)", color: "#0f172a", marginBottom: "0.25rem", fontWeight: "700" }}>
                                                        📄 {selectedModule.fileName}
                                                    </h2>
                                                    <p style={{ fontSize: "0.85rem", color: "#64748b", fontFamily: "var(--font-mono)" }}>
                                                        Path: {selectedModule.filePath} {selectedModule.language ? `• Language: ${selectedModule.language}` : ""}
                                                    </p>
                                                </div>
                                                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
                                                    <button
                                                        onClick={() =>
                                                            handleBookmarkItem(
                                                                "FILE",
                                                                selectedModule.fileName,
                                                                selectedModule.filePath,
                                                                selectedFileRichExplanation?.explanation || selectedModule.summary || undefined
                                                            )
                                                        }
                                                        style={{
                                                            background: "#f0f9ff",
                                                            border: "1px solid #0284c7",
                                                            color: "#0284c7",
                                                            padding: "0.25rem 0.65rem",
                                                            borderRadius: "4px",
                                                            fontSize: "0.75rem",
                                                            fontWeight: "600",
                                                            cursor: "pointer",
                                                            display: "inline-flex",
                                                            alignItems: "center",
                                                            gap: "0.3rem",
                                                        }}
                                                    >
                                                        🔖 Bookmark File
                                                    </button>
                                                    {selectedFileRichExplanation && (
                                                        <span style={{ background: "#f0f9ff", border: "1px solid #bae6fd", color: "#0284c7", padding: "0.25rem 0.65rem", borderRadius: "4px", fontSize: "0.75rem", fontWeight: "600" }}>
                                                            {selectedFileRichExplanation.role}
                                                        </span>
                                                    )}
                                                    {selectedModule.startingPoint && (
                                                        <span style={{ background: "#f5f3ff", border: "1px solid #ddd6fe", color: "#7c3aed", padding: "0.25rem 0.65rem", borderRadius: "4px", fontSize: "0.75rem", fontWeight: "600" }}>
                                                            ★ Recommended Starting Point
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* File Explanation (4–6 sentences paragraph) */}
                                            <div>
                                                <h4 style={{ fontSize: "0.85rem", color: "#0f172a", marginBottom: "0.4rem", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: "700" }}>
                                                    File Explanation
                                                </h4>
                                                <p style={{ color: "#334155", fontSize: "0.95rem", lineHeight: "1.7" }}>
                                                    {selectedFileRichExplanation?.explanation || selectedModule.summary || "No explanation available."}
                                                </p>
                                            </div>

                                            {/* How This File Fits Into the Project */}
                                            {selectedFileRichExplanation?.fitsIntoProject && (
                                                <div>
                                                    <h4 style={{ fontSize: "0.85rem", color: "#0f172a", marginBottom: "0.4rem", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: "700" }}>
                                                        How This File Fits Into the Project
                                                    </h4>
                                                    <p style={{ color: "#475569", fontSize: "0.9rem", lineHeight: "1.6" }}>
                                                        {selectedFileRichExplanation.fitsIntoProject}
                                                    </p>
                                                </div>
                                            )}

                                            {/* What You Should Understand */}
                                            {selectedFileRichExplanation?.whatToUnderstand && selectedFileRichExplanation.whatToUnderstand.length > 0 && (
                                                <div style={{ background: "#f0f9ff", border: "1px solid #bae6fd", borderRadius: "10px", padding: "1.25rem" }}>
                                                    <h4 style={{ fontSize: "0.85rem", color: "#0369a1", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: "700" }}>
                                                        💡 What You Should Understand
                                                    </h4>
                                                    <ul style={{ paddingLeft: "1.25rem", fontSize: "0.88rem", color: "#0f172a", display: "flex", flexDirection: "column", gap: "0.4rem", lineHeight: "1.6" }}>
                                                        {selectedFileRichExplanation.whatToUnderstand.map((bullet, idx) => (
                                                            <li key={idx}>{bullet}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}

                                            {/* Important Functions / Classes (2–4 sentences per function) */}
                                            {selectedModule.functions && selectedModule.functions.length > 0 && (
                                                <div>
                                                    <h4 style={{ fontSize: "0.85rem", color: "#0f172a", marginBottom: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: "700" }}>
                                                        Important Functions & Classes ({selectedModule.functions.length})
                                                    </h4>
                                                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                                                        {selectedModule.functions.map((fn, idx) => {
                                                            const funcExp = generateFunctionExplanation(
                                                                { name: fn.name, signature: fn.signature || undefined, docString: fn.docString || undefined, startLine: fn.startLine, endLine: fn.endLine },
                                                                selectedModule.fileName
                                                            );
                                                            return (
                                                                <div key={fn.id || idx} style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "1rem", boxShadow: "0 1px 2px rgba(0,0,0,0.03)" }}>
                                                                    <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem", marginBottom: "0.4rem" }}>
                                                                        <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.95rem", color: "#0284c7", fontWeight: "700" }}>
                                                                            {fn.name}()
                                                                        </span>
                                                                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                                                            <span style={{ fontSize: "0.75rem", color: "#64748b", fontFamily: "var(--font-mono)" }}>
                                                                                Lines: {fn.startLine}-{fn.endLine}
                                                                            </span>
                                                                            <button
                                                                                onClick={() =>
                                                                                    handleBookmarkItem(
                                                                                        fn.name.startsWith("class ") ? "CLASS" : "FUNCTION",
                                                                                        fn.name,
                                                                                        selectedModule.filePath,
                                                                                        funcExp
                                                                                    )
                                                                                }
                                                                                style={{
                                                                                    background: "#f1f5f9",
                                                                                    border: "1px solid #cbd5e1",
                                                                                    color: "#334155",
                                                                                    padding: "0.15rem 0.45rem",
                                                                                    borderRadius: "4px",
                                                                                    fontSize: "0.7rem",
                                                                                    fontWeight: "600",
                                                                                    cursor: "pointer",
                                                                                }}
                                                                            >
                                                                                🔖 Bookmark
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                    {fn.signature && (
                                                                        <div style={{ fontSize: "0.75rem", fontFamily: "var(--font-mono)", color: "#475569", marginBottom: "0.4rem", padding: "0.25rem 0.5rem", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "4px" }}>
                                                                            signature: ({fn.signature})
                                                                        </div>
                                                                    )}
                                                                    <p style={{ fontSize: "0.88rem", color: "#334155", lineHeight: "1.6" }}>
                                                                        {funcExp}
                                                                    </p>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Source Code Preview */}
                                            {selectedModule.codeContent && (
                                                <div>
                                                    <h4 style={{ fontSize: "0.85rem", color: "#64748b", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: "700" }}>Code Preview</h4>
                                                    <pre style={{
                                                        background: "#0f172a",
                                                        border: "1px solid #334155",
                                                        borderRadius: "8px",
                                                        padding: "1.25rem",
                                                        fontSize: "0.85rem",
                                                        lineHeight: "1.5",
                                                        fontFamily: "var(--font-mono)",
                                                        maxHeight: "320px",
                                                        overflow: "auto",
                                                        color: "#f8fafc",
                                                    }}>
                                                        <code>{selectedModule.codeContent}</code>
                                                    </pre>
                                                </div>
                                            )}

                                        </div>
                                    ) : (
                                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "350px", color: "#64748b" }}>
                                            Select a code file from the left sidebar to inspect detailed explanations and AST declarations.
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* 3. Data Flow tab */}
                            {activeTab === "dataflow" && (
                                <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "1.75rem", boxShadow: "0 1px 3px 0 rgba(0,0,0,0.05)" }}>
                                    <h2 style={{ fontSize: "1.4rem", color: "#0f172a", marginBottom: "1rem", fontWeight: "700" }}>Application Data-Flow</h2>
                                    <div style={{ whiteSpace: "pre-line", color: "#334155", lineHeight: "1.75", fontSize: "0.95rem" }}>
                                        {analysis.dataFlow}
                                    </div>
                                </div>
                            )}

                            {/* 4. APIs Summary tab */}
                            {activeTab === "apis" && (
                                <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "1.75rem", boxShadow: "0 1px 3px 0 rgba(0,0,0,0.05)" }}>
                                    <h2 style={{ fontSize: "1.4rem", color: "#0f172a", marginBottom: "1rem", fontWeight: "700" }}>API Endpoint Tracing</h2>
                                    <div style={{ whiteSpace: "pre-line", color: "#334155", lineHeight: "1.75", fontSize: "0.95rem" }}>
                                        {analysis.apiSummary}
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>

                </div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "6rem 2rem", background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px", boxShadow: "0 1px 3px 0 rgba(0,0,0,0.05)", color: "#64748b", textAlign: "center" }}>
                    <svg style={{ marginBottom: "1rem", color: "#0284c7" }} xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg>
                    <h3 style={{ color: "#0f172a", fontSize: "1.25rem", marginBottom: "0.25rem", fontWeight: "700" }}>Workspace Analysis Standby</h3>
                    <p style={{ maxWidth: "420px", fontSize: "0.9rem", color: "#475569" }}>No codebase has been traced yet. Upload a ZIP archive or specify a local workspace path above.</p>
                </div>
            )}
        </div>
    );
}
