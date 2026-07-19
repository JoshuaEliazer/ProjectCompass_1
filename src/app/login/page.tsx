"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTheme } from "@/components/shared/DashboardLayout";

export default function LoginPage() {
    const router = useRouter();
    const { theme, toggleTheme } = useTheme();

    const [email, setEmail] = useState("student@projectcompass.io");
    const [password, setPassword] = useState("password123");
    const [role, setRole] = useState("developer");
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        setTimeout(() => {
            setIsLoading(false);
            setIsSuccess(true);

            // Redirect after success animation completion
            setTimeout(() => {
                if (role === "developer") {
                    router.push("/developers");
                } else {
                    router.push("/software-users");
                }
            }, 800);
        }, 1200);
    };

    return (
        <div
            style={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "1.5rem",
                position: "relative",
                overflow: "hidden",
            }}
        >
            {/* Background radial soft glows (respecting active Light/Dark token colors) */}
            <div
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    background:
                        "radial-gradient(circle at 30% 20%, var(--accent-purple-glow) 0%, transparent 40%), radial-gradient(circle at 70% 80%, var(--accent-cyan-glow) 0%, transparent 40%)",
                    pointerEvents: "none",
                    zIndex: -1,
                }}
            />

            {/* Floating Header Toggle for Login */}
            <div style={{ position: "absolute", top: "20px", right: "20px", display: "flex", gap: "0.75rem", zIndex: 10 }}>
                <button
                    onClick={toggleTheme}
                    style={{
                        background: "var(--bg-secondary)",
                        border: "1px solid var(--border-color)",
                        borderRadius: "6px",
                        color: "var(--fg-secondary)",
                        width: "36px",
                        height: "36px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                    title="Toggle Light/Dark Theme"
                >
                    {theme === "dark" ? "☀️" : "🌙"}
                </button>
                <Link
                    href="/"
                    style={{
                        background: "var(--bg-secondary)",
                        border: "1px solid var(--border-color)",
                        borderRadius: "6px",
                        color: "var(--fg-secondary)",
                        padding: "0.5rem 1rem",
                        fontSize: "0.85rem",
                        fontWeight: "600",
                        display: "flex",
                        alignItems: "center",
                    }}
                >
                    Skip to Home
                </Link>
            </div>

            {/* Card wrapper */}
            <div
                className="glass-card"
                style={{
                    width: "100%",
                    maxWidth: "420px",
                    padding: "2.5rem 2rem",
                    boxShadow: "var(--shadow-premium)",
                    border: isSuccess ? "1.5px solid var(--accent-emerald)" : "1px solid var(--border-color)",
                    transition: "all var(--transition-normal)",
                    transform: isSuccess ? "scale(0.98)" : "none",
                }}
            >
                {/* Title */}
                <div style={{ textAlign: "center", marginBottom: "2rem" }}>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
                        <svg
                            style={{ color: "var(--accent-purple)", filter: "drop-shadow(0 0 8px var(--accent-purple-glow))" }}
                            xmlns="http://www.w3.org/2000/svg"
                            width="28"
                            height="28"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                        >
                            <circle cx="12" cy="12" r="10" />
                            <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
                        </svg>
                        <span style={{ fontSize: "1.75rem", fontWeight: 900, letterSpacing: "-0.04em", background: "linear-gradient(135deg, var(--fg-primary) 30%, var(--accent-purple) 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                            Project Compass
                        </span>
                    </div>
                    <p style={{ fontSize: "0.85rem", color: "var(--fg-secondary)" }}>
                        Decode repositories & master applications.
                    </p>
                </div>

                {isSuccess ? (
                    <div style={{ textAlign: "center", padding: "2rem 0", display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
                        <div style={{
                            width: "48px",
                            height: "48px",
                            background: "rgba(16,185,129,0.1)",
                            border: "1px solid var(--accent-emerald)",
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "var(--accent-emerald)",
                            fontSize: "1.5rem"
                        }}>
                            ✓
                        </div>
                        <h3 style={{ fontSize: "1.25rem", color: "var(--fg-primary)" }}>Access Granted</h3>
                        <p style={{ fontSize: "0.85rem", color: "var(--fg-muted)" }}>Redirecting to your dashboard environment...</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

                        {/* Role selection tab row */}
                        <div>
                            <label style={{ display: "block", fontSize: "0.75rem", color: "var(--fg-muted)", marginBottom: "0.5rem", fontWeight: "700", textTransform: "uppercase" }}>
                                Select Workspace Target
                            </label>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", background: "var(--bg-tertiary)", padding: "0.25rem", borderRadius: "8px", border: "1px solid var(--border-color)" }}>
                                <button
                                    type="button"
                                    onClick={() => setRole("developer")}
                                    style={{
                                        padding: "0.5rem",
                                        borderRadius: "6px",
                                        fontSize: "0.8rem",
                                        fontWeight: "600",
                                        background: role === "developer" ? "var(--bg-secondary)" : "transparent",
                                        color: role === "developer" ? "var(--accent-purple)" : "var(--fg-secondary)",
                                        border: role === "developer" ? "1px solid var(--border-color)" : "none",
                                    }}
                                >
                                    💻 Developer
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setRole("user")}
                                    style={{
                                        padding: "0.5rem",
                                        borderRadius: "6px",
                                        fontSize: "0.8rem",
                                        fontWeight: "600",
                                        background: role === "user" ? "var(--bg-secondary)" : "transparent",
                                        color: role === "user" ? "var(--accent-purple)" : "var(--fg-secondary)",
                                        border: role === "user" ? "1px solid var(--border-color)" : "none",
                                    }}
                                >
                                    📊 App Master
                                </button>
                            </div>
                        </div>

                        {/* Email Field */}
                        <div>
                            <label style={{ display: "block", fontSize: "0.75rem", color: "var(--fg-muted)", marginBottom: "0.4rem", fontWeight: "700", textTransform: "uppercase" }}>
                                Email Address
                            </label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                style={{ width: "100%", padding: "0.7rem 0.85rem", fontSize: "0.9rem" }}
                            />
                        </div>

                        {/* Password Field */}
                        <div>
                            <label style={{ display: "block", fontSize: "0.75rem", color: "var(--fg-muted)", marginBottom: "0.4rem", fontWeight: "700", textTransform: "uppercase" }}>
                                Password
                            </label>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                style={{ width: "100%", padding: "0.7rem 0.85rem", fontSize: "0.9rem" }}
                            />
                        </div>

                        {/* Submit button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            style={{
                                background: "linear-gradient(135deg, var(--accent-purple), #8b5cf6)",
                                color: "#fff",
                                padding: "0.8rem",
                                borderRadius: "6px",
                                fontWeight: "600",
                                fontSize: "0.9rem",
                                marginTop: "0.5rem",
                                opacity: isLoading ? 0.7 : 1,
                                boxShadow: "var(--shadow-md)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "0.5rem",
                            }}
                        >
                            {isLoading ? (
                                <>
                                    <div className="spinning" style={{ width: "16px", height: "16px", border: "2px solid #fff", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.6s linear infinite" }} />
                                    Authenticating...
                                </>
                            ) : (
                                "Launch Dashboard Workspace"
                            )}
                        </button>

                        {/* Hint alert */}
                        <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-color)", borderRadius: "6px", padding: "0.6rem 0.8rem", fontSize: "0.75rem", color: "var(--fg-muted)", textAlign: "center", lineHeight: "1.4" }}>
                            💡 Live database login credentials preset to:
                            <br />
                            <code style={{ color: "var(--accent-purple)" }}>student@projectcompass.io</code>
                        </div>

                    </form>
                )}
            </div>
        </div>
    );
}
