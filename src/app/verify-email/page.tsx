"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTheme } from "@/components/shared/DashboardLayout";

export default function VerifyEmailPage() {
    const router = useRouter();
    const { theme, toggleTheme } = useTheme();

    const [isLoading, setIsLoading] = useState(false);
    const [msg, setMsg] = useState("");
    const [errorMsg, setErrorMsg] = useState("");

    const handleResend = async () => {
        setIsLoading(true);
        setMsg("");
        setErrorMsg("");

        try {
            const res = await fetch("/api/auth/verify-email", {
                method: "POST"
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || "Failed to resend verification email.");
            }

            setMsg("✨ Verification link resent! Please check your email inbox (including spam).");
            setIsLoading(false);
        } catch (error: any) {
            setIsLoading(false);
            setErrorMsg(error.message || "Failed to resend code.");
        }
    };

    const handleLogout = async () => {
        try {
            await fetch("/api/auth/logout", { method: "POST" });
            router.push("/login");
        } catch (error) {
            console.error("Logout error:", error);
            router.push("/login");
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

            {/* Card wrapper */}
            <div
                className="glass-card"
                style={{
                    width: "100%",
                    maxWidth: "460px",
                    padding: "2.5rem 2.25rem",
                    boxShadow: "var(--shadow-premium)",
                    border: "1px solid var(--border-color)",
                    textAlign: "center",
                    transition: "all var(--transition-normal)",
                }}
            >
                {/* Envelope Icon */}
                <div style={{
                    width: "64px",
                    height: "64px",
                    background: "var(--accent-purple-glow)",
                    border: "1.5px solid var(--accent-purple)",
                    borderRadius: "50%",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--accent-purple)",
                    fontSize: "2rem",
                    marginBottom: "1.5rem",
                    filter: "drop-shadow(0 0 10px var(--accent-purple-glow))"
                }}>
                    ✉️
                </div>

                <h3 style={{ fontSize: "1.5rem", fontWeight: 900, marginBottom: "0.75rem", background: "linear-gradient(135deg, var(--fg-primary) 30%, var(--accent-purple) 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                    Verify Your Email
                </h3>

                <p style={{ fontSize: "0.85rem", color: "var(--fg-secondary)", lineHeight: "1.6", marginBottom: "1.5rem" }}>
                    We have dispatched a verification email to your registered email address.
                    Please follow the activation link within that email to verify your account credentials.
                </p>

                {msg && (
                    <div style={{
                        background: "var(--accent-emerald-glow)",
                        border: "1px solid var(--accent-emerald)",
                        borderRadius: "6px",
                        padding: "0.75rem",
                        fontSize: "0.8rem",
                        color: "var(--fg-primary)",
                        marginBottom: "1.25rem",
                        textAlign: "left"
                    }}>
                        {msg}
                    </div>
                )}

                {errorMsg && (
                    <div style={{
                        background: "rgba(239, 68, 68, 0.1)",
                        border: "1px solid #ef4444",
                        borderRadius: "6px",
                        padding: "0.75rem",
                        fontSize: "0.8rem",
                        color: "#ef4444",
                        marginBottom: "1.25rem",
                        textAlign: "left"
                    }}>
                        🛑 {errorMsg}
                    </div>
                )}

                {/* Buttons block */}
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    <button
                        onClick={handleResend}
                        disabled={isLoading}
                        style={{
                            background: "linear-gradient(135deg, var(--accent-purple), #8b5cf6)",
                            color: "#fff",
                            padding: "0.75rem",
                            borderRadius: "6px",
                            fontWeight: "600",
                            fontSize: "0.85rem",
                            opacity: isLoading ? 0.75 : 1,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "0.5rem"
                        }}
                    >
                        {isLoading ? (
                            <>
                                <div className="spinning" style={{ width: "16px", height: "16px", border: "2px solid #fff", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.6s linear infinite" }} />
                                Sending Link...
                            </>
                        ) : (
                            "Resend Verification Email"
                        )}
                    </button>

                    <button
                        onClick={handleLogout}
                        style={{
                            border: "1px solid var(--border-color)",
                            background: "rgba(255,255,255,0.02)",
                            color: "var(--fg-secondary)",
                            padding: "0.75rem",
                            borderRadius: "6px",
                            fontSize: "0.85rem",
                            fontWeight: "600",
                        }}
                    >
                        Back to Login (Logout)
                    </button>
                </div>

                <div style={{ fontSize: "0.75rem", color: "var(--fg-muted)", marginTop: "1.5rem" }}>
                    💡 Tip: If you did not receive the email, please investigate your spam folder.
                </div>
            </div>
        </div>
    );
}
