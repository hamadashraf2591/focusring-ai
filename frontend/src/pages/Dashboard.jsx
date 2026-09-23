import { useState, useEffect, useRef } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import api from "../api";

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

export default function Dashboard() {
  const [taskName, setTaskName] = useState("");
  const [plannedMinutes, setPlannedMinutes] = useState(45);
  const [sessions, setSessions] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [active, setActive] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [showRating, setShowRating] = useState(false);
  const [risk, setRisk] = useState(null);
  const [breakSuggestion, setBreakSuggestion] = useState(null);
  const [onBreak, setOnBreak] = useState(false);
  const [breakLeft, setBreakLeft] = useState(0);
  const [error, setError] = useState("");

  const elapsedRef = useRef(0);
  const onBreakRef = useRef(false);
  const lastBreakMinuteRef = useRef(0);
  const timerRef = useRef(null);

  useEffect(() => { elapsedRef.current = elapsed; }, [elapsed]);
  useEffect(() => { onBreakRef.current = onBreak; }, [onBreak]);

  const refresh = async () => {
    try {
      const [sRes, aRes] = await Promise.all([
        api.get("/users/1/sessions/"),
        api.get("/users/1/analytics/"),
      ]);
      setSessions(sRes.data);
      setAnalytics(aRes.data);
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
        if (res.data.focus_risk_percent >= 65 && minutesSoFar - lastBreakMinuteRef.current >= 5) {
          setBreakSuggestion(res.data);
        }
      } catch {}
    };
    check();
    const id = setInterval(check, 20000);
    return () => clearInterval(id);
  }, [active]);

  const startSession = async (e) => {
    e.preventDefault();
    setError("");
    setRisk(null);
    setBreakSuggestion(null);
    setOnBreak(false);
    lastBreakMinuteRef.current = 0;
    try {
      const res = await api.post("/users/1/sessions/", {
        task_name: taskName,
        planned_minutes: Number(plannedMinutes),
      });
      setActive(res.data);
      setElapsed(0);
    } catch (err) {
      setError(err.response?.data?.detail || "Could not start session");
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
    } catch {
      setError("Failed to save session");
    }
    setActive(null);
    setShowRating(false);
    setElapsed(0);
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
    } catch {
      setError("Failed to save session");
    }
    setActive(null);
    setElapsed(0);
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

  const progress = active
    ? Math.min(100, (elapsed / (active.planned_minutes * 60)) * 100)
    : 0;

  return (
    <div className="container">
      <header>
        <h1>FocusRing <span className="ai">AI</span></h1>
        <p className="subtitle">Adaptive Study &amp; Focus Assistant</p>
      </header>

      {error ? <div className="error">{error}</div> : null}

      {!active ? (
        <form className="card" onSubmit={startSession}>
          <h2>Start a Focus Session</h2>
          <label>
            Task name
            <input
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              placeholder="e.g. DSA - Arrays"
              required
            />
          </label>
          <label>
            Planned minutes
            <input
              type="number"
              min="5"
              max="180"
              value={plannedMinutes}
              onChange={(e) => setPlannedMinutes(e.target.value)}
              required
            />
          </label>
          {prediction ? (
            <p>
              Predicted focus risk for {plannedMinutes} min now:{" "}
              <span className={"risk-chip " + prediction.level}>
                {prediction.focus_risk_percent}%
              </span>{" "}
              <span className="muted">- {prediction.recommendation}</span>
            </p>
          ) : null}
          <button type="submit" className="primary">Start Focus</button>
        </form>
      ) : onBreak ? (
        <div className="card timer-card">
          <h2>Adaptive Break</h2>
          <div className="timer">{formatTime(breakLeft)}</div>
          <p className="muted">Your focus timer is paused. Studying resumes automatically.</p>
        </div>
      ) : (
        <div className="card timer-card">
          <h2>{active.task_name}</h2>
          <div className="timer">{formatTime(elapsed)}</div>
          <div className="planned">Planned: {active.planned_minutes} min</div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: progress + "%" }} />
          </div>
          {breakSuggestion ? (
            <div className="risk-banner">
              <p>
                Focus risk at <strong>{breakSuggestion.focus_risk_percent}%</strong> -
                based on your session pattern, a break now would help.
              </p>
              <div className="timer-actions">
                <button className="primary" onClick={acceptBreak}>Take a 5-min break</button>
                <button onClick={dismissBreak}>Keep going</button>
              </div>
            </div>
          ) : risk ? (
            <p className="muted">
              Live focus risk: {risk.focus_risk_percent}% ({risk.level})
            </p>
          ) : null}
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
      )}

      <section className="card">
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
                <div className="stat-value">{analytics.avg_session_minutes}m</div>
                <div className="stat-label">Avg Session</div>
              </div>
              <div className="stat-tile">
                <div className="stat-value">{analytics.completion_rate}%</div>
                <div className="stat-label">Completion Rate</div>
              </div>
              <div className="stat-tile">
                <div className="stat-value">{analytics.avg_focus_score}/5</div>
                <div className="stat-label">Avg Focus Score</div>
              </div>
            </div>
            <p className="muted">
              Best focus time: {analytics.best_focus_hour !== null ? formatHour(analytics.best_focus_hour) : "not enough data yet"}
            </p>
            {analytics.daily.some((d) => d.minutes > 0) ? (
              <div className="chart-box">
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={analytics.daily}>
                    <XAxis dataKey="date" stroke="#8b949e" />
                    <YAxis stroke="#8b949e" allowDecimals={false} />
                    <Tooltip
                      contentStyle={{ background: "#161b22", border: "1px solid #30363d", borderRadius: 8 }}
                      formatter={(value) => [`${value} min`, "Focus"]}
                    />
                    <Bar dataKey="minutes" fill="#7c3aed" radius={[6, 6, 0, 0]} />
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

      <section className="card">
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
  );
}

