import { Menu } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import "./Topbar.css";

export default function Topbar({ title, onMobileMenu }) {
  const { user } = useAuth();

  return (
    <header className="topbar">
      <div className="topbar-left">
        {/* Hamburger — mobile only */}
        <button className="topbar-hamburger" onClick={onMobileMenu} aria-label="Menu">
          <Menu size={20} />
        </button>
        <span className="topbar-title">{title}</span>
      </div>

      <div className="topbar-right">
        <span className="topbar-greeting">
          Bonjour, <strong>{user?.first_name ?? "—"}</strong> 👋
        </span>
        <div className="topbar-avatar">
          {user?.first_name?.[0]?.toUpperCase() ?? "?"}
        </div>
      </div>
    </header>
  );
}
