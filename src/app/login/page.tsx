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
    const [rememberMe, setRememberMe] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg("");

        // Validation
        if (!email.trim() || !password) {
            setErrorMsg("Email address and password are required.");
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setErrorMsg("Please enter a valid email address.");
            return;
        }

        setIsLoading(true);

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password, rememberMe }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Authentication failed.");
            }

            setIsSuccess(true);
            setIsLoading(false);

            // Redirect to appropriate workspace
            setTimeout(() => {
                const userRole = data.user?.role || "USER";
                if (userRole === "DEVELOPER") {
                    router.push("/developers");
                } else {
                    router.push("/software-users");
                }
            }, 800);

        } catch (error: any) {
            setIsLoading(false);
            setErrorMsg(error.message || "Something went wrong. Please try again.");
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
                        "radial-gradient(circle at 25% 25%, var(--accent-purple-glow) 0%, transparent 45%), radial-gradient(circle at 75% 75%, var(--accent-cyan-glow) 0%, transparent 45%)",
                    pointerEvents: "none",
                    zIndex: -1,
                }}
            />

            {/* Toggle controls */}
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

            {/* Login Card */}
            <div
                className="glass-card"
                style={{
                    width: "100%",
                    maxWidth: "440px",
                    padding: "2.5rem 2.25rem",
                    boxShadow: "var(--shadow-premium)",
                    border: isSuccess
                        ? "1.5px solid var(--accent-emerald)"
                        : errorMsg
                            ? "1.5px solid #ef4444"
                            : "1px solid var(--border-color)",
                    transition: "all var(--transition-normal)",
                    transform: isSuccess ? "scale(0.98)" : "none",
                }}
            >
                {/* Logo and title header */}
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
                        <span style={{ fontSize: "1.75rem", fontWeight: 900, letterSpacing: "-0.04em", background: "linear-gradient(135deg, var(--fg-primary) 30%, var(--accent-purple) 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", userSelect: "none" }}>
                            Project Compass
                        </span>
                    </div>
                    <p style={{ fontSize: "0.85rem", color: "var(--fg-secondary)" }}>
                        Access your developer roadmap & AI workbench
                    </p>
                </div>

                {isSuccess ? (
                    <div style={{ textAlign: "center", padding: "1.5rem 0", display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
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
                        <h3 style={{ fontSize: "1.25rem", color: "var(--fg-primary)" }}>Access Granted</h3>
                        <p style={{ fontSize: "0.85rem", color: "var(--fg-muted)" }}>Redirecting to your workspace...</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

                        {/* Error Callout */}
                        {errorMsg && (
                            <div style={{
                                background: "rgba(239, 68, 68, 0.1)",
                                border: "1px solid #ef4444",
                                borderRadius: "6px",
                                padding: "0.75rem",
                                fontSize: "0.8rem",
                                color: "#ef4444",
                                display: "flex",
                                alignItems: "center",
                                gap: "0.5rem"
                            }}>
                                🛑 {errorMsg}
                            </div>
                        )}

                        {/* Email Address */}
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                            <label style={{ fontSize: "0.75rem", color: "var(--fg-secondary)", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                                Email Address
                            </label>
                            <input
                                type="email"
                                placeholder="name@domain.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                style={{ width: "100%", padding: "0.7rem 0.85rem", fontSize: "0.9rem" }}
                                disabled={isLoading}
                            />
                        </div>

                        {/* Password */}
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <label style={{ fontSize: "0.75rem", color: "var(--fg-secondary)", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                                    Password
                                </label>
                                <Link href="/forgot-password" style={{ fontSize: "0.75rem", color: "var(--accent-purple)", fontWeight: "600" }}>
                                    Forgot password?
                                </Link>
                            </div>
                            <div style={{ position: "relative" }}>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    style={{ width: "100%", padding: "0.7rem 2.5rem 0.7rem 0.85rem", fontSize: "0.9rem" }}
                                    disabled={isLoading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{
                                        position: "absolute",
                                        right: "12px",
                                        top: "50%",
                                        transform: "translateY(-50%)",
                                        color: "var(--fg-secondary)",
                                        fontSize: "0.9rem",
                                    }}
                                    disabled={isLoading}
                                >
                                    {showPassword ? "🙈" : "👁️"}
                                </button>
                            </div>
                        </div>

                        {/* Remember Me */}
                        <div style={{ display: "flex", alignItems: "center", gap: "0.55rem" }}>
                            <input
                                type="checkbox"
                                id="rememberMe"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                                style={{ width: "16px", height: "16px", cursor: "pointer", accentColor: "var(--accent-purple)" }}
                                disabled={isLoading}
                            />
                            <label htmlFor="rememberMe" style={{ fontSize: "0.8rem", color: "var(--fg-secondary)", cursor: "pointer", userSelect: "none" }}>
                                Remember me for 30 days
                            </label>
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
                                marginTop: "0.4rem",
                                opacity: isLoading ? 0.75 : 1,
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
                                    Logging in...
                                </>
                            ) : (
                                "Sign In"
                            )}
                        </button>

                        {/* Divider */}
                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", margin: "0.5rem 0" }}>
                            <div style={{ flex: 1, height: "1px", background: "var(--border-color)" }}></div>
                            <span style={{ fontSize: "0.7rem", color: "var(--fg-muted)", textTransform: "uppercase", fontWeight: "700" }}>Or Continue With</span>
                            <div style={{ flex: 1, height: "1px", background: "var(--border-color)" }}></div>
                        </div>

                        {/* Social Buttons */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                            <button
                                type="button"
                                style={{
                                    border: "1px solid var(--border-color)",
                                    background: "rgba(255,255,255,0.02)",
                                    color: "var(--fg-secondary)",
                                    padding: "0.6rem",
                                    borderRadius: "6px",
                                    fontSize: "0.8rem",
                                    fontWeight: "600",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: "0.4rem"
                                }}
                                onClick={() => alert("Redirecting to Google OAuth login...")}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12.24 10.285V13.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.859-3.578-7.859-8s3.53-8 7.859-8c2.46 0 4.105 1.025 5.047 1.926l2.427-2.334C17.955 2.192 15.34 1 12.24 1 6.033 1 1 6.033 1 12.24s5.033 11.24 11.24 11.24c6.478 0 10.793-4.537 10.793-10.986 0-.746-.08-1.32-.176-1.888H12.24z" />
                                </svg>
                                Google
                            </button>
                            <button
                                type="button"
                                style={{
                                    border: "1px solid var(--border-color)",
                                    background: "rgba(255,255,255,0.02)",
                                    color: "var(--fg-secondary)",
                                    padding: "0.6rem",
                                    borderRadius: "6px",
                                    fontSize: "0.8rem",
                                    fontWeight: "600",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: "0.4rem"
                                }}
                                onClick={() => alert("Redirecting to GitHub OAuth login...")}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                                </svg>
                                GitHub
                            </button>
                        </div>

                        {/* Sign up prompt */}
                        <div style={{ textAlign: "center", fontSize: "0.8rem", color: "var(--fg-secondary)", marginTop: "0.5rem" }}>
                            Don't have an account?{" "}
                            <Link href="/register" style={{ color: "var(--accent-purple)", fontWeight: "600" }}>
                                Sign up now
                            </Link>
                        </div>

                    </form>
                )}
            </div>
        </div>
    );
}
