import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import type { Tournament } from "../api/types";

export function Tournaments() {
  const [rows, setRows] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get("/tournament/get-all")
      .then((res) => {
        const data = res.data?.data;
        setRows(data?.result ?? data?.results ?? data ?? []);
      })
      .catch((e) =>
        setError(e?.response?.data?.message ?? "Could not load tournaments"),
      )
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-bold text-navy">Tournaments</h1>
        <Link to="/tournaments/new" className="btn-gold text-sm">
          + Create Tournament
        </Link>
      </div>

      {loading && <div className="text-navy/50">Loading…</div>}
      {error && <div className="text-red-600">{error}</div>}

      {!loading && !error && rows.length === 0 && (
        <div className="card text-navy/60">
          No tournaments yet. Create your first one.
        </div>
      )}

      <div className="grid gap-3">
        {rows.map((t) => (
          <div key={t._id} className="card flex items-center justify-between">
            <div>
              <div className="font-semibold text-navy">
                {t.tournamentName ?? t.courseName}
              </div>
              <div className="text-sm text-navy/60">
                {t.courseName} · {t.city} · {t.date} {t.time}
              </div>
            </div>
            <span className="text-xs px-2 py-1 rounded-full bg-navy/5 text-navy/70">
              {t.status ?? "active"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
