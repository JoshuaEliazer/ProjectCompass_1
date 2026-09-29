"use client";

import { useState, useEffect } from "react";
import { ApplicationGuideData } from "@/core/use-cases/app-guides";

export default function ApplicationGuidesPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [activeApp, setActiveApp] = useState<string | null>(null);
    const [guide, setGuide] = useState<ApplicationGuideData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [isUnidentifiable, setIsUnidentifiable] = useState(false);
    
    // Recent search history
    const [recentSearches, setRecentSearches] = useState<string[]>([]);

    // Topic learning progress state (persisted per app)
    const [completedItems, setCompletedItems] = useState<Record<string, boolean>>({});

    // Load recent searches from localStorage
    useEffect(() => {
        try {
            const savedHistory = localStorage.getItem("compass_recent_app_guides");
            if (savedHistory) {
                setRecentSearches(JSON.parse(savedHistory));
            }
        } catch {
            // ignore localStorage errors
        }
    }, []);

    // Save recent searches to localStorage
    const addRecentSearch = (appName: string) => {
        setRecentSearches((prev) => {
            const filtered = prev.filter((item) => item.toLowerCase() !== appName.toLowerCase());
            const updated = [appName, ...filtered].slice(0, 8); // Keep top 8 recent
            try {
                localStorage.setItem("compass_recent_app_guides", JSON.stringify(updated));
            } catch {
                // ignore
            }
            return updated;
        });
    };

    // Load learning progress whenever guide changes
    useEffect(() => {
        if (!guide) return;
        try {
            const storageKey = `compass_guide_progress_${guide.normalizedName}`;
            const savedProgress = localStorage.getItem(storageKey);
            if (savedProgress) {
                setCompletedItems(JSON.parse(savedProgress));
            } else {
                setCompletedItems({});
            }
        } catch {
            setCompletedItems({});
        }
    }, [guide]);

    // Toggle item completion
    const toggleCompleted = (itemId: string) => {
        if (!guide) return;
        setCompletedItems((prev) => {
            const nextState = { ...prev, [itemId]: !prev[itemId] };
            try {
                const storageKey = `compass_guide_progress_${guide.normalizedName}`;
                localStorage.setItem(storageKey, JSON.stringify(nextState));
            } catch {
                // ignore
            }
            return nextState;
        });
    };

    // Handle guide generation API call
    const handleSearch = async (targetQuery?: string) => {
        const queryToUse = (targetQuery !== undefined ? targetQuery : searchQuery).trim();
        if (!queryToUse) {
            setErrorMsg("Please enter an application name (e.g. Microsoft Word, Canva, Power BI, Figma).");
            setIsUnidentifiable(false);
            return;
        }

        setIsLoading(true);
        setErrorMsg(null);
        setIsUnidentifiable(false);

        try {
            const res = await fetch("/api/application-guides", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ query: queryToUse }),
            });

            const data = await res.json();

            if (!res.ok) {
                setErrorMsg(data.error || "Failed to generate application guide.");
                setIsUnidentifiable(!!data.unidentifiable);
                setGuide(null);
            } else if (data.guide) {
                setGuide(data.guide);
                setActiveApp(data.guide.appName);
                addRecentSearch(data.guide.appName);
                setSearchQuery(""); // reset input field after success
            }
        } catch (err: any) {
            console.error(err);
            setErrorMsg(err.message || "Something went wrong while generating the guide. Please try again.");
            setGuide(null);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            handleSearch();
        }
    };

    // Calculate progress stats
    const totalLearnableItems = guide ? guide.learningPath.length + guide.tutorials.length : 0;
    const completedCount = Object.values(completedItems).filter(Boolean).length;
    const progressPercent = totalLearnableItems > 0 ? Math.round((completedCount / totalLearnableItems) * 100) : 0;

    return (
        <div style={{ padding: "2.5rem 2rem", minHeight: "100vh", background: "#ffffff", color: "#0f172a", fontFamily: "var(--font-sans, system-ui, sans-serif)" }}>
            <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "2rem" }}>

                {/* Header & Search Bar Section */}
                <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem", padding: "1rem 0" }}>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "#f1f5f9", padding: "0.35rem 0.9rem", borderRadius: "20px", fontSize: "0.85rem", fontWeight: "600", color: "#475569" }}>
                        <span>🧭</span> Interactive Application Intelligence
                    </div>
                    
                    <h1 style={{ fontSize: "2.5rem", fontWeight: "800", color: "#0f172a", letterSpacing: "-0.02em", margin: 0 }}>
                        Application Guides
                    </h1>
                    <p style={{ fontSize: "1.1rem", color: "#64748b", maxWidth: "600px", margin: 0 }}>
                        Learn any software application with Project Compass
                    </p>

                    {/* Search Bar Input */}
                    <div style={{ width: "100%", maxWidth: "680px", display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
                        <div style={{ position: "relative", flex: 1 }}>
                            <span style={{ position: "absolute", left: "1.25rem", top: "50%", transform: "translateY(-50%)", fontSize: "1.2rem", color: "#94a3b8" }}>
                                🔍
                            </span>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Enter an application, e.g. Microsoft Word, Canva, Power BI, Figma..."
                                disabled={isLoading}
                                style={{
                                    width: "100%",
                                    padding: "0.9rem 1rem 0.9rem 3.2rem",
                                    fontSize: "1rem",
                                    borderRadius: "12px",
                                    border: "2px solid #e2e8f0",
                                    outline: "none",
                                    transition: "all 0.2s ease",
                                    background: "#ffffff",
                                    boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
                                }}
                            />
                        </div>
                        <button
                            onClick={() => handleSearch()}
                            disabled={isLoading}
                            style={{
                                padding: "0 1.75rem",
                                borderRadius: "12px",
                                background: "linear-gradient(135deg, #0284c7, #2563eb)",
                                color: "#ffffff",
                                fontWeight: "700",
                                fontSize: "1rem",
                                border: "none",
                                cursor: isLoading ? "not-allowed" : "pointer",
                                opacity: isLoading ? 0.7 : 1,
                                boxShadow: "0 4px 12px rgba(37,99,235,0.25)",
                                display: "flex",
                                alignItems: "center",
                                gap: "0.5rem",
                            }}
                        >
                            {isLoading ? (
                                <>
                                    <span style={{ display: "inline-block", animation: "spin 1s linear infinite" }}>🔄</span> Generating...
                                </>
                            ) : (
                                <>
                                    <span>Learn</span> ➔
                                </>
                            )}
                        </button>
                    </div>

                    {/* Dynamic Recently Explored */}
                    {recentSearches.length > 0 && (
                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap", justifyContent: "center", marginTop: "0.5rem" }}>
                            <span style={{ fontSize: "0.85rem", fontWeight: "600", color: "#64748b" }}>Recently Explored:</span>
                            {recentSearches.map((item) => (
                                <button
                                    key={item}
                                    onClick={() => handleSearch(item)}
                                    disabled={isLoading}
                                    style={{
                                        background: activeApp?.toLowerCase() === item.toLowerCase() ? "#eff6ff" : "#f8fafc",
                                        border: activeApp?.toLowerCase() === item.toLowerCase() ? "1px solid #3b82f6" : "1px solid #e2e8f0",
                                        color: activeApp?.toLowerCase() === item.toLowerCase() ? "#1d4ed8" : "#475569",
                                        padding: "0.35rem 0.75rem",
                                        borderRadius: "20px",
                                        fontSize: "0.85rem",
                                        fontWeight: "600",
                                        cursor: "pointer",
                                        transition: "all 0.15s ease",
                                    }}
                                >
                                    {item}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Loading State Skeleton */}
                {isLoading && (
                    <div style={{ background: "#f8fafc", border: "1px dashed #cbd5e1", borderRadius: "16px", padding: "3rem 2rem", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
                        <div style={{ width: "48px", height: "48px", borderRadius: "50%", border: "4px solid #e2e8f0", borderTopColor: "#0284c7", animation: "spin 0.8s linear infinite" }} />
                        <h3 style={{ fontSize: "1.25rem", fontWeight: "700", color: "#0f172a", margin: 0 }}>
                            Generating Application Guide for "{searchQuery || activeApp}"...
                        </h3>
                        <p style={{ fontSize: "0.95rem", color: "#64748b", margin: 0 }}>
                            Analyzing features, keyboard shortcuts, step-by-step tutorials, and learning paths...
                        </p>
                    </div>
                )}

                {/* Error State */}
                {errorMsg && !isLoading && (
                    <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "12px", padding: "1.5rem", color: "#991b1b", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: "700", fontSize: "1.05rem" }}>
                            <span>⚠️</span> {isUnidentifiable ? "Application Not Recognized" : "Generation Alert"}
                        </div>
                        <p style={{ margin: 0, fontSize: "0.95rem", color: "#b91c1c" }}>{errorMsg}</p>
                        
                        {isUnidentifiable && (
                            <div style={{ marginTop: "0.5rem", display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center" }}>
                                <span style={{ fontSize: "0.85rem", fontWeight: "600", color: "#7f1d1d" }}>Try searching for:</span>
                                {["Microsoft Word", "Canva", "Power BI", "Figma", "VS Code", "Notion"].map((suggestion) => (
                                    <button
                                        key={suggestion}
                                        onClick={() => handleSearch(suggestion)}
                                        style={{ background: "#ffffff", border: "1px solid #fca5a5", color: "#991b1b", padding: "0.25rem 0.6rem", borderRadius: "6px", fontSize: "0.8rem", fontWeight: "600", cursor: "pointer" }}
                                    >
                                        {suggestion}
                                    </button>
                                ))}
                            </div>
                        )}

                        <div style={{ marginTop: "0.5rem" }}>
                            <button
                                onClick={() => handleSearch()}
                                style={{ background: "#991b1b", color: "#ffffff", border: "none", padding: "0.4rem 1rem", borderRadius: "6px", fontSize: "0.85rem", fontWeight: "600", cursor: "pointer" }}
                            >
                                Retry Search
                            </button>
                        </div>
                    </div>
                )}

                {/* Empty Default State (before searching) */}
                {!guide && !isLoading && !errorMsg && (
                    <div style={{ background: "linear-gradient(135deg, #f8fafc, #f1f5f9)", border: "1px solid #e2e8f0", borderRadius: "16px", padding: "3.5rem 2rem", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "1.25rem" }}>
                        <div style={{ fontSize: "3rem" }}>💡</div>
                        <h2 style={{ fontSize: "1.5rem", fontWeight: "700", color: "#0f172a", margin: 0 }}>
                            Type Any Software Application Above to Start Learning
                        </h2>
                        <p style={{ fontSize: "1rem", color: "#64748b", maxWidth: "560px", margin: 0, lineHeight: 1.5 }}>
                            Project Compass dynamically analyzes and constructs customized application walkthroughs, core features, keyboard shortcuts, beginner mistakes, and step-by-step tutorials for any tool.
                        </p>
                        
                        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", justifyContent: "center", marginTop: "0.5rem" }}>
                            {["Microsoft Word", "Canva", "Power BI", "Figma", "VS Code", "Notion", "Excel"].map((example) => (
                                <button
                                    key={example}
                                    onClick={() => handleSearch(example)}
                                    style={{
                                        background: "#ffffff",
                                        border: "1px solid #cbd5e1",
                                        color: "#334155",
                                        padding: "0.5rem 1rem",
                                        borderRadius: "8px",
                                        fontSize: "0.9rem",
                                        fontWeight: "600",
                                        cursor: "pointer",
                                        boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
                                    }}
                                >
                                    Learn {example} ➔
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Generated Guide View */}
                {guide && !isLoading && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>

                        {/* Top App Overview Header Card */}
                        <section style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "16px", padding: "2rem", boxShadow: "0 4px 20px rgba(0,0,0,0.03)", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
                                <div>
                                    <div style={{ display: "inline-block", background: "#e0f2fe", color: "#0369a1", padding: "0.25rem 0.75rem", borderRadius: "6px", fontSize: "0.8rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.5rem" }}>
                                        {guide.category}
                                    </div>
                                    <h2 style={{ fontSize: "2rem", fontWeight: "800", color: "#0f172a", margin: 0 }}>
                                        {guide.appName}
                                    </h2>
                                    <p style={{ fontSize: "1.05rem", color: "#475569", margin: "0.25rem 0 0 0" }}>
                                        {guide.tagline}
                                    </p>
                                </div>

                                {/* Progress Indicator */}
                                <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "1rem 1.25rem", minWidth: "220px", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", fontWeight: "700", color: "#334155" }}>
                                        <span>Guide Mastery</span>
                                        <span style={{ color: "#0284c7" }}>{progressPercent}%</span>
                                    </div>
                                    <div style={{ height: "8px", background: "#e2e8f0", borderRadius: "4px", overflow: "hidden" }}>
                                        <div style={{ width: `${progressPercent}%`, height: "100%", background: "linear-gradient(90deg, #0284c7, #16a34a)", transition: "width 0.3s ease" }} />
                                    </div>
                                    <div style={{ fontSize: "0.75rem", color: "#64748b", textAlign: "right" }}>
                                        {completedCount} of {totalLearnableItems} topics completed
                                    </div>
                                </div>
                            </div>

                            {/* Overview 4-Quadrant Grid */}
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1rem", marginTop: "0.5rem" }}>
                                <div style={{ background: "#f8fafc", padding: "1.25rem", borderRadius: "10px", border: "1px solid #f1f5f9" }}>
                                    <div style={{ fontWeight: "700", fontSize: "0.9rem", color: "#0f172a", marginBottom: "0.35rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                                        <span>📌</span> What It Is
                                    </div>
                                    <div style={{ fontSize: "0.9rem", color: "#475569", lineHeight: 1.5 }}>{guide.overview.whatItIs}</div>
                                </div>
                                <div style={{ background: "#f8fafc", padding: "1.25rem", borderRadius: "10px", border: "1px solid #f1f5f9" }}>
                                    <div style={{ fontWeight: "700", fontSize: "0.9rem", color: "#0f172a", marginBottom: "0.35rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                                        <span>🎯</span> What It Is Used For
                                    </div>
                                    <div style={{ fontSize: "0.9rem", color: "#475569", lineHeight: 1.5 }}>{guide.overview.whatItIsUsedFor}</div>
                                </div>
                                <div style={{ background: "#f8fafc", padding: "1.25rem", borderRadius: "10px", border: "1px solid #f1f5f9" }}>
                                    <div style={{ fontWeight: "700", fontSize: "0.9rem", color: "#0f172a", marginBottom: "0.35rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                                        <span>👥</span> Who Uses It
                                    </div>
                                    <div style={{ fontSize: "0.9rem", color: "#475569", lineHeight: 1.5 }}>{guide.overview.whoUsesIt}</div>
                                </div>
                                <div style={{ background: "#f8fafc", padding: "1.25rem", borderRadius: "10px", border: "1px solid #f1f5f9" }}>
                                    <div style={{ fontWeight: "700", fontSize: "0.9rem", color: "#0f172a", marginBottom: "0.35rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                                        <span>⭐</span> Main Purpose
                                    </div>
                                    <div style={{ fontSize: "0.9rem", color: "#475569", lineHeight: 1.5 }}>{guide.overview.mainPurpose}</div>
                                </div>
                            </div>
                        </section>

                        {/* Interactive Learning Path Section */}
                        <section style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <h3 style={{ fontSize: "1.5rem", fontWeight: "800", color: "#0f172a", margin: 0, display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                    <span>📈</span> Learning Progression Path
                                </h3>
                                <span style={{ fontSize: "0.85rem", color: "#64748b" }}>Click 'Mark as Learned' to track your progress</span>
                            </div>

                            <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
                                {guide.learningPath.map((step, idx) => {
                                    const isDone = !!completedItems[step.id];
                                    return (
                                        <div
                                            key={step.id}
                                            style={{
                                                background: isDone ? "#f0fdf4" : "#ffffff",
                                                border: isDone ? "1px solid #86efac" : "1px solid #e2e8f0",
                                                borderRadius: "12px",
                                                padding: "1.25rem",
                                                display: "flex",
                                                gap: "1.25rem",
                                                alignItems: "flex-start",
                                                transition: "all 0.2s ease",
                                            }}
                                        >
                                            <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: isDone ? "#22c55e" : "#0284c7", color: "#ffffff", fontWeight: "700", fontSize: "0.9rem", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                                {isDone ? "✓" : idx + 1}
                                            </div>

                                            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                                                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                                                    <span style={{ fontSize: "0.75rem", fontWeight: "700", background: "#e2e8f0", color: "#334155", padding: "0.15rem 0.5rem", borderRadius: "4px" }}>
                                                        {step.stage}
                                                    </span>
                                                    <span style={{ fontSize: "1.05rem", fontWeight: "700", color: isDone ? "#166534" : "#0f172a" }}>
                                                        {step.title}
                                                    </span>
                                                </div>
                                                <p style={{ fontSize: "0.9rem", color: isDone ? "#15803d" : "#475569", margin: 0, lineHeight: 1.5 }}>
                                                    {step.explanation}
                                                </p>
                                                <div style={{ fontSize: "0.85rem", background: isDone ? "#dcfce7" : "#f1f5f9", padding: "0.5rem 0.75rem", borderRadius: "6px", color: isDone ? "#14532d" : "#334155", marginTop: "0.25rem" }}>
                                                    <strong>Practical Activity:</strong> {step.practicalActivity}
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => toggleCompleted(step.id)}
                                                style={{
                                                    background: isDone ? "#16a34a" : "#ffffff",
                                                    border: isDone ? "1px solid #16a34a" : "1px solid #cbd5e1",
                                                    color: isDone ? "#ffffff" : "#475569",
                                                    padding: "0.4rem 0.85rem",
                                                    borderRadius: "8px",
                                                    fontSize: "0.85rem",
                                                    fontWeight: "600",
                                                    cursor: "pointer",
                                                    flexShrink: 0,
                                                }}
                                            >
                                                {isDone ? "✓ Learned" : "Mark as Learned"}
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </section>

                        {/* Core Features Section */}
                        <section style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                            <h3 style={{ fontSize: "1.5rem", fontWeight: "800", color: "#0f172a", margin: 0, display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                <span>⚙️</span> Core Features
                            </h3>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1rem" }}>
                                {guide.coreFeatures.map((feat) => (
                                    <div key={feat.id} style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "1.5rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                                        <h4 style={{ fontSize: "1.1rem", fontWeight: "700", color: "#0284c7", margin: 0 }}>
                                            {feat.name}
                                        </h4>
                                        <p style={{ fontSize: "0.9rem", color: "#334155", margin: 0, lineHeight: 1.5 }}>
                                            {feat.description}
                                        </p>
                                        <div style={{ fontSize: "0.85rem", background: "#f0f9ff", borderLeft: "3px solid #0284c7", padding: "0.5rem 0.75rem", borderRadius: "0 6px 6px 0", color: "#0369a1" }}>
                                            <strong>Why it is useful:</strong> {feat.whyUseful}
                                        </div>
                                        <div style={{ fontSize: "0.85rem", color: "#64748b" }}>
                                            <strong>How to use:</strong> {feat.howToUse}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Useful / Lesser-Known Features Section */}
                        <section style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                            <h3 style={{ fontSize: "1.5rem", fontWeight: "800", color: "#0f172a", margin: 0, display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                <span>🚀</span> Useful & Productivity Features
                            </h3>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1rem" }}>
                                {guide.usefulFeatures.map((adv) => (
                                    <div key={adv.id} style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "1.5rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                            <h4 style={{ fontSize: "1.05rem", fontWeight: "700", color: "#0f172a", margin: 0 }}>
                                                {adv.name}
                                            </h4>
                                            <span style={{ fontSize: "0.75rem", fontWeight: "700", background: "#fef3c7", color: "#92400e", padding: "0.2rem 0.5rem", borderRadius: "4px" }}>
                                                {adv.category}
                                            </span>
                                        </div>
                                        <p style={{ fontSize: "0.9rem", color: "#334155", margin: 0, lineHeight: 1.5 }}>
                                            {adv.description}
                                        </p>
                                        <div style={{ fontSize: "0.85rem", background: "#fffbeb", borderLeft: "3px solid #f59e0b", padding: "0.5rem 0.75rem", borderRadius: "0 6px 6px 0", color: "#b45309" }}>
                                            <strong>Why it is useful:</strong> {adv.whyUseful}
                                        </div>
                                        <div style={{ fontSize: "0.85rem", color: "#64748b" }}>
                                            <strong>How to use:</strong> {adv.howToUse}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Step-by-Step Tutorials Section */}
                        <section style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                            <h3 style={{ fontSize: "1.5rem", fontWeight: "800", color: "#0f172a", margin: 0, display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                <span>📑</span> Practical Step-by-Step Tutorials
                            </h3>
                            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                                {guide.tutorials.map((tut) => {
                                    const isDone = !!completedItems[tut.id];
                                    return (
                                        <div key={tut.id} style={{ background: "#ffffff", border: isDone ? "1px solid #86efac" : "1px solid #e2e8f0", borderRadius: "12px", padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "0.5rem" }}>
                                                <div>
                                                    <h4 style={{ fontSize: "1.2rem", fontWeight: "700", color: "#0f172a", margin: 0 }}>
                                                        {tut.title}
                                                    </h4>
                                                    <div style={{ fontSize: "0.9rem", color: "#0284c7", fontWeight: "600", marginTop: "0.25rem" }}>
                                                        Goal: {tut.goal}
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => toggleCompleted(tut.id)}
                                                    style={{
                                                        background: isDone ? "#16a34a" : "#f1f5f9",
                                                        border: isDone ? "1px solid #16a34a" : "1px solid #cbd5e1",
                                                        color: isDone ? "#ffffff" : "#475569",
                                                        padding: "0.35rem 0.75rem",
                                                        borderRadius: "6px",
                                                        fontSize: "0.85rem",
                                                        fontWeight: "600",
                                                        cursor: "pointer",
                                                    }}
                                                >
                                                    {isDone ? "✓ Tutorial Completed" : "Mark as Completed"}
                                                </button>
                                            </div>

                                            {/* Tutorial Steps List */}
                                            <div style={{ background: "#f8fafc", borderRadius: "8px", padding: "1rem 1.25rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                                                <div style={{ fontSize: "0.85rem", fontWeight: "700", color: "#334155" }}>Steps:</div>
                                                <ol style={{ margin: 0, paddingLeft: "1.25rem", fontSize: "0.9rem", color: "#475569", display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                                                    {tut.steps.map((stepText, sIdx) => (
                                                        <li key={sIdx}>{stepText}</li>
                                                    ))}
                                                </ol>
                                            </div>

                                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "0.75rem" }}>
                                                <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", padding: "0.75rem", borderRadius: "8px", fontSize: "0.85rem", color: "#166534" }}>
                                                    <strong>Expected Result:</strong> {tut.expectedResult}
                                                </div>
                                                <div style={{ background: "#fefce8", border: "1px solid #fef08a", padding: "0.75rem", borderRadius: "8px", fontSize: "0.85rem", color: "#854d0e" }}>
                                                    <strong>Useful Tip:</strong> {tut.usefulTip}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </section>

                        {/* Shortcuts & Beginner Mistakes 2-Column Grid */}
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: "1.5rem" }}>
                            
                            {/* Shortcuts & Productivity Tips */}
                            <section style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
                                <h3 style={{ fontSize: "1.25rem", fontWeight: "800", color: "#0f172a", margin: 0, display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                    <span>⌨️</span> Shortcuts & Productivity Tips
                                </h3>
                                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                                    {guide.shortcuts.map((sc) => (
                                        <div key={sc.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.75rem", background: "#f8fafc", borderRadius: "8px", border: "1px solid #f1f5f9" }}>
                                            <div>
                                                <div style={{ fontWeight: "700", fontSize: "0.9rem", color: "#0f172a" }}>{sc.action}</div>
                                                <div style={{ fontSize: "0.8rem", color: "#64748b" }}>{sc.description}</div>
                                            </div>
                                            <kbd style={{ background: "#0f172a", color: "#ffffff", padding: "0.25rem 0.6rem", borderRadius: "6px", fontFamily: "monospace", fontSize: "0.85rem", fontWeight: "700", whiteSpace: "nowrap" }}>
                                                {sc.keyCombination}
                                            </kbd>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            {/* Common Beginner Mistakes */}
                            <section style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
                                <h3 style={{ fontSize: "1.25rem", fontWeight: "800", color: "#0f172a", margin: 0, display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                    <span>🛑</span> Common Beginner Mistakes
                                </h3>
                                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                                    {guide.commonMistakes.map((cm) => (
                                        <div key={cm.id} style={{ background: "#fff5f5", border: "1px solid #fed7d7", borderRadius: "8px", padding: "0.85rem", display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                                            <div style={{ fontWeight: "700", fontSize: "0.9rem", color: "#9b2c2c" }}>
                                                ❌ {cm.mistake}
                                            </div>
                                            <div style={{ fontSize: "0.8rem", color: "#742a2a" }}>
                                                <strong>Why it happens:</strong> {cm.whyItHappens}
                                            </div>
                                            <div style={{ fontSize: "0.8rem", color: "#22543d", background: "#f0fff4", padding: "0.35rem 0.5rem", borderRadius: "4px", marginTop: "0.2rem" }}>
                                                <strong>How to avoid:</strong> {cm.howToAvoid}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        </div>

                        {/* Real-World Use Cases */}
                        <section style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                            <h3 style={{ fontSize: "1.5rem", fontWeight: "800", color: "#0f172a", margin: 0, display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                <span>🌐</span> Real-World Use Cases
                            </h3>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1rem" }}>
                                {guide.realWorldUseCases.map((uc) => (
                                    <div key={uc.id} style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "1.25rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                                        <div style={{ fontSize: "0.8rem", fontWeight: "700", background: "#e0e7ff", color: "#3730a3", padding: "0.2rem 0.5rem", borderRadius: "4px", alignSelf: "flex-start" }}>
                                            {uc.userRole}
                                        </div>
                                        <div style={{ fontSize: "0.9rem", color: "#334155", lineHeight: 1.5 }}>
                                            <strong>Scenario:</strong> {uc.scenario}
                                        </div>
                                        <div style={{ fontSize: "0.85rem", color: "#166534", background: "#f0fdf4", padding: "0.5rem", borderRadius: "6px" }}>
                                            <strong>Outcome:</strong> {uc.outcome}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* What to Learn Next & Official Sources */}
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem" }}>
                            <section style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "1.5rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                                <h4 style={{ fontSize: "1.1rem", fontWeight: "700", color: "#0f172a", margin: 0 }}>
                                    🎓 What to Learn Next
                                </h4>
                                <ul style={{ margin: 0, paddingLeft: "1.25rem", fontSize: "0.9rem", color: "#475569", display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                                    {guide.whatToLearnNext.map((item, idx) => (
                                        <li key={idx}>{item}</li>
                                    ))}
                                </ul>
                            </section>

                            <section style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "1.5rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                                <h4 style={{ fontSize: "1.1rem", fontWeight: "700", color: "#0f172a", margin: 0 }}>
                                    🔗 Official Sources & Documentation
                                </h4>
                                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                                    {guide.sources.map((src, idx) => (
                                        <a
                                            key={idx}
                                            href={src.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{ fontSize: "0.9rem", color: "#0284c7", fontWeight: "600", textDecoration: "none", display: "flex", alignItems: "center", gap: "0.35rem" }}
                                        >
                                            <span>↗</span> {src.title} ({src.type})
                                        </a>
                                    ))}
                                </div>
                            </section>
                        </div>

                    </div>
                )}

            </div>
        </div>
    );
}
