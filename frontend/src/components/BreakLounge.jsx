import { useState, useEffect } from "react";
import api from "../api";

const BREAK_TYPES = [
  { kind: "Water", emoji: "💧", minutes: 2, color: "#38bdf8" },
  { kind: "Stretch", emoji: "🧘", minutes: 3, color: "#d7fe45" },
  { kind: "Walk", emoji: "🚶", minutes: 5, color: "#fb923c" },
  { kind: "Breathe", emoji: "🌬️", minutes: 1, color: "#a78bfa" },
];

export default function BreakLounge({ showToast }) {
  const [selected, setSelected] = useState(BREAK_TYPES[0]);
  const [running, setRunning] = useState(false);
  const [left, setLeft] = useState(0);
  const [breaks, setBreaks] = useState([]);
  const [phase, setPhase] = useState("in");

  const load = async () => {
    try {
      const r = await api.get("/users/1/breaks/");
      setBreaks(r.data);
    } catch {}
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setPhase((p) => (p === "in" ? "hold" : p === "hold" ? "out" : "in"));
    }, 4000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!running) return;
    if (left <= 0) {
      setRunning(false);
      api.post("/users/1/breaks/", {
        kind: selected.kind,
        duration_seconds: selected.minutes * 60,
      })
        .then(() => {
          showToast(selected.kind + " break complete - logged");
          load();
        })
        .catch(() => {});
      return;
    }
    const id = setTimeout(() => setLeft((l) => l - 1), 1000);
    return () => clearTimeout(id);
  }, [running, left, selected]);

  const today = new Date().toDateString();
  const todayBreaks = breaks.filter(
    (b) => new Date(b.created_at).toDateString() === today
  );
  const todayMinutes = todayBreaks.reduce(
    (s, b) => s + Math.round(b.duration_seconds / 60), 0
  );

  const phaseText =
    phase === "in" ? "Breathe in" : phase === "hold" ? "Hold" : "Breathe out";

  return (
    <section className="card hide-in-zen" id="lounge">
      <h2>Break Lounge</h2>
      <p className="muted" style={{ marginTop: "-0.5rem", fontSize: "0.82rem" }}>
        Smart recovery is part of studying. Pick a recharge - the timer does the rest.
      </p>
      <div className="lounge-grid">
        <div>
          {running ? (
            <div style={{ textAlign: "center", padding: "1rem 0" }}>
              <div className="break-timer">
                {String(Math.floor(left / 60)).padStart(2, "0")}:
                {String(left % 60).padStart(2, "0")}
              </div>
              <p className="muted">
                {selected.emoji} {selected.kind} break in progress
              </p>
              <button onClick={() => setRunning(false)}>Skip break</button>
            </div>
          ) : (
            <>
              <div className="break-btns">
                {BREAK_TYPES.map((b) => (
                  <button
                    key={b.kind}
                    className={selected.kind === b.kind ? "break-type active" : "break-type"}
                    onClick={() => setSelected(b)}
                  >
                    <span className="dot" style={{ background: b.color }} />
                    {b.emoji} {b.kind} - {b.minutes}m
                  </button>
                ))}
              </div>
              <button className="primary" onClick={startBreak}>
                Start {selected.kind} break
              </button>
            </>
          )}
          <div className="lounge-stats">
            <div className="lounge-stat">
              <strong>{todayBreaks.length}</strong>
              <span>breaks today</span>
            </div>
            <div className="lounge-stat">
              <strong>{todayMinutes}m</strong>
              <span>recharge time</span>
            </div>
            <div className="lounge-stat">
              <strong>{breaks.length}</strong>
              <span>all time</span>
            </div>
          </div>
        </div>
        <div className="breath-card">
          <h3 style={{ marginBottom: 0 }}>1-minute reset</h3>
          <div className="breath-wrap">
            <div className={"breath-bubble " + phase}>{phaseText}</div>
            <div className="breath-phase">{phaseText}</div>
          </div>
          <ul className="tip-list">
            <li>Stand up and roll your shoulders every 30 minutes</li>
            <li>Water first - dehydration feels like distraction</li>
            <li>No phone during breaks - eyes need distance, not screens</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
