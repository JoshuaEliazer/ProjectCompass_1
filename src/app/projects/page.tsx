"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface ProjectItem {
    id: string;
    repoName: string;
    createdAt: string;
    updatedAt: string;
    architectureText: string;
    detectedTechnologies: string[];
    detectedEntryPoint: string | null;
    languages: string[];
    fileCount: number;
    moduleCount: number;
    functionCount: number;
    status: string;
}

export default function ProjectsPage() {
    const [projects, setProjects] = useState<ProjectItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorText, setErrorText] = useState("");

    useEffect(() => {
        async function fetchProjects() {
            try {
                setIsLoading(true);
                setErrorText("");
                const res = await fetch("/api/projects");
                if (!res.ok) {
                    const err = await res.json();
                    throw new Error(err.details || err.error || "Failed to load projects");
                }
                const data = await res.json();
                setProjects(data.projects || []);
            } catch (err: any) {
                console.error(err);
                setErrorText(err.message || "Failed to load projects");
            } finally {
                setIsLoading(false);
            }
        }
        fetchProjects();
    }, []);

    const formatDate = (dateStr: string) => {
        try {
            const date = new Date(dateStr);
            return date.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
            });
        } catch {
            return dateStr;
        }
    };

    return (
        <div
                style={{
                    background: "#ffffff",
                    minHeight: "100vh",
                    color: "#0f172a",
                    padding: "2.5rem 2rem",
                    fontFamily: "var(--font-sans, system-ui, sans-serif)",
                }}
            >
                {/* Header */}
                <div
                    style={{
                        maxWidth: "1200px",
                        margin: "0 auto 2.5rem auto",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        flexWrap: "wrap",
                        gap: "1rem",
                        paddingBottom: "1.5rem",
                        borderBottom: "1px solid #e2e8f0",
                    }}
                >
                    <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.4rem" }}>
                            <span style={{ fontSize: "1.75rem" }}>📁</span>
                            <h1 style={{ fontSize: "1.875rem", fontWeight: 700, color: "#0f172a", letterSpacing: "-0.02em", margin: 0 }}>
                                Projects
                            </h1>
                        </div>
                        <p style={{ color: "#64748b", fontSize: "0.95rem", margin: 0 }}>
                            Manage and inspect software codebase analyses associated with your account.
                        </p>
                    </div>

                    <Link
                        href="/developers"
                        style={{
                            background: "linear-gradient(135deg, #0284c7 0%, #2563eb 100%)",
                            color: "#ffffff",
                            padding: "0.65rem 1.35rem",
                            borderRadius: "8px",
                            fontWeight: 600,
                            fontSize: "0.9rem",
                            textDecoration: "none",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "0.5rem",
                            boxShadow: "0 2px 8px rgba(2, 132, 199, 0.25)",
                            transition: "transform 0.15s ease",
                        }}
                    >
                        <span>🚀</span> Analyze New Project
                    </Link>
                </div>

                {/* Main Content Area */}
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
                                Loading your analyzed projects...
                            </p>
                            <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                        </div>
                    ) : errorText ? (
                        <div
                            style={{
                                background: "#fef2f2",
                                border: "1px solid #fecaca",
                                borderRadius: "12px",
                                padding: "1.5rem 2rem",
                                color: "#991b1b",
                            }}
                        >
                            <h3 style={{ margin: "0 0 0.5rem 0", fontSize: "1.1rem" }}>Error Loading Projects</h3>
                            <p style={{ margin: 0, fontSize: "0.95rem" }}>{errorText}</p>
                        </div>
                    ) : projects.length === 0 ? (
                        /* Clean Empty State */
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
                                📦
                            </div>
                            <h2 style={{ fontSize: "1.25rem", fontWeight: 600, color: "#0f172a", marginBottom: "0.5rem" }}>
                                No projects have been analyzed yet.
                            </h2>
                            <p style={{ color: "#64748b", fontSize: "0.95rem", maxWidth: "480px", margin: "0 auto 1.75rem auto", lineHeight: "1.5" }}>
                                Upload a ZIP archive or scan a project codebase in the Developer Workspace to generate instant architectural insights.
                            </p>
                            <Link
                                href="/developers"
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
                                    boxShadow: "0 2px 8px rgba(2, 132, 199, 0.2)",
                                }}
                            >
                                Upload & Analyze Project
                            </Link>
                        </div>
                    ) : (
                        /* Projects Grid */
                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
                                gap: "1.5rem",
                            }}
                        >
                            {projects.map((proj) => {
                                const techList = proj.detectedTechnologies.length > 0
                                    ? proj.detectedTechnologies
                                    : proj.languages;

                                return (
                                    <div
                                        key={proj.id}
                                        style={{
                                            background: "#ffffff",
                                            border: "1px solid #e2e8f0",
                                            borderRadius: "12px",
                                            padding: "1.75rem",
                                            display: "flex",
                                            flexDirection: "column",
                                            justifyContent: "space-between",
                                            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
                                            transition: "all 0.2s ease-in-out",
                                        }}
                                    >
                                        <div>
                                            {/* Top Row: Title & Status */}
                                            <div
                                                style={{
                                                    display: "flex",
                                                    alignItems: "flex-start",
                                                    justifyContent: "space-between",
                                                    marginBottom: "0.85rem",
                                                    gap: "0.5rem",
                                                }}
                                            >
                                                <h2
                                                    style={{
                                                        fontSize: "1.25rem",
                                                        fontWeight: 700,
                                                        color: "#0f172a",
                                                        margin: 0,
                                                        wordBreak: "break-word",
                                                    }}
                                                >
                                                    {proj.repoName}
                                                </h2>
                                                <span
                                                    style={{
                                                        background: "#f0fdf4",
                                                        color: "#166534",
                                                        border: "1px solid #bbf7d0",
                                                        padding: "0.2rem 0.6rem",
                                                        borderRadius: "12px",
                                                        fontSize: "0.75rem",
                                                        fontWeight: 600,
                                                        whiteSpace: "nowrap",
                                                        display: "inline-flex",
                                                        alignItems: "center",
                                                        gap: "0.3rem",
                                                    }}
                                                >
                                                    <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#16a34a" }} />
                                                    {proj.status}
                                                </span>
                                            </div>

                                            {/* Technologies line */}
                                            <div style={{ marginBottom: "1.25rem" }}>
                                                <div
                                                    style={{
                                                        fontSize: "0.875rem",
                                                        fontWeight: 600,
                                                        color: "#0284c7",
                                                        lineHeight: "1.4",
                                                        wordBreak: "break-word",
                                                    }}
                                                >
                                                    {techList.join(" • ")}
                                                </div>
                                            </div>

                                            {/* Entry Point */}
                                            {proj.detectedEntryPoint && (
                                                <div
                                                    style={{
                                                        background: "#f8fafc",
                                                        border: "1px solid #f1f5f9",
                                                        borderRadius: "8px",
                                                        padding: "0.75rem 0.85rem",
                                                        marginBottom: "1.25rem",
                                                    }}
                                                >
                                                    <div style={{ fontSize: "0.725rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "0.25rem" }}>
                                                        Entry Point
                                                    </div>
                                                    <div style={{ fontSize: "0.85rem", fontFamily: "monospace", color: "#334155", wordBreak: "break-all" }}>
                                                        {proj.detectedEntryPoint}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Statistics Row */}
                                            <div
                                                style={{
                                                    display: "grid",
                                                    gridTemplateColumns: "repeat(3, 1fr)",
                                                    gap: "0.5rem",
                                                    background: "#f8fafc",
                                                    border: "1px solid #e2e8f0",
                                                    borderRadius: "8px",
                                                    padding: "0.85rem",
                                                    textAlign: "center",
                                                    marginBottom: "1.5rem",
                                                }}
                                            >
                                                <div>
                                                    <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "#0f172a" }}>
                                                        {proj.fileCount}
                                                    </div>
                                                    <div style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 500 }}>
                                                        Files
                                                    </div>
                                                </div>
                                                <div style={{ borderLeft: "1px solid #e2e8f0", borderRight: "1px solid #e2e8f0" }}>
                                                    <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "#0f172a" }}>
                                                        {proj.moduleCount}
                                                    </div>
                                                    <div style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 500 }}>
                                                        Modules
                                                    </div>
                                                </div>
                                                <div>
                                                    <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "#0f172a" }}>
                                                        {proj.functionCount}
                                                    </div>
                                                    <div style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 500 }}>
                                                        Functions
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Card Footer */}
                                        <div
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "space-between",
                                                paddingTop: "1rem",
                                                borderTop: "1px solid #f1f5f9",
                                            }}
                                        >
                                            <span style={{ fontSize: "0.8rem", color: "#94a3b8" }}>
                                                Analyzed {formatDate(proj.createdAt)}
                                            </span>

                                            <Link
                                                href={`/developers?id=${proj.id}`}
                                                style={{
                                                    background: "#f1f5f9",
                                                    color: "#0f172a",
                                                    padding: "0.5rem 1rem",
                                                    borderRadius: "6px",
                                                    fontWeight: 600,
                                                    fontSize: "0.85rem",
                                                    textDecoration: "none",
                                                    display: "inline-flex",
                                                    alignItems: "center",
                                                    gap: "0.35rem",
                                                    border: "1px solid #cbd5e1",
                                                    transition: "all 0.15s ease",
                                                }}
                                            >
                                                Open Project ➔
                                            </Link>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
    );
}
