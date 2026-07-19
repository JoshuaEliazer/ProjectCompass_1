"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface GuideStep {
    id: string;
    order: number;
    title: string;
    content: string;
    shortcuts: string | null;
    productivityTips: string | null;
    practiceTask: string | null;
}

interface QuizQuestion {
    id: string;
    questionText: string;
    options: string; // JSON string array
    correctAnswer: string;
    explanation: string | null;
}

interface Quiz {
    id: string;
    title: string;
    description: string | null;
    questions: QuizQuestion[];
}

interface LearningPath {
    id: string;
    title: string;
    description: string | null;
    difficulty: string;
    steps: GuideStep[];
    quizzes: Quiz[];
}

interface Application {
    id: string;
    name: string;
    description: string;
    icon: string;
    learningPaths: LearningPath[];
}

export default function SoftwareUsersDashboard() {
    const [apps, setApps] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);
    const [errorText, setErrorText] = useState("");
    const [selectedApp, setSelectedApp] = useState<Application | null>(null);
    const [selectedPath, setSelectedPath] = useState<LearningPath | null>(null);

    // Progress states
    const [completedSteps, setCompletedSteps] = useState<string[]>([]);
    const [savedQuizScore, setSavedQuizScore] = useState<number | null>(null);

    // Quiz states
    const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
    const [quizSubmitted, setQuizSubmitted] = useState(false);
    const [currentScore, setCurrentScore] = useState(0);

    // Load applications
    useEffect(() => {
        async function loadApps() {
            try {
                const res = await fetch("/api/apps");
                if (!res.ok) throw new Error("Failed to load roadmaps.");
                const data = await res.json();
                setApps(data);
            } catch (err: any) {
                console.error(err);
                setErrorText(err.message || "Something went wrong.");
            } finally {
                setLoading(false);
            }
        }
        loadApps();
    }, []);

    // Fetch progress when path selected
    useEffect(() => {
        if (!selectedPath) return;

        async function loadProgress() {
            try {
                const res = await fetch(`/api/progress?learningPathId=${selectedPath?.id}`);
                if (res.ok) {
                    const progress = await res.json();
                    const completedList = progress.completedSteps
                        ? progress.completedSteps.split(",").filter(Boolean)
                        : [];
                    setCompletedSteps(completedList);
                    setSavedQuizScore(progress.quizScore);
                }
            } catch (err) {
                console.error("Failed to load progress:", err);
            }
        }

        loadProgress();
        // Reset local quiz state
        setQuizAnswers({});
        setQuizSubmitted(false);
        setCurrentScore(0);
    }, [selectedPath]);

    // Handle steps completeness toggling
    const toggleStep = async (stepId: string) => {
        if (!selectedPath) return;

        let updatedList: string[];
        if (completedSteps.includes(stepId)) {
            updatedList = completedSteps.filter((id) => id !== stepId);
        } else {
            updatedList = [...completedSteps, stepId];
        }
        setCompletedSteps(updatedList);

        // Save to Database
        try {
            await fetch("/api/progress", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    learningPathId: selectedPath.id,
                    completedSteps: updatedList.join(","),
                }),
            });
        } catch (err) {
            console.error("Failed to save progress step:", err);
        }
    };

    // Submit quiz answer validation
    const submitQuiz = async (quiz: Quiz) => {
        let score = 0;
        quiz.questions.forEach((q) => {
            if (quizAnswers[q.id] === q.correctAnswer) {
                score += 1;
            }
        });

        const percentScore = Math.round((score / quiz.questions.length) * 100);
        setCurrentScore(percentScore);
        setQuizSubmitted(true);
        setSavedQuizScore(percentScore);

        // Save to Database
        try {
            await fetch("/api/progress", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    learningPathId: selectedPath!.id,
                    quizId: quiz.id,
                    quizScore: percentScore,
                }),
            });
        } catch (err) {
            console.error("Failed to submit quiz score:", err);
        }
    };

    const currentPercentComp = selectedPath?.steps.length
        ? Math.round((completedSteps.length / selectedPath.steps.length) * 100)
        : 0;

    if (loading) {
        return (
            <div style={{ minHeight: "50vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "1rem" }}>
                <div className="spinning" style={{ width: "40px", height: "40px", border: "3px solid rgba(255,255,255,0.1)", borderTopColor: "var(--accent-purple)", borderRadius: "50%", animation: "spin 1s linear infinite" }}></div>
                <p style={{ color: "var(--fg-secondary)" }}>Loading application roadmaps database...</p>
            </div>
        );
    }

    return (
        <div style={{ padding: "2rem 1.5rem", display: "flex", flexDirection: "column", gap: "2.5rem" }}>

            {errorText && (
                <div style={{ padding: "1.25rem", background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.3)", borderRadius: "8px", color: "#f87171", marginBottom: "2rem" }}>
                    <strong>Configuration error:</strong> {errorText}
                </div>
            )}

            {/* 1. App Selection Grid */}
            {!selectedApp && (
                <div>
                    <div style={{ marginBottom: "2.5rem" }}>
                        <h1 style={{ fontSize: "2.2rem", marginBottom: "0.5rem" }}>Application Guides & roadmaps</h1>
                        <p style={{ color: "var(--fg-secondary)" }}>Master systems in business and development. Select a platform below to begin custom lessons.</p>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "2rem" }}>
                        {apps.map((app) => (
                            <div
                                key={app.id}
                                className="glass-card glow-purple-hover"
                                style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", height: "240px", cursor: "pointer" }}
                                onClick={() => setSelectedApp(app)}
                            >
                                <div>
                                    <span style={{ fontSize: "2.5rem", display: "block", marginBottom: "1rem" }}>{app.icon}</span>
                                    <h3 style={{ fontSize: "1.35rem", marginBottom: "0.5rem" }}>{app.name}</h3>
                                    <p style={{ color: "var(--fg-secondary)", fontSize: "0.9rem", lineHeight: "1.5" }}>{app.description}</p>
                                </div>
                                <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: "0.8rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <span style={{ fontSize: "0.8rem", color: "var(--fg-muted)" }}>{app.learningPaths.length} Active Roads</span>
                                    <span style={{ color: "var(--accent-purple)", fontWeight: "600", fontSize: "0.85rem" }}>Explore Paths →</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 2. Paths Selection view under selected application */}
            {selectedApp && !selectedPath && (
                <div>
                    <div style={{ marginBottom: "2.5rem" }}>
                        <h2 style={{ fontSize: "2rem", marginBottom: "0.4rem" }}>{selectedApp.name} roadmaps</h2>
                        <p style={{ color: "var(--fg-secondary)" }}>Choose an learning path mapped under the {selectedApp.name} stack environment.</p>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                        {selectedApp.learningPaths.map((path) => (
                            <div
                                key={path.id}
                                className="glass-card glow-purple-hover"
                                style={{ cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1.5rem" }}
                                onClick={() => setSelectedPath(path)}
                            >
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", marginBottom: "0.5rem" }}>
                                        <span style={{ fontSize: "0.75rem", padding: "0.15rem 0.4rem", borderRadius: "4px", background: "var(--accent-purple-glow)", color: "var(--accent-purple)", border: "1px solid rgba(168,85,247,0.2)" }}>
                                            {path.difficulty}
                                        </span>
                                        <span style={{ fontSize: "0.8rem", color: "var(--fg-muted)" }}>
                                            {path.steps.length} structured steps
                                        </span>
                                    </div>
                                    <h3 style={{ fontSize: "1.3rem", marginBottom: "0.25rem" }}>{path.title}</h3>
                                    <p style={{ color: "var(--fg-secondary)", fontSize: "0.9rem" }}>{path.description}</p>
                                </div>
                                <div>
                                    <button style={{ background: "linear-gradient(135deg, var(--accent-purple), #8b5cf6)", color: "#fff", border: "none", padding: "0.6rem 1.2rem", borderRadius: "5px", fontWeight: "600", cursor: "pointer" }}>
                                        Start Path
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 3. Steps Checklist & Quiz rendering panel */}
            {selectedApp && selectedPath && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: "2.5rem", alignItems: "start" }}>

                    {/* Left Column: Vertical checklist items */}
                    <div>
                        <div style={{ marginBottom: "2rem" }}>
                            <span style={{ fontSize: "0.8rem", color: "var(--accent-purple)", fontWeight: "600", textTransform: "uppercase" }}>{selectedApp.name} Paths / {selectedPath.difficulty}</span>
                            <h2 style={{ fontSize: "1.8rem", marginTop: "0.25rem", marginBottom: "0.5rem" }}>{selectedPath.title}</h2>

                            {/* Visual completion progress bar */}
                            <div style={{ marginTop: "1.5rem" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", color: "var(--fg-secondary)", marginBottom: "0.4rem" }}>
                                    <span>Step Milestones Progress</span>
                                    <span style={{ fontWeight: "600" }}>{currentPercentComp}% Completed</span>
                                </div>
                                <div style={{ width: "100%", height: "6px", background: "rgba(255,255,255,0.05)", borderRadius: "10px", overflow: "hidden" }}>
                                    <div style={{ width: `${currentPercentComp}%`, height: "100%", background: "linear-gradient(90deg, var(--accent-purple), #8b5cf6)", borderRadius: "10px", transition: "width var(--transition-normal)" }}></div>
                                </div>
                            </div>
                        </div>

                        {/* Checklist list */}
                        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                            {selectedPath.steps.map((step) => {
                                const isDone = completedSteps.includes(step.id);
                                return (
                                    <div
                                        key={step.id}
                                        className="glass-card"
                                        style={{
                                            border: isDone ? "1px solid rgba(16,185,129,0.3)" : "1px solid var(--border-color)",
                                            background: isDone ? "rgba(16,185,129,0.01)" : "rgba(255,255,255,0.02)",
                                            transition: "all var(--transition-normal)",
                                        }}
                                    >
                                        <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>

                                            {/* Interactive Checkbox */}
                                            <button
                                                onClick={() => toggleStep(step.id)}
                                                style={{
                                                    background: isDone ? "var(--accent-emerald)" : "transparent",
                                                    border: isDone ? "1.5px solid var(--accent-emerald)" : "1.5px solid var(--border-color)",
                                                    width: "22px",
                                                    height: "22px",
                                                    borderRadius: "4px",
                                                    cursor: "pointer",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    color: "#000",
                                                    flexShrink: 0,
                                                    marginTop: "0.2rem",
                                                }}
                                            >
                                                {isDone && (
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                                                )}
                                            </button>

                                            <div style={{ flex: 1 }}>
                                                <h3 style={{ fontSize: "1.15rem", color: isDone ? "var(--fg-muted)" : "var(--fg-primary)", textDecoration: isDone ? "line-through" : "none", transition: "all var(--transition-fast)" }}>
                                                    Step {step.order}: {step.title}
                                                </h3>
                                                <p style={{ marginTop: "0.75rem", fontSize: "0.92rem", color: "var(--fg-secondary)", lineHeight: "1.6" }}>
                                                    {step.content}
                                                </p>

                                                {/* Shortcuts Block */}
                                                {step.shortcuts && (
                                                    <div style={{ marginTop: "1rem", display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center" }}>
                                                        <span style={{ fontSize: "0.75rem", color: "var(--fg-muted)", fontWeight: "600" }}>HOTKEYS:</span>
                                                        {step.shortcuts.split(",").map((shortcut, i) => (
                                                            <span key={i} style={{ fontSize: "0.75rem", background: "rgba(255,255,255,0.06)", border: "1px solid var(--border-color)", padding: "0.15rem 0.4rem", borderRadius: "4px", fontFamily: "var(--font-mono)", color: "var(--accent-purple)" }}>
                                                                {shortcut.trim()}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}

                                                {/* Productivity tip alerts box */}
                                                {step.productivityTips && (
                                                    <div style={{ marginTop: "1rem", background: "rgba(168,85,247,0.05)", borderLeft: "3px solid var(--accent-purple)", padding: "0.75rem 1rem", borderRadius: "0 6px 6px 0", fontSize: "0.85rem", color: "var(--fg-secondary)" }}>
                                                        <strong>Pro Tip:</strong> {step.productivityTips}
                                                    </div>
                                                )}

                                                {/* Practice items instruction */}
                                                {step.practiceTask && (
                                                    <div style={{ marginTop: "1rem", background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-color)", padding: "0.75rem 1rem", borderRadius: "6px", fontSize: "0.85rem" }}>
                                                        <span style={{ fontWeight: "700", display: "block", marginBottom: "0.25rem", color: "var(--accent-emerald)" }}>⚡ PRACTICE TASK Checklist</span>
                                                        {step.practiceTask}
                                                    </div>
                                                )}

                                            </div>

                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Right Column: Quiz integration widgets */}
                    <aside style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
                        {selectedPath.quizzes.map((quiz) => (
                            <div key={quiz.id} className="glass-card" style={{ border: quizSubmitted ? "1px solid rgba(168,85,247,0.3)" : "1px solid var(--border-color)" }}>
                                <h3 style={{ fontSize: "1.2rem", marginBottom: "0.25rem" }}>{quiz.title}</h3>
                                <p style={{ fontSize: "0.8rem", color: "var(--fg-secondary)", marginBottom: "1.5rem" }}>{quiz.description}</p>

                                {/* Quiz score displays if saved progress exists */}
                                {savedQuizScore !== null && (
                                    <div style={{ marginBottom: "1.5rem", background: "rgba(168,85,247,0.1)", padding: "0.75rem", borderRadius: "6px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                        <span style={{ fontSize: "0.85rem", fontWeight: "600" }}>Saved Quiz Grade</span>
                                        <strong style={{ color: "var(--accent-purple)" }}>{savedQuizScore}% Pass</strong>
                                    </div>
                                )}

                                {/* Question items */}
                                <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                                    {quiz.questions.map((q, idx) => {
                                        const optionsList: string[] = JSON.parse(q.options);
                                        const isCorrect = quizAnswers[q.id] === q.correctAnswer;
                                        return (
                                            <div key={q.id} style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                                                <span style={{ fontSize: "0.85rem", color: "var(--fg-primary)", fontWeight: "600" }}>
                                                    {idx + 1}. {q.questionText}
                                                </span>

                                                {/* Radio checkboxes options */}
                                                <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                                                    {optionsList.map((opt) => {
                                                        const isSelected = quizAnswers[q.id] === opt;
                                                        return (
                                                            <label
                                                                key={opt}
                                                                style={{
                                                                    display: "flex",
                                                                    alignItems: "center",
                                                                    gap: "0.5rem",
                                                                    fontSize: "0.8rem",
                                                                    cursor: quizSubmitted ? "default" : "pointer",
                                                                    padding: "0.4rem",
                                                                    borderRadius: "4px",
                                                                    background: isSelected ? "rgba(255,255,255,0.03)" : "transparent",
                                                                    border: isSelected ? "1px solid var(--border-color)" : "1px solid transparent",
                                                                }}
                                                            >
                                                                <input
                                                                    type="radio"
                                                                    name={`q-${q.id}`}
                                                                    value={opt}
                                                                    checked={isSelected}
                                                                    disabled={quizSubmitted}
                                                                    onChange={() => setQuizAnswers({ ...quizAnswers, [q.id]: opt })}
                                                                />
                                                                <span>{opt}</span>
                                                            </label>
                                                        );
                                                    })}
                                                </div>

                                                {/* Submission Feedback comments */}
                                                {quizSubmitted && (
                                                    <div style={{
                                                        marginTop: "0.5rem",
                                                        padding: "0.5rem",
                                                        fontSize: "0.75rem",
                                                        borderRadius: "4px",
                                                        background: isCorrect ? "rgba(16,185,129,0.05)" : "rgba(239, 68, 68, 0.05)",
                                                        color: isCorrect ? "var(--accent-emerald)" : "#f87171",
                                                        borderLeft: isCorrect ? "2.5px solid var(--accent-emerald)" : "2.5px solid #ef4444",
                                                    }}>
                                                        <span style={{ fontWeight: "700", display: "block" }}>{isCorrect ? "✓ Correct" : `✗ Incorrect (Correct: ${q.correctAnswer})`}</span>
                                                        {q.explanation}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Submission triggers */}
                                {!quizSubmitted ? (
                                    <button
                                        onClick={() => submitQuiz(quiz)}
                                        disabled={Object.keys(quizAnswers).length < quiz.questions.length}
                                        style={{
                                            width: "100%",
                                            marginTop: "1.5rem",
                                            padding: "0.7rem",
                                            borderRadius: "5px",
                                            background: "linear-gradient(135deg, var(--accent-purple), #8b5cf6)",
                                            color: "#fff",
                                            border: "none",
                                            fontWeight: "600",
                                            cursor: "pointer",
                                            opacity: Object.keys(quizAnswers).length < quiz.questions.length ? 0.5 : 1,
                                        }}
                                    >
                                        Submit Answers
                                    </button>
                                ) : (
                                    <div style={{ marginTop: "1.5rem" }}>
                                        <div style={{ textAlign: "center", marginBottom: "0.75rem", fontSize: "0.95rem" }}>
                                            Submit Result Grade Score: <strong style={{ color: "var(--accent-purple)" }}>{currentScore}%</strong>
                                        </div>
                                        <button
                                            onClick={() => {
                                                setQuizSubmitted(false);
                                                setQuizAnswers({});
                                            }}
                                            style={{
                                                width: "100%",
                                                padding: "0.6rem",
                                                borderRadius: "5px",
                                                background: "rgba(255,255,255,0.05)",
                                                border: "1px solid var(--border-color)",
                                                color: "var(--fg-secondary)",
                                                fontWeight: "500",
                                                cursor: "pointer",
                                            }}
                                        >
                                            Reset quiz answers
                                        </button>
                                    </div>
                                )}

                            </div>
                        ))}
                    </aside>

                </div>
            )}

        </div>
    );
}
