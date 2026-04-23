import { useState, useEffect, useRef } from "react";
import {
  CheckCircle, Plus, X, Sparkles, Heart, Target, Briefcase, ChevronDown, ChevronUp,
} from "lucide-react";
import Topbar from "../components/Topbar";
import Button from "../components/Button";
import InputField from "../components/InputField";
import Loader from "../components/Loader";
import { profileService } from "../services/profileService";
import { useAuth } from "../context/AuthContext";

/* ── Constantes ───────────────────────────────────────────────── */
const LEVELS = [
  ["", "Sélectionner..."],
  ["6e", "6ème"], ["5e", "5ème"], ["4e", "4ème"], ["3e", "3ème"],
  ["2nde", "Seconde"], ["1ere", "Première"], ["Term", "Terminale"],
  ["Bac+1", "Bac+1"], ["Bac+2", "Bac+2"], ["Bac+3", "Bac+3"],
  ["Bac+4", "Bac+4"], ["Bac+5", "Bac+5+"],
];

const INTEREST_SUGGESTIONS = [
  "Mathématiques", "Sciences", "Informatique", "Littérature", "Histoire",
  "Musique", "Sport", "Art", "Cinéma", "Voyage", "Philosophie", "Économie",
  "Biologie", "Droit", "Entrepreneuriat", "Design", "Langues", "Astronomie",
  "Robotique", "Théâtre", "Cuisine", "Photographie", "Environnement",
];

const ACTIVITY_TYPES = [
  { value: "ASSOCIATIF",   label: "Associatif",        color: "#166534", bg: "#dcfce7", border: "#86efac" },
  { value: "COMPETITION",  label: "Compétition",        color: "#7e22ce", bg: "#f3e8ff", border: "#d8b4fe" },
  { value: "STAGE",        label: "Stage",              color: "#92400e", bg: "#fef3c7", border: "#fcd34d" },
  { value: "PROJET",       label: "Projet personnel",   color: "#1d4ed8", bg: "#eff6ff", border: "#bfdbfe" },
  { value: "BENEVOLE",     label: "Bénévolat",          color: "#0e7490", bg: "#ecfeff", border: "#a5f3fc" },
  { value: "CERTIFICATION",label: "Certification",      color: "#be185d", bg: "#fdf2f8", border: "#f9a8d4" },
  { value: "AUTRE",        label: "Autre",              color: "#475569", bg: "#f1f5f9", border: "#cbd5e1" },
];

const ACTIVITY_TYPE_MAP = Object.fromEntries(ACTIVITY_TYPES.map((t) => [t.value, t]));

const EMPTY_ACTIVITY = { title: "", activity_type: "ASSOCIATIF", description: "", start_date: "", end_date: "" };

