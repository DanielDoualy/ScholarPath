import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Sidebar.css";

const NAV_ITEMS = [
  { to: "/dashboard", icon: "⊞", label: "Tableau de bord" },
  { to: "/profile", icon: "◉", label: "Mon profil" },
  { to: "/academic", icon: "📊", label: "Résultats scolaires" },
  { to: "/documents", icon: "📄", label: "Documents" },
  { to: "/analysis", icon: "🧠", label: "Analyse IA" },
  { to: "/recommendations", icon: "🎯", label: "Orientations" },
  { to: "/notifications", icon: "🔔", label: "Notifications" },
  { to: "/settings", icon: "⚙", label: "Paramètres" },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">SP</div>
        <span className="sidebar-logo-text">ScholarPath</span>
      </div>

      {/* Nav */}
      <nav className="sidebar-nav">
        {NAV_ITEMS.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""}`
            }
          >
            <span className="sidebar-link-icon">{icon}</span>
            <span className="sidebar-link-label">{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User footer */}
      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-avatar">
            {user?.first_name?.[0] ?? user?.email?.[0] ?? "?"}
          </div>
          <div className="sidebar-user-info">
            <span className="sidebar-user-name truncate">
              {user?.first_name
                ? `${user.first_name} ${user.last_name ?? ""}`
                : user?.email}
            </span>
            <span className="sidebar-user-role">{user?.role}</span>
          </div>
        </div>
        <button className="sidebar-logout" onClick={handleLogout} title="Déconnexion">
          ⎋
        </button>
      </div>
    </aside>
  );
}
