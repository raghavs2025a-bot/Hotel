import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authService } from '../services/index.js';
import { setUnauthorizedHandler } from '../services/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    authService.me()
      .then((r) => active && setUser(r.user))
      .catch(() => active && setUser(null))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  useEffect(() => { setUnauthorizedHandler(() => setUser(null)); }, []);

  const login = useCallback(async (body) => { const r = await authService.login(body); setUser(r.user); return r.user; }, []);
  const register = useCallback(async (body) => { const r = await authService.register(body); setUser(r.user); return r.user; }, []);
  const logout = useCallback(async () => { try { await authService.logout(); } finally { setUser(null); } }, []);

  const value = useMemo(() => ({ user, loading, isAdmin: user?.role === 'admin', login, register, logout, setUser }), [user, loading, login, register, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
