import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authService } from "../services/authService";
import { useAuth } from "../context/AuthContext";
import Button from "../components/Button";
import InputField from "../components/InputField";
import "../styles/auth.css";

export default function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: "",
    first_name: "",
    last_name: "",
    role: "STUDENT",
    password: "",
    password2: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);
    try {
      await authService.register(form);
      await login(form.email, form.password);
      navigate("/dashboard");
    } catch (err) {
      const data = err.response?.data ?? {};
      setErrors(data);
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
          Commencez à construire<br /><span>votre parcours aujourd'hui.</span>
        </h2>
        <p className="auth-desc">
          ScholarPath vous accompagne de la 6ème jusqu'à l'insertion professionnelle.
          Gratuit pour les élèves et leurs familles.
        </p>
        <div className="auth-features">
          {[
            "Inscription gratuite en 1 minute",
            "Profil structuré et évolutif",
            "IA d'orientation personnalisée",
            "Données sécurisées et confidentielles",
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
          <h1 className="auth-card-title">Créer un compte</h1>
          <p className="auth-card-subtitle">Rejoignez ScholarPath gratuitement</p>

          {errors.non_field_errors && (
            <div className="auth-error">{errors.non_field_errors}</div>
          )}

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="auth-row">
              <InputField
                label="Prénom"
                id="first_name"
                name="first_name"
                value={form.first_name}
                onChange={handleChange}
                placeholder="Alice"
                error={errors.first_name?.[0]}
                required
              />
              <InputField
                label="Nom"
                id="last_name"
                name="last_name"
                value={form.last_name}
                onChange={handleChange}
                placeholder="Dupont"
                error={errors.last_name?.[0]}
                required
              />
            </div>
            <InputField
              label="Adresse e-mail"
              id="email"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="alice@email.com"
              error={errors.email?.[0]}
              required
            />
            <InputField
              label="Rôle"
              id="role"
              type="select"
              name="role"
              value={form.role}
              onChange={handleChange}
            >
              <option value="STUDENT">Élève / Étudiant</option>
              <option value="PARENT">Parent / Tuteur</option>
              <option value="MENTOR">Enseignant / Conseiller</option>
            </InputField>
            <div className="auth-row">
              <InputField
                label="Mot de passe"
                id="password"
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Min. 8 caractères"
                error={errors.password?.[0]}
                required
              />
              <InputField
                label="Confirmer"
                id="password2"
                type="password"
                name="password2"
                value={form.password2}
                onChange={handleChange}
                placeholder="Retapez le mot de passe"
                error={errors.password2?.[0]}
                required
              />
            </div>
            <Button type="submit" variant="primary" loading={loading} style={{ marginTop: 4 }}>
              Créer mon compte →
            </Button>
          </form>

          <div className="auth-link">
            Déjà inscrit ? <Link to="/login">Se connecter</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
