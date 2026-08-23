import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { api, TOKEN_KEY, unwrap } from "../api/client";

interface CreatorUser {
  id?: string;
  _id?: string;
  name?: string;
  email?: string;
  role?: string;
}

interface AuthState {
  user: CreatorUser | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthCtx = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem(TOKEN_KEY),
  );
  const [user, setUser] = useState<CreatorUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .get("/user/get-my-profile")
      .then((res) => setUser(unwrap<CreatorUser>(res)))
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY);
        setToken(null);
      })
      .finally(() => setLoading(false));
  }, [token]);

  const login = async (email: string, password: string) => {
    const res = await api.post("/auth/login", { email, password });
    // Backends vary on envelope shape; accept the common spots.
    const data = res.data?.data ?? res.data;
    const jwt = data?.accessToken ?? data?.token ?? data?.access_token;
    if (!jwt) throw new Error("No token returned from login");
    localStorage.setItem(TOKEN_KEY, jwt);
    setToken(jwt);
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  };

  return (
    <AuthCtx.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthCtx.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
