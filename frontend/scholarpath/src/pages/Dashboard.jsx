import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  BarChart2, Target, Brain, PenLine,
  FileText, CheckCircle, Circle, ArrowRight,
} from "lucide-react";
import Topbar from "../components/Topbar";
import Loader from "../components/Loader";
import CompletionBar from "../components/CompletionBar";
import { profileService } from "../services/profileService";
import "../styles/dashboard.css";

const QUICK_ACTIONS = [
  { to: "/academic", Icon: BarChart2, label: "Ajouter des notes" },
  { to: "/documents", Icon: FileText,  label: "Déposer un document" },
  { to: "/analysis",  Icon: Brain,     label: "Lancer une analyse IA" },
  { to: "/profile",   Icon: PenLine,   label: "Compléter mon profil" },
];

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    profileService
      .getDashboard()
      .then(setData)
      .catch(() => setError("Impossible de charger le tableau de bord."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <><Topbar title="Tableau de bord" /><Loader center size={40} /></>;
  if (error)   return <><Topbar title="Tableau de bord" /><div className="page-container"><p style={{ color: "var(--red)" }}>{error}</p></div></>;

  const { profile, academic, recommendations, unread_notifications } = data;

  return (
    <>
      <Topbar title="Tableau de bord" />
      <div className="page-container">

        {/* Stats row */}
        <div className="dashboard-stats">
          <div className="stat-card accent">
            <span className="stat-label">Fiabilité du profil</span>
            <span className="stat-value">{profile.reliability_score.toFixed(0)}%</span>
            <span className="stat-sub">Score de confiance</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Complétion</span>
            <span className="stat-value">{profile.completion_score.toFixed(0)}%</span>
            <span className="stat-sub">Profil renseigné</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Notes saisies</span>
            <span className="stat-value">{academic.total_records}</span>
            <span className="stat-sub">{academic.verified_records} vérifiées</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Notifications</span>
            <span className="stat-value">{unread_notifications}</span>
            <span className="stat-sub">non lues</span>
          </div>
        </div>

        {/* Completion bar */}
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="card-title">Complétion du profil</div>
          <CompletionBar value={profile.completion_score} label="Profil global" />
          <div style={{ marginTop: 12, display: "flex", gap: 12, flexWrap: "wrap" }}>
            {[
              { label: "Niveau scolaire", done: !!profile.level },
              { label: "Notes saisies",   done: academic.total_records > 0 },
              { label: "Recommandations", done: recommendations.length > 0 },
            ].map(({ label, done }) => (
              <span key={label} className={`badge ${done ? "badge-verified" : "badge-gray"}`}
                style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                {done
                  ? <CheckCircle size={11} />
                  : <Circle size={11} />}
                {label}
              </span>
            ))}
          </div>
        </div>

        {/* Main grid */}
        <div className="dashboard-grid">
          {/* Subjects */}
          <div className="card">
            <div className="flex justify-between items-center" style={{ marginBottom: 16 }}>
              <div className="card-title" style={{ margin: 0 }}>Matières</div>
              <Link to="/academic" style={{ fontSize: "0.8rem", color: "var(--green-dark)", fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
                Voir tout <ArrowRight size={13} />
              </Link>
            </div>

            {academic.strong_subjects.length === 0 && academic.weak_subjects.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon"><BarChart2 size={26} color="var(--text-muted)" /></div>
                <p>Saisissez vos notes pour voir vos matières fortes et faibles.</p>
                <Link to="/academic" style={{ color: "var(--green-dark)", fontWeight: 600, fontSize: "0.875rem" }}>
                  Ajouter des notes →
                </Link>
              </div>
            ) : (
              <div className="subject-list">
                {[...academic.strong_subjects, ...academic.weak_subjects].slice(0, 6).map((s) => {
                  const isWeak = s.avg < 10;
                  return (
                    <div key={s.subject} className="subject-row">
                      <span className="subject-name">{s.subject}</span>
                      <div className="subject-bar-wrap">
                        <div className={`subject-bar ${isWeak ? "weak" : ""}`} style={{ width: `${(s.avg / 20) * 100}%` }} />
                      </div>
                      <span className={`subject-grade ${isWeak ? "status-weak" : "status-strong"}`}>
                        {s.avg}/20
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Recommendations */}
          <div className="card">
            <div className="flex justify-between items-center" style={{ marginBottom: 16 }}>
              <div className="card-title" style={{ margin: 0 }}>Orientations IA</div>
              <Link to="/recommendations" style={{ fontSize: "0.8rem", color: "var(--green-dark)", fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
                Voir tout <ArrowRight size={13} />
              </Link>
            </div>
            {recommendations.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon"><Target size={26} color="var(--text-muted)" /></div>
                <p>Lancez l'analyse IA pour obtenir vos recommandations.</p>
                <Link to="/analysis" style={{ color: "var(--green-dark)", fontWeight: 600, fontSize: "0.875rem" }}>
                  Analyser mon profil →
                </Link>
              </div>
            ) : (
              <div className="rec-list">
                {recommendations.map((r, i) => (
                  <div key={r.id} className="rec-item">
                    <div className={`rec-rank ${i === 0 ? "top" : ""}`}>{r.rank}</div>
                    <div className="rec-info">
                      <div className="rec-field">{r.orientation_field_name}</div>
                      <div className="rec-domain">{r.orientation_field_domain}</div>
                    </div>
                    <div className="rec-score">{r.fit_score.toFixed(0)}%</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick actions */}
        <div className="card">
          <div className="card-title">Actions rapides</div>
          <div className="flex gap-12" style={{ flexWrap: "wrap" }}>
            {QUICK_ACTIONS.map(({ to, Icon, label }) => (
              <Link
                key={to}
                to={to}
                style={{
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "10px 16px",
                  background: "var(--surface)",
                  border: "1.5px solid var(--border)",
                  borderRadius: 8,
                  fontSize: "0.875rem", fontWeight: 500,
                  color: "var(--text-primary)",
                  transition: "border-color 0.2s, background 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "var(--green)";
                  e.currentTarget.style.background = "var(--green-light)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--border)";
                  e.currentTarget.style.background = "var(--surface)";
                }}
              >
                <Icon size={15} color="var(--green-dark)" />
                {label}
              </Link>
            ))}
          </div>
        </div>

      </div>
    </>
  );
}
