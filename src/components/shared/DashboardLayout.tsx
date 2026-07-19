"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";

// Simple UI Theme Context
const ThemeContext = createContext({
    theme: "dark",
    toggleTheme: () => { },
});

export function useTheme() {
    return useContext(ThemeContext);
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();

    const [theme, setTheme] = useState("dark");
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [isAiDrawerOpen, setIsAiDrawerOpen] = useState(false);

    // Load and apply theme
    useEffect(() => {
        const savedTheme = localStorage.getItem("compass-theme") || "dark";
        setTheme(savedTheme);
        document.documentElement.setAttribute("data-theme", savedTheme);
    }, []);

    const toggleTheme = () => {
        const nextTheme = theme === "dark" ? "light" : "dark";
        setTheme(nextTheme);
        localStorage.setItem("compass-theme", nextTheme);
        document.documentElement.setAttribute("data-theme", nextTheme);
    };

    // If the path is /login, render children raw (auth pages have independent pages)
    if (pathname === "/login") {
        return (
            <ThemeContext.Provider value={{ theme, toggleTheme }}>
                <div style={{ background: "var(--bg-primary)", color: "var(--fg-primary)", minHeight: "100vh" }}>
                    {children}
                </div>
            </ThemeContext.Provider>
        );
    }

    const menuItems = [
        { label: "Home", path: "/", icon: "🏠" },
        { label: "Developer Workspace", path: "/developers", icon: "💻" },
        { label: "Learning Hub", path: "/software-users", icon: "📊" },
        { label: "AI Assistant", path: "#ai-chat", icon: "🤖", action: () => setIsAiDrawerOpen(true) },
        { label: "Documentation", path: "#docs", icon: "📚" },
        { label: "Projects", path: "#projects", icon: "📁" },
        { label: "Notes", path: "#notes", icon: "📝" },
        { label: "Bookmarks", path: "#bookmarks", icon: "🔖" },
        { label: "Progress", path: "/software-users", icon: "📈" },
        { label: "Analytics", path: "#analytics", icon: "📊" },
        { label: "Settings", path: "#settings", icon: "⚙️" },
    ];

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg-primary)", color: "var(--fg-primary)", fontFamily: "var(--font-sans)", transition: "all var(--transition-normal)" }}>

                {/* LEFT SIDEBAR (Desktop) */}
                <aside
                    style={{
                        width: isSidebarCollapsed ? "70px" : "260px",
                        borderRight: "1px solid var(--border-color)",
                        background: "var(--bg-secondary)",
                        display: "flex",
                        flexDirection: "column",
                        transition: "width var(--transition-normal)",
                        flexShrink: 0,
                        zIndex: 90,
                        position: "sticky",
                        top: 0,
                        height: "100vh",
                    }}
                    className="desktop-sidebar"
                >
                    {/* Logo Section */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: isSidebarCollapsed ? "center" : "space-between", padding: "1.5rem 1.25rem", borderBottom: "1px solid var(--border-color)", height: "70px" }}>
                        {!isSidebarCollapsed && (
                            <Link href="/" style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                                <svg
                                    style={{ color: "var(--accent-purple)", filter: "drop-shadow(0 0 8px var(--accent-purple-glow))" }}
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="22"
                                    height="22"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2.5"
                                >
                                    <circle cx="12" cy="12" r="10" />
                                    <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
                                </svg>
                                <span style={{ fontWeight: 800, fontSize: "1.15rem", background: "linear-gradient(135deg, var(--fg-primary) 30%, var(--accent-purple) 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                                    Compass
                                </span>
                            </Link>
                        )}

                        {/* Collapse Trigger Button */}
                        <button
                            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                            style={{
                                background: "rgba(255,255,255,0.03)",
                                border: "1px solid var(--border-color)",
                                borderRadius: "6px",
                                width: "28px",
                                height: "28px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "var(--fg-secondary)",
                            }}
                        >
                            {isSidebarCollapsed ? "➔" : "⯇"}
                        </button>
                    </div>

                    {/* Navigation Menu List */}
                    <nav style={{ flex: 1, padding: "1rem 0.5rem", overflowY: "auto", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                        {menuItems.map((item) => {
                            const isActive = pathname === item.path;
                            if (item.action) {
                                return (
                                    <button
                                        key={item.label}
                                        onClick={item.action}
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: isSidebarCollapsed ? "0" : "0.75rem",
                                            justifyContent: isSidebarCollapsed ? "center" : "flex-start",
                                            padding: "0.7rem 0.75rem",
                                            borderRadius: "8px",
                                            width: "100%",
                                            fontSize: "0.9rem",
                                            fontWeight: isActive ? "600" : "500",
                                            color: isActive ? "var(--accent-purple)" : "var(--fg-secondary)",
                                            background: isActive ? "var(--accent-purple-glow)" : "transparent",
                                        }}
                                        className="sidebar-link-hover"
                                    >
                                        <span style={{ fontSize: "1.2rem" }}>{item.icon}</span>
                                        {!isSidebarCollapsed && <span>{item.label}</span>}
                                    </button>
                                );
                            }

                            return (
                                <Link
                                    key={item.label}
                                    href={item.path}
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: isSidebarCollapsed ? "0" : "0.75rem",
                                        justifyContent: isSidebarCollapsed ? "center" : "flex-start",
                                        padding: "0.7rem 0.75rem",
                                        borderRadius: "8px",
                                        fontSize: "0.9rem",
                                        fontWeight: isActive ? "600" : "500",
                                        color: isActive ? "var(--accent-purple)" : "var(--fg-secondary)",
                                        background: isActive ? "var(--accent-purple-glow)" : "transparent",
                                    }}
                                    className="sidebar-link-hover"
                                >
                                    <span style={{ fontSize: "1.2rem" }}>{item.icon}</span>
                                    {!isSidebarCollapsed && <span>{item.label}</span>}
                                </Link>
                            );
                        })}
                    </nav>
                </aside>

                {/* CONTAINER CONTENT SECTION */}
                <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>

                    {/* TOP HEADER */}
                    <header
                        style={{
                            height: "70px",
                            borderBottom: "1px solid var(--border-color)",
                            background: "var(--bg-secondary)",
                            backdropFilter: "blur(12px)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "0 1.5rem",
                            position: "sticky",
                            top: 0,
                            zIndex: 80,
                        }}
                    >
                        {/* Hamburger Trigger for mobile details */}
                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                            <button
                                className="mobile-hamburger"
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                style={{
                                    background: "none",
                                    border: "none",
                                    fontSize: "1.5rem",
                                    color: "var(--fg-primary)",
                                    display: "none",
                                }}
                            >
                                ☰
                            </button>

                            {/* Global search input */}
                            <div style={{ position: "relative" }} className="header-search">
                                <svg
                                    style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "var(--fg-muted)" }}
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="14"
                                    height="14"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2.5"
                                >
                                    <circle cx="11" cy="11" r="8" />
                                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                                </svg>
                                <input
                                    type="text"
                                    placeholder="Ask and search codebase or roadmap..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    style={{
                                        padding: "0.45rem 1rem 0.45rem 2rem",
                                        fontSize: "0.85rem",
                                        width: "280px",
                                        background: "var(--bg-primary)",
                                        borderRadius: "6px",
                                        border: "1px solid var(--border-color)",
                                    }}
                                />
                            </div>
                        </div>

                        {/* Right Quick Controls */}
                        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>

                            {/* AI Assistant Button */}
                            <button
                                onClick={() => setIsAiDrawerOpen(true)}
                                style={{
                                    background: "var(--accent-purple-glow)",
                                    border: "1px solid rgba(168,85,247,0.2)",
                                    color: "var(--accent-purple)",
                                    padding: "0.4rem 0.75rem",
                                    borderRadius: "6px",
                                    fontSize: "0.8rem",
                                    fontWeight: "600",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "0.35rem",
                                }}
                            >
                                <span>🤖</span>
                                <span className="hide-mobile">AI Copilot</span>
                            </button>

                            {/* Toggle theme widget */}
                            <button
                                onClick={toggleTheme}
                                style={{
                                    fontSize: "1.2rem",
                                    color: "var(--fg-secondary)",
                                    background: "rgba(255,255,255,0.03)",
                                    border: "1px solid var(--border-color)",
                                    borderRadius: "6px",
                                    width: "32px",
                                    height: "32px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                                title="Toggle Active Theme Mode"
                            >
                                {theme === "dark" ? "☀️" : "🌙"}
                            </button>

                            {/* Alerts Bell notification icon */}
                            <button
                                style={{
                                    fontSize: "1.1rem",
                                    color: "var(--fg-secondary)",
                                    background: "rgba(255,255,255,0.03)",
                                    border: "1px solid var(--border-color)",
                                    borderRadius: "6px",
                                    width: "32px",
                                    height: "32px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    position: "relative",
                                }}
                            >
                                🔔
                                <span style={{ position: "absolute", top: "2px", right: "2px", width: "7px", height: "7px", background: "red", borderRadius: "50%" }}></span>
                            </button>

                            {/* Profile Avatar trigger */}
                            <div style={{ position: "relative" }}>
                                <button
                                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                                    style={{
                                        width: "32px",
                                        height: "32px",
                                        borderRadius: "50%",
                                        background: "linear-gradient(135deg, var(--accent-purple), var(--accent-cyan))",
                                        color: "#fff",
                                        fontWeight: "bold",
                                        fontSize: "0.85rem",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        border: "1px solid var(--border-color)",
                                    }}
                                >
                                    MS
                                </button>

                                {isProfileOpen && (
                                    <div
                                        style={{
                                            position: "absolute",
                                            right: 0,
                                            top: "40px",
                                            width: "180px",
                                            background: "var(--bg-secondary)",
                                            border: "1px solid var(--border-color)",
                                            borderRadius: "8px",
                                            boxShadow: "var(--shadow-lg)",
                                            padding: "0.5rem",
                                            zIndex: 100,
                                        }}
                                    >
                                        <div style={{ padding: "0.4rem 0.5rem", borderBottom: "1px solid var(--border-color)" }}>
                                            <div style={{ fontWeight: "bold", fontSize: "0.85rem" }}>Mentor Student</div>
                                            <div style={{ fontSize: "0.75rem", color: "var(--fg-muted)" }}>student@compass.io</div>
                                        </div>
                                        <Link
                                            href="/login"
                                            onClick={() => setIsProfileOpen(false)}
                                            style={{
                                                display: "block",
                                                padding: "0.4rem 0.5rem",
                                                fontSize: "0.8rem",
                                                color: "var(--fg-secondary)",
                                                borderRadius: "6px",
                                            }}
                                            className="sidebar-link-hover"
                                        >
                                            🚪 Log Out
                                        </Link>
                                    </div>
                                )}
                            </div>

                        </div>
                    </header>

                    {/* MAIN PAGE CHILDREN WRAP */}
                    <main style={{ flex: 1, overflowY: "auto" }}>
                        {children}
                    </main>

                </div>

                {/* MOBILE DRAWER SIDEBAR SCREEN OVERLAY */}
                {isMobileMenuOpen && (
                    <div
                        style={{
                            position: "fixed",
                            top: 0,
                            left: 0,
                            width: "100%",
                            height: "100%",
                            background: "rgba(0,0,0,0.5)",
                            zIndex: 150,
                        }}
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        <div
                            style={{
                                width: "260px",
                                height: "100%",
                                background: "var(--bg-secondary)",
                                boxShadow: "var(--shadow-premium)",
                                display: "flex",
                                flexDirection: "column",
                            }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1.5rem", borderBottom: "1px solid var(--border-color)" }}>
                                <span style={{ fontWeight: 800 }}>Project Compass</span>
                                <button onClick={() => setIsMobileMenuOpen(false)} style={{ fontSize: "1.2rem", color: "var(--fg-primary)" }}>✕</button>
                            </div>
                            <nav style={{ padding: "1rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                                {menuItems.map((item) => (
                                    <Link
                                        key={item.label}
                                        href={item.path}
                                        onClick={() => {
                                            if (item.action) item.action();
                                            setIsMobileMenuOpen(false);
                                        }}
                                        style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.6rem 0.75rem", borderRadius: "6px", color: "var(--fg-secondary)" }}
                                    >
                                        <span>{item.icon}</span>
                                        <span>{item.label}</span>
                                    </Link>
                                ))}
                            </nav>
                        </div>
                    </div>
                )}

                {/* AI COPILOT SIDE DRAW DIALOG */}
                {isAiDrawerOpen && (
                    <div
                        style={{
                            position: "fixed",
                            top: 0,
                            right: 0,
                            width: "380px",
                            height: "100vh",
                            background: "var(--bg-secondary)",
                            borderLeft: "1px solid var(--accent-purple)",
                            boxShadow: "var(--shadow-premium)",
                            zIndex: 200,
                            display: "flex",
                            flexDirection: "column",
                        }}
                    >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1.25rem", borderBottom: "1px solid var(--border-color)", background: "var(--accent-purple-glow)" }}>
                            <h3 style={{ fontSize: "1.1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                <span>🤖</span> AI Compass Assistant
                            </h3>
                            <button onClick={() => setIsAiDrawerOpen(false)} style={{ color: "var(--fg-primary)", fontSize: "1.2rem" }}>✕</button>
                        </div>

                        {/* Copilot chat log mock */}
                        <div style={{ flex: 1, padding: "1.25rem", overflowY: "auto", display: "flex", flexDirection: "column", gap: "1rem", fontSize: "0.85rem" }}>
                            <div style={{ background: "var(--bg-primary)", border: "1px solid var(--border-color)", padding: "0.8rem", borderRadius: "8px" }}>
                                Hello! I am your AI Codebase & Roadmap Copilot. Type any command to debug files, trace functions, or ask application walkthrough questions.
                            </div>
                            <div style={{ alignSelf: "flex-end", background: "var(--accent-purple-glow)", padding: "0.8rem", borderRadius: "8px", color: "var(--fg-primary)" }}>
                                How do I write a measure in Power BI?
                            </div>
                            <div style={{ background: "var(--bg-primary)", border: "1px solid var(--border-color)", padding: "0.8rem", borderRadius: "8px", color: "var(--fg-secondary)" }}>
                                To write a measure: select 'New Measure' in the dashboard view modeling tab. Then write: `Total Sales = SUM(Sales[Amount])`.
                            </div>
                        </div>

                        {/* Input bar */}
                        <div style={{ padding: "1rem", borderTop: "1px solid var(--border-color)", display: "flex", gap: "0.5rem" }}>
                            <input
                                type="text"
                                placeholder="Ask about formulas / AST nodes..."
                                style={{ flex: 1, padding: "0.5rem", fontSize: "0.8rem", borderRadius: "4px" }}
                            />
                            <button style={{ background: "var(--accent-purple)", color: "#fff", padding: "0.5rem 1rem", borderRadius: "4px", fontSize: "0.8rem", fontWeight: "bold" }}>
                                Send
                            </button>
                        </div>
                    </div>
                )}

            </div>
        </ThemeContext.Provider>
    );
}
