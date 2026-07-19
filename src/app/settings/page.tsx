"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTheme } from "@/components/shared/DashboardLayout";

// Typings for State
interface UserProfile {
    id: string;
    email: string;
    name: string | null;
    username: string | null;
    bio: string | null;
    phone: string | null;
    location: string | null;
    college: string | null;
    degree: string | null;
    gradYear: string | null;
    company: string | null;
    website: string | null;
    githubProfile: string | null;
    linkedinProfile: string | null;
    avatarUrl: string | null;
    emailNotifications: boolean;
    pushNotifications: boolean;
    productUpdates: boolean;
    aiAnalysisAlerts: boolean;
    weeklyReports: boolean;
    marketingEmails: boolean;
    themePreference: string;
    accentColor: string;
    publicProfile: boolean;
    showLearningProgress: boolean;
    showUploadedProjects: boolean;
    aiHistoryShared: boolean;
    shareActivity: boolean;
    googleConnected: boolean;
    githubConnected: boolean;
    linkedinConnected: boolean;
    prefLanguages: string;
    prefAiModel: string;
    dailyLearningGoal: number;
    weeklyLearningGoal: number;
    difficultyLevel: string;
    learningStyle: string;
}

interface ActiveSession {
    id: string;
    token: string;
    device: string;
    ipAddress: string;
    lastActive: string;
}

