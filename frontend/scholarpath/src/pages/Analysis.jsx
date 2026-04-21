import { useState } from "react";
import Topbar from "../components/Topbar";
import Button from "../components/Button";
import { aiService } from "../services/aiService";

export default function Analysis() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAnalyze = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await aiService.analyzeProfile();
      setResult(data);
    } catch {
      setError("Erreur lors de l'analyse. Vérifiez que votre profil est renseigné.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Topbar title="Analyse IA" />
      <div className="page-container">
        <p className="page-title">Analyse de profil</p>
        <p className="page-subtitle">
          L'IA analyse l'ensemble de votre parcours pour identifier vos aptitudes dominantes et la cohérence de votre profil.
        </p>

        {!result ? (
          <div className="card" style={{ textAlign: "center", padding: "48px 32px" }}>
            <div style={{ fontSize: "3rem", marginBottom: 16 }}>🧠</div>
            <h2 style={{ fontWeight: 700, marginBottom: 8 }}>Analysez votre profil avec l'IA</h2>
            <p style={{ color: "var(--text-muted)", marginBottom: 24, maxWidth: 480, margin: "0 auto 24px" }}>
              L'analyse prend en compte tous vos résultats, centres d'intérêt, objectifs et activités
              pour produire une synthèse personnalisée.
            </p>
            {error && <div style={{ color: "#c62828", marginBottom: 16, fontSize: "0.875rem" }}>{error}</div>}
            <Button variant="primary" loading={loading} onClick={handleAnalyze}>
              {loading ? "Analyse en cours..." : "Lancer l'analyse IA →"}
            </Button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Resume */}
            <div className="card" style={{ background: "var(--black)", border: "none" }}>
              <div style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.8rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>
                Synthèse
              </div>
              <p style={{ color: "var(--white)", fontSize: "1rem", lineHeight: 1.7 }}>
                {result.resume || "Analyse disponible ci-dessous."}
              </p>
            </div>

            <div className="grid-3">
              {/* Aptitudes */}
              <div className="card">
                <div className="card-title">Aptitudes dominantes</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {(result.aptitudes_dominantes ?? []).length === 0 ? (
                    <span className="text-muted">—</span>
                  ) : (
                    result.aptitudes_dominantes.map((a, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--green)" }} />
                        <span style={{ fontSize: "0.875rem" }}>{a}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Forces */}
              <div className="card">
                <div className="card-title" style={{ color: "var(--green-dark)" }}>Points forts</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {(result.forces ?? []).map((f, i) => (
                    <div key={i} style={{ display: "flex", gap: 8, fontSize: "0.875rem" }}>
                      <span style={{ color: "var(--green)" }}>✓</span> {f}
                    </div>
                  ))}
                </div>
              </div>

              {/* Faiblesses */}
              <div className="card">
                <div className="card-title" style={{ color: "#c62828" }}>Points à renforcer</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {(result.faiblesses ?? []).map((f, i) => (
                    <div key={i} style={{ display: "flex", gap: 8, fontSize: "0.875rem" }}>
                      <span style={{ color: "#ef5350" }}>!</span> {f}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Coherence + signals */}
            <div className="grid-2">
              <div className="card">
                <div className="card-title">Cohérence du profil</div>
                <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>
                  {result.coherence || "—"}
                </p>
              </div>
              <div className="card">
                <div className="card-title">Signaux détectés</div>
                {(result.signaux ?? []).length === 0 ? (
                  <span className="text-muted">Aucun signal particulier.</span>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {result.signaux.map((s, i) => (
                      <div key={i} style={{ display: "flex", gap: 8, fontSize: "0.875rem" }}>
                        <span>🔔</span> {s}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <Button variant="outline" onClick={() => setResult(null)}>
              Relancer une analyse
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
