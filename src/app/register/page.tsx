"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTheme } from "@/components/shared/DashboardLayout";

export default function RegisterPage() {
    const { theme, toggleTheme } = useTheme();
    const [name, setName] = useState("");
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [acceptTerms, setAcceptTerms] = useState(false);

    const [errorMsg, setErrorMsg] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    // Password strength state: 0=empty, 1=weak, 2=medium, 3=strong
    const [passwordStrength, setPasswordStrength] = useState(0);
    const [strengthLabel, setStrengthLabel] = useState("");
    const [strengthColor, setStrengthColor] = useState("transparent");

    useEffect(() => {
        if (!password) {
            setPasswordStrength(0);
            setStrengthLabel("");
            setStrengthColor("transparent");
            return;
        }

        let score = 0;
        if (password.length >= 8) score++;
        if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
        if (/[0-9]/.test(password) || /[^A-Za-z0-9]/.test(password)) score++;

        setPasswordStrength(score);

        if (score === 1) {
            setStrengthLabel("Weak (needs numbers/symbols/mixed-case)");
            setStrengthColor("#ef4444");
        } else if (score === 2) {
            setStrengthLabel("Medium (good, but could be stronger)");
            setStrengthColor("#eab308");
        } else if (score >= 3) {
            setStrengthLabel("Strong password");
            setStrengthColor("var(--accent-emerald)");
        }
    }, [password]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg("");

        // Validation checks
        if (!name.trim() || !email.trim() || !password || !confirmPassword) {
            setErrorMsg("Please fill in all required fields.");
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setErrorMsg("Please enter a valid email address.");
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

        if (!acceptTerms) {
            setErrorMsg("You must accept the terms and conditions.");
            return;
        }

        setIsLoading(true);

        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name,
                    username: username.trim() || undefined,
                    email,
                    password,
                    confirmPassword,
                    acceptTerms
                })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Registration failed.");
            }

            setIsSuccess(true);
            setIsLoading(false);

            // Redirect to verify-email
            setTimeout(() => {
                window.location.href = "/verify-email";
            }, 800);

        } catch (error: any) {
            setIsLoading(false);
            setErrorMsg(error.message || "Failed to create account. Please try again.");
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
            {/* Background radial soft glows */}
            <div
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    background:
                        "radial-gradient(circle at 15% 20%, var(--accent-purple-glow) 0%, transparent 40%), radial-gradient(circle at 85% 80%, var(--accent-cyan-glow) 0%, transparent 40%)",
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
                    padding: "2.25rem 2rem",
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
                {/* Title info */}
                <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                        <svg
                            style={{ color: "var(--accent-purple)", filter: "drop-shadow(0 0 8px var(--accent-purple-glow))" }}
                            xmlns="http://www.w3.org/2000/svg"
                            width="26"
                            height="26"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                        >
                            <circle cx="12" cy="12" r="10" />
                            <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
                        </svg>
                        <span style={{ fontSize: "1.5rem", fontWeight: 900, letterSpacing: "-0.04em", background: "linear-gradient(135deg, var(--fg-primary) 30%, var(--accent-purple) 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                            Create Account
                        </span>
                    </div>
                    <p style={{ fontSize: "0.85rem", color: "var(--fg-secondary)" }}>
                        Get started with your custom developer workbench
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
                        <h3 style={{ fontSize: "1.25rem", color: "var(--fg-primary)" }}>Verification Sent</h3>
                        <p style={{ fontSize: "0.85rem", color: "var(--fg-muted)" }}>Redirecting to email verification panel...</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>

                        {errorMsg && (
                            <div style={{
                                background: "rgba(239, 68, 68, 0.1)",
                                border: "1px solid #ef4444",
                                borderRadius: "6px",
                                padding: "0.6rem 0.75rem",
                                fontSize: "0.8rem",
                                color: "#ef4444"
                            }}>
                                🛑 {errorMsg}
                            </div>
                        )}

                        {/* Full Name */}
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                            <label style={{ fontSize: "0.7rem", color: "var(--fg-secondary)", fontWeight: "700", textTransform: "uppercase" }}>
                                Full Name *
                            </label>
                            <input
                                type="text"
                                placeholder="E.g. Mentor Student"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                style={{ width: "100%", padding: "0.65rem 0.8rem", fontSize: "0.85rem" }}
                                disabled={isLoading}
                            />
                        </div>

                        {/* Username */}
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                            <label style={{ fontSize: "0.7rem", color: "var(--fg-secondary)", fontWeight: "700", textTransform: "uppercase" }}>
                                Username (optional)
                            </label>
                            <input
                                type="text"
                                placeholder="E.g. mentor_student"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                style={{ width: "100%", padding: "0.65rem 0.8rem", fontSize: "0.85rem" }}
                                disabled={isLoading}
                            />
                        </div>

                        {/* Email Address */}
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                            <label style={{ fontSize: "0.7rem", color: "var(--fg-secondary)", fontWeight: "700", textTransform: "uppercase" }}>
                                Email Address *
                            </label>
                            <input
                                type="email"
                                placeholder="name@domain.com"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                style={{ width: "100%", padding: "0.65rem 0.8rem", fontSize: "0.85rem" }}
                                disabled={isLoading}
                            />
                        </div>

                        {/* Password */}
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                            <label style={{ fontSize: "0.7rem", color: "var(--fg-secondary)", fontWeight: "700", textTransform: "uppercase" }}>
                                Password *
                            </label>
                            <input
                                type="password"
                                placeholder="Minimum 8 characters"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                style={{ width: "100%", padding: "0.65rem 0.8rem", fontSize: "0.85rem" }}
                                disabled={isLoading}
                            />

                            {/* Strength indicator */}
                            {password && (
                                <div style={{ marginTop: "0.25rem" }}>
                                    <div style={{ display: "flex", height: "4px", gap: "4px", background: "rgba(255,255,255,0.05)", borderRadius: "2px", overflow: "hidden" }}>
                                        <div style={{ flex: 1, background: passwordStrength >= 1 ? strengthColor : "transparent", transition: "all 0.3s" }}></div>
                                        <div style={{ flex: 1, background: passwordStrength >= 2 ? strengthColor : "transparent", transition: "all 0.3s" }}></div>
                                        <div style={{ flex: 1, background: passwordStrength >= 3 ? strengthColor : "transparent", transition: "all 0.3s" }}></div>
                                    </div>
                                    <span style={{ fontSize: "0.7rem", color: strengthColor, marginTop: "0.25rem", display: "inline-block", fontWeight: "600" }}>
                                        {strengthLabel}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Confirm Password */}
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                            <label style={{ fontSize: "0.7rem", color: "var(--fg-secondary)", fontWeight: "700", textTransform: "uppercase" }}>
                                Confirm Password *
                            </label>
                            <input
                                type="password"
                                placeholder="Repeat password"
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                style={{ width: "100%", padding: "0.65rem 0.8rem", fontSize: "0.85rem" }}
                                disabled={isLoading}
                            />
                        </div>

                        {/* Accept Terms */}
                        <div style={{ display: "flex", alignItems: "flex-start", gap: "0.55rem", padding: "0.25rem 0" }}>
                            <input
                                type="checkbox"
                                id="acceptTerms"
                                checked={acceptTerms}
                                onChange={(e) => setAcceptTerms(e.target.checked)}
                                style={{ width: "16px", height: "16px", cursor: "pointer", accentColor: "var(--accent-purple)", marginTop: "2px" }}
                                disabled={isLoading}
                            />
                            <label htmlFor="acceptTerms" style={{ fontSize: "0.75rem", color: "var(--fg-secondary)", cursor: "pointer", userSelect: "none", lineHeight: "1.3" }}>
                                I accept the <Link href="#terms" style={{ color: "var(--accent-purple)" }}>Terms of Service</Link> & <Link href="#privacy" style={{ color: "var(--accent-purple)" }}>Privacy Policy</Link>
                            </label>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            style={{
                                background: "linear-gradient(135deg, var(--accent-purple), #8b5cf6)",
                                color: "#fff",
                                padding: "0.75rem",
                                borderRadius: "6px",
                                fontWeight: "600",
                                fontSize: "0.85rem",
                                marginTop: "0.25rem",
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
                                    Creating Account...
                                </>
                            ) : (
                                "Create Account"
                            )}
                        </button>

                        {/* Divider */}
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", margin: "0.25rem 0" }}>
                            <div style={{ flex: 1, height: "1px", background: "var(--border-color)" }}></div>
                            <span style={{ fontSize: "0.65rem", color: "var(--fg-muted)", textTransform: "uppercase", fontWeight: "700" }}>Or Signup With</span>
                            <div style={{ flex: 1, height: "1px", background: "var(--border-color)" }}></div>
                        </div>

                        {/* Social Signups */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                            <button
                                type="button"
                                style={{
                                    border: "1px solid var(--border-color)",
                                    background: "rgba(255,255,255,0.02)",
                                    color: "var(--fg-secondary)",
                                    padding: "0.5rem",
                                    borderRadius: "6px",
                                    fontSize: "0.75rem",
                                    fontWeight: "600",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: "0.4rem"
                                }}
                                onClick={() => alert("Connecting with Google...")}
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
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
                                    padding: "0.5rem",
                                    borderRadius: "6px",
                                    fontSize: "0.75rem",
                                    fontWeight: "600",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: "0.4rem"
                                }}
                                onClick={() => alert("Connecting with GitHub...")}
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                                </svg>
                                GitHub
                            </button>
                        </div>

                        {/* Sign in prompt */}
                        <div style={{ textAlign: "center", fontSize: "0.8rem", color: "var(--fg-secondary)", marginTop: "0.25rem" }}>
                            Already have an account?{" "}
                            <Link href="/login" style={{ color: "var(--accent-purple)", fontWeight: "600" }}>
                                Sign in
                            </Link>
                        </div>

                    </form>
                )}
            </div>
        </div>
    );
}