export default function SettingsPage() {
    const router = useRouter();
    const { theme, toggleTheme } = useTheme();

    const [activeTab, setActiveTab] = useState<
        "personal" | "security" | "notifications" | "appearance" | "privacy" | "integrations" | "learning"
    >("personal");

    // Profile state
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [sessions, setSessions] = useState<ActiveSession[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Notification Banner state
    const [banner, setBanner] = useState<{ type: "success" | "error"; message: string } | null>(null);

    // Form inputs states
    // Personal Info
    const [personalForm, setPersonalForm] = useState({
        name: "",
        username: "",
        bio: "",
        phone: "",
        location: "",
        college: "",
        degree: "",
        gradYear: "",
        company: "",
        website: "",
        githubProfile: "",
        linkedinProfile: "",
        avatarUrl: ""
    });

    // Security Info
    const [securityForm, setSecurityForm] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });

    // Learning Preference
    const [learningForm, setLearningForm] = useState({
        prefLanguages: [] as string[],
        prefAiModel: "GPT-4o",
        dailyLearningGoal: 30,
        weeklyLearningGoal: 150,
        difficultyLevel: "Intermediate",
        learningStyle: "Hands-on coding labs"
    });

    // Initial Fetch
    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                const res = await fetch("/api/profile");
                if (res.status === 401) {
                    // Redirect to login if unauthorized
                    router.push("/login");
                    return;
                }
                if (!res.ok) throw new Error("Failed to fetch profile");

                const data = await res.json();
                setProfile(data.profile);
                setSessions(data.sessions || []);

                // Map data to forms
                setPersonalForm({
                    name: data.profile.name || "",
                    username: data.profile.username || "",
                    bio: data.profile.bio || "",
                    phone: data.profile.phone || "",
                    location: data.profile.location || "",
                    college: data.profile.college || "",
                    degree: data.profile.degree || "",
                    gradYear: data.profile.gradYear || "",
                    company: data.profile.company || "",
                    website: data.profile.website || "",
                    githubProfile: data.profile.githubProfile || "",
                    linkedinProfile: data.profile.linkedinProfile || "",
                    avatarUrl: data.profile.avatarUrl || ""
                });

                setLearningForm({
                    prefLanguages: data.profile.prefLanguages ? data.profile.prefLanguages.split(",") : [],
                    prefAiModel: data.profile.prefAiModel || "GPT-4o",
                    dailyLearningGoal: data.profile.dailyLearningGoal || 30,
                    weeklyLearningGoal: data.profile.weeklyLearningGoal || 150,
                    difficultyLevel: data.profile.difficultyLevel || "Intermediate",
                    learningStyle: data.profile.learningStyle || "Hands-on coding labs"
                });

                setIsLoading(false);
            } catch (error: any) {
                console.error("Failed to load settings:", error);

                // Fallback mock details if offline / db issue
                const mockProfile = {
                    id: "mock-id",
                    email: "student@projectcompass.io",
                    name: "Mentor Student",
                    username: "mentor_student",
                    bio: "Exploring algorithm complexity and systems design.",
                    phone: "+1 555-0199",
                    location: "San Francisco, CA",
                    college: "Stanford University",
                    degree: "Computer Science",
                    gradYear: "2026",
                    company: "Acme Labs",
                    website: "https://compass.io",
                    githubProfile: "github.com/mentor_student",
                    linkedinProfile: "linkedin.com/in/mentor_student",
                    avatarUrl: null,
                    emailNotifications: true,
                    pushNotifications: false,
                    productUpdates: true,
                    aiAnalysisAlerts: true,
                    weeklyReports: true,
                    marketingEmails: false,
                    themePreference: "dark",
                    accentColor: "purple",
                    publicProfile: true,
                    showLearningProgress: true,
                    showUploadedProjects: true,
                    aiHistoryShared: true,
                    shareActivity: true,
                    googleConnected: true,
                    githubConnected: false,
                    linkedinConnected: false,
                    prefLanguages: "JavaScript,TypeScript,Python",
                    prefAiModel: "GPT-4o",
                    dailyLearningGoal: 45,
                    weeklyLearningGoal: 200,
                    difficultyLevel: "Intermediate",
                    learningStyle: "Interactive Labs"
                };

                const mockSessions = [
                    { id: "s1", token: "curr", device: "Chrome 122 / Windows", ipAddress: "192.168.1.51", lastActive: new Date().toISOString() },
                    { id: "s2", token: "prev", device: "Safari / iPhone 15", ipAddress: "72.4.99.12", lastActive: new Date(Date.now() - 86400000).toISOString() }
                ];

                setProfile(mockProfile);
                setSessions(mockSessions);
                setPersonalForm({
                    name: mockProfile.name,
                    username: mockProfile.username,
                    bio: mockProfile.bio,
                    phone: mockProfile.phone,
                    location: mockProfile.location,
                    college: mockProfile.college,
                    degree: mockProfile.degree,
                    gradYear: mockProfile.gradYear,
                    company: mockProfile.company,
                    website: mockProfile.website,
                    githubProfile: mockProfile.githubProfile,
                    linkedinProfile: mockProfile.linkedinProfile,
                    avatarUrl: ""
                });

                setLearningForm({
                    prefLanguages: mockProfile.prefLanguages.split(","),
                    prefAiModel: mockProfile.prefAiModel,
                    dailyLearningGoal: mockProfile.dailyLearningGoal,
                    weeklyLearningGoal: mockProfile.weeklyLearningGoal,
                    difficultyLevel: mockProfile.difficultyLevel,
                    learningStyle: mockProfile.learningStyle
                });

                setIsLoading(false);
            }
        };

        fetchProfileData();
    }, [router]);

    // Handle form save execution
    const handleUpdate = async (type: string, data: any) => {
        setIsSaving(true);
        setBanner(null);

        try {
            const res = await fetch("/api/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ type, data })
            });

            const result = await res.json();
            if (!res.ok) throw new Error(result.error || "Update operation failed.");

            // Update local profile state
            if (result.profile) {
                setProfile(result.profile);
            }

            setBanner({ type: "success", message: result.message || "Settings saved successfully." });
            setIsSaving(false);

            // If security fields saved, empty out security inputs
            if (type === "SECURITY_CHANGE_PASSWORD") {
                setSecurityForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
            }

        } catch (error: any) {
            setIsSaving(false);
            setBanner({ type: "error", message: error.message || "Something went wrong." });
        }
    };

    // Logout from single session
    const pruneSession = async (sessId: string) => {
        try {
            const res = await fetch("/api/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ type: "SECURITY_LOGOUT_SESS", data: { sessionId: sessId } })
            });
            if (res.ok) {
                setSessions(sessions.filter(s => s.id !== sessId));
                setBanner({ type: "success", message: "Terminated active session." });
            }
        } catch (err: any) {
            console.error("Session delete error:", err);
        }
    };

    // Logout from all devices
    const terminateAllSessions = async () => {
        try {
            const res = await fetch("/api/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ type: "SECURITY_LOGOUT_ALL" })
            });
            if (res.ok) {
                setSessions([]);
                setBanner({ type: "success", message: "Terminated all other active sessions." });
            }
        } catch (err: any) {
            console.error("All sessions delete error:", err);
        }
    };

    if (isLoading) {
        return (
            <div style={{ display: "flex", flex: 1, alignItems: "center", justifyContent: "center", minHeight: "80vh", flexDirection: "column", gap: "1rem" }}>
                <div className="spinning" style={{ width: "32px", height: "32px", border: "3px solid var(--accent-purple)", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.6s linear infinite" }} />
                <span style={{ color: "var(--fg-secondary)", fontSize: "0.9rem" }}>Loading settings dashboard...</span>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "1.5rem 1rem" }}>

            {/* Header Title */}
            <div style={{ marginBottom: "1.5rem" }}>
                <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--fg-primary)", marginBottom: "0.25rem" }}>
                    Account Settings
                </h1>
                <p style={{ fontSize: "0.85rem", color: "var(--fg-muted)" }}>
                    Update your profile fields, preferences, configure security details, and manage connected apps.
                </p>
            </div>

            {/* Banner Notifications */}
            {banner && (
                <div style={{
                    background: banner.type === "success" ? "var(--accent-emerald-glow)" : "rgba(239, 68, 68, 0.1)",
                    border: banner.type === "success" ? "1px solid var(--accent-emerald)" : "1px solid #ef4444",
                    borderRadius: "8px",
                    padding: "0.75rem 1rem",
                    color: "var(--fg-primary)",
                    fontSize: "0.85rem",
                    marginBottom: "1.5rem",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                }}>
                    <span>{banner.type === "success" ? "✨" : "🛑"} {banner.message}</span>
                    <button style={{ color: "var(--fg-secondary)" }} onClick={() => setBanner(null)}>✕</button>
                </div>
            )}

            {/* Layout Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1.5rem" }} className="responsive-settings-grid">

                {/* Style adjustments for screens */}
                <style dangerouslySetInnerHTML={{
                    __html: `
                    @media (min-width: 900px) {
                        .responsive-settings-grid {
                            grid-template-columns: 280px 1fr !important;
                        }
                    }
                    .setting-tab {
                        display: flex;
                        align-items: center;
                        gap: 0.6rem;
                        width: 100%;
                        padding: 0.6rem 0.8rem;
                        background: none;
                        border: none;
                        text-align: left;
                        font-size: 0.85rem;
                        color: var(--fg-secondary);
                        border-radius: 6px;
                        cursor: pointer;
                        transition: all 0.2s;
                    }
                    .setting-tab.active {
                        background: var(--bg-secondary) !important;
                        color: var(--fg-primary) !important;
                        font-weight: 600;
                        box-shadow: inset 3px 0 0 var(--accent-purple);
                    }
                    .setting-tab:hover:not(.active) {
                        background: rgba(255,255,255,0.03);
                        color: var(--fg-primary);
                    }
                `}} />

                {/* Left Column: Navigation & Summary Card */}
                <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

                    {/* Navigation Tabs */}
                    <div className="glass-card" style={{ padding: "0.75rem", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                        <button className={`setting-tab ${activeTab === "personal" ? "active" : ""}`} onClick={() => setActiveTab("personal")}>
                            👤 Personal Information
                        </button>
                        <button className={`setting-tab ${activeTab === "security" ? "active" : ""}`} onClick={() => setActiveTab("security")}>
                            🔒 Security & Sessions
                        </button>
                        <button className={`setting-tab ${activeTab === "learning" ? "active" : ""}`} onClick={() => setActiveTab("learning")}>
                            🎓 Learning Preferences
                        </button>
                        <button className={`setting-tab ${activeTab === "appearance" ? "active" : ""}`} onClick={() => setActiveTab("appearance")}>
                            🎨 Appearance Themes
                        </button>
                        <button className={`setting-tab ${activeTab === "notifications" ? "active" : ""}`} onClick={() => setActiveTab("notifications")}>
                            🔔 Notification Alerts
                        </button>
                        <button className={`setting-tab ${activeTab === "privacy" ? "active" : ""}`} onClick={() => setActiveTab("privacy")}>
                            🛡️ Privacy Controls
                        </button>
                        <button className={`setting-tab ${activeTab === "integrations" ? "active" : ""}`} onClick={() => setActiveTab("integrations")}>
                            🔌 Connected Dev Apps
                        </button>
                    </div>

                    {/* GitHub/Notion style Dashboard Summary Card */}
                    <div className="glass-card" style={{ padding: "1.25rem", position: "relative", overflow: "hidden" }}>
                        <div style={{
                            position: "absolute",
                            top: 0,
                            right: 0,
                            width: "80px",
                            height: "80px",
                            background: "radial-gradient(circle, var(--accent-purple-glow) 0%, transparent 70%)",
                            zIndex: 0,
                            pointerEvents: "none"
                        }} />

                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem", position: "relative", zIndex: 1 }}>
                            <div style={{
                                width: "42px",
                                height: "42px",
                                borderRadius: "50%",
                                background: "var(--accent-purple)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontWeight: "bold",
                                color: "#fff"
                            }}>
                                {personalForm.name.slice(0, 2).toUpperCase() || "ME"}
                            </div>
                            <div>
                                <h3 style={{ fontSize: "0.9rem", fontWeight: "700", margin: 0 }}>{personalForm.name || "Mentor Student"}</h3>
                                <p style={{ fontSize: "0.75rem", color: "var(--fg-muted)", margin: 0 }}>@{personalForm.username || "student"}</p>
                            </div>
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", borderTop: "1px dashed var(--border-color)", paddingTop: "0.75rem", position: "relative", zIndex: 1 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem" }}>
                                <span style={{ color: "var(--fg-secondary)" }}>🔥 Learning Streak</span>
                                <span style={{ fontWeight: "bold" }}>12 Days</span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem" }}>
                                <span style={{ color: "var(--fg-secondary)" }}>📁 Document Uploads</span>
                                <span style={{ fontWeight: "bold" }}>8 Repos / Files</span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem" }}>
                                <span style={{ color: "var(--fg-secondary)" }}>💻 AI Queries</span>
                                <span style={{ fontWeight: "bold" }}>142 Questions</span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem" }}>
                                <span style={{ color: "var(--fg-secondary)" }}>🎯 Learning Progress</span>
                                <span style={{ fontWeight: "bold", color: "var(--accent-emerald)" }}>67% Complete</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Settings Details Form */}
                <div className="glass-card" style={{ padding: "1.75rem 1.5rem" }}>

                    {/* PERSONAL INFORMATION TAB */}
                    {activeTab === "personal" && (
                        <div>
                            <h3 style={{ fontSize: "1.1rem", fontWeight: "700", marginBottom: "1rem" }}>Personal Information</h3>
                            <form onSubmit={(e) => { e.preventDefault(); handleUpdate("PERSONAL_INFO", personalForm); }} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>

                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                                    <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                                        <label style={{ fontSize: "0.75rem", color: "var(--fg-secondary)", fontWeight: "600" }}>Full Name</label>
                                        <input type="text" value={personalForm.name} onChange={(e) => setPersonalForm({ ...personalForm, name: e.target.value })} style={{ padding: "0.55rem" }} />
                                    </div>
                                    <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                                        <label style={{ fontSize: "0.75rem", color: "var(--fg-secondary)", fontWeight: "600" }}>Username</label>
                                        <input type="text" value={personalForm.username} onChange={(e) => setPersonalForm({ ...personalForm, username: e.target.value })} style={{ padding: "0.55rem" }} />
                                    </div>
                                </div>

                                <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                                    <label style={{ fontSize: "0.75rem", color: "var(--fg-secondary)", fontWeight: "600" }}>Biography (Bio)</label>
                                    <textarea value={personalForm.bio} onChange={(e) => setPersonalForm({ ...personalForm, bio: e.target.value })} style={{ padding: "0.55rem", minHeight: "60px", background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-color)", borderStyle: "solid", borderRadius: "6px", color: "var(--fg-primary)", outline: "none", fontSize: "0.85rem" }} />
                                </div>

                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                                    <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                                        <label style={{ fontSize: "0.75rem", color: "var(--fg-secondary)", fontWeight: "600" }}>PhoneNumber</label>
                                        <input type="text" value={personalForm.phone} onChange={(e) => setPersonalForm({ ...personalForm, phone: e.target.value })} style={{ padding: "0.55rem" }} />
                                    </div>
                                    <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                                        <label style={{ fontSize: "0.75rem", color: "var(--fg-secondary)", fontWeight: "600" }}>Location</label>
                                        <input type="text" value={personalForm.location} onChange={(e) => setPersonalForm({ ...personalForm, location: e.target.value })} style={{ padding: "0.55rem" }} />
                                    </div>
                                </div>

                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
                                    <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                                        <label style={{ fontSize: "0.75rem", color: "var(--fg-secondary)", fontWeight: "600" }}>College/Uni</label>
                                        <input type="text" value={personalForm.college} onChange={(e) => setPersonalForm({ ...personalForm, college: e.target.value })} style={{ padding: "0.55rem" }} />
                                    </div>
                                    <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                                        <label style={{ fontSize: "0.75rem", color: "var(--fg-secondary)", fontWeight: "600" }}>Degree</label>
                                        <input type="text" value={personalForm.degree} onChange={(e) => setPersonalForm({ ...personalForm, degree: e.target.value })} style={{ padding: "0.55rem" }} />
                                    </div>
                                    <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                                        <label style={{ fontSize: "0.75rem", color: "var(--fg-secondary)", fontWeight: "600" }}>Grad Year</label>
                                        <input type="text" value={personalForm.gradYear} onChange={(e) => setPersonalForm({ ...personalForm, gradYear: e.target.value })} style={{ padding: "0.55rem" }} />
                                    </div>
                                </div>

                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                                    <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                                        <label style={{ fontSize: "0.75rem", color: "var(--fg-secondary)", fontWeight: "600" }}>GitHub Profile URL</label>
                                        <input type="text" value={personalForm.githubProfile} onChange={(e) => setPersonalForm({ ...personalForm, githubProfile: e.target.value })} style={{ padding: "0.55rem" }} />
                                    </div>
                                    <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                                        <label style={{ fontSize: "0.75rem", color: "var(--fg-secondary)", fontWeight: "600" }}>LinkedIn Profile URL</label>
                                        <input type="text" value={personalForm.linkedinProfile} onChange={(e) => setPersonalForm({ ...personalForm, linkedinProfile: e.target.value })} style={{ padding: "0.55rem" }} />
                                    </div>
                                </div>

                                <button type="submit" disabled={isSaving} style={{ display: "inline-flex", alignSelf: "flex-start", padding: "0.6rem 1.25rem", background: "var(--accent-purple)", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "600", fontSize: "0.85rem", marginTop: "0.5rem" }}>
                                    {isSaving ? "Saving..." : "Save Alterations"}
                                </button>
                            </form>
                        </div>
                    )}

                    {/* SECURITY & SESSIONS TAB */}
                    {activeTab === "security" && (
                        <div>
                            <h3 style={{ fontSize: "1.1rem", fontWeight: "700", marginBottom: "1rem" }}>Security Configurations</h3>

                            <form onSubmit={(e) => { e.preventDefault(); handleUpdate("SECURITY_CHANGE_PASSWORD", securityForm); }} style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "2rem" }}>
                                <h4 style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--fg-secondary)" }}>Change Password</h4>

                                <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                                    <label style={{ fontSize: "0.75rem", color: "var(--fg-secondary)" }}>Current Password</label>
                                    <input type="password" value={securityForm.currentPassword} onChange={(e) => setSecurityForm({ ...securityForm, currentPassword: e.target.value })} style={{ padding: "0.55rem" }} />
                                </div>
                                <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                                    <label style={{ fontSize: "0.75rem", color: "var(--fg-secondary)" }}>New Password</label>
                                    <input type="password" value={securityForm.newPassword} onChange={(e) => setSecurityForm({ ...securityForm, newPassword: e.target.value })} style={{ padding: "0.55rem" }} />
                                </div>
                                <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                                    <label style={{ fontSize: "0.75rem", color: "var(--fg-secondary)" }}>Confirm New Password</label>
                                    <input type="password" value={securityForm.confirmPassword} onChange={(e) => setSecurityForm({ ...securityForm, confirmPassword: e.target.value })} style={{ padding: "0.55rem" }} />
                                </div>

                                <button type="submit" disabled={isSaving} style={{ display: "inline-flex", alignSelf: "flex-start", padding: "0.6rem 1.25rem", background: "var(--accent-purple)", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "600", fontSize: "0.85rem" }}>
                                    {isSaving ? "Saving..." : "Update Password"}
                                </button>
                            </form>

                            {/* Sessions Details lists */}
                            <div style={{ borderTop: "1px dashed var(--border-color)", paddingTop: "1.5rem" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                                    <h4 style={{ fontSize: "0.9rem", fontWeight: "600", margin: 0 }}>Active Connected Sessions</h4>
                                    {sessions.length > 1 && (
                                        <button onClick={terminateAllSessions} style={{ color: "#ef4444", fontSize: "0.75rem", background: "none", border: "none", cursor: "pointer", fontWeight: "600" }}>
                                            ⚠️ Revoke All Other Devices
                                        </button>
                                    )}
                                </div>

                                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                                    {sessions.map((sess) => (
                                        <div key={sess.id} style={{ display: "flex", justifySelf: "stretch", justifyContent: "space-between", alignItems: "center", background: "rgba(255,255,255,0.01)", border: "1px solid var(--border-color)", borderRadius: "6px", padding: "0.6rem 0.8rem" }}>
                                            <div>
                                                <div style={{ fontSize: "0.8rem", fontWeight: "650", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                                                    🖥️ {sess.device}
                                                    {sess.token === "curr" && (
                                                        <span style={{ fontSize: "0.65rem", background: "var(--accent-emerald-glow)", border: "1px solid var(--accent-emerald)", paddingLeft: "0.3rem", paddingRight: "0.3rem", borderRadius: "4px", color: "var(--accent-emerald)", fontWeight: "bold" }}>
                                                            CURRENT DEVICE
                                                        </span>
                                                    )}
                                                </div>
                                                <div style={{ fontSize: "0.7rem", color: "var(--fg-muted)", marginTop: "0.15rem" }}>
                                                    IP: {sess.ipAddress} • Last online: {new Date(sess.lastActive).toLocaleTimeString()}
                                                </div>
                                            </div>
                                            {sess.token !== "curr" && (
                                                <button onClick={() => pruneSession(sess.id)} style={{ color: "var(--fg-secondary)", fontSize: "0.75rem", background: "rgba(255,255,255,0.03)", border: "1px solid var(--border-color)", padding: "0.25rem 0.5rem", borderRadius: "4px", cursor: "pointer" }}>
                                                    Revoke
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* LEARNING PREFERENCES TAB */}
                    {activeTab === "learning" && (
                        <div>
                            <h3 style={{ fontSize: "1.1rem", fontWeight: "700", marginBottom: "1rem" }}>Learning Preferences</h3>
                            <form onSubmit={(e) => { e.preventDefault(); handleUpdate("LEARNING_PREF", learningForm); }} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>

                                <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                                    <label style={{ fontSize: "0.75rem", color: "var(--fg-secondary)", fontWeight: "600" }}>Preferred Languages (comma separated)</label>
                                    <input
                                        type="text"
                                        value={learningForm.prefLanguages.join(",")}
                                        onChange={(e) => setLearningForm({ ...learningForm, prefLanguages: e.target.value.split(",") })}
                                        placeholder="JavaScript, Python, Go"
                                        style={{ padding: "0.55rem" }}
                                    />
                                    <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginTop: "0.25rem" }}>
                                        {learningForm.prefLanguages.map((lang, i) => lang.trim() && (
                                            <span key={i} style={{ fontSize: "0.7rem", background: "var(--accent-purple-glow)", border: "1px solid var(--accent-purple)", color: "var(--fg-primary)", padding: "0.15rem 0.4rem", borderRadius: "4px" }}>
                                                {lang.trim()}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                                    <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                                        <label style={{ fontSize: "0.75rem", color: "var(--fg-secondary)", fontWeight: "600" }}>AI Assistant Model</label>
                                        <select
                                            value={learningForm.prefAiModel}
                                            onChange={(e) => setLearningForm({ ...learningForm, prefAiModel: e.target.value })}
                                            style={{ padding: "0.55rem", background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-color)", borderStyle: "solid", borderRadius: "6px", color: "var(--fg-primary)" }}
                                        >
                                            <option value="GPT-4o">GPT-4o</option>
                                            <option value="Claude 3.5 Sonnet">Claude 3.5 Sonnet</option>
                                            <option value="Gemini 1.5 Pro">Gemini 1.5 Pro</option>
                                            <option value="Llama 3 70B">Llama 3 70B</option>
                                        </select>
                                    </div>
                                    <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                                        <label style={{ fontSize: "0.75rem", color: "var(--fg-secondary)", fontWeight: "600" }}>Difficulty Level</label>
                                        <select
                                            value={learningForm.difficultyLevel}
                                            onChange={(e) => setLearningForm({ ...learningForm, difficultyLevel: e.target.value })}
                                            style={{ padding: "0.55rem", background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-color)", borderStyle: "solid", borderRadius: "6px", color: "var(--fg-primary)" }}
                                        >
                                            <option value="Beginner">Beginner</option>
                                            <option value="Intermediate">Intermediate</option>
                                            <option value="Advanced">Advanced</option>
                                        </select>
                                    </div>
                                </div>

                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                                    <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                                        <label style={{ fontSize: "0.75rem", color: "var(--fg-secondary)", fontWeight: "600" }}>Daily Coding Goal (minutes)</label>
                                        <input type="number" value={learningForm.dailyLearningGoal} onChange={(e) => setLearningForm({ ...learningForm, dailyLearningGoal: parseInt(e.target.value) || 0 })} style={{ padding: "0.55rem" }} />
                                    </div>
                                    <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                                        <label style={{ fontSize: "0.75rem", color: "var(--fg-secondary)", fontWeight: "600" }}>Weekly Coding Goal (minutes)</label>
                                        <input type="number" value={learningForm.weeklyLearningGoal} onChange={(e) => setLearningForm({ ...learningForm, weeklyLearningGoal: parseInt(e.target.value) || 0 })} style={{ padding: "0.55rem" }} />
                                    </div>
                                </div>

                                <button type="submit" disabled={isSaving} style={{ display: "inline-flex", alignSelf: "flex-start", padding: "0.6rem 1.25rem", background: "var(--accent-purple)", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "600", fontSize: "0.85rem", marginTop: "0.5rem" }}>
                                    {isSaving ? "Saving..." : "Save Preferences"}
                                </button>
                            </form>
                        </div>
                    )}

                    {/* APPEARANCE THEME TAB */}
                    {activeTab === "appearance" && (
                        <div>
                            <h3 style={{ fontSize: "1.1rem", fontWeight: "700", marginBottom: "1rem" }}>Appearance Theme Settings</h3>
                            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

                                <div>
                                    <p style={{ fontSize: "0.8rem", color: "var(--fg-secondary)", marginBottom: "0.5rem" }}>Choose your theme styling mode:</p>
                                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                                        <button
                                            onClick={theme === "light" ? toggleTheme : () => { }}
                                            style={{
                                                padding: "1rem",
                                                border: theme === "light" ? "1.5px solid var(--accent-purple)" : "1px solid var(--border-color)",
                                                background: theme === "light" ? "var(--bg-secondary)" : "rgba(0,0,0,0.01)",
                                                borderRadius: "8px",
                                                cursor: "pointer",
                                                textAlign: "center"
                                            }}
                                        >
                                            <div style={{ fontSize: "1.5rem" }}>☀️</div>
                                            <div style={{ fontSize: "0.85rem", fontWeight: "bold", marginTop: "0.25rem" }}>Light Mode</div>
                                        </button>
                                        <button
                                            onClick={theme === "dark" ? toggleTheme : () => { }}
                                            style={{
                                                padding: "1rem",
                                                border: theme === "dark" ? "1.5px solid var(--accent-purple)" : "1px solid var(--border-color)",
                                                background: theme === "dark" ? "var(--bg-secondary)" : "rgba(0,0,0,0.01)",
                                                borderRadius: "8px",
                                                cursor: "pointer",
                                                textAlign: "center"
                                            }}
                                        >
                                            <div style={{ fontSize: "1.5rem" }}>🌙</div>
                                            <div style={{ fontSize: "0.85rem", fontWeight: "bold", marginTop: "0.25rem" }}>Dark Mode</div>
                                        </button>
                                    </div>
                                </div>

                                <div style={{ borderTop: "1px dashed var(--border-color)", paddingTop: "1rem" }}>
                                    <p style={{ fontSize: "0.8rem", color: "var(--fg-secondary)", marginBottom: "0.5rem" }}>Select Accent Color Override:</p>
                                    <div style={{ display: "flex", gap: "0.75rem" }}>
                                        {["purple", "emerald", "cyan", "blue"].map((color) => {
                                            const colors: Record<string, string> = {
                                                purple: "var(--accent-purple)",
                                                emerald: "var(--accent-emerald)",
                                                cyan: "var(--accent-cyan)",
                                                blue: "#3b82f6"
                                            };
                                            const active = profile?.accentColor === color;
                                            return (
                                                <button
                                                    key={color}
                                                    onClick={() => handleUpdate("APPEARANCE_PREF", { themePreference: theme, accentColor: color })}
                                                    style={{
                                                        width: "36px",
                                                        height: "36px",
                                                        borderRadius: "50%",
                                                        background: colors[color],
                                                        border: active ? "3px solid #fffa" : "1px solid #0000",
                                                        cursor: "pointer",
                                                        boxShadow: active ? "0 0 10px " + colors[color] : "none",
                                                        transform: active ? "scale(1.1)" : "none",
                                                        transition: "all 0.2s"
                                                    }}
                                                    title={color.toUpperCase()}
                                                />
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* NOTIFICATION PREFERENCES TAB */}
                    {activeTab === "notifications" && (
                        <div>
                            <h3 style={{ fontSize: "1.1rem", fontWeight: "700", marginBottom: "1rem" }}>Notification Alerts</h3>
                            {profile && (
                                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>

                                    <div style={{ display: "flex", alignItems: "center", justifySelf: "stretch", justifyContent: "space-between" }}>
                                        <div>
                                            <div style={{ fontSize: "0.85rem", fontWeight: "600" }}>Email Notifications</div>
                                            <div style={{ fontSize: "0.75rem", color: "var(--fg-muted)" }}>Receive email details, digests and account alerts.</div>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={profile.emailNotifications}
                                            onChange={(e) => handleUpdate("NOTIFICATION_PREF", { ...profile, emailNotifications: e.target.checked })}
                                            style={{ width: "20px", height: "20px", cursor: "pointer", accentColor: "var(--accent-purple)" }}
                                        />
                                    </div>

                                    <div style={{ display: "flex", alignItems: "center", justifySelf: "stretch", justifyContent: "space-between" }}>
                                        <div>
                                            <div style={{ fontSize: "0.85rem", fontWeight: "600" }}>Push Notifications</div>
                                            <div style={{ fontSize: "0.75rem", color: "var(--fg-muted)" }}>Receive push notifications inside the browser dashboard.</div>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={profile.pushNotifications}
                                            onChange={(e) => handleUpdate("NOTIFICATION_PREF", { ...profile, pushNotifications: e.target.checked })}
                                            style={{ width: "20px", height: "20px", cursor: "pointer", accentColor: "var(--accent-purple)" }}
                                        />
                                    </div>

                                    <div style={{ display: "flex", alignItems: "center", justifySelf: "stretch", justifyContent: "space-between" }}>
                                        <div>
                                            <div style={{ fontSize: "0.85rem", fontWeight: "600" }}>Product Updates</div>
                                            <div style={{ fontSize: "0.75rem", color: "var(--fg-muted)" }}>Keep notified on new compass workbench version features.</div>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={profile.productUpdates}
                                            onChange={(e) => handleUpdate("NOTIFICATION_PREF", { ...profile, productUpdates: e.target.checked })}
                                            style={{ width: "20px", height: "20px", cursor: "pointer", accentColor: "var(--accent-purple)" }}
                                        />
                                    </div>

                                    <div style={{ display: "flex", alignItems: "center", justifySelf: "stretch", justifyContent: "space-between" }}>
                                        <div>
                                            <div style={{ fontSize: "0.85rem", fontWeight: "600" }}>AI Analysis Alerts</div>
                                            <div style={{ fontSize: "0.75rem", color: "var(--fg-muted)" }}>Get triggered when AI reports are generated on your repositories.</div>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={profile.aiAnalysisAlerts}
                                            onChange={(e) => handleUpdate("NOTIFICATION_PREF", { ...profile, aiAnalysisAlerts: e.target.checked })}
                                            style={{ width: "20px", height: "20px", cursor: "pointer", accentColor: "var(--accent-purple)" }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* PRIVACY CONTROLS TAB */}
                    {activeTab === "privacy" && (
                        <div>
                            <h3 style={{ fontSize: "1.1rem", fontWeight: "700", marginBottom: "1rem" }}>Privacy Details</h3>
                            {profile && (
                                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>

                                    <div style={{ display: "flex", alignItems: "center", justifySelf: "stretch", justifyContent: "space-between" }}>
                                        <div>
                                            <div style={{ fontSize: "0.85rem", fontWeight: "600" }}>Public Profile</div>
                                            <div style={{ fontSize: "0.75rem", color: "var(--fg-muted)" }}>Allows other users in the group to visualize your learning path.</div>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={profile.publicProfile}
                                            onChange={(e) => handleUpdate("PRIVACY_PREF", { ...profile, publicProfile: e.target.checked })}
                                            style={{ width: "20px", height: "20px", cursor: "pointer", accentColor: "var(--accent-purple)" }}
                                        />
                                    </div>

                                    <div style={{ display: "flex", alignItems: "center", justifySelf: "stretch", justifyContent: "space-between" }}>
                                        <div>
                                            <div style={{ fontSize: "0.85rem", fontWeight: "600" }}>Show learning progress metrics</div>
                                            <div style={{ fontSize: "0.75rem", color: "var(--fg-muted)" }}>Includes your milestones progress indicators transparently.</div>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={profile.showLearningProgress}
                                            onChange={(e) => handleUpdate("PRIVACY_PREF", { ...profile, showLearningProgress: e.target.checked })}
                                            style={{ width: "20px", height: "20px", cursor: "pointer", accentColor: "var(--accent-purple)" }}
                                        />
                                    </div>

                                    <div style={{ display: "flex", alignItems: "center", justifySelf: "stretch", justifyContent: "space-between" }}>
                                        <div>
                                            <div style={{ fontSize: "0.85rem", fontWeight: "600" }}>Share AI execution history</div>
                                            <div style={{ fontSize: "0.75rem", color: "var(--fg-muted)" }}>Help improve models by sharing request feedback.</div>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={profile.aiHistoryShared}
                                            onChange={(e) => handleUpdate("PRIVACY_PREF", { ...profile, aiHistoryShared: e.target.checked })}
                                            style={{ width: "20px", height: "20px", cursor: "pointer", accentColor: "var(--accent-purple)" }}
                                        />
                                    </div>

                                    <div style={{ borderTop: "1px dashed var(--border-color)", paddingTop: "1rem", marginTop: "1rem" }}>
                                        <h4 style={{ color: "#ef4444", fontSize: "0.9rem", fontWeight: "600" }}>Danger Zone</h4>
                                        <p style={{ fontSize: "0.75rem", color: "var(--fg-muted)" }}>Permanent action: this deletes your profile, roadmaps, and resets progress details.</p>
                                        <button
                                            onClick={async () => {
                                                if (confirm("Are you absolutely sure you want to delete your account? This action is irreversible.")) {
                                                    const res = await fetch("/api/profile", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "DELETE_ACCOUNT" }) });
                                                    if (res.ok) router.push("/login");
                                                }
                                            }}
                                            style={{
                                                padding: "0.5rem 1rem",
                                                border: "1.5px solid #ef4444",
                                                background: "rgba(239, 68, 68, 0.1)",
                                                color: "#ef4444",
                                                borderRadius: "6px",
                                                fontSize: "0.8rem",
                                                fontWeight: "bold",
                                                cursor: "pointer"
                                            }}
                                        >
                                            Delete Account Permanent
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* CONNECTED DEV APPS / INTEGRATIONS TAB */}
                    {activeTab === "integrations" && (
                        <div>
                            <h3 style={{ fontSize: "1.1rem", fontWeight: "700", marginBottom: "1rem" }}>Connected Dev Apps</h3>
                            <p style={{ fontSize: "0.85rem", color: "var(--fg-muted)", marginBottom: "1.5rem" }}>
                                Connect developer platforms and code repositories directly with Project Compass.
                            </p>

                            {profile && (
                                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                                    {[
                                        { id: "google", service: "Google", dbField: "googleConnected", color: "#4285F4", icon: "📧" },
                                        { id: "github", service: "GitHub", dbField: "githubConnected", color: "#333", icon: "🐙" },
                                        { id: "linkedin", service: "LinkedIn", dbField: "linkedinConnected", color: "#0A66C2", icon: "💼" }
                                    ].map((app) => {
                                        const isConnected = !!(profile as any)[app.dbField];
                                        return (
                                            <div key={app.id} style={{ display: "flex", justifySelf: "stretch", justifyContent: "space-between", alignItems: "center", border: "1px solid var(--border-color)", padding: "0.75rem 1rem", borderRadius: "8px", background: "rgba(255,255,255,0.01)" }}>
                                                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                                                    <span style={{ fontSize: "1.5rem" }}>{app.icon}</span>
                                                    <div>
                                                        <div style={{ fontSize: "0.85rem", fontWeight: "bold" }}>{app.service} Authentication</div>
                                                        <div style={{ fontSize: "0.7rem", color: isConnected ? "var(--accent-emerald)" : "var(--fg-muted)", fontWeight: "600" }}>
                                                            {isConnected ? "✓ Linked & Connected" : "Disconnected"}
                                                        </div>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleUpdate("INTEGRATIONS_PREF", { service: app.id, connected: !isConnected })}
                                                    style={{
                                                        padding: "0.4rem 0.8rem",
                                                        fontSize: "0.75rem",
                                                        fontWeight: "600",
                                                        border: "1px solid var(--border-color)",
                                                        background: isConnected ? "rgba(239, 68, 68, 0.08)" : "var(--accent-purple-glow)",
                                                        color: isConnected ? "#ef4444" : "var(--fg-primary)",
                                                        borderColor: isConnected ? "#ef4444" : "var(--accent-purple)",
                                                        borderRadius: "4px",
                                                        cursor: "pointer"
                                                    }}
                                                >
                                                    {isConnected ? "Disconnect" : "Connect App"}
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}
