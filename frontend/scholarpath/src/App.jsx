import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Sidebar from "./components/Sidebar";

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

function AppLayout({ children }) {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">{children}</main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <AppLayout><Dashboard /></AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <AppLayout><Profile /></AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/academic"
            element={
              <ProtectedRoute>
                <AppLayout><AcademicHistory /></AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/documents"
            element={
              <ProtectedRoute>
                <AppLayout><Documents /></AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/analysis"
            element={
              <ProtectedRoute>
                <AppLayout><Analysis /></AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/recommendations"
            element={
              <ProtectedRoute>
                <AppLayout><Recommendations /></AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <AppLayout><Notifications /></AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <AppLayout><Settings /></AppLayout>
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
