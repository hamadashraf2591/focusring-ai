export default function Achievements({ data }) {
  if (!data) return null;
  const pct = Math.min(100, (data.xp_into_level / data.xp_for_next) * 100);

  return (
    <section className="card hide-in-zen" id="achievements">
      <div className="ach-head">
        <h2>Achievements</h2>
        <div className="xp-chip big">
          <span className="lvl">LVL {data.level}</span>
          <div className="xp-bar"><div style={{ width: pct + "%" }} /></div>
          <small>{data.xp_into_level} / {data.xp_for_next} XP</small>
        </div>
      </div>
      <div className="ach-grid">
        {data.badges.map((b) => (
          <div key={b.id} className={b.unlocked ? "ach-card unlocked" : "ach-card"}>
            <div className="ach-icon">{b.icon}</div>
            <strong>{b.name}</strong>
            <p>{b.description}</p>
            {b.unlocked ? (
              <span className="ach-done">Unlocked</span>
            ) : (
              <div className="ach-progress">
                <div style={{ width: b.progress + "%" }} />
                <small>{b.progress}%</small>
              </div>
            )}
          </div>
        ))}
      </div>
      <p className="muted" style={{ fontSize: "0.78rem", marginBottom: 0 }}>
        XP: every focus minute counts (+5 per break). Badges are computed from your real history - nothing is given for free.
      </p>
    </section>
  );
}
