import { useState, useEffect } from "react";
import Topbar from "../components/Topbar";
import Button from "../components/Button";
import Loader from "../components/Loader";
import { aiService } from "../services/aiService";
import api from "../services/api";

export default function Recommendations() {
  const [recs, setRecs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const load = () =>
    api.get("/recommendations/")
      .then((r) => setRecs(r.data.results ?? r.data))
      .finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const handleGenerate = async () => {
    setGenerating(true);
    await aiService.recommend();
    await load();
    setGenerating(false);
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
            {generating ? "Génération..." : "🔄 Regénérer"}
          </Button>
        </div>

        {recs.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: "48px 32px" }}>
            <div style={{ fontSize: "3rem", marginBottom: 16 }}>🎯</div>
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
                }}>
                  #{r.rank}
                </div>

                {/* Info */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6, flexWrap: "wrap" }}>
                    <h3 style={{ fontWeight: 700, fontSize: "1.05rem" }}>{r.orientation_field_name}</h3>
                    <span className="badge badge-gray">{r.orientation_field_domain}</span>
                  </div>
                  <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>
                    {r.justification}
                  </p>
                </div>

                {/* Score */}
                <div style={{ textAlign: "right", minWidth: 80 }}>
                  <div style={{
                    fontSize: "1.75rem", fontWeight: 800,
                    color: r.fit_score >= 80 ? "var(--green-dark)" : r.fit_score >= 60 ? "#f57c00" : "var(--text-primary)",
                  }}>
                    {r.fit_score.toFixed(0)}%
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Adéquation</div>
                  <div style={{ height: 6, background: "var(--border)", borderRadius: 3, overflow: "hidden", marginTop: 6 }}>
                    <div style={{
                      height: "100%", width: `${r.fit_score}%`,
                      background: r.fit_score >= 80 ? "var(--green)" : r.fit_score >= 60 ? "#ff9800" : "#ef5350",
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
