import { Link } from "react-router-dom";
import { useAuth } from "../auth";

export default function TopBar() {
  const { user, logout } = useAuth();

  return (
    <header className="topbar">
      <Link to="/" className="topbar-brand">
        <img src="/linux_tux.jpg" alt="Cipher Forge logo" className="topbar-logo" />
        <span>Cipher Forge</span>
      </Link>
      <div className="topbar-actions">
        {user && (
          <span className="topbar-user" title={user.username}>
            {user.username}
          </span>
        )}
        <Link to="/leaderboard" className="topbar-link">
          leaderboard
        </Link>
        <button className="exit-run-btn" onClick={logout}>
          logout
        </button>
      </div>
    </header>
  );
}
