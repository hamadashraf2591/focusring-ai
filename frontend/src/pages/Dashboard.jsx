import { useState, useEffect, useRef } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import FocusRing from "../components/FocusRing";
import Hero from "../components/Hero";
import BreakLounge from "../components/BreakLounge";
import Achievements from "../components/Achievements";
import TechMarquee from "../components/TechMarquee";
import SiteFooter from "../components/SiteFooter";
import api from "../api";

const QUOTES = [
  { text: "Discipline is choosing between what you want now and what you want most.", by: "Abraham Lincoln" },
  { text: "It always seems impossible until it is done.", by: "Nelson Mandela" },
  { text: "Focus is the art of knowing what to ignore.", by: "James Clear" },
  { text: "Small daily improvements are the key to staggering long-term results.", by: "Robin Sharma" },
  { text: "The successful warrior is the average person with laser-like focus.", by: "Bruce Lee" },
  { text: "You do not rise to the level of your goals. You fall to the level of your systems.", by: "James Clear" },
  { text: "Deep work is the ability to focus without distraction on a cognitively demanding task.", by: "Cal Newport" },
];

const QUICK_TASKS = ["DSA", "DBMS", "Calculus", "OS", "Networks"];
const DURATIONS = [25, 45, 60];

const STEPS = [
  {
    img: "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=900&q=70",
    num: "Step 1",
    title: "Plan",
    text: "Pick a task and session length. Quick chips make it a two-click start.",
    cta: "Go to planner",
    action: "plan",
  },
  {
    img: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=900&q=70",
    num: "Step 2",
    title: "Focus",
    text: "The ring tracks your session while the model watches your risk in real time.",
    cta: "See how the AI thinks",
    action: "focus",
  },
  {
    img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=900&q=70",
    num: "Step 3",
    title: "Adapt",
    text: "Predictions sharpen with every logged session - breaks land before burnout.",
    cta: "View your insights",
    action: "adapt",
  },
];

function formatTime(totalSeconds) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function formatHour(h) {
  const suffix = h < 12 ? "AM" : "PM";
  const display = h % 12 === 0 ? 12 : h % 12;
  return `${display} ${suffix}`;
}

function burstConfetti() {
  const colors = ["#d7fe45", "#8ef6e4", "#ffd166", "#f87171", "#a78bfa"];
  for (let i = 0; i < 60; i++) {
    const p = document.createElement("div");
    p.className = "confetti-piece";
    p.style.left = Math.random() * 100 + "vw";
    p.style.background = colors[Math.floor(Math.random() * colors.length)];
    p.style.width = 6 + Math.random() * 6 + "px";
    p.style.height = 10 + Math.random() * 8 + "px";
    p.style.animationDuration = 1 + Math.random() * 0.9 + "s";
    p.style.animationDelay = Math.random() * 0.25 + "s";
    document.body.appendChild(p);
    setTimeout(() => p.remove(), 2300);
  }
}

function Flame() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
      <path d="M12 2c.5 2.5-.8 4-2.2 5.6C8.2 9.4 7 11 7 13.5A5 5 0 0 0 17 13.5c0-1.8-.8-3.2-1.9-4.4.1 1-.3 1.9-1.1 2.4.4-2.3-.4-4.6-2-6.5A9 9 0 0 0 12 2z" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
    </svg>
  );
}

