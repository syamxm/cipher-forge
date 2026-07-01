import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../auth";
import Terminal from "../components/Terminal";

export default function Login() {
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
      const { access_token } = await api.login(username, password);
      await login(access_token);
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Terminal title="cipher-forge — login">
      <p className="prompt">authenticate</p>
      <form onSubmit={submit} className="form">
        <label>
          username
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
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
            autoComplete="current-password"
          />
        </label>
        {error && <p className="error">! {error}</p>}
        <button type="submit" disabled={busy}>
          {busy ? "authenticating…" : "login"}
        </button>
      </form>
      <p className="muted">
        no account? <Link to="/register">register</Link>
      </p>
    </Terminal>
  );
}
