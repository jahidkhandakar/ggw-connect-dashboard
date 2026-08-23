import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await login(email, password);
      navigate("/");
    } catch (err: unknown) {
      setError(
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Login failed",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen grid place-items-center bg-navy">
      <form onSubmit={submit} className="card w-[380px]">
        <div className="text-center mb-6">
          <div className="text-gold font-bold text-2xl">GGW Connect</div>
          <div className="text-navy/60 text-sm">Creator Dashboard</div>
        </div>
        {error && (
          <div className="mb-3 text-sm text-red-600 bg-red-50 rounded px-3 py-2">
            {error}
          </div>
        )}
        <label className="label">Email</label>
        <input
          className="field mb-3"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <label className="label">Password</label>
        <input
          className="field mb-5"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button className="btn-gold w-full" disabled={busy}>
          {busy ? "Signing in…" : "Sign in"}
        </button>
        <p className="text-xs text-navy/50 mt-4 text-center">
          Sign in with your GGW Connect account. Access is scoped to your own
          clubs, leagues, and events.
        </p>
      </form>
    </div>
  );
}
