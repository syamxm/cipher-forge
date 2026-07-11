import { useState } from "react";
import Terminal from "./Terminal";
import CountdownBar from "./CountdownBar";
import useCountdown from "../useCountdown";
import { engine } from "../api";

export default function Stage2({ runCtx, onDone, onExpired }) {
  const [chosenE, setChosenE] = useState(null);
  const [dInput, setDInput]   = useState("");
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);

  const { remaining, pct } = useCountdown(remainingSec, onExpired);

  function computeD(e, phi) {
    let [old_r, r]   = [e, phi];
    let [old_s, s]   = [1, 0];
    while (r !== 0) {
      const q = Math.floor(old_r / r);
      [old_r, r] = [r, old_r - q * r];
      [old_s, s] = [s, old_s - q * s];
    }
    if (old_r !== 1) return null;
    return ((old_s % phi) + phi) % phi;
  }

  function handlePickE(e) {
    setChosenE(e);
    setDInput("");
    setError("");
  }

  const shownD = chosenE !== null ? computeD(chosenE, runCtx.phi) : null;

  async function handleSubmit() {
    if (chosenE === null) { setError("Pick a value for e first."); return; }
    if (!dInput)          { setError("Enter the value of d."); return; }

    setLoading(true);
    setError("");
    try {
      const data = await engine.stage2(runCtx.run_id, chosenE, dInput);
      if (data.expired) { onExpired(); return; }
      if (!data.ok)     { setError(data.reason); setLoading(false); return; }
      onDone({ e: chosenE, d: Number(dInput) });
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <Terminal title="cryptoforge — stage 2: key generation">
      <CountdownBar remaining={remaining} pct={pct} />

      <p className="prompt">generate your key pair</p>

      <ul className="stages" style={{ fontSize: "13px", marginBottom: "12px" }}>
        <li>n &nbsp;= {runCtx.n}</li>
        <li>φ(n) = {runCtx.phi}</li>
      </ul>

      <p className="muted" style={{ marginBottom: "6px" }}>
        Choose your public exponent e (must be coprime with φ(n)):
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "14px" }}>
        {runCtx.e_options.map((e) => (
          <button
            key={e}
            onClick={() => handlePickE(e)}
            style={{
              background: chosenE === e ? "var(--cyan)" : "var(--bg-input)",
              color: chosenE === e ? "var(--bg-titlebar)" : "var(--fg)",
              border: `1px solid ${chosenE === e ? "var(--cyan)" : "var(--border)"}`,
              padding: "8px 14px",
              fontWeight: chosenE === e ? 700 : 400,
            }}
          >
            {e}
          </button>
        ))}
      </div>

      {shownD !== null && (
        <div
          style={{
            background: "var(--bg-input)",
            border: "1px solid var(--green)",
            borderRadius: "6px",
            padding: "10px 14px",
            marginBottom: "14px",
            fontSize: "13px",
          }}
        >
          <span style={{ color: "var(--fg-muted)" }}>private key d = </span>
          <span style={{ color: "var(--green)", fontWeight: 700 }}>{shownD}</span>
          <span style={{ color: "var(--fg-muted)", marginLeft: "8px" }}>
            — note this down!
          </span>
        </div>
      )}
      
      <div className="form" style={{ marginTop: "0" }}>
        <label>
          Confirm d (type it back to continue)
          <input
            type="number"
            value={dInput}
            onChange={(e) => { setDInput(e.target.value); setError(""); }}
            placeholder="enter d"
            disabled={chosenE === null}
          />
        </label>
      </div>

      {error && <p className="error">{error}</p>}

      <button
        onClick={handleSubmit}
        disabled={loading || chosenE === null || !dInput}
        style={{ marginTop: "12px", width: "100%" }}
      >
        {loading ? "verifying…" : "Confirm key pair →"}
      </button>
    </Terminal>
  );
}
