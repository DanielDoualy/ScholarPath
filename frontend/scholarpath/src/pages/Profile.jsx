import { useState, useEffect } from "react";
import Topbar from "../components/Topbar";
import Button from "../components/Button";
import InputField from "../components/InputField";
import Loader from "../components/Loader";
import { profileService } from "../services/profileService";
import { useAuth } from "../context/AuthContext";

const LEVELS = [
  ["", "Sélectionner..."],
  ["6e", "6ème"], ["5e", "5ème"], ["4e", "4ème"], ["3e", "3ème"],
  ["2nde", "Seconde"], ["1ere", "Première"], ["Term", "Terminale"],
  ["Bac+1", "Bac+1"], ["Bac+2", "Bac+2"], ["Bac+3", "Bac+3"],
  ["Bac+4", "Bac+4"], ["Bac+5", "Bac+5+"],
];

export default function Profile() {
  const { user, refetch } = useAuth();
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ level: "", bio: "", languages: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    profileService
      .getStudentProfile()
      .then((p) => {
        setProfile(p);
        setForm({ level: p.level ?? "", bio: p.bio ?? "", languages: p.languages ?? "" });
      })
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    await profileService.updateStudentProfile(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    setSaving(false);
  };

  if (loading) return <><Topbar title="Mon profil" /><Loader center size={40} /></>;

  return (
    <>
      <Topbar title="Mon profil" />
      <div className="page-container">
        <p className="page-title">Mon profil</p>
        <p className="page-subtitle">Renseignez vos informations personnelles et scolaires.</p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 24 }}>
          {/* Identity card */}
          <div className="card" style={{ alignSelf: "start" }}>
            <div style={{ textAlign: "center", marginBottom: 16 }}>
              <div style={{
                width: 72, height: 72, borderRadius: "50%",
                background: "var(--green)", color: "white",
                fontSize: "1.75rem", fontWeight: 700,
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 12px",
              }}>
                {user?.first_name?.[0] ?? "?"}
              </div>
              <div style={{ fontWeight: 700, fontSize: "1rem" }}>
                {user?.first_name} {user?.last_name}
              </div>
              <div style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>{user?.email}</div>
              <span className="badge badge-green" style={{ marginTop: 8 }}>{user?.role}</span>
            </div>

            <div style={{ borderTop: "1px solid var(--border)", paddingTop: 16, display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { label: "Fiabilité", value: `${profile?.reliability_score?.toFixed(0) ?? 0}%` },
                { label: "Complétion", value: `${profile?.completion_score?.toFixed(0) ?? 0}%` },
                { label: "Niveau", value: profile?.level || "—" },
              ].map(({ label, value }) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem" }}>
                  <span style={{ color: "var(--text-muted)" }}>{label}</span>
                  <span style={{ fontWeight: 600 }}>{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Edit form */}
          <div className="card">
            <div className="card-title">Informations scolaires</div>
            <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <InputField
                label="Niveau scolaire"
                id="level"
                type="select"
                name="level"
                value={form.level}
                onChange={handleChange}
              >
                {LEVELS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </InputField>
              <InputField
                label="Langues pratiquées"
                id="languages"
                name="languages"
                value={form.languages}
                onChange={handleChange}
                placeholder="Français, Anglais, Espagnol..."
              />
              <InputField
                label="Bio / Présentation"
                id="bio"
                type="textarea"
                name="bio"
                value={form.bio}
                onChange={handleChange}
                placeholder="Parlez de vous, de vos passions, de vos ambitions..."
              />
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <Button type="submit" variant="primary" loading={saving}>
                  Enregistrer
                </Button>
                {saved && <span style={{ color: "var(--green-dark)", fontSize: "0.875rem", fontWeight: 600 }}>✓ Sauvegardé</span>}
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
