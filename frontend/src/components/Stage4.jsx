import { useEffect, useMemo, useState } from "react";
import Terminal from "./Terminal";
import CountdownBar from "./CountdownBar";
import ScrambleReveal from "./ScrambleReveal";
import useCountdown from "../useCountdown";
import { engine } from "../api";

export default function Stage4({ runCtx, remainingSec, onDone, onExpired }) {
  const [dInput, setDInput] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [revealDone, setRevealDone] = useState(false);

  const { remaining, pct } = useCountdown(
    remainingSec,
    result ? () => {} : onExpired
  );

  const plaintextTokens = useMemo(
    () => (result ? result.plaintext.split("") : []),
    [result]
  );

  useEffect(() => {
    if (!revealDone) return;
    const id = setTimeout(() => onDone(result), 800);
    return () => clearTimeout(id);
  }, [revealDone]);

  async function handleSubmit() {
    if (!dInput) { setError("Enter your private key d."); return; }

    setLoading(true);
    setError("");
    try {
      const data = await engine.stage4(runCtx.run_id, dInput);
      if (data.expired) { onExpired(); return; }
      if (!data.ok) { setError(data.reason); setLoading(false); return; }
      setResult(data);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <Terminal title="cipher-forge — stage 4: decryption">
      <CountdownBar remaining={remaining} pct={pct} />

      <p className="prompt">decrypt the message</p>
      <p className="muted">
        Using private key (d=?, n={runCtx.n}). Each value c decrypts as m = c^d mod n.
      </p>

      <div
        className="info-panel"
        style={{
          margin: "14px 0",
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

      {result ? (
        <>
          <p className="muted">plaintext:</p>
          <ScrambleReveal
            tokens={plaintextTokens}
            separator=""
            onDone={() => setRevealDone(true)}
          />
        </>
      ) : (
        <>
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
        </>
      )}
    </Terminal>
  );
}
