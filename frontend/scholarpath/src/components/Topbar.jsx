import { useAuth } from "../context/AuthContext";
import "./Topbar.css";

export default function Topbar({ title }) {
  const { user } = useAuth();
  return (
    <header className="topbar">
      <div className="topbar-title">{title}</div>
      <div className="topbar-right">
        <span className="topbar-greeting">
          Bonjour, {user?.first_name ?? "—"} 👋
        </span>
      </div>
    </header>
  );
}
