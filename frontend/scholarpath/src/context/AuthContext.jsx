import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { authService } from "../services/authService";
import { tokenStorage } from "../utils/tokenStorage";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    try {
      const data = await authService.getCurrentUser();
      setUser(data);
    } catch {
      setUser(null);
      tokenStorage.clear();
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (tokenStorage.getAccess()) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [fetchUser]);

  const login = async (email, password) => {
    await authService.login(email, password);
    await fetchUser();
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refetch: fetchUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
