import Terminal from "./Terminal";
import ScoreSubmit from "./ScoreSubmit";

export default function SuccessScreen({ runCtx, onRetry }) {
  const { run_id, elapsed_sec, difficulty } = runCtx;

  const mins = String(Math.floor(elapsed_sec / 60)).padStart(2, "0");
  const secs = String(Math.floor(elapsed_sec % 60)).padStart(2, "0");

  return (
    <Terminal title="cryptoforge — success!">
      <p className="prompt">run complete</p>

      <ul className="stages" style={{ marginTop: "16px" }}>
        <li style={{ color: "var(--green)" }}>✓ Stage 1 — prime selection</li>
        <li style={{ color: "var(--green)" }}>✓ Stage 2 — key generation</li>
        <li style={{ color: "var(--green)" }}>✓ Stage 3 — encryption</li>
        <li style={{ color: "var(--green)" }}>✓ Stage 4 — decryption</li>
      </ul>

      <div
        style={{
          background: "var(--bg-input)",
          border: "1px solid var(--green)",
          borderRadius: "6px",
          padding: "12px 16px",
          margin: "16px 0",
          fontSize: "13px",
        }}
      >
        <div style={{ color: "var(--fg-muted)", marginBottom: "4px" }}>
          difficulty: <span style={{ color: "var(--fg)" }}>{difficulty}</span>
        </div>
        <div style={{ color: "var(--fg-muted)" }}>
          time: <span style={{ color: "var(--green)", fontWeight: 700 }}>{mins}:{secs}</span>
        </div>
      </div>

      <ScoreSubmit run_id={run_id} />

      <button onClick={onRetry} style={{ width: "100%", marginTop: "8px" }}>
        Play again
      </button>
    </Terminal>
  );
}
