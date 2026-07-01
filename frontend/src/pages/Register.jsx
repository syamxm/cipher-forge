import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../auth";
import Terminal from "../components/Terminal";

export default function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const { access_token } = await api.register(username, password);
      await login(access_token);
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Terminal title="cipher-forge — register">
      <p className="prompt">create account</p>
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
            autoComplete="username"
          />
        </label>
        <label>
          password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            autoComplete="new-password"
          />
        </label>
        <p className="muted">username 3–20 chars · password min 8</p>
        {error && <p className="error">! {error}</p>}
        <button type="submit" disabled={busy}>
          {busy ? "creating…" : "register"}
        </button>
      </form>
      <p className="muted">
        already have one? <Link to="/login">login</Link>
      </p>
    </Terminal>
  );
}
