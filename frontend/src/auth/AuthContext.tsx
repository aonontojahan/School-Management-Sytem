import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { api } from "../lib/api";

export type Role = "ADMIN" | "TEACHER" | "STUDENT" | "GUARDIAN";

interface AuthState {
  token: string | null;
  role: Role | null;
  email: string | null;
  login: (email: string, password: string) => Promise<Role>;
  logout: () => void;
}

const Ctx = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(localStorage.getItem("access_token"));
  const [role, setRole] = useState<Role | null>(() => (localStorage.getItem("role") as Role) ?? null);
  const [email, setEmail] = useState<string | null>(localStorage.getItem("email"));

  async function login(email: string, password: string): Promise<Role> {
    const res = await api.post("/auth/login", { email, password });
    localStorage.setItem("access_token", res.data.access_token);
    localStorage.setItem("refresh_token", res.data.refresh_token);
    localStorage.setItem("role", res.data.role);
    localStorage.setItem("email", email);
    setToken(res.data.access_token);
    setRole(res.data.role);
    setEmail(email);
    return res.data.role as Role;
  }

  function logout() {
    const refresh = localStorage.getItem("refresh_token");
    if (refresh && token) api.post("/auth/logout", { refresh_token: refresh }).catch(() => {});
    localStorage.clear();
    setToken(null);
    setRole(null);
    setEmail(null);
  }

  useEffect(() => {
    if (token && !role) {
      api.get("/auth/me").then((r) => {
        setRole(r.data.role);
        localStorage.setItem("role", r.data.role);
      }).catch(() => logout());
    }
  }, [token, role]);

  return <Ctx.Provider value={{ token, role, email, login, logout }}>{children}</Ctx.Provider>;
}

export function useAuth(): AuthState {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth outside provider");
  return v;
}
