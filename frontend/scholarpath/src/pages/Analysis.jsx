import { useState } from "react";
import {
  Brain, Zap, TrendingUp, AlertTriangle, RefreshCw,
  Bell, CheckCircle, Wifi, WifiOff, ChevronDown, ChevronUp,
} from "lucide-react";
import Topbar from "../components/Topbar";
import Button from "../components/Button";
import { aiService } from "../services/aiService";

/* ── Composant carte résultat ─────────────────────────────────── */
function ResultCard({ icon: Icon, iconBg, iconColor, title, titleColor, items, empty, renderItem }) {
  return (
    <div className="card">
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 9,
          background: iconBg,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Icon size={16} color={iconColor} />
        </div>
        <span className="card-title" style={{ margin: 0, color: titleColor }}>{title}</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {items.length === 0
          ? <span className="text-muted">{empty}</span>
          : items.map((item, i) => renderItem(item, i))}
      </div>
    </div>
  );
}

/* ── Bloc d'erreur ────────────────────────────────────────────── */
function ErrorBlock({ message, onTest }) {
  const [testing, setTesting]   = useState(false);
  const [testResult, setResult] = useState(null);
  const [open, setOpen]         = useState(false);

  const handleTest = async () => {
    setTesting(true);
    try {
      const r = await aiService.testConnection();
      setResult(r);
    } catch {
      setResult({ ok: false, error: "Impossible de joindre le serveur backend." });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div style={{
      background: "#fff5f5", border: "1px solid #ffcdd2",
      borderRadius: 12, padding: "16px 20px", marginBottom: 20,
    }}>
      <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
        <AlertTriangle size={18} color="#c62828" style={{ flexShrink: 0, marginTop: 2 }} />
        <div style={{ flex: 1 }}>
          <p style={{ fontWeight: 700, color: "#c62828", marginBottom: 4 }}>Erreur IA</p>
          <p style={{ fontSize: "0.875rem", color: "#b71c1c" }}>{message}</p>
        </div>
      </div>

      {/* Diagnostic rapide */}
      <div style={{ marginTop: 14, borderTop: "1px solid #ffcdd2", paddingTop: 12 }}>
        <button
          onClick={() => setOpen(p => !p)}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            fontSize: "0.8rem", fontWeight: 600, color: "#c62828",
            background: "none", border: "none", cursor: "pointer",
          }}
        >
          {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          Aide au diagnostic
        </button>

        {open && (
          <div style={{ marginTop: 12, fontSize: "0.82rem", color: "#7f1d1d", lineHeight: 1.7 }}>
            <p style={{ fontWeight: 700, marginBottom: 6 }}>Vérifiez dans <code>backend/.env</code> :</p>
            <pre style={{
              background: "#1e293b", color: "#86efac",
              padding: "10px 14px", borderRadius: 8,
              fontSize: "0.78rem", overflowX: "auto", marginBottom: 10,
            }}>
{`GROQ_API_KEY=gsk_votre_cle_ici
GROQ_MODEL=llama-3.3-70b-versatile`}
            </pre>
            <p>Modèles Groq actifs (2025) : <code>llama-3.3-70b-versatile</code> ✓,{" "}
              <code>llama-3.1-8b-instant</code> ✓, <code>gemma2-9b-it</code> ✓
            </p>
            <p style={{ marginTop: 4, color: "#b91c1c" }}>
              ✗ Désactivés : <code>llama3-70b-8192</code>, <code>llama3-8b-8192</code>, <code>mixtral-8x7b-32768</code>
            </p>
            <p style={{ marginTop: 8, color: "#991b1b" }}>
              ⚠️ Après toute modification du <code>.env</code>, relancez le serveur Django.
            </p>

            <div style={{ marginTop: 12 }}>
              <Button variant="outline" size="sm" loading={testing} onClick={handleTest}>
                <Wifi size={13} /> Tester la connexion Groq
              </Button>
            </div>

            {testResult && (
              <div style={{
                marginTop: 10, padding: "10px 14px",
                borderRadius: 8,
                background: testResult.ok ? "#f0fdf4" : "#fff5f5",
                border: `1px solid ${testResult.ok ? "#bbf7d0" : "#ffcdd2"}`,
                display: "flex", alignItems: "center", gap: 8,
              }}>
                {testResult.ok
                  ? <><CheckCircle size={15} color="var(--green-dark)" />
                      <span style={{ color: "var(--green-dark)", fontWeight: 600 }}>
                        Connexion OK — modèle : {testResult.model}
                      </span>
                    </>
                  : <><WifiOff size={15} color="#c62828" />
                      <span style={{ color: "#c62828" }}>{testResult.error}</span>
                    </>
                }
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Page principale ──────────────────────────────────────────── */
export default function Analysis() {
  const [result,  setResult]  = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  const handleAnalyze = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await aiService.analyzeProfile();
      if (data.error) {
        // Erreur renvoyée proprement par le backend (503 / 500)
        setError(data.error);
      } else {
        setResult(data);
      }
    } catch (err) {
      const serverMsg = err?.response?.data?.error ?? err?.response?.data?.detail ?? "";
      setError(serverMsg || "Erreur inattendue. Relancez le serveur backend.");
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
          L'IA analyse l'ensemble de votre parcours pour identifier vos aptitudes
          dominantes et la cohérence de votre profil.
        </p>

        {error && <ErrorBlock message={error} />}

        {!result ? (
          <div className="card" style={{ textAlign: "center", padding: "56px 32px" }}>
            <div style={{
              width: 72, height: 72, borderRadius: 20,
              background: "linear-gradient(135deg, var(--green-light), #bbf7d0)",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 20px",
              boxShadow: "0 8px 24px rgba(34,197,94,0.2)",
            }}>
              <Brain size={36} color="var(--green-dark)" />
            </div>

            <h2 style={{ fontWeight: 800, fontSize: "1.3rem", marginBottom: 10 }}>
              Analysez votre profil avec l'IA
            </h2>
            <p style={{ color: "var(--text-muted)", maxWidth: 480, margin: "0 auto 28px", lineHeight: 1.7 }}>
              L'analyse prend en compte vos résultats, centres d'intérêt, objectifs
              et activités pour produire une synthèse personnalisée.
            </p>

            <Button variant="primary" size="lg" loading={loading} onClick={handleAnalyze}>
              {loading ? "Analyse en cours…" : <><Zap size={16} /> Lancer l'analyse IA</>}
            </Button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            {/* Résumé hero */}
            <div className="card" style={{
              background: "linear-gradient(135deg, var(--black) 0%, #1e293b 100%)",
              border: "none", padding: "28px 32px",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <Brain size={18} color="var(--green)" />
                <span style={{
                  color: "var(--green)", fontSize: "0.8rem", fontWeight: 700,
                  textTransform: "uppercase", letterSpacing: "0.05em",
                }}>
                  Synthèse IA
                </span>
              </div>
              <p style={{ color: "var(--white)", fontSize: "1rem", lineHeight: 1.75 }}>
                {result.resume || "Analyse disponible ci-dessous."}
              </p>
            </div>

            {/* 3 colonnes */}
            <div className="grid-3">
              <ResultCard
                icon={Zap} iconBg="var(--green-light)" iconColor="var(--green-dark)"
                title="Aptitudes dominantes"
                items={result.aptitudes_dominantes ?? []}
                empty="Non disponible"
                renderItem={(a, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--green)", flexShrink: 0 }} />
                    <span style={{ fontSize: "0.875rem" }}>{a}</span>
                  </div>
                )}
              />

              <ResultCard
                icon={TrendingUp} iconBg="#f0fdf4" iconColor="var(--green-dark)"
                title="Points forts" titleColor="var(--green-dark)"
                items={result.forces ?? []}
                empty="Non disponible"
                renderItem={(f, i) => (
                  <div key={i} style={{ display: "flex", gap: 8, fontSize: "0.875rem", alignItems: "flex-start" }}>
                    <CheckCircle size={14} color="var(--green)" style={{ flexShrink: 0, marginTop: 2 }} />
                    <span>{f}</span>
                  </div>
                )}
              />

              <ResultCard
                icon={AlertTriangle} iconBg="#fff5f5" iconColor="#c62828"
                title="À renforcer" titleColor="#c62828"
                items={result.faiblesses ?? []}
                empty="Aucun point faible détecté"
                renderItem={(f, i) => (
                  <div key={i} style={{ display: "flex", gap: 8, fontSize: "0.875rem", alignItems: "flex-start" }}>
                    <AlertTriangle size={13} color="#ef5350" style={{ flexShrink: 0, marginTop: 2 }} />
                    <span>{f}</span>
                  </div>
                )}
              />
            </div>

            {/* Cohérence + Signaux */}
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
                      <div key={i} style={{
                        display: "flex", gap: 8, fontSize: "0.875rem",
                        padding: "8px 12px", background: "var(--surface-2)", borderRadius: 8,
                      }}>
                        <Bell size={13} color="var(--orange)" style={{ flexShrink: 0, marginTop: 2 }} />
                        <span>{s}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div>
              <Button variant="outline" onClick={() => { setResult(null); setError(""); }}>
                <RefreshCw size={14} /> Relancer une analyse
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
