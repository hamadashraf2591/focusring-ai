const LINKEDIN_URL = "https://www.linkedin.com/in/m-hamad-ashraf-4b15a53a9";

export default function SiteFooter() {
  return (
    <footer className="site-footer hide-in-zen">
      <div className="footer-grid">
        <div className="dev-card">
          <div className="dev-avatar">MH</div>
          <div>
            <div className="dev-name">Muhammad Hamad Ashraf</div>
            <div className="dev-role">Full-Stack &amp; ML Developer</div>
            <div className="dev-links">
              <a href="https://github.com/hamadashraf2591" target="_blank" rel="noreferrer">
                GitHub
              </a>
              <a href={LINKEDIN_URL} target="_blank" rel="noreferrer">
                LinkedIn
              </a>
            </div>
          </div>
        </div>
        <div>
          <h4>Jump to</h4>
          <a href="#how">How it works</a>
          <a href="#lounge">Break Lounge</a>
          <a href="#achievements">Achievements</a>
          <a href="#analytics">Analytics</a>
        </div>
        <div>
          <h4>Built with</h4>
          <p>
            React + Vite<br />
            FastAPI + SQLAlchemy<br />
            scikit-learn Logistic Regression<br />
            Recharts + Pandas
          </p>
        </div>
      </div>
      <div className="footer-bottom">
        <span>
          &copy; {new Date().getFullYear()} FocusRing AI - designed &amp; engineered by Muhammad Hamad Ashraf
        </span>
        <span className="fb-right">Every number on this page is computed from real session data</span>
      </div>
    </footer>
  );
}


