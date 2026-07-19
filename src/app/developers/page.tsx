"use client";

import { useState } from "react";
import Link from "next/link";

interface FunctionDef {
    id: string;
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
}

interface RepoAnalysis {
    id: string;
    repoName: string;
    architecture: string | null;
    dataFlow: string | null;
    authFlow: string | null;
    apiSummary: string | null;
    modules: CodeModule[];
}

export default function DevelopersDashboard() {
    const [scanPath, setScanPath] = useState("");
    const [isScanning, setIsScanning] = useState(false);
    const [analysis, setAnalysis] = useState<RepoAnalysis | null>(null);
    const [selectedModule, setSelectedModule] = useState<CodeModule | null>(null);
    const [activeTab, setActiveTab] = useState<"arch" | "explorer" | "dataflow" | "apis">("arch");
    const [errorText, setErrorText] = useState("");

    const triggerScan = async () => {
        setIsScanning(true);
        setErrorText("");
        setAnalysis(null);
        setSelectedModule(null);

        try {
            const res = await fetch("/api/developers/upload", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ path: scanPath }),
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.details || "Scan failed.");
            }

            const data = await res.json();
            setAnalysis(data);

            // Select the first starting point file if available
            const startPoint = data.modules.find((m: CodeModule) => m.startingPoint && m.fileType === "file");
            if (startPoint) {
                setSelectedModule(startPoint);
                setActiveTab("explorer");
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

    return (
        <div style={{ padding: "2rem 1.5rem", display: "flex", flexDirection: "column", gap: "2.5rem" }}>

            {/* Upload Action / Scan Header */}
            <section style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "flex-end" }} className="glass-card">
                <div style={{ flex: 1, minWidth: "300px" }}>
                    <label style={{ display: "block", fontSize: "0.85rem", color: "var(--fg-secondary)", marginBottom: "0.5rem", fontWeight: "600" }}>
                        Local Repository Folder Path (e.g. C:\MyProjects\cool-app)
                    </label>
                    <input
                        type="text"
                        placeholder="Leave blank to analyze Project Compass workspace itself..."
                        value={scanPath}
                        onChange={(e) => setScanPath(e.target.value)}
                        style={{ width: "100%", padding: "0.8rem 1rem", fontSize: "0.95rem" }}
                        disabled={isScanning}
                    />
                </div>
                <button
                    onClick={triggerScan}
                    disabled={isScanning}
                    style={{
                        background: "linear-gradient(135deg, var(--accent-cyan), #0891b2)",
                        color: "#000",
                        padding: "0.8rem 1.8rem",
                        borderRadius: "6px",
                        fontWeight: "600",
                        fontSize: "0.95rem",
                        boxShadow: isScanning ? "none" : "var(--shadow-md)",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        opacity: isScanning ? 0.7 : 1,
                    }}
                >
                    {isScanning ? (
                        <>
                            <svg className="spinning" style={{ animation: "spin 1s linear infinite" }} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="2" x2="12" y2="6" /><line x1="12" y1="18" x2="12" y2="22" /><line x1="4.93" y1="4.93" x2="7.76" y2="7.76" /><line x1="16.24" y1="16.24" x2="19.07" y2="19.07" /><line x1="2" y1="12" x2="6" y2="12" /><line x1="18" y1="12" x2="22" y2="12" /><line x1="4.93" y1="19.07" x2="7.76" y2="16.24" /><line x1="16.24" y1="7.76" x2="19.07" y2="4.93" /></svg>
                            Scanning AST...
                        </>
                    ) : (
                        <>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>
                            Trace Codebase
                        </>
                    )}
                </button>
            </section>

            {errorText && (
                <div style={{ padding: "1.25rem", background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.3)", borderRadius: "8px", color: "#f87171" }}>
                    <strong>Scan Failed:</strong> {errorText}
                </div>
            )}

            {/* Dashboard Grid Workspace */}
            {analysis ? (
                <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: "2.5rem" }}>

                    {/* Left sidebar: File Tree Explorer */}
                    <aside className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "1.5rem", padding: "1rem", height: "fit-content" }}>
                        <h3 style={{ fontSize: "1.1rem", borderBottom: "1px solid var(--border-color)", paddingBottom: "0.5rem" }}>File Explorer</h3>
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem", maxHeight: "550px", overflowY: "auto", paddingRight: "0.25rem" }}>
                            {analysis.modules.map((mod) => (
                                <button
                                    key={mod.id}
                                    onClick={() => {
                                        setSelectedModule(mod);
                                        setActiveTab("explorer");
                                    }}
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "0.5rem",
                                        padding: "0.6rem 0.75rem",
                                        borderRadius: "6px",
                                        fontSize: "0.85rem",
                                        width: "100%",
                                        textAlign: "left",
                                        background: selectedModule?.id === mod.id ? "var(--accent-cyan-glow)" : "transparent",
                                        border: selectedModule?.id === mod.id ? "1px solid rgba(6,182,212,0.3)" : "1px solid transparent",
                                        color: selectedModule?.id === mod.id ? "var(--accent-cyan)" : "var(--fg-secondary)",
                                        transition: "all var(--transition-fast)",
                                    }}
                                >
                                    {/* Item icon file vs directory */}
                                    {mod.fileType === "directory" ? (
                                        <svg style={{ color: "var(--accent-purple)", flexShrink: 0 }} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /></svg>
                                    ) : (
                                        <svg style={{ color: "var(--fg-muted)", flexShrink: 0 }} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                                    )}

                                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                        {mod.filePath}
                                    </span>

                                    {mod.startingPoint && (
                                        <span style={{ fontSize: "0.65rem", background: "var(--accent-purple)", color: "#fff", padding: "0.05rem 0.25rem", borderRadius: "3px", marginLeft: "auto", flexShrink: 0 }}>
                                            Start
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </aside>

                    {/* Right main workspace layout */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

                        {/* Tabs controls */}
                        <div style={{ display: "flex", borderBottom: "1px solid var(--border-color)", gap: "0.5rem" }}>
                            <button
                                onClick={() => setActiveTab("arch")}
                                style={{
                                    padding: "0.75rem 1.25rem",
                                    borderBottom: activeTab === "arch" ? "2px solid var(--accent-cyan)" : "2px solid transparent",
                                    color: activeTab === "arch" ? "var(--accent-cyan)" : "var(--fg-muted)",
                                    fontSize: "0.95rem",
                                    fontWeight: "600",
                                }}
                            >
                                Architecture Map
                            </button>
                            <button
                                onClick={() => setActiveTab("explorer")}
                                style={{
                                    padding: "0.75rem 1.25rem",
                                    borderBottom: activeTab === "explorer" ? "2px solid var(--accent-cyan)" : "2px solid transparent",
                                    color: activeTab === "explorer" ? "var(--accent-cyan)" : "var(--fg-muted)",
                                    fontSize: "0.95rem",
                                    fontWeight: "600",
                                }}
                            >
                                File Insights
                            </button>
                            <button
                                onClick={() => setActiveTab("dataflow")}
                                style={{
                                    padding: "0.75rem 1.25rem",
                                    borderBottom: activeTab === "dataflow" ? "2px solid var(--accent-cyan)" : "2px solid transparent",
                                    color: activeTab === "dataflow" ? "var(--accent-cyan)" : "var(--fg-muted)",
                                    fontSize: "0.95rem",
                                    fontWeight: "600",
                                }}
                            >
                                Data Flows
                            </button>
                            <button
                                onClick={() => setActiveTab("apis")}
                                style={{
                                    padding: "0.75rem 1.25rem",
                                    borderBottom: activeTab === "apis" ? "2px solid var(--accent-cyan)" : "2px solid transparent",
                                    color: activeTab === "apis" ? "var(--accent-cyan)" : "var(--fg-muted)",
                                    fontSize: "0.95rem",
                                    fontWeight: "600",
                                }}
                            >
                                APIs Scan
                            </button>
                        </div>

                        {/* Tab Content rendering */}
                        <div className="glass-card" style={{ flex: 1, minHeight: "450px" }}>

                            {/* 1. Architecture Map tab */}
                            {activeTab === "arch" && (
                                <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>
                                    <div>
                                        <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>System Tracing Summary</h2>
                                        <div style={{ whiteSpace: "pre-line", color: "var(--fg-secondary)", lineHeight: "1.7", fontSize: "0.95rem" }}>
                                            {analysis.architecture}
                                        </div>
                                    </div>

                                    {/* interactive vector graphics dependency diagram */}
                                    <div>
                                        <h3 style={{ fontSize: "1.2rem", marginBottom: "1.5rem", color: "var(--accent-cyan)" }}>Modules Relationship Layout</h3>
                                        <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-color)", borderRadius: "10px", padding: "2.5rem 1.5rem", position: "relative" }}>

                                            {/* Node lines linking diagram via CSS */}
                                            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-around", alignItems: "center", gap: "2rem", position: "relative" }}>

                                                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
                                                    <div style={{ border: "1px solid var(--border-color)", background: "var(--bg-tertiary)", padding: "0.8rem 1.5rem", borderRadius: "8px", fontWeight: "bold", fontSize: "0.85rem", boxShadow: "var(--shadow-md)" }}>
                                                        📁 src/app/
                                                    </div>
                                                    <span style={{ fontSize: "0.7rem", color: "var(--fg-muted)" }}>Next.js App Server</span>
                                                </div>

                                                <div style={{ color: "var(--accent-cyan)", fontSize: "1.5rem" }}>⇄</div>

                                                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
                                                    <div style={{ border: "1px solid var(--accent-cyan)", background: "var(--accent-cyan-glow)", padding: "0.8rem 1.5rem", borderRadius: "8px", fontWeight: "bold", fontSize: "0.85rem", color: "var(--accent-cyan)" }}>
                                                        📁 src/core/
                                                    </div>
                                                    <span style={{ fontSize: "0.7rem", color: "var(--fg-muted)" }}>Business AST Logic</span>
                                                </div>

                                                <div style={{ color: "var(--fg-muted)", fontSize: "1.5rem" }}>➔</div>

                                                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
                                                    <div style={{ border: "1px solid var(--accent-purple)", background: "var(--accent-purple-glow)", padding: "0.8rem 1.5rem", borderRadius: "8px", fontWeight: "bold", fontSize: "0.85rem", color: "var(--accent-purple)" }}>
                                                        📁 src/infrastructure/
                                                    </div>
                                                    <span style={{ fontSize: "0.7rem", color: "var(--fg-muted)" }}>Database / DB Config</span>
                                                </div>

                                                <div style={{ color: "var(--accent-emerald)", fontSize: "1.5rem" }}>➔</div>

                                                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
                                                    <div style={{ border: "1px solid var(--accent-emerald)", background: "rgba(16,185,129,0.05)", padding: "0.8rem 1.5rem", borderRadius: "8px", fontWeight: "bold", fontSize: "0.85rem", color: "var(--accent-emerald)" }}>
                                                        💾 schema.prisma
                                                    </div>
                                                    <span style={{ fontSize: "0.7rem", color: "var(--fg-muted)" }}>SQLite Data Engine</span>
                                                </div>
                                            </div>

                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* 2. File Explorer tab */}
                            {activeTab === "explorer" && (
                                <div>
                                    {selectedModule ? (
                                        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

                                            {/* Header details */}
                                            <div style={{ borderBottom: "1px solid var(--border-color)", paddingBottom: "1rem", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                                <div>
                                                    <h2 style={{ fontSize: "1.4rem", fontFamily: "var(--font-mono)", color: "var(--accent-cyan)", marginBottom: "0.25rem" }}>
                                                        {selectedModule.fileName}
                                                    </h2>
                                                    <p style={{ fontSize: "0.85rem", color: "var(--fg-muted)", fontFamily: "var(--font-mono)" }}>
                                                        Path: {selectedModule.filePath}
                                                    </p>
                                                </div>
                                                {selectedModule.startingPoint && (
                                                    <span style={{ background: "var(--accent-purple)", color: "#fff", padding: "0.3rem 0.75rem", borderRadius: "4px", fontSize: "0.75rem", fontWeight: "bold" }}>
                                                        ★ Recomended contributor entry point
                                                    </span>
                                                )}
                                            </div>

                                            {/* File summary */}
                                            <div>
                                                <h4 style={{ fontSize: "0.9rem", color: "var(--fg-muted)", marginBottom: "0.4rem", textTransform: "uppercase" }}>Module Summary</h4>
                                                <p style={{ color: "var(--fg-primary)", fontSize: "0.95rem" }}>{selectedModule.summary || "No description provided."}</p>
                                            </div>

                                            {/* Functions AST parsing definitions */}
                                            {selectedModule.functions.length > 0 && (
                                                <div>
                                                    <h4 style={{ fontSize: "0.9rem", color: "var(--fg-muted)", marginBottom: "0.75rem", textTransform: "uppercase" }}>
                                                        Decoded AST Declarations ({selectedModule.functions.length})
                                                    </h4>
                                                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                                                        {selectedModule.functions.map((fn) => (
                                                            <div key={fn.id} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-color)", borderRadius: "6px", padding: "0.85rem" }}>
                                                                <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem" }}>
                                                                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.9rem", color: "var(--accent-cyan)", fontWeight: "bold" }}>
                                                                        {fn.name}()
                                                                    </span>
                                                                    <span style={{ fontSize: "0.75rem", color: "var(--fg-muted)", fontFamily: "var(--font-mono)" }}>
                                                                        Lines: {fn.startLine}-{fn.endLine}
                                                                    </span>
                                                                </div>
                                                                {fn.signature && (
                                                                    <div style={{ fontSize: "0.75rem", fontFamily: "var(--font-mono)", color: "var(--fg-secondary)", marginTop: "0.25rem", padding: "0.2rem", background: "rgba(0,0,0,0.2)", borderRadius: "3px" }}>
                                                                        args: ({fn.signature})
                                                                    </div>
                                                                )}
                                                                {fn.docString && (
                                                                    <p style={{ fontSize: "0.8rem", color: "var(--fg-muted)", marginTop: "0.4rem", fontStyle: "italic" }}>
                                                                        "{fn.docString}"
                                                                    </p>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Source code preview */}
                                            {selectedModule.codeContent && (
                                                <div>
                                                    <h4 style={{ fontSize: "0.9rem", color: "var(--fg-muted)", marginBottom: "0.5rem", textTransform: "uppercase" }}>Code Preview</h4>
                                                    <pre style={{
                                                        background: "#050507",
                                                        border: "1px solid var(--border-color)",
                                                        borderRadius: "6px",
                                                        padding: "1rem",
                                                        fontSize: "0.85rem",
                                                        lineHeight: "1.5",
                                                        fontFamily: "var(--font-mono)",
                                                        maxHeight: "300px",
                                                        overflow: "auto",
                                                        color: "var(--fg-primary)",
                                                    }}>
                                                        <code>{selectedModule.codeContent}</code>
                                                    </pre>
                                                </div>
                                            )}

                                        </div>
                                    ) : (
                                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "350px", color: "var(--fg-muted)" }}>
                                            Select a code file from the left sidebar to run detailed insights.
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* 3. Data Flow tab */}
                            {activeTab === "dataflow" && (
                                <div>
                                    <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>Application Data-Flow</h2>
                                    <div style={{ whiteSpace: "pre-line", color: "var(--fg-secondary)", lineHeight: "1.7", fontSize: "0.95rem" }}>
                                        {analysis.dataFlow}
                                    </div>
                                </div>
                            )}

                            {/* 4. APIs Summary tab */}
                            {activeTab === "apis" && (
                                <div>
                                    <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>API Endpoint Tracing</h2>
                                    <div style={{ whiteSpace: "pre-line", color: "var(--fg-secondary)", lineHeight: "1.7", fontSize: "0.95rem" }}>
                                        {analysis.apiSummary}
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>

                </div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "6rem 2rem", color: "var(--fg-muted)", textAlign: "center" }}>
                    <svg style={{ marginBottom: "1rem", color: "var(--accent-cyan-glow)" }} xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg>
                    <h3 style={{ color: "var(--fg-primary)", fontSize: "1.25rem", marginBottom: "0.25rem" }}>Workspace Analysis Standby</h3>
                    <p style={{ maxWidth: "420px", fontSize: "0.9rem" }}>No codebase has been traced yet. Click "Trace Codebase" above to run the AST compiler structure mapper.</p>
                </div>
            )}
        </div>
    );
}
