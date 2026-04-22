import { useState, useEffect } from "react";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip,
} from "recharts";
import { BookOpen, Trash2, Plus, X } from "lucide-react";
import Topbar from "../components/Topbar";
import Button from "../components/Button";
import InputField from "../components/InputField";
import Loader from "../components/Loader";
import { academicService } from "../services/academicService";
import "../styles/academic.css";

const TRIMESTERS = ["T1", "T2", "T3", "S1", "S2", "AN"];
const STATUS_LABELS = { DECLARED: "Déclaré", DOCUMENTED: "Documenté", VERIFIED: "Vérifié" };
const STATUS_CLASS  = { DECLARED: "badge-declared", DOCUMENTED: "badge-documented", VERIFIED: "badge-verified" };

// Fallback subjects if API returns empty (before seeding completes)
const FALLBACK_SUBJECTS = [
  { id: "__math__",   name: "Mathématiques" },
  { id: "__pc__",     name: "Physique-Chimie" },
  { id: "__svt__",    name: "Sciences de la vie et de la Terre" },
  { id: "__fr__",     name: "Français" },
  { id: "__philo__",  name: "Philosophie" },
  { id: "__hg__",     name: "Histoire-Géographie" },
  { id: "__en__",     name: "Anglais (LV1)" },
  { id: "__es__",     name: "Espagnol (LV2)" },
  { id: "__eps__",    name: "Éducation physique et sportive" },
  { id: "__ses__",    name: "Sciences économiques et sociales" },
  { id: "__nsi__",    name: "Informatique (NSI)" },
  { id: "__arts__",   name: "Arts plastiques" },
  { id: "__music__",  name: "Musique" },
  { id: "__techno__", name: "Technologie" },
  { id: "__bio__",    name: "Biologie" },
  { id: "__chimie__", name: "Chimie" },
];

export default function AcademicHistory() {
  const [records, setRecords] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    subject: "", school_year: "2024-2025", trimester: "T1", grade: "", max_grade: "20", appreciation: "",
  });

  const load = () =>
    Promise.all([
      academicService.getRecords(),
      academicService.getSubjects(),
    ]).then(([rec, sub]) => {
      setRecords(rec.results ?? rec);
      const fetched = sub.results ?? sub;
      // Use API subjects if available, otherwise fall back to hardcoded list
      setSubjects(fetched.length > 0 ? fetched : FALLBACK_SUBJECTS);
    }).catch(() => {
      setSubjects(FALLBACK_SUBJECTS);
    }).finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  // Build radar data
  const subjectAvg = {};
  for (const r of records) {
    const norm = (r.grade / r.max_grade) * 20;
    if (!subjectAvg[r.subject_name]) subjectAvg[r.subject_name] = [];
    subjectAvg[r.subject_name].push(norm);
  }
  const radarData = Object.entries(subjectAvg)
    .slice(0, 8)
    .map(([name, vals]) => ({
      subject: name.length > 12 ? name.slice(0, 12) + "…" : name,
      avg: +(vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1),
    }));

  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await academicService.createRecord({
      ...form,
      grade: parseFloat(form.grade),
      max_grade: parseFloat(form.max_grade),
    });
    setForm({ subject: "", school_year: "2024-2025", trimester: "T1", grade: "", max_grade: "20", appreciation: "" });
    setShowForm(false);
    load();
    setSaving(false);
  };

  const handleDelete = async (id) => {
    await academicService.deleteRecord(id);
    setRecords((p) => p.filter((r) => r.id !== id));
  };

  if (loading) return <><Topbar title="Résultats scolaires" /><Loader center size={40} /></>;

  return (
    <>
      <Topbar title="Résultats scolaires" />
      <div className="page-container">
        <div className="flex justify-between items-center" style={{ marginBottom: 8 }}>
          <div>
            <p className="page-title">Résultats scolaires</p>
            <p className="page-subtitle">Saisissez vos notes par matière et trimestre.</p>
          </div>
          <Button variant="primary" size="sm" onClick={() => setShowForm((p) => !p)}>
            {showForm ? <><X size={14} /> Annuler</> : <><Plus size={14} /> Ajouter une note</>}
          </Button>
        </div>

        {/* Add form */}
        {showForm && (
          <div className="card" style={{ marginBottom: 24 }}>
            <div className="card-title">Nouvelle note</div>
            <form onSubmit={handleSubmit} className="academic-form-grid">
              <InputField label="Matière" id="subject" type="select" name="subject" value={form.subject} onChange={handleChange} required>
                <option value="">Sélectionner...</option>
                {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </InputField>
              <InputField label="Année scolaire" id="school_year" name="school_year" value={form.school_year} onChange={handleChange} placeholder="2024-2025" required />
              <InputField label="Période" id="trimester" type="select" name="trimester" value={form.trimester} onChange={handleChange}>
                {TRIMESTERS.map((t) => <option key={t} value={t}>{t}</option>)}
              </InputField>
              <InputField label="Note obtenue" id="grade" type="number" name="grade" value={form.grade} onChange={handleChange} min="0" max="20" step="0.5" required />
              <InputField label="Note max" id="max_grade" type="number" name="max_grade" value={form.max_grade} onChange={handleChange} min="1" max="100" step="0.5" />
              <InputField label="Appréciation" id="appreciation" name="appreciation" value={form.appreciation} onChange={handleChange} placeholder="Optionnel" />
              <div style={{ gridColumn: "1/-1" }}>
                <Button type="submit" variant="primary" loading={saving}>Enregistrer</Button>
              </div>
            </form>
          </div>
        )}

        <div className="academic-layout">
          {/* Records table */}
          <div className="card">
            <div className="card-title">Historique ({records.length} notes)</div>
            {records.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon"><BookOpen size={26} color="var(--text-muted)" /></div>
                <p>Aucune note saisie pour l'instant.</p>
                <span style={{ fontSize: "0.8rem" }}>Cliquez sur « Ajouter une note » pour commencer.</span>
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table className="academic-table">
                  <thead>
                    <tr>
                      {["Matière", "Année", "Période", "Note", "Statut", ""].map((h) => (
                        <th key={h}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((r) => (
                      <tr key={r.id}>
                        <td style={{ fontWeight: 500 }}>{r.subject_name}</td>
                        <td style={{ color: "var(--text-muted)" }}>{r.school_year}</td>
                        <td>{r.trimester}</td>
                        <td>
                          <span style={{ fontWeight: 700, color: r.grade / r.max_grade >= 0.7 ? "var(--green-dark)" : r.grade / r.max_grade < 0.5 ? "#c62828" : "var(--text-primary)" }}>
                            {r.grade}/{r.max_grade}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${STATUS_CLASS[r.verification_status]}`}>
                            {STATUS_LABELS[r.verification_status]}
                          </span>
                        </td>
                        <td>
                          <button
                            onClick={() => handleDelete(r.id)}
                            title="Supprimer"
                            style={{ color: "#ef5350", cursor: "pointer", background: "none", border: "none", display: "flex", alignItems: "center" }}
                          >
                            <Trash2 size={15} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Radar chart */}
          {radarData.length > 0 && (
            <div className="card" style={{ alignSelf: "start" }}>
              <div className="card-title">Radar par matière</div>
              <ResponsiveContainer width="100%" height={260}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="var(--border)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: "var(--text-muted)" }} />
                  <Radar dataKey="avg" stroke="var(--green)" fill="var(--green)" fillOpacity={0.2} strokeWidth={2} />
                  <Tooltip formatter={(v) => [`${v}/20`, "Moyenne"]} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
