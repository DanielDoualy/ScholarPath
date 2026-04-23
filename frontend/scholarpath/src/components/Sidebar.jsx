import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  User,
  BarChart2,
  FileText,
  Brain,
  Target,
  Bell,
  Settings,
  LogOut,
  GraduationCap,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import "./Sidebar.css";

const NAV_ITEMS = [
  { to: "/dashboard",       icon: LayoutDashboard, label: "Tableau de bord" },
  { to: "/profile",         icon: User,            label: "Mon profil"       },
  { to: "/academic",        icon: BarChart2,        label: "Résultats"        },
  { to: "/documents",       icon: FileText,         label: "Documents"        },
  { to: "/analysis",        icon: Brain,            label: "Analyse IA"       },
  { to: "/recommendations", icon: Target,           label: "Orientations"     },
  { to: "/notifications",   icon: Bell,             label: "Notifications"    },
  { to: "/settings",        icon: Settings,         label: "Paramètres"       },
];

export default function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <>
    {mobileOpen && <div className="sidebar-overlay" onClick={onMobileClose} aria-hidden="true" />}
    <aside className={`sidebar ${collapsed ? "collapsed" : ""} ${mobileOpen ? "mobile-open" : ""}`}>
      {/* Header row: logo + toggle */}
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <GraduationCap size={18} color="white" />
          </div>
          {!collapsed && <span className="sidebar-logo-text">ScholarPath</span>}
        </div>

        {/* Mobile close */}
        <button className="sidebar-close-btn mobile-only" onClick={onMobileClose} aria-label="Fermer">
          <X size={18} />
        </button>

        {/* Desktop collapse toggle */}
        <button className="sidebar-toggle-btn desktop-only" onClick={onToggle} aria-label="Réduire/agrandir">
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Nav */}
      <nav className="sidebar-nav">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onMobileClose}
            className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
            title={collapsed ? label : undefined}
          >
            <Icon size={18} className="sidebar-link-icon" />
            {!collapsed && <span className="sidebar-link-label">{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User footer */}
      <div className="sidebar-footer">
        <div className="sidebar-avatar">
          {user?.first_name?.[0]?.toUpperCase() ?? user?.email?.[0]?.toUpperCase() ?? "?"}
        </div>
        {!collapsed && (
          <div className="sidebar-user-info">
            <span className="sidebar-user-name">
              {user?.first_name
                ? `${user.first_name} ${user.last_name ?? ""}`
                : user?.email}
            </span>
            <span className="sidebar-user-role">{user?.role}</span>
          </div>
        )}
        <button
          className="sidebar-logout"
          onClick={handleLogout}
          title="Déconnexion"
        >
          <LogOut size={16} />
        </button>
      </div>
    </aside>
    </>
  );
}
