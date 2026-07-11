import { useState } from "react";
import Terminal from "./Terminal";
import CountdownBar from "./CountdownBar";
import useCountdown from "../useCountdown";
import { engine } from "../api";

export default function Stage1({ runCtx, remainingSec, onDone, onExpired }) {
  const [selected, setSelected] = useState([]);   
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  const { remaining, pct } = useCountdown(remainingSec, onExpired);

  function toggle(num) {
    setError("");
    setSelected((prev) => {
      if (prev.includes(num)) return prev.filter((n) => n !== num);
      if (prev.length === 2) return prev;      
      return [...prev, num];
    });
  }

  async function handleSubmit() {
    if (selected.length !== 2) {
      setError("Select exactly two numbers from the pool.");
      return;
    }
    const [p, q] = selected;
    setLoading(true);
    setError("");
    try {
      const data = await engine.stage1(runCtx.run_id, p, q);
      if (data.expired) { onExpired(); return; }
      if (!data.ok)     { setError(data.reason); setLoading(false); return; }
      onDone(data);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <Terminal title="cryptoforge — stage 1: prime selection">
      <CountdownBar remaining={remaining} pct={pct} />

      <p className="prompt">select p and q</p>
      <p className="muted">
        Pick two prime numbers from the pool below. Composites are decoys!
      </p>

      {/* Candidate grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
          gap: "8px",
          margin: "16px 0",
        }}
      >
        {runCtx.candidates.map((num) => {
          const isChosen = selected.includes(num);
          return (
            <button
              key={num}
              className="choice-btn"
              onClick={() => toggle(num)}
              style={{
                padding: "10px 0",
                ...(isChosen && {
                  background: "var(--magenta)",
                  color: "var(--bg-titlebar)",
                  borderColor: "var(--magenta)",
                  fontWeight: 700,
                }),
              }}
            >
              {num}
            </button>
          );
        })}
      </div>

      <p className="muted">
        Selected:{" "}
        {selected.length === 0
          ? "none"
          : selected.join(" and ")}
      </p>

      {error && <p className="error">{error}</p>}

      <button
        onClick={handleSubmit}
        disabled={loading || selected.length !== 2}
        style={{ marginTop: "8px", width: "100%" }}
      >
        {loading ? "checking…" : "Confirm p and q →"}
      </button>
    </Terminal>
  );
}
