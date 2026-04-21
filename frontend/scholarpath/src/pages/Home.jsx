import { Link } from "react-router-dom";
import {
  BookOpen, ShieldCheck, Compass, TrendingUp, Users, FileOutput,
  GraduationCap, ArrowRight, CheckCircle,
} from "lucide-react";
import Button from "../components/Button";
import "../styles/home.css";

const FEATURES = [
  {
    icon: BookOpen,
    title: "Suivi longitudinal",
    desc: "Construisez votre profil dès la 6ème. Résultats, activités, projets, certifications — tout est enregistré et exploitable.",
  },
  {
    icon: ShieldCheck,
    title: "Données vérifiées",
    desc: "Distinguez ce qui est déclaré, documenté et vérifié. Un indice de fiabilité contextualise chaque information de votre profil.",
  },
  {
    icon: Compass,
    title: "Orientation intelligente",
    desc: "L'IA analyse votre parcours complet et recommande les filières qui correspondent vraiment à votre profil réel.",
  },
  {
    icon: TrendingUp,
    title: "Plan de progression",
    desc: "Détectez les écarts entre votre profil actuel et les filières visées, avec des actions concrètes et priorisées.",
  },
  {
    icon: Users,
    title: "Espace famille & mentors",
    desc: "Parents et enseignants disposent d'une vue synthétique pour un dialogue éducatif fondé sur des faits.",
  },
  {
    icon: FileOutput,
    title: "Portfolio exportable",
    desc: "Générez automatiquement un portfolio exploitable pour Parcoursup, concours et dossiers d'admission.",
  },
];

export default function Home() {
  return (
    <div className="home-page">
      {/* Navbar */}
      <nav className="home-nav">
        <div className="home-nav-logo">
          <div className="home-nav-logo-icon">
            <GraduationCap size={16} color="white" />
          </div>
          <span>ScholarPath</span>
        </div>
        <div className="home-nav-links">
          <a href="#features">Fonctionnalités</a>
          <a href="#about">À propos</a>
        </div>
        <div className="home-nav-cta">
          <Button variant="outline" size="sm" onClick={() => window.location.href = "/login"}>
            Connexion
          </Button>
          <Button variant="primary" size="sm" onClick={() => window.location.href = "/register"}>
            Commencer
          </Button>
        </div>
      </nav>

      {/* Hero */}
      <section className="home-hero">
        <div className="hero-content">
          <div className="hero-label">
            <GraduationCap size={14} />
            <span>Orientation intelligente</span>
          </div>
          <h1 className="hero-title">
            Construisez votre<br />
            <span>parcours scolaire</span><br />
            avec confiance
          </h1>
          <p className="hero-desc">
            ScholarPath suit votre évolution depuis la 6ème jusqu'à l'insertion
            professionnelle. Un profil vérifié, une IA d'orientation et un plan
            de progression construit sur votre historique réel.
          </p>
          <div className="hero-cta">
            <Button variant="primary" size="lg" onClick={() => window.location.href = "/register"}>
              Créer mon profil gratuit <ArrowRight size={16} />
            </Button>
            <Button variant="outline" size="lg" onClick={() => window.location.href = "/login"}>
              Se connecter
            </Button>
          </div>
        </div>

        {/* Mockup */}
        <div className="hero-mockup">
          <div className="mockup-topbar">
            <div className="mockup-dot" style={{ background: "#ff5f57" }} />
            <div className="mockup-dot" style={{ background: "#febc2e" }} />
            <div className="mockup-dot" style={{ background: "#28c840" }} />
          </div>
          <div className="mockup-body">
            <div className="mockup-sidebar">
              {[true, false, false, false, false].map((a, i) => (
                <div key={i} className={`mockup-icon ${a ? "active" : ""}`} />
              ))}
            </div>
            <div className="mockup-main">
              <div className="mockup-title-bar" />
              <div className="mockup-cards">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="mockup-card">
                    <div className="mockup-card-line" />
                    <div className="mockup-card-line short" />
                    <div className="mockup-card-line green" />
                  </div>
                ))}
              </div>
              <div style={{ background: "#1a1a1a", borderRadius: 10, padding: 14, marginTop: 4 }}>
                <div className="mockup-card-line" style={{ width: "40%", marginBottom: 10 }} />
                {[85, 72, 68].map((w, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <div style={{ width: 20, height: 20, borderRadius: "50%", background: "#2a2a2a" }} />
                    <div style={{ flex: 1, height: 6, background: "#2a2a2a", borderRadius: 3, overflow: "hidden" }}>
                      <div style={{ width: `${w}%`, height: "100%", background: "var(--green)", borderRadius: 3 }} />
                    </div>
                    <div style={{ fontSize: 10, color: "var(--green)", fontWeight: 700 }}>{w}%</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="home-features">
        <div className="home-features-inner">
          <div className="section-label">Fonctionnalités</div>
          <h2 className="section-title">Tout ce dont vous avez besoin pour<br />réussir votre orientation</h2>
          <p className="section-desc">
            Une plateforme complète qui transforme votre scolarité entière en une base crédible
            pour des choix d'orientation solides et lucides.
          </p>
          <div className="features-grid">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="feature-card">
                <div className="feature-icon">
                  <Icon size={22} color="var(--green-dark)" />
                </div>
                <h3 className="feature-title">{title}</h3>
                <p className="feature-desc">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section className="home-cta-section">
        <h2>Prêt à prendre le contrôle de votre orientation ?</h2>
        <p>Rejoignez ScholarPath et construisez un profil qui vous ressemble vraiment.</p>
        <Button variant="primary" size="lg" onClick={() => window.location.href = "/register"}>
          Créer mon compte gratuitement <ArrowRight size={16} />
        </Button>
      </section>

      {/* Footer */}
      <footer className="home-footer">
        <div className="home-nav-logo">
          <div className="home-nav-logo-icon">
            <GraduationCap size={14} color="white" />
          </div>
          <span>ScholarPath</span>
        </div>
        <span>© {new Date().getFullYear()} ScholarPath — Orientation intelligente</span>
      </footer>
    </div>
  );
}
