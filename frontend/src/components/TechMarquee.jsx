const ITEMS = [
  { name: "React", tag: "UI Library", letter: "R", color: "#61dafb" },
  { name: "Vite", tag: "Build Tool", letter: "V", color: "#a855f7" },
  { name: "FastAPI", tag: "Backend Framework", letter: "F", color: "#05998b" },
  { name: "Python", tag: "Language", letter: "Py", color: "#ffd43b" },
  { name: "scikit-learn", tag: "Machine Learning", letter: "sk", color: "#f89939" },
  { name: "Logistic Regression", tag: "Prediction Model", letter: "LR", color: "#d7fe45" },
  { name: "SQLAlchemy", tag: "Database ORM", letter: "SA", color: "#d71f00" },
  { name: "Pandas", tag: "Data Processing", letter: "pd", color: "#8b5cf6" },
  { name: "NumPy", tag: "Numerical Computing", letter: "np", color: "#4dabcf" },
  { name: "Recharts", tag: "Visualization", letter: "Re", color: "#8ef6e4" },
  { name: "SQLite", tag: "Database", letter: "SQL", color: "#4da6c9" },
  { name: "REST API", tag: "Architecture", letter: "API", color: "#fb923c" },
];

export default function TechMarquee() {
  const row = [...ITEMS, ...ITEMS];
  return (
    <section className="marquee-section hide-in-zen" aria-label="Tech stack">
      <p className="marquee-heading">Powered by</p>
      <div className="marquee-wrap">
        <div className="marquee">
          {row.map((it, i) => (
            <span className="tech-card" key={i}>
              <span
                className="tech-icon"
                style={{
                  background: it.color + "1f",
                  color: it.color,
                  borderColor: it.color + "55",
                }}
              >
                {it.letter}
              </span>
              <span className="tech-meta">
                <strong>{it.name}</strong>
                <small>{it.tag}</small>
              </span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
