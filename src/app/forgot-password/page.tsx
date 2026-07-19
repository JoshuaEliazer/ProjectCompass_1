"use client";

import { useState } from "react";
import Link from "next/link";
import { useTheme } from "@/components/shared/DashboardLayout";

export default function ForgotPasswordPage() {
    const { theme, toggleTheme } = useTheme();
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg("");

        if (!email.trim()) {
            setErrorMsg("Please enter your email address.");
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setErrorMsg("Please enter a valid email address.");
            return;
        }

        setIsLoading(true);

        try {
            const res = await fetch("/api/auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to submit request.");
            }

            setIsSuccess(true);
            setIsLoading(false);

        } catch (error: any) {
            setIsLoading(false);
            setErrorMsg(error.message || "Failed to request reset. Please try again.");
        }
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
            {/* Background design glows */}
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

            {/* Toggle Theme */}
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
            </div>

            {/* Main forgot password card */}
            <div
                className="glass-card"
                style={{
                    width: "100%",
                    maxWidth: "420px",
                    padding: "2.5rem 2rem",
                    boxShadow: "var(--shadow-premium)",
                    border: isSuccess
                        ? "1.5px solid var(--accent-emerald)"
                        : errorMsg
                            ? "1.5px solid #ef4444"
                            : "1px solid var(--border-color)",
                    transition: "all var(--transition-normal)",
                }}
            >
                <div style={{ textAlign: "center", marginBottom: "1.75rem" }}>
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
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                        <span style={{ fontSize: "1.5rem", fontWeight: 900, background: "linear-gradient(135deg, var(--fg-primary) 30%, var(--accent-purple) 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                            Forgot Password
                        </span>
                    </div>
                    <p style={{ fontSize: "0.85rem", color: "var(--fg-secondary)", paddingLeft: "0.5rem", paddingRight: "0.5rem" }}>
                        Enter your email address and we'll send you a link to reset your password.
                    </p>
                </div>

                {isSuccess ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                        <div style={{
                            background: "rgba(16, 185, 129, 0.1)",
                            border: "1px solid var(--accent-emerald)",
                            borderRadius: "6px",
                            padding: "1rem",
                            fontSize: "0.85rem",
                            color: "var(--fg-primary)",
                            textAlign: "center"
                        }}>
                            ✨ A reset email was sent! Please check your inbox. If you don't receive it, verify your email or click Resend below.
                        </div>

                        <button
                            onClick={() => {
                                setIsSuccess(false);
                                setErrorMsg("");
                            }}
                            style={{
                                border: "1px solid var(--border-color)",
                                background: "rgba(255,255,255,0.02)",
                                padding: "0.7rem",
                                borderRadius: "6px",
                                fontSize: "0.85rem",
                                fontWeight: "600",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "0.5rem"
                            }}
                        >
                            🔄 Change Email
                        </button>

                        <Link href="/login" style={{ textAlign: "center", fontSize: "0.8rem", color: "var(--accent-purple)", fontWeight: "600", marginTop: "0.5rem" }}>
                            ← Back to Login
                        </Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                        {errorMsg && (
                            <div style={{
                                background: "rgba(239, 68, 68, 0.1)",
                                border: "1px solid #ef4444",
                                borderRadius: "6px",
                                padding: "0.75rem",
                                fontSize: "0.8rem",
                                color: "#ef4444"
                            }}>
                                🛑 {errorMsg}
                            </div>
                        )}

                        <div style={{ display: "flex", flexDirection: "column", gap: "0.40rem" }}>
                            <label style={{ fontSize: "0.75rem", color: "var(--fg-secondary)", fontWeight: "700", textTransform: "uppercase" }}>
                                Email Address
                            </label>
                            <input
                                type="email"
                                placeholder="name@domain.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                style={{ width: "100%", padding: "0.7rem 0.85rem", fontSize: "0.9rem" }}
                                disabled={isLoading}
                                required
                            />
                        </div>

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
                                opacity: isLoading ? 0.75 : 1,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "0.5rem",
                            }}
                        >
                            {isLoading ? (
                                <>
                                    <div className="spinning" style={{ width: "16px", height: "16px", border: "2px solid #fff", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.6s linear infinite" }} />
                                    Sending Link...
                                </>
                            ) : (
                                "Send Reset Link"
                            )}
                        </button>

                        <div style={{ textAlign: "center", fontSize: "0.8rem", color: "var(--fg-secondary)", marginTop: "0.5rem" }}>
                            Back to{" "}
                            <Link href="/login" style={{ color: "var(--accent-purple)", fontWeight: "600" }}>
                                Login
                            </Link>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
