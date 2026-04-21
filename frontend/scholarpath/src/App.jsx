import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import AcademicHistory from "./pages/AcademicHistory";
import Documents from "./pages/Documents";
import Analysis from "./pages/Analysis";
import Recommendations from "./pages/Recommendations";
import Notifications from "./pages/Notifications";
import Settings from "./pages/Settings";

function AppLayout({ children, title }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile sidebar on resize to desktop
  useEffect(() => {
    const handler = () => {
      if (window.innerWidth > 768) setMobileOpen(false);
    };
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  return (
    <div className={`app-layout ${collapsed ? "sidebar-collapsed" : ""}`}>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="sidebar-overlay" onClick={() => setMobileOpen(false)} />
      )}

      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((p) => !p)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <main className="main-content">
        <Topbar title={title} onMobileMenu={() => setMobileOpen((p) => !p)} />
        {children}
      </main>
    </div>
  );
}

function Protected({ title, children }) {
  return (
    <ProtectedRoute>
      <AppLayout title={title}>{children}</AppLayout>
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/dashboard"      element={<Protected title="Tableau de bord"><Dashboard /></Protected>} />
          <Route path="/profile"        element={<Protected title="Mon profil"><Profile /></Protected>} />
          <Route path="/academic"       element={<Protected title="Résultats scolaires"><AcademicHistory /></Protected>} />
          <Route path="/documents"      element={<Protected title="Documents"><Documents /></Protected>} />
          <Route path="/analysis"       element={<Protected title="Analyse IA"><Analysis /></Protected>} />
          <Route path="/recommendations"element={<Protected title="Orientations"><Recommendations /></Protected>} />
          <Route path="/notifications"  element={<Protected title="Notifications"><Notifications /></Protected>} />
          <Route path="/settings"       element={<Protected title="Paramètres"><Settings /></Protected>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
