"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface ProjectSummaryItem {
    id: string;
    repoName: string;
    createdAt: string;
}

interface NoteItem {
    id: string;
    userId: string;
    analysisId: string;
    title: string;
    content: string;
    createdAt: string;
    updatedAt: string;
}

export default function NotesPage() {
    const router = useRouter();

    const [projectList, setProjectList] = useState<ProjectSummaryItem[]>([]);
    const [selectedProjectId, setSelectedProjectId] = useState<string>("");
    const [selectedProjectName, setSelectedProjectName] = useState<string>("");
    const [notes, setNotes] = useState<NoteItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorText, setErrorText] = useState("");

    // Modal / Editor State
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [editingNote, setEditingNote] = useState<NoteItem | null>(null);
    const [noteTitle, setNoteTitle] = useState("");
    const [noteContent, setNoteContent] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    // Initial Load: Fetch User Projects and Active Project Notes
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

                // 3. Fetch notes for the selected project
                await fetchNotesForProject(targetId);
            } catch (err: any) {
                console.error(err);
                setErrorText(err.message || "Failed to load notes");
            } finally {
                setIsLoading(false);
            }
        }
        loadInitialData();
    }, []);

    // Helper to fetch notes for a specific project ID
    const fetchNotesForProject = async (projectId: string) => {
        const notesRes = await fetch(`/api/notes?analysisId=${projectId}`);
        if (!notesRes.ok) {
            const err = await notesRes.json();
            throw new Error(err.details || err.error || "Failed to fetch project notes");
        }
        const notesData = await notesRes.json();
        setNotes(notesData.notes || []);
    };

    // Handle switching project from selector dropdown
    const handleSelectProject = async (newId: string) => {
        setSelectedProjectId(newId);
        const proj = projectList.find((p) => p.id === newId);
        if (proj) setSelectedProjectName(proj.repoName);

        setIsLoading(true);
        setErrorText("");
        router.push(`/notes?id=${newId}`);

        try {
            await fetchNotesForProject(newId);
        } catch (err: any) {
            console.error(err);
            setErrorText(err.message || "Failed to switch project notes");
        } finally {
            setIsLoading(false);
        }
    };

    // Open Editor for Create
    const handleOpenCreateModal = () => {
        setEditingNote(null);
        setNoteTitle("");
        setNoteContent("");
        setIsEditorOpen(true);
    };

    // Open Editor for Edit
    const handleOpenEditModal = (note: NoteItem) => {
        setEditingNote(note);
        setNoteTitle(note.title);
        setNoteContent(note.content);
        setIsEditorOpen(true);
    };

    // Save Note (Create or Update)
    const handleSaveNote = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!noteTitle.trim()) return;

        setIsSaving(true);
        setErrorText("");

        try {
            if (editingNote) {
                // Update existing note
                const res = await fetch(`/api/notes/${editingNote.id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        title: noteTitle,
                        content: noteContent,
                    }),
                });
                if (!res.ok) {
                    const err = await res.json();
                    throw new Error(err.details || err.error || "Failed to update note");
                }
                const data = await res.json();
                setNotes((prev) =>
                    prev.map((n) => (n.id === editingNote.id ? data.note : n))
                );
            } else {
                // Create new note
                const res = await fetch("/api/notes", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        analysisId: selectedProjectId,
                        title: noteTitle,
                        content: noteContent,
                    }),
                });
                if (!res.ok) {
                    const err = await res.json();
                    throw new Error(err.details || err.error || "Failed to create note");
                }
                const data = await res.json();
                setNotes((prev) => [data.note, ...prev]);
            }

            setIsEditorOpen(false);
            setNoteTitle("");
            setNoteContent("");
            setEditingNote(null);
        } catch (err: any) {
            console.error(err);
            setErrorText(err.message || "Failed to save note");
        } finally {
            setIsSaving(false);
        }
    };

    // Delete Note
    const handleDeleteNote = async (noteId: string) => {
        if (!confirm("Are you sure you want to delete this note?")) return;

        try {
            const res = await fetch(`/api/notes/${noteId}`, {
                method: "DELETE",
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.details || err.error || "Failed to delete note");
            }
            setNotes((prev) => prev.filter((n) => n.id !== noteId));
        } catch (err: any) {
            console.error(err);
            alert(err.message || "Failed to delete note");
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
                {/* Header & Controls Bar */}
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
                            <span style={{ fontSize: "1.75rem" }}>📝</span>
                            <h1 style={{ fontSize: "1.875rem", fontWeight: 700, color: "#0f172a", letterSpacing: "-0.02em", margin: 0 }}>
                                Project Notes
                            </h1>
                        </div>
                        <p style={{ color: "#64748b", fontSize: "0.95rem", margin: 0 }}>
                            Save architectural insights, observations, and key technical details for {selectedProjectName ? `"${selectedProjectName}"` : "your project"}.
                        </p>
                    </div>

                    {/* Navigation Actions & Project Selector */}
                    <div style={{ display: "flex", alignItems: "center", gap: "0.85rem", flexWrap: "wrap" }}>
                        {projectList.length > 0 && (
                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                <label htmlFor="notes-project-select" style={{ fontSize: "0.85rem", fontWeight: 600, color: "#64748b" }}>
                                    Project:
                                </label>
                                <select
                                    id="notes-project-select"
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
                                <button
                                    onClick={handleOpenCreateModal}
                                    style={{
                                        background: "linear-gradient(135deg, #0284c7 0%, #2563eb 100%)",
                                        color: "#ffffff",
                                        border: "none",
                                        padding: "0.6rem 1.25rem",
                                        borderRadius: "8px",
                                        fontWeight: 600,
                                        fontSize: "0.9rem",
                                        cursor: "pointer",
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: "0.4rem",
                                        boxShadow: "0 2px 8px rgba(2, 132, 199, 0.25)",
                                    }}
                                >
                                    <span>✏️</span> New Note
                                </button>

                                <Link
                                    href={`/developers?id=${selectedProjectId}`}
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
                                    Open Workspace
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
                                Loading project notes...
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
                                Analyze a software project first to start recording project notes and observations.
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
                    ) : notes.length === 0 ? (
                        /* Empty State: No Notes for this project */
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
                                📝
                            </div>
                            <h2 style={{ fontSize: "1.25rem", fontWeight: 600, color: "#0f172a", marginBottom: "0.5rem" }}>
                                No notes yet
                            </h2>
                            <p style={{ color: "#64748b", fontSize: "0.95rem", maxWidth: "480px", margin: "0 auto 1.75rem auto", lineHeight: "1.5" }}>
                                Create a note to save important observations, architecture insights, or development reminders for <strong>{selectedProjectName}</strong>.
                            </p>
                            <button
                                onClick={handleOpenCreateModal}
                                style={{
                                    background: "#0284c7",
                                    color: "#ffffff",
                                    border: "none",
                                    padding: "0.75rem 1.5rem",
                                    borderRadius: "8px",
                                    fontWeight: 600,
                                    fontSize: "0.95rem",
                                    cursor: "pointer",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "0.5rem",
                                    boxShadow: "0 2px 8px rgba(2, 132, 199, 0.25)",
                                }}
                            >
                                <span>✏️</span> Create New Note
                            </button>
                        </div>
                    ) : (
                        /* Notes Grid */
                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
                                gap: "1.5rem",
                            }}
                        >
                            {notes.map((note) => (
                                <div
                                    key={note.id}
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
                                        <h3
                                            style={{
                                                fontSize: "1.15rem",
                                                fontWeight: 700,
                                                color: "#0f172a",
                                                margin: "0 0 0.65rem 0",
                                                wordBreak: "break-word",
                                            }}
                                        >
                                            {note.title}
                                        </h3>
                                        <p
                                            style={{
                                                color: "#334155",
                                                fontSize: "0.925rem",
                                                lineHeight: "1.6",
                                                margin: "0 0 1.25rem 0",
                                                whiteSpace: "pre-wrap",
                                                wordBreak: "break-word",
                                            }}
                                        >
                                            {note.content}
                                        </p>
                                    </div>

                                    {/* Note Footer */}
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
                                            {formatDate(note.createdAt)}
                                        </span>

                                        <div style={{ display: "flex", gap: "0.5rem" }}>
                                            <button
                                                onClick={() => handleOpenEditModal(note)}
                                                style={{
                                                    background: "#f1f5f9",
                                                    color: "#0f172a",
                                                    border: "1px solid #cbd5e1",
                                                    padding: "0.35rem 0.75rem",
                                                    borderRadius: "6px",
                                                    fontWeight: 600,
                                                    fontSize: "0.8rem",
                                                    cursor: "pointer",
                                                }}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDeleteNote(note.id)}
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
                            ))}
                        </div>
                    )}
                </div>

                {/* Editor Modal */}
                {isEditorOpen && (
                    <div
                        style={{
                            position: "fixed",
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: "rgba(15, 23, 42, 0.4)",
                            backdropFilter: "blur(4px)",
                            zIndex: 999,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: "1rem",
                        }}
                    >
                        <div
                            style={{
                                background: "#ffffff",
                                border: "1px solid #e2e8f0",
                                borderRadius: "14px",
                                width: "100%",
                                maxWidth: "560px",
                                padding: "2rem",
                                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                            }}
                        >
                            <h2 style={{ fontSize: "1.35rem", fontWeight: 700, color: "#0f172a", margin: "0 0 1.25rem 0" }}>
                                {editingNote ? "Edit Note" : "New Note"}
                            </h2>

                            <form onSubmit={handleSaveNote}>
                                <div style={{ marginBottom: "1.25rem" }}>
                                    <label htmlFor="note-title-input" style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: "#334155", marginBottom: "0.4rem" }}>
                                        Title *
                                    </label>
                                    <input
                                        id="note-title-input"
                                        type="text"
                                        value={noteTitle}
                                        onChange={(e) => setNoteTitle(e.target.value)}
                                        placeholder="e.g. Database ORM Architecture Notes"
                                        required
                                        style={{
                                            width: "100%",
                                            background: "#f8fafc",
                                            border: "1px solid #cbd5e1",
                                            borderRadius: "8px",
                                            padding: "0.65rem 0.85rem",
                                            fontSize: "0.95rem",
                                            color: "#0f172a",
                                            outline: "none",
                                            boxSizing: "border-box",
                                        }}
                                    />
                                </div>

                                <div style={{ marginBottom: "1.75rem" }}>
                                    <label htmlFor="note-content-input" style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: "#334155", marginBottom: "0.4rem" }}>
                                        Content / Observations
                                    </label>
                                    <textarea
                                        id="note-content-input"
                                        rows={6}
                                        value={noteContent}
                                        onChange={(e) => setNoteContent(e.target.value)}
                                        placeholder="Record key architectural details, execution entry flows, or code observations..."
                                        style={{
                                            width: "100%",
                                            background: "#f8fafc",
                                            border: "1px solid #cbd5e1",
                                            borderRadius: "8px",
                                            padding: "0.65rem 0.85rem",
                                            fontSize: "0.95rem",
                                            color: "#0f172a",
                                            outline: "none",
                                            resize: "vertical",
                                            fontFamily: "inherit",
                                            boxSizing: "border-box",
                                        }}
                                    />
                                </div>

                                <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
                                    <button
                                        type="button"
                                        onClick={() => setIsEditorOpen(false)}
                                        style={{
                                            background: "#f1f5f9",
                                            color: "#334155",
                                            border: "1px solid #cbd5e1",
                                            padding: "0.6rem 1.25rem",
                                            borderRadius: "8px",
                                            fontWeight: 600,
                                            fontSize: "0.9rem",
                                            cursor: "pointer",
                                        }}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSaving || !noteTitle.trim()}
                                        style={{
                                            background: "#0284c7",
                                            color: "#ffffff",
                                            border: "none",
                                            padding: "0.6rem 1.25rem",
                                            borderRadius: "8px",
                                            fontWeight: 600,
                                            fontSize: "0.9rem",
                                            cursor: isSaving || !noteTitle.trim() ? "not-allowed" : "pointer",
                                            opacity: isSaving || !noteTitle.trim() ? 0.6 : 1,
                                        }}
                                    >
                                        {isSaving ? "Saving..." : "Save Note"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
    );
}
