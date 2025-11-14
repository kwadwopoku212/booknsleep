/* JOIN THE TEAM SECTION */
.join-team {
    margin-top: 2.5rem;
    padding: 1.5rem;
    background: var(--glass);
    border: var(--border);
    border-radius: 1.2em;
    box-shadow: 0 6px 25px rgba(0,0,0,0.35);
    text-align: left;
    max-width: 480px;
    margin-left: auto;
    margin-right: auto;
    backdrop-filter: blur(6px);
}

.join-team h2 {
    color: var(--gold);
    font-family: "Share Tech Mono", monospace;
    font-size: 1.4rem;
    margin-bottom: 0.6rem;
}

.join-team p {
    color: var(--secondary-text);
    font-size: 1rem;
    margin-bottom: 1rem;
}

/* APPLY FORM */
.apply-form {
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
}

.apply-form input,
.apply-form textarea {
    padding: 0.7em 1em;
    border-radius: 0.8em;
    border: 1.5px solid var(--accent);
    background: rgba(251,191,36,0.05);
    font-size: 1rem;
    color: var(--text);
    outline: none;
    transition: border 0.2s;
}

.apply-form input:focus,
.apply-form textarea:focus {
    border-color: var(--gold);
}

.apply-form textarea {
    min-height: 100px;
    resize: vertical;
}

.apply-form button {
    align-self: flex-start;
    padding: 0.65em 1.4em;
    border-radius: 2em;
    border: none;
    background: var(--accent);
    color: #18120d;
    font-weight: 700;
    cursor: pointer;
    font-size: 1.08em;
    transition: background 0.22s;
}

.apply-form button:hover {
    background: var(--gold);
}

/* MOBILE OPTIMIZATION */
@media (max-width: 600px) {
    .join-team {
        padding: 1rem;
        max-width: 95vw;
    }
    .join-team h2 {
        font-size: 1.2rem;
    }
}
:root {
  --bg: #0a0a20;
  --text: #fafaff;
  --card: rgba(30, 30, 48, 0.52);
  --accent: #fbbf24;
  --gold: #ffd700;
  --border: 1.5px solid rgba(255,212,55,0.25);
}
body { background: var(--bg); color: var(--text); font-family: system-ui, Segoe UI, Roboto, Arial, sans-serif; }
.main { max-width: 1100px; margin: 40px auto; padding: 0 20px; }
.card { background: var(--card); border: var(--border); border-radius: 16px; padding: 16px; }
.header { display: flex; gap: 8px; align-items: center; justify-content: space-between; }
.token { padding: 6px 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.18); background: rgba(255,255,255,0.06); color: var(--text); }
.table { width: 100%; border-collapse: collapse; }
.table th, .table td { border-bottom: 1px solid rgba(255,255,255,0.08); padding: 10px; text-align: left; font-size: 14px; }
.badge { display: inline-block; padding: 2px 8px; border-radius: 999px; font-size: 12px; color: #18120d; }
.badge.industry_watch { background: #ffd700; }
.badge.high_interest { background: #fbbf24; }
.badge.medium_interest { background: #d1fae5; }
.badge.low_interest { background: #e5e7eb; }
/* Add to style.css */
.consent-banner {
  position: fixed; bottom: 0; left: 0; right: 0;
  background: var(--glass);
  border-top: var(--border);
  backdrop-filter: blur(6px);
  color: var(--text);
  padding: 0.9rem 1rem;
  display: flex; gap: 1rem; align-items: center; justify-content: center;
  z-index: 1000;
}
.consent-banner p { margin: 0; font-size: 0.95rem; color: var(--secondary-text); }
.consent-banner button {
  padding: 0.4em 0.9em; border-radius: 1.2em; border: 1px solid var(--accent);
  background: var(--accent); color: #18120d; cursor: pointer; font-weight: 600;
}
.consent-banner .decline { background: transparent; color: var(--text); }


