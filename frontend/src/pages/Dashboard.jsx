import { useState, useEffect, useRef } from "react";
import api from "../api";

function formatTime(totalSeconds) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function Dashboard() {
  const [taskName, setTaskName] = useState("");
  const [plannedMinutes, setPlannedMinutes] = useState(45);
  const [sessions, setSessions] = useState([]);
  const [active, setActive] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [showRating, setShowRating] = useState(false);
  const [error, setError] = useState("");
  const timerRef = useRef(null);

  const fetchSessions = async () => {
    try {
      const res = await api.get("/users/1/sessions/");
      setSessions(res.data);
    } catch {
      setError("Failed to load sessions. Is the backend running on port 8000?");
    }
  };

  useEffect(() => { fetchSessions(); }, []);

  useEffect(() => {
    if (active) {
      timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [active]);

  const startSession = async (e) => {
    e.preventDefault();
    setError("");
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
    fetchSessions();
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
    fetchSessions();
  };

  const progress = active
    ? Math.min(100, (elapsed / (active.planned_minutes * 60)) * 100)
    : 0;

  return (
    <div className="container">
      <header>
        <h1>FocusRing <span className="ai">AI</span></h1>
        <p className="subtitle">Adaptive Study & Focus Assistant</p>
      </header>

      {error && <div className="error">{error}</div>}

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
          <button type="submit" className="primary">Start Focus</button>
        </form>
      ) : (
        <div className="card timer-card">
          <h2>{active.task_name}</h2>
          <div className="timer">{formatTime(elapsed)}</div>
          <div className="planned">Planned: {active.planned_minutes} min</div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: progress + "%" }} />
          </div>
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
