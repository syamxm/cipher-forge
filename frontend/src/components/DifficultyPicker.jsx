import { useState } from "react";
import Terminal from "./Terminal";
import { engine } from "../api";

const LEVELS = [
  {
    id: "easy",
    label: "Easy",
    color: "var(--green)",
    desc: "Primes 17–50 · 5 min",
  },
  {
    id: "medium",
    label: "Medium",
    color: "var(--yellow)",
    desc: "Primes 50–150 · 3 min",
  },
  {
    id: "hard",
    label: "Hard",
    color: "var(--red)",
    desc: "Primes 150–255 · 2 min",
  },
];

export default function DifficultyPicker({ onStarted }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handlePick(difficulty) {
    setLoading(true);
    setError("");
    try {
      const data = await engine.start(difficulty);
      onStarted(data);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <Terminal title="cryptoforge — difficulty">
      <p className="prompt">select difficulty</p>
      <p className="muted">Choose how large the prime numbers will be.</p>

      <div className="form" style={{ gap: "10px", marginTop: "16px" }}>
        {LEVELS.map((lvl) => (
          <button
            key={lvl.id}
            disabled={loading}
            onClick={() => handlePick(lvl.id)}
            style={{
              background: "var(--bg-input)",
              color: lvl.color,
              border: `1px solid ${lvl.color}`,
              textAlign: "left",
              padding: "12px 16px",
            }}
          >
            <span style={{ fontWeight: 700 }}>{lvl.label}</span>
            <span
              style={{
                marginLeft: "12px",
                color: "var(--fg-muted)",
                fontSize: "12px",
                fontWeight: 400,
              }}
            >
              {lvl.desc}
            </span>
          </button>
        ))}
      </div>

      {error && <p className="error">{error}</p>}
    </Terminal>
  );
}
