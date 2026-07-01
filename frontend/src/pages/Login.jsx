import { useCallback, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../auth";
import Terminal from "../components/Terminal";
import GoogleButton from "../components/GoogleButton";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const { access_token } = await api.login(email, password);
      await login(access_token);
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  const handleGoogle = useCallback(
    async (credential) => {
      setError("");
      try {
        const { access_token } = await api.google(credential);
        await login(access_token);
        navigate("/");
      } catch (err) {
        setError(err.message);
      }
    },
    [login, navigate]
  );

  return (
    <Terminal title="cipher-forge — login">
      <p className="prompt">authenticate</p>
      <form onSubmit={submit} className="form">
        <label>
          email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
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
      <div className="divider">or</div>
      <GoogleButton onCredential={handleGoogle} />
      <p className="muted">
        no account? <Link to="/register">register</Link>
      </p>
    </Terminal>
  );
}
