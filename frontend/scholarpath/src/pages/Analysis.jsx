import { useState } from "react";
import { Brain, Zap, TrendingUp, AlertTriangle, RefreshCw, Bell, CheckCircle } from "lucide-react";
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
    } catch (err) {
      const msg = err?.response?.data?.detail ?? err?.message ?? "";
      if (err?.response?.status === 404) {
        setError("Profil introuvable. Complétez d'abord votre profil dans l'onglet « Profil ».");
      } else {
        setError("Erreur lors de l'analyse. " + (msg || "Vérifiez que votre profil est renseigné."));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Topbar title="Analyse IA" />
      <div className="page-container">
        <p className="page-title">Analyse de profil IA</p>
        <p className="page-subtitle">
          L'IA analyse l'ensemble de votre parcours pour identifier vos aptitudes dominantes
          et la cohérence de votre profil.
        </p>

        {!result ? (
          <div className="card" style={{ textAlign: "center", padding: "56px 32px" }}>
            {/* Animated brain icon */}
            <div style={{
              width: 72, height: 72,
              background: "linear-gradient(135deg, var(--green-light), #bbf7d0)",
              borderRadius: 20,
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 20px",
              boxShadow: "0 8px 24px rgba(34,197,94,0.2)",
            }}>
              <Brain size={36} color="var(--green-dark)" />
            </div>

            <h2 style={{ fontWeight: 800, fontSize: "1.3rem", marginBottom: 10 }}>
              Analysez votre profil avec l'IA
            </h2>
            <p style={{ color: "var(--text-muted)", marginBottom: 28, maxWidth: 480, margin: "0 auto 28px", lineHeight: 1.7 }}>
              L'analyse prend en compte tous vos résultats, centres d'intérêt, objectifs
              et activités pour produire une synthèse personnalisée.
            </p>

            {error && (
              <div style={{
                display: "flex", alignItems: "flex-start", gap: 10,
                background: "#fff5f5", color: "#c62828",
                borderRadius: 10, padding: "12px 16px",
                border: "1px solid #ffcdd2",
                marginBottom: 20, maxWidth: 480, margin: "0 auto 20px",
                textAlign: "left", fontSize: "0.875rem",
              }}>
                <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: 2 }} />
                {error}
              </div>
            )}

            <Button variant="primary" size="lg" loading={loading} onClick={handleAnalyze}>
              {loading ? "Analyse en cours…" : <><Zap size={16} /> Lancer l'analyse IA</>}
            </Button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            {/* Hero résumé */}
            <div className="card" style={{
              background: "linear-gradient(135deg, var(--black) 0%, #1e293b 100%)",
              border: "none",
              padding: "28px 32px",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <Brain size={18} color="var(--green)" />
                <span style={{ color: "var(--green)", fontSize: "0.8rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Synthèse IA
                </span>
              </div>
              <p style={{ color: "var(--white)", fontSize: "1rem", lineHeight: 1.75 }}>
                {result.resume || "Analyse disponible ci-dessous."}
              </p>
            </div>

            {/* 3-column cards */}
            <div className="grid-3">
              {/* Aptitudes */}
              <div className="card">
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 9, background: "var(--green-light)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Zap size={16} color="var(--green-dark)" />
                  </div>
                  <span className="card-title" style={{ margin: 0 }}>Aptitudes dominantes</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {(result.aptitudes_dominantes ?? []).length === 0 ? (
                    <span className="text-muted">Non disponible</span>
                  ) : (
                    result.aptitudes_dominantes.map((a, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--green)", flexShrink: 0 }} />
                        <span style={{ fontSize: "0.875rem" }}>{a}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Points forts */}
              <div className="card">
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 9, background: "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <TrendingUp size={16} color="var(--green-dark)" />
                  </div>
                  <span className="card-title" style={{ margin: 0, color: "var(--green-dark)" }}>Points forts</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {(result.forces ?? []).length === 0 ? (
                    <span className="text-muted">Non disponible</span>
                  ) : (
                    result.forces.map((f, i) => (
                      <div key={i} style={{ display: "flex", gap: 8, fontSize: "0.875rem", alignItems: "flex-start" }}>
                        <CheckCircle size={14} color="var(--green)" style={{ flexShrink: 0, marginTop: 2 }} />
                        <span>{f}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Points à renforcer */}
              <div className="card">
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 9, background: "#fff5f5", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <AlertTriangle size={16} color="#c62828" />
                  </div>
                  <span className="card-title" style={{ margin: 0, color: "#c62828" }}>À renforcer</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {(result.faiblesses ?? []).length === 0 ? (
                    <span className="text-muted">Non disponible</span>
                  ) : (
                    result.faiblesses.map((f, i) => (
                      <div key={i} style={{ display: "flex", gap: 8, fontSize: "0.875rem", alignItems: "flex-start" }}>
                        <AlertTriangle size={13} color="#ef5350" style={{ flexShrink: 0, marginTop: 2 }} />
                        <span>{f}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Coherence + Signaux */}
            <div className="grid-2">
              <div className="card">
                <div className="card-title">Cohérence du profil</div>
                <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", lineHeight: 1.7 }}>
                  {result.coherence || "—"}
                </p>
              </div>
              <div className="card">
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                  <Bell size={15} color="var(--text-muted)" />
                  <span className="card-title" style={{ margin: 0 }}>Signaux détectés</span>
                </div>
                {(result.signaux ?? []).length === 0 ? (
                  <span className="text-muted">Aucun signal particulier.</span>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {result.signaux.map((s, i) => (
                      <div key={i} style={{ display: "flex", gap: 8, fontSize: "0.875rem", padding: "8px 12px", background: "var(--surface-2)", borderRadius: 8 }}>
                        <Bell size={13} color="var(--orange)" style={{ flexShrink: 0, marginTop: 2 }} />
                        <span>{s}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div>
              <Button variant="outline" onClick={() => setResult(null)}>
                <RefreshCw size={14} /> Relancer une analyse
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
