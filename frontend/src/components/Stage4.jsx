import { useState } from "react";
import Terminal from "./Terminal";
import CountdownBar from "./CountdownBar";
import useCountdown from "../useCountdown";
import { engine } from "../api";

export default function Stage4({ runCtx, onDone, onExpired }) {
  const [dInput, setDInput] = useState("");
  const [error, setError]   = useState("");
  const [loading, setLoading] = useState(false);

  const { remaining, pct } = useCountdown(remainingSec, onExpired);

  async function handleSubmit() {
    if (!dInput) { setError("Enter your private key d."); return; }

    setLoading(true);
    setError("");
    try {
      const data = await engine.stage4(runCtx.run_id, dInput);
      if (data.expired) { onExpired(); return; }
      if (!data.ok)     { setError(data.reason); setLoading(false); return; }
      onDone(data);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <Terminal title="cryptoforge — stage 4: decryption">
      <CountdownBar remaining={remaining} pct={pct} />

      <p className="prompt">decrypt the message</p>
      <p className="muted">
        Using private key (d=?, n={runCtx.n}). Each value c decrypts as m = c^d mod n.
      </p>

      <div
        style={{
          background: "var(--bg-input)",
          border: "1px solid var(--border)",
          borderRadius: "6px",
          padding: "10px 14px",
          margin: "14px 0",
          fontSize: "12px",
          color: "var(--cyan)",
          wordBreak: "break-all",
          lineHeight: "1.8",
        }}
      >
        <span style={{ color: "var(--fg-muted)", display: "block", marginBottom: "4px" }}>
          ciphertext:
        </span>
        [{runCtx.ciphertext.join(", ")}]
      </div>

      <div className="form">
        <label>
          Your private key d
          <input
            type="number"
            value={dInput}
            onChange={(e) => { setDInput(e.target.value); setError(""); }}
            placeholder="enter d…"
            autoFocus
          />
        </label>
      </div>

      {error && <p className="error">{error}</p>}

      <button
        onClick={handleSubmit}
        disabled={loading || !dInput}
        style={{ marginTop: "8px", width: "100%" }}
      >
        {loading ? "decrypting…" : "Decrypt →"}
      </button>
    </Terminal>
  );
}
