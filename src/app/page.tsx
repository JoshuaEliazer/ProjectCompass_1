"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface UserProgress {
  learningPathId: string;
  completedSteps: string;
  quizScore: number | null;
}

export default function DashboardHome() {
  const [currentTime, setCurrentTime] = useState("");
  const [pbiProgress, setPbiProgress] = useState(0);

  // Set system time
  useEffect(() => {
    setCurrentTime("Sunday, July 19, 2026");

    // Fetch actual progress from db if available
    async function getProgress() {
      try {
        const res = await fetch("/api/apps");
        if (res.ok) {
          const apps = await res.json();
          // Find Power BI path id to get mock/real progress percentage
          const pbiApp = apps.find((a: any) => a.name === "Power BI");
          if (pbiApp && pbiApp.learningPaths.length > 0) {
            const pathId = pbiApp.learningPaths[0].id;
            const progressRes = await fetch(`/api/progress?learningPathId=${pathId}`);
            if (progressRes.ok) {
              const progressData = await progressRes.json();
              if (progressData.completedSteps) {
                const list = progressData.completedSteps.split(",").filter(Boolean);
                const stepsCount = pbiApp.learningPaths[0].steps.length;
                setPbiProgress(stepsCount ? Math.round((list.length / stepsCount) * 100) : 0);
              }
            }
          }
        }
      } catch (err) {
        console.error("Failed to read progress metrics for dashboard metrics:", err);
      }
    }
    getProgress();
  }, []);

  return (
    <div style={{ padding: "2rem 1.5rem", display: "flex", flexDirection: "column", gap: "2.5rem" }}>

      {/* 1. Welcome Section */}
      <section
        className="glass-card"
        style={{
          background: "linear-gradient(135deg, var(--bg-secondary) 40%, var(--accent-purple-glow) 100%)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1.5rem",
        }}
      >
        <div>
          <span style={{ fontSize: "0.85rem", color: "var(--accent-purple)", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Workspace Hub
          </span>
          <h1 style={{ fontSize: "2rem", marginTop: "0.25rem", marginBottom: "0.5rem", letterSpacing: "-0.03em" }}>
            Welcome back, Mentor Student
          </h1>
          <p style={{ color: "var(--fg-secondary)", fontSize: "0.95rem" }}>
            {currentTime} • Let's resume mapping database models or learning analytical keys.
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <Link
            href="/login"
            style={{
              border: "1px solid var(--border-color)",
              background: "rgba(255,255,255,0.03)",
              padding: "0.6rem 1.2rem",
              borderRadius: "6px",
              fontSize: "0.85rem",
              fontWeight: "600",
            }}
          >
            Switch Profile
          </Link>
          <Link
            href="/developers"
            style={{
              background: "linear-gradient(135deg, var(--accent-purple), #8b5cf6)",
              color: "#fff",
              padding: "0.6rem 1.28rem",
              borderRadius: "6px",
              fontSize: "0.85rem",
              fontWeight: "600",
              boxShadow: "var(--glow-purple)",
            }}
          >
            Trace Codebase
          </Link>
        </div>
      </section>

      {/* 2. Grid for Core Actions and Continue Learning */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: "2rem" }}>

        {/* Quick Actions Grid */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <h2 style={{ fontSize: "1.25rem", letterSpacing: "-0.01em" }}>Quick Actions</h2>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <Link
              href="/developers"
              className="glass-card glow-cyan-hover"
              style={{ display: "flex", flexDirection: "column", gap: "0.6rem", padding: "1.25rem" }}
            >
              <span style={{ fontSize: "1.5rem" }}>💻</span>
              <h3 style={{ fontSize: "1rem" }}>Developer Workspace</h3>
              <p style={{ fontSize: "0.78rem", color: "var(--fg-muted)", lineHeight: "1.4" }}>
                Scan repository AST files and inspect visual dependency trees.
              </p>
            </Link>

            <Link
              href="/software-users"
              className="glass-card glow-purple-hover"
              style={{ display: "flex", flexDirection: "column", gap: "0.6rem", padding: "1.25rem" }}
            >
              <span style={{ fontSize: "1.5rem" }}>📊</span>
              <h3 style={{ fontSize: "1rem" }}>Learning Hub</h3>
              <p style={{ fontSize: "0.78rem", color: "var(--fg-muted)", lineHeight: "1.4" }}>
                Master Figma auto-layout, Power BI metrics & financial Excel templates.
              </p>
            </Link>

            <a
              href="#docs"
              className="glass-card"
              style={{ display: "flex", flexDirection: "column", gap: "0.6rem", padding: "1.25rem" }}
            >
              <span style={{ fontSize: "1.5rem" }}>📚</span>
              <h3 style={{ fontSize: "1rem" }}>Documentation</h3>
              <p style={{ fontSize: "0.78rem", color: "var(--fg-muted)", lineHeight: "1.4" }}>
                Explore structural clean configurations mapping instructions.
              </p>
            </a>

            <a
              href="#ai-chat"
              className="glass-card"
              style={{ display: "flex", flexDirection: "column", gap: "0.6rem", padding: "1.25rem" }}
            >
              <span style={{ fontSize: "1.5rem" }}>🤖</span>
              <h3 style={{ fontSize: "1rem" }}>AI Copilot Q&A</h3>
              <p style={{ fontSize: "0.78rem", color: "var(--fg-muted)", lineHeight: "1.4" }}>
                Instant guidance dialogue box on complex structures.
              </p>
            </a>
          </div>
        </div>

        {/* Continue Learning Widget */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <h2 style={{ fontSize: "1.25rem", letterSpacing: "-0.01em" }}>Continue Learning</h2>

          <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "1.25rem", flex: 1, justifyContent: "space-between" }}>

            {/* Power BI item */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem" }}>
                <span style={{ fontSize: "0.85rem", fontWeight: "600" }}>📊 Power BI - DAX Contexts</span>
                <span style={{ fontSize: "0.8rem", color: "var(--accent-purple)", fontWeight: "bold" }}>{pbiProgress}%</span>
              </div>
              <div style={{ width: "100%", height: "4px", background: "rgba(255,255,255,0.05)", borderRadius: "4px", overflow: "hidden" }}>
                <div style={{ width: `${pbiProgress}%`, height: "100%", background: "var(--accent-purple)", borderRadius: "4px" }}></div>
              </div>
            </div>

            {/* Excel item */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem" }}>
                <span style={{ fontSize: "0.85rem", fontWeight: "600" }}>📈 Excel - Hotkeys Financials</span>
                <span style={{ fontSize: "0.8rem", color: "var(--fg-muted)" }}>0%</span>
              </div>
              <div style={{ width: "100%", height: "4px", background: "rgba(255,255,255,0.05)", borderRadius: "4px" }} />
            </div>

            {/* Figma item */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem" }}>
                <span style={{ fontSize: "0.85rem", fontWeight: "600" }}>🎨 Figma - Resizing Frame Controls</span>
                <span style={{ fontSize: "0.8rem", color: "var(--fg-muted)" }}>0%</span>
              </div>
              <div style={{ width: "100%", height: "4px", background: "rgba(255,255,255,0.05)", borderRadius: "4px" }} />
            </div>

            <Link
              href="/software-users"
              style={{
                textAlign: "center",
                background: "rgba(255,255,255,0.02)",
                border: "1px solid var(--border-color)",
                padding: "0.5rem",
                borderRadius: "6px",
                fontSize: "0.8rem",
                fontWeight: "600",
                display: "block",
                marginTop: "0.5rem",
              }}
            >
              Resume Learning paths
            </Link>

          </div>
        </div>

      </div>

      {/* 3. Grid for Recent scanned projects and Activity log */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "2rem" }}>

        {/* Scanned codebases */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <h2 style={{ fontSize: "1.25rem", letterSpacing: "-0.01em" }}>Recent Scanned projects</h2>
          <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-color)", paddingBottom: "0.5rem" }}>
              <div>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.85rem", fontWeight: "600" }}>fastapi-ml-predictor</span>
                <div style={{ fontSize: "0.75rem", color: "var(--fg-muted)", marginTop: "0.15rem" }}>3 days ago • 32 modules files</div>
              </div>
              <span style={{ fontSize: "0.7rem", background: "rgba(16,185,129,0.1)", color: "var(--accent-emerald)", padding: "0.15rem 0.4rem", borderRadius: "4px" }}>Success</span>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.85rem", fontWeight: "600" }}>my-nextjs-ecommerce</span>
                <div style={{ fontSize: "0.75rem", color: "var(--fg-muted)", marginTop: "0.15rem" }}>2 weeks ago • 120 modules files</div>
              </div>
              <span style={{ fontSize: "0.7rem", background: "rgba(16,185,129,0.1)", color: "var(--accent-emerald)", padding: "0.15rem 0.4rem", borderRadius: "4px" }}>Success</span>
            </div>

            <Link
              href="/developers"
              style={{
                fontSize: "0.8rem",
                color: "var(--accent-purple)",
                fontWeight: "600",
                display: "inline-block",
                marginTop: "0.5rem"
              }}
            >
              Open developer scans directory →
            </Link>
          </div>
        </div>

        {/* Recent actions feeds */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <h2 style={{ fontSize: "1.25rem", letterSpacing: "-0.01em" }}>Recent Activity</h2>

          <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "1rem", fontSize: "0.82rem" }}>
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <span style={{ fontSize: "1.1rem" }}>✅</span>
              <div>
                <p style={{ color: "var(--fg-primary)", fontWeight: "500" }}>Completed lesson 'Understanding DAX Contexts'</p>
                <span style={{ fontSize: "0.72rem", color: "var(--fg-muted)" }}>2 hours ago in Power BI</span>
              </div>
            </div>

            <div style={{ display: "flex", gap: "0.75rem" }}>
              <span style={{ fontSize: "1.1rem" }}>🏆</span>
              <div>
                <p style={{ color: "var(--fg-primary)", fontWeight: "500" }}>Passed Quiz 'DAX Evaluation Contexts Check'</p>
                <span style={{ fontSize: "0.72rem", color: "var(--fg-muted)" }}>2 hours ago • Score: 100%</span>
              </div>
            </div>

            <div style={{ display: "flex", gap: "0.75rem" }}>
              <span style={{ fontSize: "1.1rem" }}>🔍</span>
              <div>
                <p style={{ color: "var(--fg-primary)", fontWeight: "500" }}>Traced workspace AST structural folders</p>
                <span style={{ fontSize: "0.72rem", color: "var(--fg-muted)" }}>Yesterday in Developers Workspace</span>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
