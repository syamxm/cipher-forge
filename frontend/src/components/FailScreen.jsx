import Terminal from "./Terminal";

export default function FailScreen({ onRetry }) {
  return (
    <Terminal title="cryptoforge — time's up">
      <p className="prompt" style={{ color: "var(--red)" }}>time expired</p>
      <p className="muted">
        You ran out of time before completing all stages. The run has been
        marked as failed.
      </p>
      <p className="muted" style={{ marginTop: "12px" }}>
        Try a lower difficulty or work faster!
      </p>
      <button
        className="choice-btn"
        onClick={onRetry}
        style={{
          width: "100%",
          marginTop: "20px",
          color: "var(--red)",
          borderColor: "var(--red)",
          fontWeight: 600,
        }}
      >
        Try again
      </button>
    </Terminal>
  );
}
