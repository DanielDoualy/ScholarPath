import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Topbar from "../components/Topbar";
import Button from "../components/Button";
import InputField from "../components/InputField";
import { useAuth } from "../context/AuthContext";

export default function Settings() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <>
      <Topbar title="Paramètres" />
      <div className="page-container">
        <p className="page-title">Paramètres</p>
        <p className="page-subtitle">Gérez vos préférences et votre compte.</p>

        <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 640 }}>
          {/* Account info */}
          <div className="card">
            <div className="card-title">Informations du compte</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                { label: "E-mail", value: user?.email },
                { label: "Rôle", value: user?.role },
              ].map(({ label, value }) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem", padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
                  <span style={{ color: "var(--text-muted)", fontWeight: 600 }}>{label}</span>
                  <span>{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Session */}
          <div className="card">
            <div className="card-title">Session</div>
            <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", marginBottom: 16 }}>
              Déconnectez-vous de ScholarPath sur cet appareil.
            </p>
            <Button variant="outline" onClick={handleLogout}>Se déconnecter</Button>
          </div>

          {/* Danger zone */}
          <div className="card" style={{ borderColor: "#ffcdd2" }}>
            <div className="card-title" style={{ color: "#c62828" }}>Zone de danger</div>
            <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", marginBottom: 16 }}>
              La suppression de compte est irréversible. Toutes vos données seront effacées.
            </p>
            {!confirmDelete ? (
              <Button variant="danger" size="sm" onClick={() => setConfirmDelete(true)}>
                Supprimer mon compte
              </Button>
            ) : (
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <span style={{ fontSize: "0.875rem" }}>Êtes-vous sûr ?</span>
                <Button variant="danger" size="sm">Confirmer la suppression</Button>
                <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(false)}>Annuler</Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
