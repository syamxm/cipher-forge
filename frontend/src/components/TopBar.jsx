import { Link } from "react-router-dom";
import { useAuth } from "../auth";

export default function TopBar() {
  const { logout } = useAuth();

  return (
    <header className="topbar">
      <Link to="/" className="topbar-brand">
        <img src="/linux_tux.jpg" alt="Cipher Forge logo" className="topbar-logo" />
        <span>Cipher Forge</span>
      </Link>
      <button className="exit-run-btn" onClick={logout}>
        logout
      </button>
    </header>
  );
}
