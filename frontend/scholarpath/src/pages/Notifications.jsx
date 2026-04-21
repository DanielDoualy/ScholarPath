import { useState, useEffect } from "react";
import Topbar from "../components/Topbar";
import Loader from "../components/Loader";
import { formatDate } from "../utils/formatDate";
import api from "../services/api";

const TYPE_ICON = { ALERT: "⚠️", OPPORTUNITY: "💡", VERIFICATION: "✅", INFO: "ℹ️" };

export default function Notifications() {
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/notifications/")
      .then((r) => setNotifs(r.data.results ?? r.data))
      .finally(() => setLoading(false));
  }, []);

  const markRead = async (id) => {
    await api.patch(`/notifications/${id}/read/`);
    setNotifs((p) => p.map((n) => n.id === id ? { ...n, is_read: true } : n));
  };

  if (loading) return <><Topbar title="Notifications" /><Loader center size={40} /></>;

  return (
    <>
      <Topbar title="Notifications" />
      <div className="page-container">
        <p className="page-title">Notifications</p>
        <p className="page-subtitle">{notifs.filter((n) => !n.is_read).length} non lues</p>

        {notifs.length === 0 ? (
          <div className="card">
            <div className="empty-state">
              <span style={{ fontSize: "2rem" }}>🔔</span>
              <p>Aucune notification pour l'instant.</p>
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {notifs.map((n) => (
              <div
                key={n.id}
                className="card"
                style={{
                  display: "flex", gap: 14, alignItems: "flex-start",
                  opacity: n.is_read ? 0.65 : 1,
                  borderLeft: n.is_read ? "3px solid var(--border)" : "3px solid var(--green)",
                }}
              >
                <span style={{ fontSize: "1.25rem", marginTop: 2 }}>{TYPE_ICON[n.notif_type] ?? "📬"}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, marginBottom: 2 }}>{n.title}</div>
                  <div style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>{n.body}</div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: 4 }}>{formatDate(n.created_at)}</div>
                </div>
                {!n.is_read && (
                  <button
                    onClick={() => markRead(n.id)}
                    style={{ fontSize: "0.8rem", color: "var(--green-dark)", fontWeight: 600, cursor: "pointer", background: "none", border: "none", whiteSpace: "nowrap" }}
                  >
                    Marquer lu
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
