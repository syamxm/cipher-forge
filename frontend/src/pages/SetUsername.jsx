import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../auth";
import Terminal from "../components/Terminal";

export default function SetUsername() {
  const { user, loading, refresh } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (loading) return <div className="screen center muted">booting…</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.username) return <Navigate to="/" replace />;

  async function submit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await api.setUsername(username);
      await refresh();
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Terminal title="cipher-forge — set handle">
      <p className="prompt">choose your handle</p>
      <p className="muted">letters, numbers, underscore. 3–20 chars.</p>
      <form onSubmit={submit} className="form">
        <label>
          username
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            minLength={3}
            maxLength={20}
            pattern="[a-zA-Z0-9_]+"
          />
        </label>
        {error && <p className="error">! {error}</p>}
        <button type="submit" disabled={busy}>
          {busy ? "saving…" : "continue"}
        </button>
      </form>
    </Terminal>
  );
}
