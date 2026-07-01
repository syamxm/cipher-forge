import { useAuth } from "../auth";
import Terminal from "../components/Terminal";

export default function Game() {
  const { user, logout } = useAuth();
  return (
    <Terminal title={`cipher-forge — ${user.username}`}>
      <p className="prompt">welcome, {user.username}</p>
      <p className="muted">auth gate cleared. the RSA forge is being built.</p>
      <ul className="stages">
        <li>[ ] stage 1 — prime selection</li>
        <li>[ ] stage 2 — key generation</li>
        <li>[ ] stage 3 — encryption</li>
        <li>[ ] stage 4 — decryption</li>
      </ul>
      <button onClick={logout}>logout</button>
    </Terminal>
  );
}