/* ── Composant principal ──────────────────────────────────────── */
export default function Profile() {
  const { user } = useAuth();

  // ── Profil de base ──────────────────────────────────────────────
  const [profile, setProfile] = useState(null);
  const [form, setForm]       = useState({ level: "", bio: "", languages: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [saved, setSaved]     = useState(false);

  // ── Centres d'intérêt ───────────────────────────────────────────
  const [interests, setInterests]             = useState([]);
  const [newInterest, setNewInterest]         = useState("");
  const [addingInt, setAddingInt]             = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef();

  // ── Objectifs ───────────────────────────────────────────────────
  const [goals, setGoals]             = useState([]);
  const [newGoalDesc, setNewGoalDesc] = useState("");
  const [newGoalYear, setNewGoalYear] = useState("");
  const [addingGoal, setAddingGoal]   = useState(false);

  // ── Activités extrascolaires ────────────────────────────────────
  const [activities, setActivities]       = useState([]);
  const [showActForm, setShowActForm]     = useState(false);
  const [actForm, setActForm]             = useState(EMPTY_ACTIVITY);
  const [addingAct, setAddingAct]         = useState(false);
  const [expandedAct, setExpandedAct]     = useState(null); // id de l'activité dépliée

  /* ── Chargement initial ──────────────────────────────────────── */
  useEffect(() => {
    Promise.all([
      profileService.getStudentProfile(),
      profileService.getInterests(),
      profileService.getGoals(),
      profileService.getActivities(),
    ]).then(([p, ints, gls, acts]) => {
      setProfile(p);
      setForm({ level: p.level ?? "", bio: p.bio ?? "", languages: p.languages ?? "" });
      setInterests(ints);
      setGoals(gls);
      setActivities(acts);
    }).finally(() => setLoading(false));
  }, []);

  /* ── Profil de base ──────────────────────────────────────────── */
  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    await profileService.updateStudentProfile(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
    setSaving(false);
  };

  /* ── Intérêts ────────────────────────────────────────────────── */
  const handleAddInterest = async (name) => {
    const trimmed = (name || newInterest).trim();
    if (!trimmed) return;
    if (interests.some((i) => i.name.toLowerCase() === trimmed.toLowerCase())) {
      setNewInterest(""); return;
    }
    setAddingInt(true);
    try {
      const created = await profileService.addInterest({ name: trimmed });
      setInterests((prev) => [...prev, created]);
      setNewInterest("");
      setShowSuggestions(false);
    } finally { setAddingInt(false); }
  };

  const handleKeyDownInterest = (e) => {
    if (e.key === "Enter") { e.preventDefault(); handleAddInterest(); }
    if (e.key === "Escape") setShowSuggestions(false);
  };

  const handleDeleteInterest = async (id) => {
    await profileService.deleteInterest(id);
    setInterests((prev) => prev.filter((i) => i.id !== id));
  };

  const filteredSuggestions = INTEREST_SUGGESTIONS.filter(
    (s) =>
      !interests.some((i) => i.name.toLowerCase() === s.toLowerCase()) &&
      s.toLowerCase().includes(newInterest.toLowerCase())
  );

  /* ── Objectifs ───────────────────────────────────────────────── */
  const handleAddGoal = async () => {
    const desc = newGoalDesc.trim();
    if (!desc) return;
    setAddingGoal(true);
    try {
      const payload = { description: desc };
      if (newGoalYear) payload.target_year = parseInt(newGoalYear, 10);
      const created = await profileService.addGoal(payload);
      setGoals((prev) => [...prev, created]);
      setNewGoalDesc("");
      setNewGoalYear("");
    } finally { setAddingGoal(false); }
  };

  const handleDeleteGoal = async (id) => {
    await profileService.deleteGoal(id);
    setGoals((prev) => prev.filter((g) => g.id !== id));
  };

  /* ── Activités ───────────────────────────────────────────────── */
  const handleActChange = (e) =>
    setActForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleAddActivity = async (e) => {
    e.preventDefault();
    if (!actForm.title.trim()) return;
    setAddingAct(true);
    try {
      const payload = { ...actForm };
      if (!payload.start_date) delete payload.start_date;
      if (!payload.end_date)   delete payload.end_date;
      if (!payload.description.trim()) delete payload.description;
      const created = await profileService.addActivity(payload);
      setActivities((prev) => [...prev, created]);
      setActForm(EMPTY_ACTIVITY);
      setShowActForm(false);
    } finally { setAddingAct(false); }
  };

  const handleDeleteActivity = async (id) => {
    await profileService.deleteActivity(id);
    setActivities((prev) => prev.filter((a) => a.id !== id));
    if (expandedAct === id) setExpandedAct(null);
  };

  /* ── Render ──────────────────────────────────────────────────── */
  if (loading) return <><Topbar title="Mon profil" /><Loader center size={40} /></>;

  return (
    <>
      <Topbar title="Mon profil" />
      <div className="page-container">
        <p className="page-title">Mon profil</p>
        <p className="page-subtitle">Renseignez vos informations pour que l'IA puisse vous conseiller au mieux.</p>

        <div className="profile-layout">

          {/* ── Carte identité (sidebar) ──────────────────────── */}
          <div className="card profile-identity-card" style={{ alignSelf: "start" }}>
            <div style={{ textAlign: "center", marginBottom: 16 }}>
              <div style={{
                width: 72, height: 72, borderRadius: "50%",
                background: "linear-gradient(135deg, var(--green), var(--green-dark))",
                color: "white", fontSize: "1.75rem", fontWeight: 700,
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 12px", boxShadow: "var(--shadow-green)",
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
                { label: "Fiabilité",     value: `${profile?.reliability_score?.toFixed(0) ?? 0}%` },
                { label: "Complétion",    value: `${profile?.completion_score?.toFixed(0) ?? 0}%` },
                { label: "Niveau",        value: profile?.level || "—" },
                { label: "Intérêts",      value: `${interests.length} renseigné${interests.length > 1 ? "s" : ""}` },
                { label: "Objectifs",     value: `${goals.length} déclaré${goals.length > 1 ? "s" : ""}` },
                { label: "Expériences",   value: `${activities.length} ajoutée${activities.length > 1 ? "s" : ""}` },
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

            {/* ── Informations scolaires ───────────────────────── */}
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
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Utilisés par l'IA pour personnaliser votre analyse</div>
                </div>
              </div>

              {interests.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
                  {interests.map((interest) => (
                    <span key={interest.id} style={{
                      display: "inline-flex", alignItems: "center", gap: 6,
                      padding: "5px 12px", background: "var(--green-light)",
                      border: "1px solid var(--green-mid)", borderRadius: 999,
                      fontSize: "0.82rem", fontWeight: 600, color: "var(--green-deeper)",
                    }}>
                      {interest.name}
                      <button onClick={() => handleDeleteInterest(interest.id)}
                        style={{ display: "flex", alignItems: "center", background: "none", border: "none", cursor: "pointer", color: "var(--green-dark)", padding: 0 }}
                        title="Supprimer"><X size={13} /></button>
                    </span>
                  ))}
                </div>
              )}

              {interests.length === 0 && (
                <div style={{ marginBottom: 16, padding: "12px 16px", background: "var(--surface-2)", borderRadius: 10, fontSize: "0.875rem", color: "var(--text-muted)" }}>
                  Aucun centre d'intérêt renseigné.
                </div>
              )}

              <div style={{ position: "relative" }}>
                <div style={{ display: "flex", gap: 10 }}>
                  <div style={{ flex: 1 }}>
                    <input ref={inputRef} value={newInterest}
                      onChange={(e) => { setNewInterest(e.target.value); setShowSuggestions(true); }}
                      onFocus={() => setShowSuggestions(true)}
                      onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                      onKeyDown={handleKeyDownInterest}
                      placeholder="Ex : Mathématiques, Musique, Sport…"
                      style={{ width: "100%", padding: "10px 14px", border: "1.5px solid var(--border-dark)", borderRadius: 8, fontSize: "0.875rem", outline: "none", fontFamily: "inherit", transition: "border-color 0.2s" }}
                      onFocusCapture={(e) => e.target.style.borderColor = "var(--green)"}
                      onBlurCapture={(e) => e.target.style.borderColor = "var(--border-dark)"} />
                  </div>
                  <Button variant="primary" size="sm" loading={addingInt} onClick={() => handleAddInterest()} disabled={!newInterest.trim()}>
                    <Plus size={15} /> Ajouter
                  </Button>
                </div>

                {showSuggestions && filteredSuggestions.length > 0 && (
                  <div style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, right: 80, zIndex: 50, background: "var(--white)", border: "1px solid var(--border)", borderRadius: 10, boxShadow: "var(--shadow-md)", maxHeight: 200, overflowY: "auto" }}>
                    {filteredSuggestions.slice(0, 8).map((s) => (
                      <button key={s} onMouseDown={() => handleAddInterest(s)}
                        style={{ display: "block", width: "100%", textAlign: "left", padding: "9px 14px", fontSize: "0.875rem", background: "none", border: "none", cursor: "pointer", borderBottom: "1px solid var(--border)", color: "var(--text-primary)", transition: "background 0.15s" }}
                        onMouseEnter={(e) => e.currentTarget.style.background = "var(--green-light)"}
                        onMouseLeave={(e) => e.currentTarget.style.background = "none"}>
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ marginTop: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8, fontSize: "0.75rem", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  <Sparkles size={12} /> Suggestions
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {INTEREST_SUGGESTIONS
                    .filter((s) => !interests.some((i) => i.name.toLowerCase() === s.toLowerCase()))
                    .slice(0, 10)
                    .map((s) => (
                      <button key={s} onClick={() => handleAddInterest(s)}
                        style={{ padding: "4px 12px", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 999, fontSize: "0.78rem", color: "var(--text-secondary)", cursor: "pointer", transition: "all 0.15s", fontFamily: "inherit" }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = "var(--green-light)"; e.currentTarget.style.borderColor = "var(--green-mid)"; e.currentTarget.style.color = "var(--green-deeper)"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = "var(--surface-2)"; e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-secondary)"; }}>
                        + {s}
                      </button>
                    ))}
                </div>
              </div>
            </div>

            {/* ── Objectifs ───────────────────────────────────── */}
            <div className="card">
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                <div style={{ width: 32, height: 32, borderRadius: 9, background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Target size={16} color="#1d4ed8" />
                </div>
                <div>
                  <div className="card-title" style={{ margin: 0 }}>Mes objectifs</div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>L'IA oriente ses recommandations selon vos ambitions</div>
                </div>
              </div>

              {goals.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
                  {goals.map((goal) => (
                    <div key={goal.id} style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, padding: "10px 14px", background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 10 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, color: "#1e3a8a", fontSize: "0.875rem" }}>{goal.description}</div>
                        {goal.target_year && <div style={{ fontSize: "0.75rem", color: "#3b82f6", marginTop: 2 }}>Horizon : {goal.target_year}</div>}
                      </div>
                      <button onClick={() => handleDeleteGoal(goal.id)}
                        style={{ display: "flex", alignItems: "center", flexShrink: 0, background: "none", border: "none", cursor: "pointer", color: "#93c5fd", padding: 2, transition: "color 0.15s" }}
                        onMouseEnter={(e) => e.currentTarget.style.color = "#1d4ed8"}
                        onMouseLeave={(e) => e.currentTarget.style.color = "#93c5fd"}
                        title="Supprimer"><X size={14} /></button>
                    </div>
                  ))}
                </div>
              )}

              {goals.length === 0 && (
                <div style={{ marginBottom: 16, padding: "12px 16px", background: "var(--surface-2)", borderRadius: 10, fontSize: "0.875rem", color: "var(--text-muted)" }}>
                  Aucun objectif déclaré.
                </div>
              )}

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <textarea value={newGoalDesc} onChange={(e) => setNewGoalDesc(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleAddGoal(); } }}
                  placeholder="Ex : Intégrer une école d'ingénieurs, devenir médecin…"
                  rows={2}
                  style={{ width: "100%", padding: "10px 14px", border: "1.5px solid var(--border-dark)", borderRadius: 8, fontSize: "0.875rem", outline: "none", resize: "vertical", fontFamily: "inherit", lineHeight: 1.5, transition: "border-color 0.2s" }}
                  onFocus={(e) => e.target.style.borderColor = "#3b82f6"}
                  onBlur={(e) => e.target.style.borderColor = "var(--border-dark)"} />
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <input type="number" min="2024" max="2040" value={newGoalYear}
                    onChange={(e) => setNewGoalYear(e.target.value)}
                    placeholder="Année cible (ex: 2027)"
                    style={{ width: 180, padding: "9px 12px", border: "1.5px solid var(--border-dark)", borderRadius: 8, fontSize: "0.875rem", outline: "none", fontFamily: "inherit", transition: "border-color 0.2s" }}
                    onFocus={(e) => e.target.style.borderColor = "#3b82f6"}
                    onBlur={(e) => e.target.style.borderColor = "var(--border-dark)"} />
                  <Button variant="primary" size="sm" loading={addingGoal} onClick={handleAddGoal} disabled={!newGoalDesc.trim()}>
                    <Plus size={15} /> Ajouter
                  </Button>
                </div>
              </div>

              <div style={{ marginTop: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8, fontSize: "0.75rem", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  <Sparkles size={12} /> Exemples
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {["Intégrer une grande école", "Devenir médecin", "Travailler dans l'informatique",
                    "Créer une entreprise", "Études à l'étranger", "Licence en droit",
                    "Devenir enseignant", "Master en finance"]
                    .filter((s) => !goals.some((g) => g.description.toLowerCase() === s.toLowerCase()))
                    .map((s) => (
                      <button key={s} onClick={() => setNewGoalDesc(s)}
                        style={{ padding: "4px 12px", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 999, fontSize: "0.78rem", color: "var(--text-secondary)", cursor: "pointer", transition: "all 0.15s", fontFamily: "inherit" }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = "#eff6ff"; e.currentTarget.style.borderColor = "#bfdbfe"; e.currentTarget.style.color = "#1d4ed8"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = "var(--surface-2)"; e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-secondary)"; }}>
                        + {s}
                      </button>
                    ))}
                </div>
              </div>
            </div>

            {/* ── Activités extrascolaires ─────────────────────── */}
            <div className="card">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 9, background: "#fef3c7", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Briefcase size={16} color="#92400e" />
                  </div>
                  <div>
                    <div className="card-title" style={{ margin: 0 }}>Expériences extrascolaires</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Stages, associations, projets, certifications…</div>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => setShowActForm((p) => !p)}>
                  {showActForm ? <><X size={14} /> Annuler</> : <><Plus size={14} /> Ajouter</>}
                </Button>
              </div>

              {/* Formulaire d'ajout */}
              {showActForm && (
                <form onSubmit={handleAddActivity}
                  style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 12, padding: 16, marginBottom: 16, display: "flex", flexDirection: "column", gap: 12 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
                    <InputField label="Intitulé *" id="act-title" name="title"
                      value={actForm.title} onChange={handleActChange}
                      placeholder="Ex : Délégué de classe, stage en entreprise…" required />
                    <InputField label="Type" id="act-type" type="select" name="activity_type"
                      value={actForm.activity_type} onChange={handleActChange}>
                      {ACTIVITY_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </InputField>
                    <InputField label="Date de début" id="act-start" type="date" name="start_date"
                      value={actForm.start_date} onChange={handleActChange} />
                    <InputField label="Date de fin" id="act-end" type="date" name="end_date"
                      value={actForm.end_date} onChange={handleActChange} />
                  </div>
                  <InputField label="Description" id="act-desc" type="textarea" name="description"
                    value={actForm.description} onChange={handleActChange}
                    placeholder="Décrivez votre rôle, vos responsabilités, ce que vous avez appris…" />
                  <div>
                    <Button type="submit" variant="primary" size="sm" loading={addingAct} disabled={!actForm.title.trim()}>
                      <Plus size={14} /> Enregistrer l'expérience
                    </Button>
                  </div>
                </form>
              )}

              {/* Liste des activités */}
              {activities.length === 0 && !showActForm && (
                <div style={{ padding: "20px 16px", background: "var(--surface-2)", borderRadius: 10, textAlign: "center", color: "var(--text-muted)", fontSize: "0.875rem" }}>
                  Aucune expérience ajoutée. Stages, associations, projets perso, certifications — tout compte !
                </div>
              )}

              {activities.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {activities.map((act) => {
                    const typeInfo = ACTIVITY_TYPE_MAP[act.activity_type] ?? ACTIVITY_TYPE_MAP.AUTRE;
                    const isExpanded = expandedAct === act.id;
                    const hasDates = act.start_date || act.end_date;

                    return (
                      <div key={act.id} style={{ border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden" }}>
                        {/* En-tête cliquable */}
                        <div
                          onClick={() => setExpandedAct(isExpanded ? null : act.id)}
                          style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", cursor: "pointer", background: isExpanded ? "var(--surface-2)" : "var(--white)", transition: "background 0.15s" }}
                          onMouseEnter={(e) => { if (!isExpanded) e.currentTarget.style.background = "var(--surface-2)"; }}
                          onMouseLeave={(e) => { if (!isExpanded) e.currentTarget.style.background = "var(--white)"; }}
                        >
                          <span style={{ padding: "3px 10px", borderRadius: 999, fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", background: typeInfo.bg, color: typeInfo.color, border: `1px solid ${typeInfo.border}`, flexShrink: 0 }}>
                            {typeInfo.label}
                          </span>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 600, fontSize: "0.875rem", color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                              {act.title}
                            </div>
                            {hasDates && (
                              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: 1 }}>
                                {act.start_date && new Date(act.start_date).toLocaleDateString("fr-FR", { month: "short", year: "numeric" })}
                                {act.start_date && act.end_date && " → "}
                                {act.end_date && new Date(act.end_date).toLocaleDateString("fr-FR", { month: "short", year: "numeric" })}
                              </div>
                            )}
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                            {isExpanded ? <ChevronUp size={15} color="var(--text-muted)" /> : <ChevronDown size={15} color="var(--text-muted)" />}
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDeleteActivity(act.id); }}
                              style={{ display: "flex", alignItems: "center", background: "none", border: "none", cursor: "pointer", color: "#fca5a5", padding: 2, transition: "color 0.15s" }}
                              onMouseEnter={(e) => e.currentTarget.style.color = "#ef4444"}
                              onMouseLeave={(e) => e.currentTarget.style.color = "#fca5a5"}
                              title="Supprimer"><X size={14} /></button>
                          </div>
                        </div>

                        {/* Description dépliée */}
                        {isExpanded && act.description && (
                          <div style={{ padding: "10px 14px 14px", borderTop: "1px solid var(--border)", background: "var(--white)", fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>
                            {act.description}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
