import { useState, useEffect } from "react";
import { Target, RefreshCw, AlertTriangle } from "lucide-react";
import Topbar from "../components/Topbar";
import Button from "../components/Button";
import Loader from "../components/Loader";
import { aiService } from "../services/aiService";
import api from "../services/api";

export default function Recommendations() {
  const [recs, setRecs]             = useState([]);
  const [loading, setLoading]       = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError]           = useState("");

  const load = () =>
    api.get("/recommendations/")
      .then((r) => setRecs(r.data.results ?? r.data))
      .finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const handleGenerate = async () => {
    setGenerating(true);
    setError("");
    try {
      await aiService.recommend();
      await load();
    } catch (err) {
      const msg = err?.response?.data?.error ?? err?.response?.data?.detail ?? "";
      setError(msg || "Erreur IA. Vérifiez votre clé Groq et le modèle dans backend/.env.");
    } finally {
      setGenerating(false);
    }
  };

  if (loading) return <><Topbar title="Orientations" /><Loader center size={40} /></>;

  return (
    <>
      <Topbar title="Orientations recommandées" />
      <div className="page-container">
        <div className="flex justify-between items-center" style={{ marginBottom: 8 }}>
          <div>
            <p className="page-title">Orientations recommandées</p>
            <p className="page-subtitle">
              Filières classées par adéquation avec votre profil réel, générées par l'IA.
            </p>
          </div>
          <Button variant="primary" size="sm" loading={generating} onClick={handleGenerate}>
            {generating ? "Génération…" : <><RefreshCw size={14} /> Regénérer</>}
          </Button>
        </div>

        {error && (
          <div style={{
            display: "flex", gap: 10, alignItems: "flex-start",
            background: "#fff5f5", border: "1px solid #ffcdd2",
            borderRadius: 10, padding: "12px 16px", marginBottom: 16,
            fontSize: "0.875rem", color: "#c62828",
          }}>
            <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: 2 }} />
            {error}
          </div>
        )}

        {recs.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: "56px 32px" }}>
            <div style={{
              width: 64, height: 64, borderRadius: 18,
              background: "var(--green-light)",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 20px",
              boxShadow: "0 6px 20px rgba(34,197,94,0.15)",
            }}>
              <Target size={30} color="var(--green-dark)" />
            </div>
            <h2 style={{ fontWeight: 700, marginBottom: 8 }}>Aucune recommandation</h2>
            <p style={{ color: "var(--text-muted)", marginBottom: 24 }}>
              Générez vos recommandations personnalisées à partir de votre profil.
            </p>
            <Button variant="primary" loading={generating} onClick={handleGenerate}>
              Générer mes recommandations →
            </Button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {recs.map((r, i) => (
              <div key={r.id} className="card" style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
                {/* Rank badge */}
                <div style={{
                  minWidth: 52, height: 52, borderRadius: "50%",
                  background: i === 0 ? "var(--green)" : i === 1 ? "var(--black)" : "var(--border)",
                  color: i < 2 ? "white" : "var(--text-primary)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "1.1rem", fontWeight: 800,
                  flexShrink: 0,
                  boxShadow: i === 0 ? "var(--shadow-green)" : "none",
                }}>
                  #{r.rank}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6, flexWrap: "wrap" }}>
                    <h3 style={{ fontWeight: 700, fontSize: "1.05rem" }}>{r.orientation_field_name}</h3>
                    <span className="badge badge-gray">{r.orientation_field_domain}</span>
                  </div>
                  <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>
                    {r.justification}
                  </p>
                </div>

                {/* Score */}
                <div style={{ textAlign: "right", minWidth: 80, flexShrink: 0 }}>
                  <div style={{
                    fontSize: "1.75rem", fontWeight: 800,
                    color: r.fit_score >= 80 ? "var(--green-dark)"
                         : r.fit_score >= 60 ? "#f57c00"
                         : "var(--text-primary)",
                  }}>
                    {r.fit_score.toFixed(0)}%
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Adéquation</div>
                  <div style={{ height: 6, background: "var(--border)", borderRadius: 3, overflow: "hidden", marginTop: 6 }}>
                    <div style={{
                      height: "100%", width: `${r.fit_score}%`,
                      background: r.fit_score >= 80 ? "var(--green)"
                               : r.fit_score >= 60 ? "#ff9800"
                               : "#ef5350",
                      borderRadius: 3,
                    }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
