import { useState, useEffect, useRef } from "react";
import { CheckCircle, Plus, X, Sparkles, Heart } from "lucide-react";
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

// Suggestions rapides de centres d'intérêt
const INTEREST_SUGGESTIONS = [
  "Mathématiques", "Sciences", "Informatique", "Littérature", "Histoire",
  "Musique", "Sport", "Art", "Cinéma", "Voyage", "Philosophie", "Économie",
  "Biologie", "Droit", "Entrepreneuriat", "Design", "Langues", "Astronomie",
  "Robotique", "Théâtre", "Cuisine", "Photographie", "Environnement",
];

export default function Profile() {
  const { user } = useAuth();

  // ── Profil de base ──────────────────────────────────────────────
  const [profile, setProfile] = useState(null);
  const [form, setForm]       = useState({ level: "", bio: "", languages: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [saved, setSaved]     = useState(false);

  // ── Centres d'intérêt ───────────────────────────────────────────
  const [interests, setInterests]     = useState([]);
  const [newInterest, setNewInterest] = useState("");
  const [addingInt, setAddingInt]     = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef();

  // ── Chargement initial ──────────────────────────────────────────
  useEffect(() => {
    Promise.all([
      profileService.getStudentProfile(),
      profileService.getInterests(),
    ]).then(([p, ints]) => {
      setProfile(p);
      setForm({ level: p.level ?? "", bio: p.bio ?? "", languages: p.languages ?? "" });
      setInterests(ints);
    }).finally(() => setLoading(false));
  }, []);

  // ── Sauvegarde profil ───────────────────────────────────────────
  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    await profileService.updateStudentProfile(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
    setSaving(false);
  };

  // ── Ajouter un intérêt ──────────────────────────────────────────
  const handleAddInterest = async (name) => {
    const trimmed = (name || newInterest).trim();
    if (!trimmed) return;
    if (interests.some((i) => i.name.toLowerCase() === trimmed.toLowerCase())) {
      setNewInterest("");
      return;
    }
    setAddingInt(true);
    try {
      const created = await profileService.addInterest({ name: trimmed });
      setInterests((prev) => [...prev, created]);
      setNewInterest("");
      setShowSuggestions(false);
    } finally {
      setAddingInt(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") { e.preventDefault(); handleAddInterest(); }
    if (e.key === "Escape") setShowSuggestions(false);
  };

  // ── Supprimer un intérêt ────────────────────────────────────────
  const handleDeleteInterest = async (id) => {
    await profileService.deleteInterest(id);
    setInterests((prev) => prev.filter((i) => i.id !== id));
  };

  // ── Suggestions filtrées ────────────────────────────────────────
  const filteredSuggestions = INTEREST_SUGGESTIONS.filter(
    (s) =>
      !interests.some((i) => i.name.toLowerCase() === s.toLowerCase()) &&
      s.toLowerCase().includes(newInterest.toLowerCase())
  );

  if (loading) return <><Topbar title="Mon profil" /><Loader center size={40} /></>;

  return (
    <>
      <Topbar title="Mon profil" />
      <div className="page-container">
        <p className="page-title">Mon profil</p>
        <p className="page-subtitle">Renseignez vos informations scolaires et vos centres d'intérêt.</p>

        <div className="profile-layout">

          {/* ── Carte identité ────────────────────────────────── */}
          <div className="card" style={{ alignSelf: "start" }}>
            <div style={{ textAlign: "center", marginBottom: 16 }}>
              <div style={{
                width: 72, height: 72, borderRadius: "50%",
                background: "linear-gradient(135deg, var(--green), var(--green-dark))",
                color: "white", fontSize: "1.75rem", fontWeight: 700,
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 12px",
                boxShadow: "var(--shadow-green)",
              }}>
                {user?.first_name?.[0]?.toUpperCase() ?? "?"}
              </div>
              <div style={{ fontWeight: 700, fontSize: "1rem" }}>
                {user?.first_name} {user?.last_name}
              </div>
              <div style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>{user?.email}</div>
              <span className="badge badge-green" style={{ marginTop: 8 }}>{user?.role}</span>
            </div>

            <div style={{ borderTop: "1px solid var(--border)", paddingTop: 16, display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { label: "Fiabilité",   value: `${profile?.reliability_score?.toFixed(0) ?? 0}%` },
                { label: "Complétion",  value: `${profile?.completion_score?.toFixed(0) ?? 0}%` },
                { label: "Niveau",      value: profile?.level || "—" },
                { label: "Intérêts",    value: `${interests.length} renseigné${interests.length > 1 ? "s" : ""}` },
              ].map(({ label, value }) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem" }}>
                  <span style={{ color: "var(--text-muted)" }}>{label}</span>
                  <span style={{ fontWeight: 600 }}>{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Colonne droite ────────────────────────────────── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            {/* Informations scolaires */}
            <div className="card">
              <div className="card-title">Informations scolaires</div>
              <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <InputField label="Niveau scolaire" id="level" type="select" name="level"
                  value={form.level} onChange={(e) => setForm(p => ({ ...p, level: e.target.value }))}>
                  {LEVELS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </InputField>
                <InputField label="Langues pratiquées" id="languages" name="languages"
                  value={form.languages} onChange={(e) => setForm(p => ({ ...p, languages: e.target.value }))}
                  placeholder="Français, Anglais, Espagnol..." />
                <InputField label="Bio / Présentation" id="bio" type="textarea" name="bio"
                  value={form.bio} onChange={(e) => setForm(p => ({ ...p, bio: e.target.value }))}
                  placeholder="Parlez de vous, de vos passions, de vos ambitions..." />
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <Button type="submit" variant="primary" loading={saving}>Enregistrer</Button>
                  {saved && (
                    <span style={{ color: "var(--green-dark)", fontSize: "0.875rem", fontWeight: 600, display: "flex", alignItems: "center", gap: 5 }}>
                      <CheckCircle size={15} /> Sauvegardé
                    </span>
                  )}
                </div>
              </form>
            </div>

            {/* ── Centres d'intérêt ───────────────────────────── */}
            <div className="card">
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                <div style={{ width: 32, height: 32, borderRadius: 9, background: "var(--green-light)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Heart size={16} color="var(--green-dark)" />
                </div>
                <div>
                  <div className="card-title" style={{ margin: 0 }}>Centres d'intérêt</div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                    Utilisés par l'IA pour personnaliser votre analyse
                  </div>
                </div>
              </div>

              {/* Tags existants */}
              {interests.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
                  {interests.map((interest) => (
                    <span
                      key={interest.id}
                      style={{
                        display: "inline-flex", alignItems: "center", gap: 6,
                        padding: "5px 12px",
                        background: "var(--green-light)",
                        border: "1px solid var(--green-mid)",
                        borderRadius: 999,
                        fontSize: "0.82rem", fontWeight: 600,
                        color: "var(--green-deeper)",
                      }}
                    >
                      {interest.name}
                      <button
                        onClick={() => handleDeleteInterest(interest.id)}
                        style={{
                          display: "flex", alignItems: "center",
                          background: "none", border: "none", cursor: "pointer",
                          color: "var(--green-dark)", padding: 0, lineHeight: 1,
                        }}
                        title="Supprimer"
                      >
                        <X size={13} />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {interests.length === 0 && (
                <div style={{ marginBottom: 16, padding: "12px 16px", background: "var(--surface-2)", borderRadius: 10, fontSize: "0.875rem", color: "var(--text-muted)" }}>
                  Aucun centre d'intérêt renseigné. L'IA s'en sert pour personnaliser votre analyse.
                </div>
              )}

              {/* Champ d'ajout */}
              <div style={{ position: "relative" }}>
                <div style={{ display: "flex", gap: 10 }}>
                  <div style={{ flex: 1, position: "relative" }}>
                    <input
                      ref={inputRef}
                      value={newInterest}
                      onChange={(e) => { setNewInterest(e.target.value); setShowSuggestions(true); }}
                      onFocus={() => setShowSuggestions(true)}
                      onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                      onKeyDown={handleKeyDown}
                      placeholder="Ex : Mathématiques, Musique, Sport…"
                      style={{
                        width: "100%", padding: "10px 14px",
                        border: "1.5px solid var(--border-dark)", borderRadius: 8,
                        fontSize: "0.875rem", outline: "none",
                        fontFamily: "inherit",
                        transition: "border-color 0.2s",
                      }}
                      onFocusCapture={(e) => e.target.style.borderColor = "var(--green)"}
                      onBlurCapture={(e) => e.target.style.borderColor = "var(--border-dark)"}
                    />
                  </div>
                  <Button
                    variant="primary" size="sm"
                    loading={addingInt}
                    onClick={() => handleAddInterest()}
                    disabled={!newInterest.trim()}
                  >
                    <Plus size={15} /> Ajouter
                  </Button>
                </div>

                {/* Dropdown suggestions */}
                {showSuggestions && filteredSuggestions.length > 0 && (
                  <div style={{
                    position: "absolute", top: "calc(100% + 4px)", left: 0,
                    right: 80, zIndex: 50,
                    background: "var(--white)", border: "1px solid var(--border)",
                    borderRadius: 10, boxShadow: "var(--shadow-md)",
                    maxHeight: 200, overflowY: "auto",
                  }}>
                    {filteredSuggestions.slice(0, 8).map((s) => (
                      <button
                        key={s}
                        onMouseDown={() => handleAddInterest(s)}
                        style={{
                          display: "block", width: "100%", textAlign: "left",
                          padding: "9px 14px", fontSize: "0.875rem",
                          background: "none", border: "none", cursor: "pointer",
                          borderBottom: "1px solid var(--border)",
                          color: "var(--text-primary)",
                          transition: "background 0.15s",
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = "var(--green-light)"}
                        onMouseLeave={(e) => e.currentTarget.style.background = "none"}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Suggestions rapides */}
              <div style={{ marginTop: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8, fontSize: "0.75rem", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  <Sparkles size={12} /> Suggestions
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {INTEREST_SUGGESTIONS
                    .filter((s) => !interests.some((i) => i.name.toLowerCase() === s.toLowerCase()))
                    .slice(0, 10)
                    .map((s) => (
                      <button
                        key={s}
                        onClick={() => handleAddInterest(s)}
                        style={{
                          padding: "4px 12px",
                          background: "var(--surface-2)",
                          border: "1px solid var(--border)",
                          borderRadius: 999, fontSize: "0.78rem",
                          color: "var(--text-secondary)", cursor: "pointer",
                          transition: "all 0.15s", fontFamily: "inherit",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "var(--green-light)";
                          e.currentTarget.style.borderColor = "var(--green-mid)";
                          e.currentTarget.style.color = "var(--green-deeper)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "var(--surface-2)";
                          e.currentTarget.style.borderColor = "var(--border)";
                          e.currentTarget.style.color = "var(--text-secondary)";
                        }}
                      >
                        + {s}
                      </button>
                    ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
