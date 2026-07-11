import { useState } from "react";
import Terminal from "./Terminal";
import CountdownBar from "./CountdownBar";
import useCountdown from "../useCountdown";
import { engine } from "../api";

export default function Stage3({ runCtx, onDone, onExpired }) {
  const [message, setMessage] = useState("");
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);

  const { remaining, pct } = useCountdown(remainingSec, onExpired);

  async function handleSubmit() {
    if (!message.trim()) { setError("Enter a message to encrypt."); return; }

    setLoading(true);
    setError("");
    try {
      const data = await engine.stage3(runCtx.run_id, message);
      if (data.expired) { onExpired(); return; }
      if (!data.ok)     { setError(data.reason); setLoading(false); return; }
      onDone({ message, ciphertext: data.ciphertext });
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <Terminal title="cryptoforge — stage 3: encryption">
      <CountdownBar remaining={remaining} pct={pct} />

      <p className="prompt">encrypt a message</p>
      <p className="muted">
        Using public key (e={runCtx.e}, n={runCtx.n}). Each character will be
        encrypted as c = m^e mod n.
      </p>

      <div className="form">
        <label>
          Plaintext message
          <input
            type="text"
            value={message}
            maxLength={200}
            onChange={(e) => { setMessage(e.target.value); setError(""); }}
            placeholder="type your message…"
            autoFocus
          />
        </label>
      </div>

      {error && <p className="error">{error}</p>}

      <button
        onClick={handleSubmit}
        disabled={loading || !message.trim()}
        style={{ marginTop: "8px", width: "100%" }}
      >
        {loading ? "encrypting…" : "Encrypt →"}
      </button>
    </Terminal>
  );
}
