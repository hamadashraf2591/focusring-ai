export default function FocusRing({ progress, children }) {
  const R = 130;
  const C = 2 * Math.PI * R;
  const clamped = Math.min(100, Math.max(0, progress));
  return (
    <div className="focus-ring">
      <svg width="300" height="300" viewBox="0 0 300 300">
        <defs>
          <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: "var(--accent)" }} />
            <stop offset="100%" style={{ stopColor: "var(--accent2)" }} />
          </linearGradient>
        </defs>
        <circle cx="150" cy="150" r={R} stroke="var(--track)" strokeWidth="14" fill="none" />
        <circle
          cx="150"
          cy="150"
          r={R}
          stroke="url(#ringGrad)"
          strokeWidth="14"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={C}
          strokeDashoffset={C - (C * clamped) / 100}
          transform="rotate(-90 150 150)"
          style={{ transition: "stroke-dashoffset 1s linear" }}
        />
      </svg>
      <div className="ring-center">{children}</div>
    </div>
  );
}
