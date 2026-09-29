"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface ProjectSummaryItem {
    id: string;
    repoName: string;
    createdAt: string;
}

interface BookmarkItem {
    id: string;
    userId: string;
    analysisId: string;
    type: "FILE" | "MODULE" | "FUNCTION" | "CLASS";
    title: string;
    description: string | null;
    targetPath: string;
    targetId: string | null;
    createdAt: string;
    updatedAt: string;
}

export default function BookmarksPage() {
    const router = useRouter();

    const [projectList, setProjectList] = useState<ProjectSummaryItem[]>([]);
    const [selectedProjectId, setSelectedProjectId] = useState<string>("");
    const [selectedProjectName, setSelectedProjectName] = useState<string>("");
    const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorText, setErrorText] = useState("");

    // Initial Load: Fetch Projects list and active project bookmarks
    useEffect(() => {
        async function loadInitialData() {
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
                const matchedProject = projects.find((p) => p.id === targetId);

                if (!targetId || !matchedProject) {
                    targetId = projects[0].id;
                    setSelectedProjectName(projects[0].repoName);
                } else {
                    setSelectedProjectName(matchedProject.repoName);
                }

                setSelectedProjectId(targetId);

                // 3. Fetch bookmarks for the selected project
                await fetchBookmarksForProject(targetId);
            } catch (err: any) {
                console.error(err);
                setErrorText(err.message || "Failed to load bookmarks");
            } finally {
                setIsLoading(false);
            }
        }
        loadInitialData();
    }, []);

    // Helper to fetch bookmarks for a specific project ID
    const fetchBookmarksForProject = async (projectId: string) => {
        const bookmarksRes = await fetch(`/api/bookmarks?analysisId=${projectId}`);
        if (!bookmarksRes.ok) {
            const err = await bookmarksRes.json();
            throw new Error(err.details || err.error || "Failed to fetch project bookmarks");
        }
        const bookmarksData = await bookmarksRes.json();
        setBookmarks(bookmarksData.bookmarks || []);
    };

    // Handle switching project from selector dropdown
    const handleSelectProject = async (newId: string) => {
        setSelectedProjectId(newId);
        const proj = projectList.find((p) => p.id === newId);
        if (proj) setSelectedProjectName(proj.repoName);

        setIsLoading(true);
        setErrorText("");
        router.push(`/bookmarks?id=${newId}`);

        try {
            await fetchBookmarksForProject(newId);
        } catch (err: any) {
            console.error(err);
            setErrorText(err.message || "Failed to switch project bookmarks");
        } finally {
            setIsLoading(false);
        }
    };

    // Delete Bookmark
    const handleDeleteBookmark = async (bookmarkId: string) => {
        if (!confirm("Are you sure you want to delete this bookmark?")) return;

        try {
            const res = await fetch(`/api/bookmarks/${bookmarkId}`, {
                method: "DELETE",
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.details || err.error || "Failed to delete bookmark");
            }
            setBookmarks((prev) => prev.filter((b) => b.id !== bookmarkId));
        } catch (err: any) {
            console.error(err);
            alert(err.message || "Failed to delete bookmark");
        }
    };

    // Open Bookmark in Developer Workspace
    const handleOpenBookmark = (b: BookmarkItem) => {
        if (b.type === "FILE") {
            router.push(`/developers?id=${b.analysisId}&file=${encodeURIComponent(b.targetPath)}`);
        } else if (b.type === "MODULE") {
            router.push(`/developers?id=${b.analysisId}&module=${encodeURIComponent(b.targetPath)}`);
        } else {
            router.push(`/developers?id=${b.analysisId}&file=${encodeURIComponent(b.targetPath)}`);
        }
    };

    const formatDate = (dateStr: string) => {
        try {
            const date = new Date(dateStr);
            return date.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            });
        } catch {
            return dateStr;
        }
    };

    const getTypeBadgeStyle = (type: string) => {
        switch (type) {
            case "FILE":
                return { bg: "#e0f2fe", color: "#0369a1", border: "#bae6fd" };
            case "MODULE":
                return { bg: "#f3e8ff", color: "#7e22ce", border: "#e9d5ff" };
            case "FUNCTION":
                return { bg: "#dcfce7", color: "#15803d", border: "#bbf7d0" };
            case "CLASS":
                return { bg: "#fffbeb", color: "#b45309", border: "#fde68a" };
            default:
                return { bg: "#f1f5f9", color: "#475569", border: "#cbd5e1" };
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
                {/* Header & Control Bar */}
                <div
                    style={{
                        maxWidth: "1200px",
                        margin: "0 auto 2.5rem auto",
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
                            <span style={{ fontSize: "1.75rem" }}>🔖</span>
                            <h1 style={{ fontSize: "1.875rem", fontWeight: 700, color: "#0f172a", letterSpacing: "-0.02em", margin: 0 }}>
                                Project Bookmarks
                            </h1>
                        </div>
                        <p style={{ color: "#64748b", fontSize: "0.95rem", margin: 0 }}>
                            Quickly access saved files, modules, and key components for {selectedProjectName ? `"${selectedProjectName}"` : "your project"}.
                        </p>
                    </div>

                    {/* Navigation Actions & Project Selector */}
                    <div style={{ display: "flex", alignItems: "center", gap: "0.85rem", flexWrap: "wrap" }}>
                        {projectList.length > 0 && (
                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                <label htmlFor="bookmarks-project-select" style={{ fontSize: "0.85rem", fontWeight: 600, color: "#64748b" }}>
                                    Project:
                                </label>
                                <select
                                    id="bookmarks-project-select"
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

                        {selectedProjectId && (
                            <>
                                <Link
                                    href={`/developers?id=${selectedProjectId}`}
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

                                <Link
                                    href={`/documentation?id=${selectedProjectId}`}
                                    style={{
                                        background: "#f1f5f9",
                                        color: "#334155",
                                        border: "1px solid #cbd5e1",
                                        padding: "0.55rem 1rem",
                                        borderRadius: "8px",
                                        fontWeight: 600,
                                        fontSize: "0.875rem",
                                        textDecoration: "none",
                                    }}
                                >
                                    Documentation
                                </Link>

                                <Link
                                    href={`/notes?id=${selectedProjectId}`}
                                    style={{
                                        background: "#f1f5f9",
                                        color: "#334155",
                                        border: "1px solid #cbd5e1",
                                        padding: "0.55rem 1rem",
                                        borderRadius: "8px",
                                        fontWeight: 600,
                                        fontSize: "0.875rem",
                                        textDecoration: "none",
                                    }}
                                >
                                    Notes
                                </Link>
                            </>
                        )}

                        <Link
                            href="/projects"
                            style={{
                                background: "#ffffff",
                                color: "#64748b",
                                border: "1px solid #e2e8f0",
                                padding: "0.55rem 1rem",
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
                                Loading project bookmarks...
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
                            <h3 style={{ margin: "0 0 0.5rem 0", fontSize: "1.1rem" }}>Error</h3>
                            <p style={{ margin: 0, fontSize: "0.95rem" }}>{errorText}</p>
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
                                📦
                            </div>
                            <h2 style={{ fontSize: "1.25rem", fontWeight: 600, color: "#0f172a", marginBottom: "0.5rem" }}>
                                No projects have been analyzed yet.
                            </h2>
                            <p style={{ color: "#64748b", fontSize: "0.95rem", maxWidth: "480px", margin: "0 auto 1.75rem auto", lineHeight: "1.5" }}>
                                Analyze a codebase in the Developer Workspace to start bookmarking key files, modules, and functions.
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
                                }}
                            >
                                Go to Projects
                            </Link>
                        </div>
                    ) : bookmarks.length === 0 ? (
                        /* Empty State: No Bookmarks for this project */
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
                                🔖
                            </div>
                            <h2 style={{ fontSize: "1.25rem", fontWeight: 600, color: "#0f172a", marginBottom: "0.5rem" }}>
                                No bookmarks saved yet
                            </h2>
                            <p style={{ color: "#64748b", fontSize: "0.95rem", maxWidth: "480px", margin: "0 auto 1.75rem auto", lineHeight: "1.5" }}>
                                Bookmark important files, modules, or functions from the Developer Workspace for <strong>{selectedProjectName}</strong> to quickly return to them.
                            </p>
                            <Link
                                href={`/developers?id=${selectedProjectId}`}
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
                                    boxShadow: "0 2px 8px rgba(2, 132, 199, 0.25)",
                                }}
                            >
                                Open Developer Workspace
                            </Link>
                        </div>
                    ) : (
                        /* Bookmarks Grid */
                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
                                gap: "1.5rem",
                            }}
                        >
                            {bookmarks.map((b) => {
                                const badgeStyle = getTypeBadgeStyle(b.type);

                                return (
                                    <div
                                        key={b.id}
                                        style={{
                                            background: "#ffffff",
                                            border: "1px solid #e2e8f0",
                                            borderRadius: "12px",
                                            padding: "1.5rem",
                                            display: "flex",
                                            flexDirection: "column",
                                            justifyContent: "space-between",
                                            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
                                        }}
                                    >
                                        <div>
                                            {/* Header Row: Title & Type Badge */}
                                            <div
                                                style={{
                                                    display: "flex",
                                                    alignItems: "flex-start",
                                                    justifyContent: "space-between",
                                                    marginBottom: "0.75rem",
                                                    gap: "0.5rem",
                                                }}
                                            >
                                                <h3
                                                    style={{
                                                        fontSize: "1.15rem",
                                                        fontWeight: 700,
                                                        color: "#0f172a",
                                                        margin: 0,
                                                        wordBreak: "break-word",
                                                    }}
                                                >
                                                    🔖 {b.title}
                                                </h3>
                                                <span
                                                    style={{
                                                        background: badgeStyle.bg,
                                                        color: badgeStyle.color,
                                                        border: `1px solid ${badgeStyle.border}`,
                                                        padding: "0.2rem 0.6rem",
                                                        borderRadius: "12px",
                                                        fontSize: "0.75rem",
                                                        fontWeight: 700,
                                                        whiteSpace: "nowrap",
                                                    }}
                                                >
                                                    {b.type}
                                                </span>
                                            </div>

                                            {/* Target Path */}
                                            <div
                                                style={{
                                                    background: "#f8fafc",
                                                    border: "1px solid #f1f5f9",
                                                    borderRadius: "6px",
                                                    padding: "0.5rem 0.75rem",
                                                    marginBottom: "0.85rem",
                                                    fontFamily: "monospace",
                                                    fontSize: "0.825rem",
                                                    color: "#334155",
                                                    wordBreak: "break-all",
                                                }}
                                            >
                                                {b.targetPath}
                                            </div>

                                            {/* Description / Preview */}
                                            {b.description && (
                                                <p
                                                    style={{
                                                        color: "#475569",
                                                        fontSize: "0.9rem",
                                                        lineHeight: "1.55",
                                                        margin: "0 0 1.25rem 0",
                                                    }}
                                                >
                                                    {b.description}
                                                </p>
                                            )}
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
                                            <span style={{ fontSize: "0.775rem", color: "#94a3b8" }}>
                                                Bookmarked {formatDate(b.createdAt)}
                                            </span>

                                            <div style={{ display: "flex", gap: "0.5rem" }}>
                                                <button
                                                    onClick={() => handleOpenBookmark(b)}
                                                    style={{
                                                        background: "#0284c7",
                                                        color: "#ffffff",
                                                        border: "none",
                                                        padding: "0.35rem 0.85rem",
                                                        borderRadius: "6px",
                                                        fontWeight: 600,
                                                        fontSize: "0.8rem",
                                                        cursor: "pointer",
                                                        display: "inline-flex",
                                                        alignItems: "center",
                                                        gap: "0.3rem",
                                                    }}
                                                >
                                                    Open ➔
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteBookmark(b.id)}
                                                    style={{
                                                        background: "#fef2f2",
                                                        color: "#991b1b",
                                                        border: "1px solid #fecaca",
                                                        padding: "0.35rem 0.75rem",
                                                        borderRadius: "6px",
                                                        fontWeight: 600,
                                                        fontSize: "0.8rem",
                                                        cursor: "pointer",
                                                    }}
                                                >
                                                    Delete
                                                </button>
                                            </div>
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
