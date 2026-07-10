import { createContext, useContext, useEffect, useState } from "react";
import { checkAuthService, loginService, logoutService, registerService } from "../../services";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await checkAuthService();
      if (res.data.success) {
        setUser(res.data.user);
        setIsAuthenticated(true);
      }
    } catch {
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const login = async (data) => {
    const res = await loginService(data);
    if (res.data.success) {
      setUser(res.data.user);
      setIsAuthenticated(true);
    }
    return res.data;
  };

  const register = async (data) => {
    const res = await registerService(data);
    if (res.data.success && res.data.user) {
      setUser(res.data.user);
      setIsAuthenticated(true);
    }
    return res.data;
  };

  const logout = async () => {
    await logoutService();
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, loading, login, register, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);