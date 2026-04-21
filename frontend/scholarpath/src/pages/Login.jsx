import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Button from "../components/Button";
import InputField from "../components/InputField";
import "../styles/auth.css";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate("/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.detail ??
        "Email ou mot de passe incorrect."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-logo">
          <div className="auth-logo-icon">SP</div>
          <span className="auth-logo-text">ScholarPath</span>
        </div>
        <h2 className="auth-tagline">
          Votre orientation,<br /><span>construite sur des faits.</span>
        </h2>
        <p className="auth-desc">
          Suivez votre parcours scolaire depuis la 6ème, obtenez des recommandations
          personnalisées et construisez un profil crédible pour votre avenir.
        </p>
        <div className="auth-features">
          {[
            "Profil longitudinal depuis la 6ème",
            "Données vérifiées et fiables",
            "Recommandations IA personnalisées",
            "Portfolio exportable pour Parcoursup",
          ].map((f) => (
            <div key={f} className="auth-feature">
              <div className="auth-feature-dot" />
              {f}
            </div>
          ))}
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-card">
          <h1 className="auth-card-title">Bon retour 👋</h1>
          <p className="auth-card-subtitle">Connectez-vous à votre espace ScholarPath</p>

          {error && <div className="auth-error">{error}</div>}

          <form className="auth-form" onSubmit={handleSubmit}>
            <InputField
              label="Adresse e-mail"
              id="email"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="exemple@email.com"
              required
            />
            <InputField
              label="Mot de passe"
              id="password"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Votre mot de passe"
              required
            />
            <Button type="submit" variant="primary" loading={loading} style={{ marginTop: 4 }}>
              Se connecter
            </Button>
          </form>

          <div className="auth-link">
            Pas encore de compte ?{" "}
            <Link to="/register">Créer un compte</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