export default function Dashboard() {
  const [taskName, setTaskName] = useState("");
  const [plannedMinutes, setPlannedMinutes] = useState(45);
  const [userName, setUserName] = useState("there");
  const [sessions, setSessions] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [insights, setInsights] = useState(null);
  const [ach, setAch] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [active, setActive] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [showRating, setShowRating] = useState(false);
  const [risk, setRisk] = useState(null);
  const [breakSuggestion, setBreakSuggestion] = useState(null);
  const [onBreak, setOnBreak] = useState(false);
  const [breakLeft, setBreakLeft] = useState(0);
  const [toast, setToast] = useState("");
  const [error, setError] = useState("");
  const [theme, setTheme] = useState(() => localStorage.getItem("fr-theme") || "dark");
  const [time, setTime] = useState(new Date());
  const [zen, setZen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [modelInfo, setModelInfo] = useState(null);

  const elapsedRef = useRef(0);
  const onBreakRef = useRef(false);
  const lastBreakMinuteRef = useRef(0);
  const timerRef = useRef(null);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("fr-theme", theme);
  }, [theme]);

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => { elapsedRef.current = elapsed; }, [elapsed]);
  useEffect(() => { onBreakRef.current = onBreak; }, [onBreak]);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(""), 3200);
    return () => clearTimeout(id);
  }, [toast]);

  const refresh = async () => {
    try {
      const [uRes, sRes, aRes, iRes, achRes] = await Promise.all([
        api.get("/users/1"),
        api.get("/users/1/sessions/"),
        api.get("/users/1/analytics/"),
        api.get("/users/1/insights/"),
        api.get("/users/1/achievements/"),
      ]);
      const n = uRes.data.name.split(" ")[0];
      setUserName(n.charAt(0).toUpperCase() + n.slice(1));
      setSessions(sRes.data);
      setAnalytics(aRes.data);
      setInsights(iRes.data);
      setAch(achRes.data);
    } catch {
      setError("Failed to load data. Is the backend running on port 8000?");
    }
  };

  useEffect(() => { refresh(); }, []);

  useEffect(() => {
    if (active) return;
    api.get("/users/1/predict/", { params: { planned_minutes: Number(plannedMinutes) } })
      .then((res) => setPrediction(res.data))
      .catch(() => {});
  }, [plannedMinutes, active]);

  useEffect(() => {
    if (!active) return;
    timerRef.current = setInterval(() => {
      if (!onBreakRef.current) setElapsed((e) => e + 1);
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [active]);

  useEffect(() => {
    if (!onBreak) return;
    let left = 300;
    setBreakLeft(left);
    const id = setInterval(() => {
      left -= 1;
      setBreakLeft(left);
      if (left <= 0) {
        clearInterval(id);
        setOnBreak(false);
        lastBreakMinuteRef.current = Math.max(1, Math.round(elapsedRef.current / 60));
        api.post("/users/1/breaks/", { kind: "Adaptive", duration_seconds: 300 }).catch(() => {});
        setToast("Break done - back to focus");
      }
    }, 1000);
    return () => clearInterval(id);
  }, [onBreak]);

  useEffect(() => {
    if (!active) return;
    const check = async () => {
      if (onBreakRef.current) return;
      const minutesSoFar = Math.max(1, Math.round(elapsedRef.current / 60));
      try {
        const res = await api.get("/users/1/predict/", {
          params: { planned_minutes: minutesSoFar },
        });
        setRisk(res.data);
        if (res.data.focus_risk_percent >= 65) {
          if (minutesSoFar - lastBreakMinuteRef.current >= 5) {
            setBreakSuggestion(res.data);
          }
        }
      } catch {}
    };
    check();
    const id = setInterval(check, 20000);
    return () => clearInterval(id);
  }, [active]);

  const openAI = () => {
    setAiOpen(true);
    if (!modelInfo) {
      api.get("/model/info").then((r) => setModelInfo(r.data)).catch(() => {});
    }
  };

  const handleStep = (action) => {
    if (action === "plan") {
      const el = document.getElementById("start-form");
      if (el) el.scrollIntoView({ behavior: "smooth" });
      setTimeout(() => {
        const input = document.getElementById("task-input");
        if (input) input.focus();
      }, 600);
    } else if (action === "focus") {
      openAI();
    } else if (action === "adapt") {
      const el = document.getElementById("insights");
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const renameUser = async () => {
    const n = prompt("Your name:", userName);
    if (!n) return;
    try {
      await api.patch("/users/1", { name: n });
      setToast("Name updated");
      refresh();
    } catch {
      setError("Could not update name");
    }
  };

  const startSession = async (e) => {
    e.preventDefault();
    setError("");
    setRisk(null);
    setBreakSuggestion(null);
    setOnBreak(false);
    setZen(false);
    lastBreakMinuteRef.current = 0;
    try {
      const res = await api.post("/users/1/sessions/", {
        task_name: taskName,
        planned_minutes: Number(plannedMinutes),
      });
      setActive(res.data);
      setElapsed(0);
      setToast("Session started - ring is running");
    } catch (err) {
      setError(err.response ? err.response.data.detail : "Could not start session");
    }
  };

  const finishSession = async (focusScore) => {
    const minutes = Math.max(1, Math.round(elapsed / 60));
    try {
      await api.patch(`/users/1/sessions/${active.id}`, {
        actual_minutes: minutes,
        focus_score: focusScore,
        completed: true,
      });
      burstConfetti();
      setToast(`Session saved - ${minutes}m focus logged`);
    } catch {
      setError("Failed to save session");
    }
    setActive(null);
    setShowRating(false);
    setElapsed(0);
    setZen(false);
    refresh();
  };

  const abandonSession = async () => {
    if (!confirm("Abandon this session?")) return;
    const minutes = Math.max(1, Math.round(elapsed / 60));
    try {
      await api.patch(`/users/1/sessions/${active.id}`, {
        actual_minutes: minutes,
        completed: false,
      });
      setToast("Session abandoned - logged honestly");
    } catch {
      setError("Failed to save session");
    }
    setActive(null);
    setElapsed(0);
    setZen(false);
    refresh();
  };

  const acceptBreak = () => {
    setBreakSuggestion(null);
    setOnBreak(true);
  };

  const dismissBreak = () => {
    setBreakSuggestion(null);
    lastBreakMinuteRef.current = Math.max(1, Math.round(elapsedRef.current / 60));
  };

  const h = time.getHours();
  const greeting = h >= 5
    ? (h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : h < 22 ? "Good evening" : "Late-night grind")
    : "Late-night grind";
  const dateLine = time.toLocaleDateString(undefined, {
    weekday: "long", month: "long", day: "numeric",
  });
  const quote = QUOTES[time.getDate() % QUOTES.length];
  const clockStr = time.toLocaleTimeString(undefined, { hour12: true });

  const week = analytics ? analytics.week_minutes : 0;
  const goal = analytics ? analytics.weekly_goal_minutes : 420;
  const goalPct = goal ? Math.min(100, (week / goal) * 100) : 0;

  const progress = active
    ? (elapsed / (active.planned_minutes * 60)) * 100
    : 0;

  const chartFill = theme === "dark" ? "#d7fe45" : "#d4551f";

  return (
    <div className={zen ? "zen" : ""}>
      <div className="hide-in-zen">
        <Hero analytics={analytics} />
      </div>

      <nav className="topnav">
        <div className="nav-brand">
          <span className="logo-dot" />
          FocusRing <span className="ai">AI</span>
        </div>
        <div className="nav-links">
          <a href="#how">How it works</a>
          <a href="#lounge">Break Lounge</a>
          <a href="#achievements">Achievements</a>
          <a href="#analytics">Analytics</a>
        </div>
        <div className="nav-right">
          <span className="clock">{clockStr}</span>
          <span className="xp-chip"><span className="lvl">LVL {ach ? ach.level : 1}</span></span>
          <div className="streak-chip">
            <Flame />
            {analytics ? analytics.streak_days : 0} day streak
          </div>
          <button className="icon-btn" onClick={renameUser} title="Edit your name">EDIT</button>
          <button
            className="icon-btn"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            title="Toggle theme"
          >
            {theme === "dark" ? <SunIcon /> : <MoonIcon />}
          </button>
        </div>
      </nav>

      <div className="container">
        <header className="hero">
          <div>
            <h2>{greeting}, {userName}</h2>
            <p className="muted">{dateLine} - ready for a focused session?</p>
          </div>
          <div className="quote-card">
            <p className="quote-text">"{quote.text}"</p>
            <p className="quote-by">- {quote.by}</p>
          </div>
        </header>

        {error ? <div className="error">{error}</div> : null}

        <section className="hide-in-zen" id="how" style={{ margin: "1.6rem 0 0.2rem" }}>
          <h2>How FocusRing works</h2>
          <div className="steps-grid">
            {STEPS.map((s) => (
              <div
                className="step-card"
                key={s.title}
                onClick={() => handleStep(s.action)}
                role="button"
                tabIndex={0}
              >
                <img className="step-img" src={s.img} alt={s.title} loading="lazy" />
                <div className="step-body">
                  <span className="step-num">{s.num}</span>
                  <h3>{s.title}</h3>
                  <p>{s.text}</p>
                  <span className="step-cta">{s.cta} &rarr;</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {!active ? (
          <div className="grid-2">
            <form className="card" onSubmit={startSession} style={{ margin: 0 }} id="start-form">
              <h2>Start a Focus Session</h2>
              <label>
                Task name
                <input
                  id="task-input"
                  value={taskName}
                  onChange={(e) => setTaskName(e.target.value)}
                  placeholder="What are you studying?"
                  required
                />
              </label>
              <div className="chip-row">
                {QUICK_TASKS.map((t) => (
                  <button
                    type="button"
                    key={t}
                    className={taskName === t ? "chip active" : "chip"}
                    onClick={() => setTaskName(t)}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <label>Session length</label>
              <div className="chip-row">
                {DURATIONS.map((d) => (
                  <button
                    type="button"
                    key={d}
                    className={Number(plannedMinutes) === d ? "chip active" : "chip"}
                    onClick={() => setPlannedMinutes(d)}
                  >
                    {d} min
                  </button>
                ))}
              </div>
              {prediction ? (
                <p className="muted" style={{ fontSize: "0.88rem" }}>
                  Predicted focus risk right now:{" "}
                  <span className={"risk-chip " + prediction.level}>
                    {prediction.focus_risk_percent}%
                  </span>
                  <br />
                  <span style={{ fontSize: "0.82rem" }}>{prediction.recommendation}</span>
                </p>
              ) : null}
              <button type="submit" className="primary">Start Focus</button>
            </form>

            <div className="card" style={{ margin: 0 }}>
              <h2>Right Now</h2>
              <div className="now-row">
                <span>Today's focus</span>
                <strong>{analytics ? `${analytics.today_minutes} min` : "-"}</strong>
              </div>
              <div className="now-row">
                <span>Best focus time</span>
                <strong>
                  {analytics
                    ? (analytics.best_focus_hour !== null
                        ? formatHour(analytics.best_focus_hour)
                        : "not enough data")
                    : "-"}
                </strong>
              </div>
              <div className="now-row">
                <span>Sessions logged</span>
                <strong>{analytics ? analytics.total_sessions : 0}</strong>
              </div>
              <div className="now-row">
                <span>Completion rate</span>
                <strong>{analytics ? `${analytics.completion_rate}%` : "-"}</strong>
              </div>
              <div className="goal-block">
                <div className="now-row now-row-plain">
                  <span>Weekly goal</span>
                  <strong>{week} / {goal} min</strong>
                </div>
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: goalPct + "%" }} />
                </div>
              </div>
            </div>
          </div>
        ) : onBreak ? (
          <div className="card timer-card">
            <h2>Adaptive Break</h2>
            <FocusRing progress={100}>
              <div className="timer">{formatTime(breakLeft)}</div>
              <div className="planned">Break time - timer paused</div>
            </FocusRing>
            <p className="muted">Studying resumes automatically when the ring resets.</p>
          </div>
        ) : (
          <div className="grid-2">
            <div className="card timer-card" style={{ margin: 0 }}>
              <h2>{active.task_name}</h2>
              <FocusRing progress={progress}>
                <div className="timer">{formatTime(elapsed)}</div>
                <div className="planned">of {active.planned_minutes} min</div>
              </FocusRing>
              {showRating ? (
                <div className="rating">
                  <p>How focused were you? (1 = distracted, 5 = deep focus)</p>
                  <div className="rating-buttons">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button key={n} onClick={() => finishSession(n)}>{n}</button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="timer-actions">
                  <button className="primary" onClick={() => setShowRating(true)}>Complete</button>
                  <button className="danger" onClick={abandonSession}>Abandon</button>
                </div>
              )}
            </div>

            <div className="card" style={{ margin: 0 }}>
              <h2>Session Pulse</h2>
              {breakSuggestion ? (
                <div className="risk-banner">
                  <p>
                    Focus risk at <strong>{breakSuggestion.focus_risk_percent}%</strong>.
                    Based on your pattern, a break now would help.
                  </p>
                  <div className="timer-actions" style={{ justifyContent: "flex-start" }}>
                    <button className="primary" onClick={acceptBreak}>Take a 5-min break</button>
                    <button onClick={dismissBreak}>Keep going</button>
                  </div>
                </div>
              ) : risk ? (
                <div>
                  <p className="muted" style={{ fontSize: "0.85rem" }}>Live focus risk (updates every 20s)</p>
                  <div className="now-value">
                    <span className={"risk-chip " + risk.level} style={{ fontSize: "1.1rem" }}>
                      {risk.focus_risk_percent}%
                    </span>
                  </div>
                  <p className="muted" style={{ fontSize: "0.82rem" }}>{risk.recommendation}</p>
                </div>
              ) : (
                <p className="muted">Measuring your focus risk...</p>
              )}
              <div className="now-row">
                <span>Elapsed</span>
                <strong>{Math.floor(elapsed / 60)} min</strong>
              </div>
              <div className="now-row">
                <span>Model</span>
                <strong style={{ fontSize: "0.8rem" }}>Logistic Regression</strong>
              </div>
              <div className="goal-block">
                <button style={{ width: "100%" }} onClick={() => setZen(!zen)}>
                  {zen ? "Exit Zen Mode" : "Enter Zen Mode"}
                </button>
              </div>
            </div>
          </div>
        )}

        {!active ? <BreakLounge showToast={setToast} /> : null}

        <section className="card hide-in-zen" id="insights">
          <h2>AI Insights</h2>
          <p className="muted" style={{ marginTop: "-0.5rem", fontSize: "0.82rem" }}>
            Generated from your real session history
            {insights ? ` (${insights.based_on} sessions)` : ""}
          </p>
          <div className="insight-grid">
            {(insights ? insights.insights : []).map((i, idx) => (
              <div key={idx} className={"insight-card " + i.kind}>
                <p style={{ margin: 0 }}>{i.text}</p>
              </div>
            ))}
          </div>
        </section>

        <Achievements data={ach} />

        <section className="card hide-in-zen" id="analytics">
          <h2>Focus Analytics</h2>
          {analytics ? (
            <>
              <div className="stats-grid">
                <div className="stat-tile">
                  <div className="stat-value">
                    {Math.floor(analytics.total_focus_minutes / 60)}h {analytics.total_focus_minutes % 60}m
                  </div>
                  <div className="stat-label">Total Focus</div>
                </div>
                <div className="stat-tile">
                  <div className="stat-value">{analytics.today_minutes}m</div>
                  <div className="stat-label">Today</div>
                </div>
                <div className="stat-tile">
                  <div className="stat-value">{analytics.avg_session_minutes}m</div>
                  <div className="stat-label">Avg Session</div>
                </div>
                <div className="stat-tile">
                  <div className="stat-value">{analytics.completion_rate}%</div>
                  <div className="stat-label">Completion</div>
                </div>
                <div className="stat-tile">
                  <div className="stat-value">{analytics.avg_focus_score}/5</div>
                  <div className="stat-label">Focus Score</div>
                </div>
              </div>
              {analytics.daily.some((d) => d.minutes > 0) ? (
                <div className="chart-box">
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={analytics.daily}>
                      <XAxis dataKey="date" stroke="#888" />
                      <YAxis stroke="#888" allowDecimals={false} />
                      <Tooltip
                        contentStyle={{
                          background: theme === "dark" ? "#131417" : "#fffdf7",
                          border: "1px solid " + (theme === "dark" ? "#26282e" : "#e4dbc5"),
                          borderRadius: 10,
                          color: theme === "dark" ? "#f4f4f1" : "#1a1712",
                        }}
                        formatter={(value) => [`${value} min`, "Focus"]}
                      />
                      <Bar dataKey="minutes" fill={chartFill} radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="muted">No focus minutes in the last 7 days yet.</p>
              )}
            </>
          ) : (
            <p className="muted">Loading analytics...</p>
          )}
        </section>

        <TechMarquee />

<section className="card hide-in-zen">
          <h2>Session History</h2>
          {sessions.length === 0 ? (
            <p className="muted">No sessions yet. Start your first one above!</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Task</th>
                  <th>Planned</th>
                  <th>Actual</th>
                  <th>Score</th>
                  <th>Status</th>
                  <th>When</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((s) => (
                  <tr key={s.id}>
                    <td>{s.task_name}</td>
                    <td>{s.planned_minutes}m</td>
                    <td>{s.actual_minutes}m</td>
                    <td>{s.focus_score || "-"}</td>
                    <td>
                      <span className={s.completed ? "badge ok" : "badge fail"}>
                        {s.completed ? "Completed" : "Abandoned"}
                      </span>
                    </td>
                    <td>{new Date(s.start_time).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>

      <SiteFooter />

      {aiOpen ? (
        <div className="modal-overlay" onClick={() => setAiOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setAiOpen(false)}>{"\u2715"}</button>
            <h3>How the AI thinks</h3>
            <p className="muted" style={{ fontSize: "0.88rem" }}>
              Every session you log trains a model that predicts whether your next
              session will survive - before you even start it.
            </p>
            {modelInfo ? (
              <div className="metric-row">
                <div className="metric-box">
                  <strong>
                    {modelInfo.accuracy != null ? (modelInfo.accuracy * 100).toFixed(1) + "%" : "-"}
                  </strong>
                  <span>Accuracy</span>
                </div>
                <div className="metric-box">
                  <strong>{modelInfo.roc_auc != null ? modelInfo.roc_auc.toFixed(3) : "-"}</strong>
                  <span>ROC-AUC</span>
                </div>
                <div className="metric-box">
                  <strong>{modelInfo.n_sessions != null ? modelInfo.n_sessions : "-"}</strong>
                  <span>Sessions trained</span>
                </div>
              </div>
            ) : (
              <p className="muted">Loading model stats...</p>
            )}
            <ul>
              <li><strong>Plan:</strong> your inputs (session length, time of day) become feature vectors</li>
              <li><strong>Predict:</strong> logistic regression outputs P(complete) - Focus Risk = 1 - P</li>
              <li><strong>Adapt:</strong> risk at 65%+ mid-session triggers a break suggestion</li>
              <li><strong>Learn:</strong> every completed or abandoned session becomes new training data</li>
            </ul>
            {modelInfo && modelInfo.source ? (
              <p className="muted" style={{ fontSize: "0.75rem", marginBottom: 0 }}>
                Current data source: {modelInfo.source}
              </p>
            ) : null}
          </div>
        </div>
      ) : null}

      {toast ? <div className="toast">{toast}</div> : null}
    </div>
  );
}

