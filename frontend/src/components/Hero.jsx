export default function Hero({ analytics }) {
  const streak = analytics ? analytics.streak_days : 0;
  const total = analytics
    ? Math.floor(analytics.total_focus_minutes / 60) + "h " + (analytics.total_focus_minutes % 60) + "m"
    : "0h 0m";
  const sessions = analytics ? analytics.total_sessions : 0;

  return (
    <section className="hero-banner">
      <img
        className="hero-img"
        src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1600&q=70"
        alt="Study workspace"
      />
      <div className="hero-overlay" />
      <div className="hero-content">
        <span className="hero-tag">AI-powered study assistant</span>
        <h1>
          Study smarter.
          <br />
          <span>Focus deeper.</span>
        </h1>
        <p>
          FocusRing learns from every session you log, predicts when your focus will
          drop, and adapts your breaks before burnout hits.
        </p>
        <div className="hero-stats">
          <div className="hero-stat">
            <strong>{streak}</strong>
            <span>day streak</span>
          </div>
          <div className="hero-stat">
            <strong>{total}</strong>
            <span>total focus</span>
          </div>
          <div className="hero-stat">
            <strong>{sessions}</strong>
            <span>sessions logged</span>
          </div>
        </div>
      </div>
    </section>
  );
}
