"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FolderCode,
  MessageSquare,
  GraduationCap,
  Eye,
  ChevronRight,
  Zap,
  Target,
  BookOpen,
  Clock,
  Activity,
  ArrowUpRight,
  Sparkles,
  Calendar,
  CheckCircle2,
  ListTodo
} from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend
} from "recharts";

// Core metric data types
interface MetricCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  trend: string;
  isPositive: boolean;
  glowColor: string;
}

export default function DashboardHome() {
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<{ name?: string | null; username?: string | null; email?: string | null } | null>(null);
  const [pbiProgress, setPbiProgress] = useState(74); // Default fallback progress
  const [currentTimeGreeting, setCurrentTimeGreeting] = useState("Hello");
  const [currentDateFormatted, setCurrentDateFormatted] = useState("");

  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>({
    task3: true
  });

  // Calculate dynamic time greet & date
  useEffect(() => {
    setMounted(true);

    const getGreeting = () => {
      const hour = new Date().getHours();
      if (hour < 12) return "Good Morning";
      if (hour < 18) return "Good Afternoon";
      return "Good Evening";
    };

    setCurrentTimeGreeting(getGreeting());
    setCurrentDateFormatted(
      new Date().toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    );

    // Fetch user & progress details from endpoints
    async function getSessionAndProgress() {
      try {
        const sessionRes = await fetch("/api/auth/session");
        if (sessionRes.ok) {
          const sessionData = await sessionRes.json();
          if (sessionData.authenticated && sessionData.user) {
            setUser(sessionData.user);
          }
        }

        const res = await fetch("/api/apps");
        if (res.ok) {
          const apps = await res.json();
          const pbiApp = apps.find((a: any) => a.name === "Power BI");
          if (pbiApp && pbiApp.learningPaths.length > 0) {
            const pathId = pbiApp.learningPaths[0].id;
            const progressRes = await fetch(`/api/progress?learningPathId=${pathId}`);
            if (progressRes.ok) {
              const progressData = await progressRes.json();
              if (progressData.completedSteps) {
                const list = progressData.completedSteps.split(",").filter(Boolean);
                const stepsCount = pbiApp.learningPaths[0].steps.length;
                if (stepsCount) {
                  setPbiProgress(Math.round((list.length / stepsCount) * 100));
                }
              }
            }
          }
        }
      } catch (err) {
        console.error("Failed to read user progress metadata:", err);
      }
    }
    getSessionAndProgress();
  }, []);

  const toggleTask = (taskId: string) => {
    setCompletedTasks(prev => ({
      ...prev,
      [taskId]: !prev[taskId]
    }));
  };

  // Mock Recharts chart structures
  const codingHoursData = [
    { name: "Mon", hours: 4.2 },
    { name: "Tue", hours: 3.8 },
    { name: "Wed", hours: 6.5 },
    { name: "Thu", hours: 2.1 },
    { name: "Fri", hours: 5.4 },
    { name: "Sat", hours: 7.2 },
    { name: "Sun", hours: 4.8 }
  ];

  const progressOverTimeData = [
    { week: "Wk 1", progress: 42 },
    { week: "Wk 2", progress: 54 },
    { week: "Wk 3", progress: 61 },
    { week: "Wk 4", progress: 74 }
  ];

  const projectsMetricsData = [
    { name: "CodeJournal", commits: 38, files: 24 },
    { name: "EduVerse", commits: 22, files: 15 },
    { name: "Portfolio", commits: 14, files: 8 }
  ];

  const aiCreditsData = [
    { name: "Mon", queries: 12 },
    { name: "Tue", queries: 28 },
    { name: "Wed", queries: 43 },
    { name: "Thu", queries: 18 },
    { name: "Fri", queries: 32 },
    { name: "Sat", queries: 25 },
    { name: "Sun", queries: 27 }
  ];

  const displayName = user?.username ? `@${user.username}` : (user?.name || "Mentor Student");

  return (
    <div style={{ padding: "2rem 2.25rem", display: "flex", flexDirection: "column", gap: "2.5rem", maxWidth: "1600px", margin: "0 auto" }}>

      {/* SECTION 1 – Welcome Hero */}
      <section
        className="glass-card"
        style={{
          background: "linear-gradient(135deg, var(--bg-secondary) 30%, var(--accent-purple-glow) 100%)",
          border: "1px solid var(--border-color)",
          padding: "2rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "2rem",
          position: "relative",
          overflow: "hidden"
        }}
      >
        <div style={{ flex: "1 1 500px", zIndex: 2 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.5rem" }}>
            <Calendar size={15} style={{ color: "var(--accent-purple)" }} />
            <span style={{ fontSize: "0.85rem", color: "var(--fg-secondary)", fontWeight: "600" }}>
              {currentDateFormatted}
            </span>
            <span style={{ width: "4px", height: "4px", borderRadius: "50%", background: "var(--border-color)" }}></span>
            <span style={{ fontSize: "0.85rem", color: "var(--accent-purple)", fontWeight: "700", display: "flex", alignItems: "center", gap: "0.2rem" }}>
              <Sparkles size={13} /> {currentTimeGreeting}
            </span>
          </div>

          <h1 style={{ fontSize: "2.25rem", fontWeight: "850", letterSpacing: "-0.04em", margin: "0.25rem 0 0.5rem", lineHeight: "1.2" }}>
            Welcome back, <span style={{ background: "linear-gradient(135deg, var(--fg-primary) 30%, var(--accent-purple) 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{displayName}</span>
          </h1>

          <p style={{ color: "var(--fg-secondary)", fontSize: "0.95rem", marginBottom: "1rem", lineHeight: "1.5" }}>
            🚀 Push your boundaries. Every small line of code builds the compass of your destination.
          </p>

          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", fontSize: "0.82rem", background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-color)", padding: "0.5rem 0.8rem", borderRadius: "6px", width: "fit-content" }}>
            <span style={{ display: "inline-block", width: "8px", height: "8px", borderRadius: "50%", background: "var(--accent-purple)", boxShadow: "0 0 6px var(--accent-purple-glow)" }}></span>
            <span style={{ color: "var(--fg-muted)" }}>Continue where you left off:</span>
            <strong style={{ color: "var(--fg-primary)" }}>CodeJournal Settings UI</strong>
          </div>
        </div>

        {/* Compact Stat Chips */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", minWidth: "320px", flex: "0 1 360px", zIndex: 2 }}>
          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-color)", padding: "0.75rem", borderRadius: "8px", display: "flex", flexDirection: "column", gap: "0.2rem" }}>
            <span style={{ fontSize: "0.72rem", color: "var(--fg-muted)", fontWeight: "700", textTransform: "uppercase" }}>🔥 Coding Streak</span>
            <span style={{ fontSize: "1.1rem", fontWeight: "bold", color: "var(--fg-primary)" }}>12 Days</span>
          </div>

          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-color)", padding: "0.75rem", borderRadius: "8px", display: "flex", flexDirection: "column", gap: "0.2rem" }}>
            <span style={{ fontSize: "0.72rem", color: "var(--fg-muted)", fontWeight: "700", textTransform: "uppercase" }}>📁 Active Projects</span>
            <span style={{ fontSize: "1.1rem", fontWeight: "bold", color: "var(--fg-primary)" }}>3 Active</span>
          </div>

          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-color)", padding: "0.75rem", borderRadius: "8px", display: "flex", flexDirection: "column", gap: "0.2rem" }}>
            <span style={{ fontSize: "0.72rem", color: "var(--fg-muted)", fontWeight: "700", textTransform: "uppercase" }}>📋 Tasks Due Today</span>
            <span style={{ fontSize: "1.1rem", fontWeight: "bold", color: "var(--fg-primary)" }}>2 Tasks</span>
          </div>

          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-color)", padding: "0.75rem", borderRadius: "8px", display: "flex", flexDirection: "column", gap: "0.2rem" }}>
            <span style={{ fontSize: "0.72rem", color: "var(--fg-muted)", fontWeight: "700", textTransform: "uppercase" }}>⚡ AI Credits</span>
            <span style={{ fontSize: "1.1rem", fontWeight: "bold", color: "var(--accent-purple)" }}>850 / 1000</span>
          </div>
        </div>
      </section>

      {/* SECTION 2 – Dashboard Overview */}
      <section style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <h2 style={{ fontSize: "1.3rem", fontWeight: "750", letterSpacing: "-0.02em", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Activity size={18} style={{ color: "var(--accent-purple)" }} /> Overview Metrics
        </h2>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.25rem" }}>
          {[
            { icon: <FolderCode size={20} />, title: "Active Projects", value: "12 Active", trend: "+2 this week", isPositive: true, colors: "var(--accent-cyan)" },
            { icon: <MessageSquare size={20} />, title: "AI Queries Asked", value: "185", trend: "+12 today", isPositive: true, colors: "var(--accent-purple)" },
            { icon: <GraduationCap size={20} />, title: "Learning Progress", value: `${pbiProgress}%`, trend: "+5% overall", isPositive: true, colors: "var(--accent-emerald)" },
            { icon: <Eye size={20} />, title: "Repository Scans", value: "26 Files", trend: "100% success", isPositive: true, colors: "#a855f7" }
          ].map((item, idx) => (
            <div
              key={idx}
              className="glass-card"
              onMouseEnter={() => setHoveredCard(idx)}
              onMouseLeave={() => setHoveredCard(null)}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem",
                padding: "1.5rem",
                position: "relative",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                transform: hoveredCard === idx ? "translateY(-4px)" : "none",
                border: hoveredCard === idx ? `1px solid ${item.colors}` : "1px solid var(--border-color)",
                boxShadow: hoveredCard === idx ? `0 8px 30px rgba(0,0,0,0.12)` : "none"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ color: item.colors, background: `${item.colors}1a`, padding: "0.50rem", borderRadius: "8px" }}>
                  {item.icon}
                </div>
                <span style={{ fontSize: "0.75rem", color: item.isPositive ? "var(--accent-emerald)" : "#ef4444", fontWeight: "600", background: item.isPositive ? "rgba(16,185,129,0.08)" : "rgba(239,68,68,0.08)", padding: "0.15rem 0.4rem", borderRadius: "4px" }}>
                  {item.trend}
                </span>
              </div>
              <div>
                <span style={{ fontSize: "0.78rem", color: "var(--fg-muted)", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.03em" }}>{item.title}</span>
                <div style={{ fontSize: "1.6rem", fontWeight: "bold", color: "var(--fg-primary)", marginTop: "0.2rem" }}>{item.value}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* GRID FOR CONTINUE & AI RECOMMENDATIONS */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "2rem" }}>

        {/* SECTION 3 – Continue Working */}
        <section style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <h2 style={{ fontSize: "1.3rem", fontWeight: "750", letterSpacing: "-0.02em", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Clock size={18} style={{ color: "var(--accent-purple)" }} /> Continue Working
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {[
              { name: "CodeJournal", tags: ["React", "Spring Boot", "PostgreSQL"], desc: "72% Complete", progress: 72, actionUrl: "/developers" },
              { name: "EduVerse", tags: ["React", "Firebase"], desc: "UI Improvements", progress: 85, actionUrl: "/software-users" },
              { name: "Portfolio", tags: ["React", "Tailwind"], desc: "Deployment Pending", progress: 95, actionUrl: "/developers" }
            ].map((p, idx) => (
              <div key={idx} className="glass-card" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1.5rem", padding: "1.25rem" }}>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                    <span style={{ fontSize: "0.95rem", fontWeight: "750", color: "var(--fg-primary)" }}>{p.name}</span>
                    <span style={{ fontSize: "0.75rem", color: "var(--fg-muted)" }}>• {p.desc}</span>
                  </div>
                  <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap" }}>
                    {p.tags.map((tag, tIdx) => (
                      <span key={tIdx} style={{ fontSize: "0.65rem", background: "var(--bg-primary)", border: "1px solid var(--border-color)", color: "var(--fg-secondary)", padding: "0.15rem 0.4rem", borderRadius: "4px" }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                  {/* Progress bar */}
                  <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginTop: "0.2rem" }}>
                    <div style={{ flex: 1, height: "4px", background: "rgba(255,255,255,0.05)", borderRadius: "4px", overflow: "hidden" }}>
                      <div style={{ width: `${p.progress}%`, height: "100%", background: "var(--accent-purple)", borderRadius: "4px" }}></div>
                    </div>
                    <span style={{ fontSize: "0.7rem", color: "var(--fg-muted)", minWidth: "26px", fontWeight: "bold" }}>{p.progress}%</span>
                  </div>
                </div>
                <Link
                  href={p.actionUrl}
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid var(--border-color)",
                    padding: "0.45rem 1rem",
                    borderRadius: "6px",
                    fontSize: "0.8rem",
                    fontWeight: "600",
                    transition: "all 0.2s",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.3rem"
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.background = "var(--accent-purple-glow)";
                    (e.currentTarget as HTMLElement).style.borderColor = "var(--accent-purple)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.03)";
                    (e.currentTarget as HTMLElement).style.borderColor = "var(--border-color)";
                  }}
                >
                  {p.name === "Portfolio" ? "Open" : p.name === "EduVerse" ? "Continue" : "Resume"} <ArrowUpRight size={13} />
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 4 – AI Recommendations */}
        <section style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <h2 style={{ fontSize: "1.3rem", fontWeight: "750", letterSpacing: "-0.02em", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Zap size={18} style={{ color: "var(--accent-purple)" }} /> AI Recommendations
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: "1.05rem" }}>
            {[
              { icon: "💡", title: "Continue working on CodeJournal", description: "Last opened 3 days ago. Finish integrating settings configurations.", btnText: "Resume", link: "/developers" },
              { icon: "🧠", title: "Revise Graph Algorithms", description: "Enhance your software engineering roadmap progress markers.", btnText: "Open Learning Path", link: "/software-users" },
              { icon: "⚡", title: "Your repository contains TODO comments", description: "Unresolved syntax tags found inside page components codebase.", btnText: "Inspect", link: "/developers" }
            ].map((rec, idx) => (
              <div key={idx} className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "0.6rem", padding: "1.1rem" }}>
                <div style={{ display: "flex", gap: "0.6rem" }}>
                  <span style={{ fontSize: "1.2rem", height: "fit-content" }}>{rec.icon}</span>
                  <div>
                    <h3 style={{ fontSize: "0.88rem", fontWeight: "700", color: "var(--fg-primary)" }}>{rec.title}</h3>
                    <p style={{ fontSize: "0.78rem", color: "var(--fg-muted)", marginTop: "0.15rem" }}>{rec.description}</p>
                  </div>
                </div>
                <Link
                  href={rec.link}
                  style={{
                    alignSelf: "flex-end",
                    fontSize: "0.75rem",
                    fontWeight: "600",
                    color: "var(--accent-purple)",
                    background: "var(--accent-purple-glow)",
                    border: "1px solid rgba(168,85,247,0.15)",
                    padding: "0.3rem 0.75rem",
                    borderRadius: "4px",
                    transition: "all 0.2s"
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.background = "var(--accent-purple)";
                    (e.currentTarget as HTMLElement).style.color = "#fff";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.background = "var(--accent-purple-glow)";
                    (e.currentTarget as HTMLElement).style.color = "var(--accent-purple)";
                  }}
                >
                  {rec.btnText}
                </Link>
              </div>
            ))}
          </div>
        </section>

      </div>

      {/* GRID FOR RECENT ACTIVITY & TODAY'S TASKS */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "2rem" }}>

        {/* SECTION 5 – Recent Activity */}
        <section style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <h2 style={{ fontSize: "1.3rem", fontWeight: "750", letterSpacing: "-0.02em", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <BookOpen size={18} style={{ color: "var(--accent-purple)" }} /> Recent Activity
          </h2>

          <div className="glass-card" style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.5rem", flex: 1 }}>
            {[
              { time: "Today", action: "Opened CodeJournal codebase scanner", detail: "Scanned AST modules configuration" },
              { time: "Yesterday", action: "Generated API Documentation", detail: "Wrote backend endpoints reference logs" },
              { time: "2 Days Ago", action: "Completed React Layout", detail: "Refined glassmorphism variables system" },
              { time: "3 Days Ago", action: "Created Learning Notes", detail: "Logged algorithms and framework study" }
            ].map((act, idx) => (
              <div key={idx} style={{ display: "flex", gap: "1rem", position: "relative" }}>
                {idx !== 3 && (
                  <div style={{ position: "absolute", left: "6px", top: "20px", bottom: "-20px", width: "1px", background: "var(--border-color)" }}></div>
                )}
                <div style={{ zIndex: 2 }}>
                  <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: "var(--accent-purple)", border: "2.5px solid var(--bg-secondary)", boxShadow: "0 0 4px var(--accent-purple-glow)", marginTop: "3.5px" }}></div>
                </div>
                <div>
                  <div style={{ fontSize: "0.85rem", fontWeight: "bold", color: "var(--fg-primary)" }}>{act.action}</div>
                  <div style={{ fontSize: "0.75rem", color: "var(--fg-muted)", marginTop: "0.15rem" }}>{act.time} • {act.detail}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 6 – Today's Tasks */}
        <section style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <h2 style={{ fontSize: "1.3rem", fontWeight: "750", letterSpacing: "-0.02em", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <ListTodo size={18} style={{ color: "var(--accent-purple)" }} /> Today's Tasks
          </h2>

          <div className="glass-card" style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.1rem", flex: 1 }}>
            {[
              { id: "task1", title: "Solve 5 DSA Problems", type: "fraction", current: 3, total: 5 },
              { id: "task2", title: "Finish JWT Authentication", type: "percent", progress: 70 },
              { id: "task3", title: "Review React Components", type: "boolean" }
            ].map((task) => {
              const isDone = task.type === "boolean"
                ? completedTasks[task.id]
                : task.type === "fraction"
                  ? task.current === task.total
                  : task.progress === 100;

              return (
                <div
                  key={task.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0.85rem 1rem",
                    background: "rgba(255,255,255,0.01)",
                    border: "1px solid var(--border-color)",
                    borderRadius: "8px",
                    transition: "all 0.2s"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                    <button
                      onClick={() => toggleTask(task.id)}
                      style={{
                        background: "none",
                        border: "none",
                        padding: 0,
                        cursor: "pointer",
                        color: isDone ? "var(--accent-emerald)" : "var(--fg-muted)",
                        display: "flex",
                        alignItems: "center"
                      }}
                    >
                      <CheckCircle2 size={16} fill={isDone ? "var(--accent-emerald-glow)" : "none"} />
                    </button>
                    <span style={{ fontSize: "0.88rem", color: isDone ? "var(--fg-muted)" : "var(--fg-primary)", textDecoration: isDone ? "line-through" : "none", fontWeight: "500" }}>
                      {task.title}
                    </span>
                  </div>

                  <div>
                    {task.type === "fraction" && (
                      <span style={{ fontSize: "0.78rem", fontWeight: "bold", background: "rgba(255, 255, 255, 0.03)", padding: "0.2rem 0.5rem", borderRadius: "4px", color: "var(--fg-secondary)" }}>
                        {task.current}/{task.total} Completed
                      </span>
                    )}
                    {task.type === "percent" && (
                      <span style={{ fontSize: "0.78rem", fontWeight: "bold", background: "rgba(168, 85, 247, 0.08)", padding: "0.2rem 0.5rem", borderRadius: "4px", color: "var(--accent-purple)" }}>
                        {task.progress}%
                      </span>
                    )}
                    {task.type === "boolean" && (
                      <span style={{ fontSize: "0.75rem", fontWeight: "bold", color: isDone ? "var(--accent-emerald)" : "var(--fg-muted)" }}>
                        {isDone ? "Completed" : "Pending"}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

      </div>

      {/* SECTION 7 – Weekly Analytics */}
      <section style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <h2 style={{ fontSize: "1.3rem", fontWeight: "750", letterSpacing: "-0.02em", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Target size={18} style={{ color: "var(--accent-purple)" }} /> Weekly Performance Analytics
        </h2>

        {!mounted ? (
          <div style={{ height: "300px", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-secondary)", borderRadius: "12px", border: "1px solid var(--border-color)" }}>
            <span style={{ fontSize: "0.85rem", color: "var(--fg-muted)" }}>Loading analytics panels...</span>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "2rem" }}>

            {/* Chart 1: Coding Hours */}
            <div className="glass-card" style={{ padding: "1.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                <div>
                  <h3 style={{ fontSize: "1rem", fontWeight: "bold" }}>Weekly Coding Hours</h3>
                  <span style={{ fontSize: "0.75rem", color: "var(--fg-muted)" }}>Hours coded daily in workspace IDE</span>
                </div>
                <span style={{ fontSize: "0.8rem", color: "var(--accent-cyan)", fontWeight: "bold" }}>Avg. 4.8h/day</span>
              </div>
              <div style={{ width: "100%", height: "260px" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={codingHoursData} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.05} />
                    <XAxis dataKey="name" stroke="var(--fg-muted)" fontSize={11} tickLine={false} />
                    <YAxis stroke="var(--fg-muted)" fontSize={11} tickLine={false} />
                    <Tooltip contentStyle={{ background: "var(--bg-secondary)", borderColor: "var(--border-color)", borderRadius: "6px", fontSize: "11px", color: "var(--fg-primary)" }} />
                    <Bar dataKey="hours" fill="var(--accent-purple)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Learning Progress */}
            <div className="glass-card" style={{ padding: "1.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                <div>
                  <h3 style={{ fontSize: "1rem", fontWeight: "bold" }}>Learning Path History</h3>
                  <span style={{ fontSize: "0.75rem", color: "var(--fg-muted)" }}>Progress ratio across active courses</span>
                </div>
                <span style={{ fontSize: "0.8rem", color: "var(--accent-emerald)", fontWeight: "bold" }}>+32% This Month</span>
              </div>
              <div style={{ width: "100%", height: "260px" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={progressOverTimeData} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.05} />
                    <XAxis dataKey="week" stroke="var(--fg-muted)" fontSize={11} tickLine={false} />
                    <YAxis stroke="var(--fg-muted)" fontSize={11} tickLine={false} domain={[0, 100]} />
                    <Tooltip contentStyle={{ background: "var(--bg-secondary)", borderColor: "var(--border-color)", borderRadius: "6px", fontSize: "11px", color: "var(--fg-primary)" }} />
                    <Line type="monotone" dataKey="progress" stroke="var(--accent-emerald)" strokeWidth={2.5} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 3: Projects worked on */}
            <div className="glass-card" style={{ padding: "1.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                <div>
                  <h3 style={{ fontSize: "1rem", fontWeight: "bold" }}>Commits & Files scanned</h3>
                  <span style={{ fontSize: "0.75rem", color: "var(--fg-muted)" }}>Activity metric across active repos</span>
                </div>
                <span style={{ fontSize: "0.8rem", color: "var(--accent-purple)", fontWeight: "bold" }}>3 Active scan pools</span>
              </div>
              <div style={{ width: "100%", height: "260px" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={projectsMetricsData} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                    <defs>
                      <linearGradient id="colorCommits" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--accent-purple)" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="var(--accent-purple)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.05} />
                    <XAxis dataKey="name" stroke="var(--fg-muted)" fontSize={11} tickLine={false} />
                    <YAxis stroke="var(--fg-muted)" fontSize={11} tickLine={false} />
                    <Tooltip contentStyle={{ background: "var(--bg-secondary)", borderColor: "var(--border-color)", borderRadius: "6px", fontSize: "11px", color: "var(--fg-primary)" }} />
                    <Area type="monotone" dataKey="commits" stroke="var(--accent-purple)" fillOpacity={1} fill="url(#colorCommits)" strokeWidth={2} />
                    <Area type="monotone" dataKey="files" stroke="var(--accent-cyan)" fill="none" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 4: AI usage */}
            <div className="glass-card" style={{ padding: "1.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                <div>
                  <h3 style={{ fontSize: "1rem", fontWeight: "bold" }}>AI Assistance Queries</h3>
                  <span style={{ fontSize: "0.75rem", color: "var(--fg-muted)" }}>Total AI Copilot Q&A volume</span>
                </div>
                <span style={{ fontSize: "0.8rem", color: "var(--accent-cyan)", fontWeight: "bold" }}>185 total prompts</span>
              </div>
              <div style={{ width: "100%", height: "260px" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={aiCreditsData} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                    <defs>
                      <linearGradient id="colorQueries" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#a855f7" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.05} />
                    <XAxis dataKey="name" stroke="var(--fg-muted)" fontSize={11} tickLine={false} />
                    <YAxis stroke="var(--fg-muted)" fontSize={11} tickLine={false} />
                    <Tooltip contentStyle={{ background: "var(--bg-secondary)", borderColor: "var(--border-color)", borderRadius: "6px", fontSize: "11px", color: "var(--fg-primary)" }} />
                    <Area type="monotone" dataKey="queries" stroke="#a855f7" fillOpacity={1} fill="url(#colorQueries)" strokeWidth={2.5} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>
        )}
      </section>

    </div>
  );
}
