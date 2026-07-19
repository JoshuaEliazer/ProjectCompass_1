"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useTheme } from "@/components/shared/DashboardLayout";

function ResetPasswordForm() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { theme } = useTheme();

    const [token, setToken] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [isSuccess, setIsSuccess] = useState(false);

    // Password strength check
    const [strengthLabel, setStrengthLabel] = useState("");
    const [strengthColor, setStrengthColor] = useState("transparent");

    useEffect(() => {
        const tokenParam = searchParams.get("token") || "";
        setToken(tokenParam);
        if (!tokenParam) {
            setErrorMsg("Missing or invalid password reset token.");
        }
    }, [searchParams]);

    useEffect(() => {
        if (!password) {
            setStrengthLabel("");
            setStrengthColor("transparent");
            return;
        }

        let score = 0;
        if (password.length >= 8) score++;
        if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
        if (/[0-9]/.test(password) || /[^A-Za-z0-9]/.test(password)) score++;

        if (score === 1) {
            setStrengthLabel("Weak password");
            setStrengthColor("#ef4444");
        } else if (score === 2) {
            setStrengthLabel("Medium password");
            setStrengthColor("#eab308");
        } else if (score >= 3) {
            setStrengthLabel("Strong password");
            setStrengthColor("var(--accent-emerald)");
        }
    }, [password]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg("");

        if (!token) {
            setErrorMsg("Cannot reset password without a valid token.");
            return;
        }

        if (!password || !confirmPassword) {
            setErrorMsg("Please fill in all fields.");
            return;
        }

        if (password.length < 8) {
            setErrorMsg("Password must be at least 8 characters long.");
            return;
        }

        if (password !== confirmPassword) {
            setErrorMsg("Passwords do not match.");
            return;
        }

        setIsLoading(true);

        try {
            const res = await fetch("/api/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, password, confirmPassword }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Password reset failed.");
            }

            setIsSuccess(true);
            setIsLoading(false);

            setTimeout(() => {
                router.push("/login");
            }, 1000);

        } catch (error: any) {
            setIsLoading(false);
            setErrorMsg(error.message || "Failed to reset password.");
        }
    };

    return (
        <div
            className="glass-card"
            style={{
                width: "100%",
                maxWidth: "420px",
                padding: "2.5rem 2rem",
                boxShadow: "var(--shadow-premium)",
                border: isSuccess
                    ? "1.5px solid var(--accent-emerald)"
                    : errorMsg && token
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
                        <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
                    </svg>
                    <span style={{ fontSize: "1.5rem", fontWeight: 900, background: "linear-gradient(135deg, var(--fg-primary) 30%, var(--accent-purple) 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                        Reset Password
                    </span>
                </div>
                <p style={{ fontSize: "0.85rem", color: "var(--fg-secondary)" }}>
                    Configure a secure new password for your account.
                </p>
            </div>

            {isSuccess ? (
                <div style={{ textAlign: "center", padding: "1rem 0", display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
                    <div style={{
                        width: "48px",
                        height: "48px",
                        background: "var(--accent-emerald-glow)",
                        border: "1.5px solid var(--accent-emerald)",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "var(--accent-emerald)",
                        fontSize: "1.5rem"
                    }}>
                        ✓
                    </div>
                    <h3 style={{ fontSize: "1.25rem", color: "var(--fg-primary)" }}>Password Updated</h3>
                    <p style={{ fontSize: "0.85rem", color: "var(--fg-muted)" }}>Credentials changed. Loading login panel...</p>
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

                    {!token ? (
                        <div style={{ textAlign: "center", fontSize: "0.85rem", margin: "1rem 0" }}>
                            <Link href="/forgot-password" style={{ color: "var(--accent-purple)", fontWeight: "600" }}>
                                Request another reset token
                            </Link>
                        </div>
                    ) : (
                        <>
                            {/* New Password */}
                            <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                                <label style={{ fontSize: "0.75rem", color: "var(--fg-secondary)", fontWeight: "700", textTransform: "uppercase" }}>
                                    New Password
                                </label>
                                <input
                                    type="password"
                                    placeholder="Minimum 8 characters"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    style={{ width: "100%", padding: "0.7rem 0.85rem", fontSize: "0.9rem" }}
                                    disabled={isLoading}
                                    required
                                />
                                {password && (
                                    <span style={{ fontSize: "0.7rem", color: strengthColor, fontWeight: "600", marginTop: "0.25rem" }}>
                                        {strengthLabel}
                                    </span>
                                )}
                            </div>

                            {/* Confirm Password */}
                            <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                                <label style={{ fontSize: "0.75rem", color: "var(--fg-secondary)", fontWeight: "700", textTransform: "uppercase" }}>
                                    Confirm New Password
                                </label>
                                <input
                                    type="password"
                                    placeholder="Repeat new password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
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
                                        Updating...
                                    </>
                                ) : (
                                    "Save Password"
                                )}
                            </button>
                        </>
                    )}

                    <div style={{ textAlign: "center", fontSize: "0.8rem", color: "var(--fg-secondary)", marginTop: "0.5rem" }}>
                        Back to{" "}
                        <Link href="/login" style={{ color: "var(--accent-purple)", fontWeight: "600" }}>
                            Login
                        </Link>
                    </div>
                </form>
            )}
        </div>
    );
}

export default function ResetPasswordPage() {
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
            <Suspense fallback={
                <div style={{ color: "var(--fg-secondary)", fontSize: "0.9rem" }}>Loading reset system...</div>
            }>
                <ResetPasswordForm />
            </Suspense>
        </div>
    );
}
