export default function CountdownBar({ remaining, pct }) {
  const mins = String(Math.floor(remaining / 60)).padStart(2, "0");
  const secs = String(remaining % 60).padStart(2, "0");

  const barColor =
    pct > 50 ? "var(--green)" : pct > 20 ? "var(--yellow)" : "var(--red)";

  return (
    <div style={{ margin: "12px 0 6px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: "12px",
          color: "var(--fg-muted)",
          marginBottom: "4px",
        }}
      >
        <span>time remaining</span>
        <span style={{ color: pct <= 20 ? "var(--red)" : "var(--fg)" }}>
          {mins}:{secs}
        </span>
      </div>
      <div
        style={{
          height: "4px",
          background: "var(--border)",
          borderRadius: "2px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${pct}%`,
            background: barColor,
            borderRadius: "2px",
            transition: "width 1s linear, background 0.5s",
          }}
        />
      </div>
    </div>
  );
}
