import { useEffect, useState, useCallback } from "react";
import { api } from "../api/client";
import type { CreatorClub, MemberSlot } from "../api/types";

export function MemberSlots() {
  const [clubs, setClubs] = useState<CreatorClub[]>([]);
  const [selected, setSelected] = useState("");
  const [slots, setSlots] = useState<MemberSlot[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [newCode, setNewCode] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.get("/club/my-club").then((res) => {
      const data = res.data?.data;
      const list: CreatorClub[] = data?.result ?? data?.results ?? data ?? [];
      // Slots exist only for private clubs (spec §12).
      setClubs(list.filter((c) => c.isPrivate));
    });
  }, []);

  const loadSlots = useCallback(async (clubId: string) => {
    if (!clubId) return;
    setError(null);
    try {
      const res = await api.get(`/clubs/${clubId}/slots`);
      setSlots(res.data?.data ?? []);
    } catch (e: unknown) {
      setError(
        (e as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Could not load member slots",
      );
    }
  }, []);

  useEffect(() => {
    if (selected) loadSlots(selected);
  }, [selected, loadSlots]);

  const addSlot = async () => {
    const displayName = prompt("Display name for the new member slot:")?.trim();
    if (!displayName) return;
    setBusy(true);
    setError(null);
    setNewCode(null);
    try {
      const res = await api.post(`/clubs/${selected}/slots`, { displayName });
      const code = res.data?.data?.code ?? res.data?.data?.slot?.accessCode;
      setNewCode(code ?? null);
      await loadSlots(selected);
    } catch (e: unknown) {
      setError(
        (e as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ??
          "Could not create the slot. Check that private-club billing (per-member fee + saved payment method) is set up.",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-navy">Private Club Members</h1>
        <select
          className="field w-64"
          value={selected}
          onChange={(e) => {
            setSelected(e.target.value);
            setNewCode(null);
          }}
        >
          <option value="">Select a private club…</option>
          {clubs.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="mb-4 text-sm text-red-600 bg-red-50 rounded px-3 py-2">
          {error}
        </div>
      )}

      {clubs.length === 0 && (
        <div className="card text-navy/60">
          You have no private clubs. Member slots are only for private clubs.
        </div>
      )}

      {selected && (
        <>
          <div className="flex items-center gap-3 mb-4">
            <button className="btn-gold" onClick={addSlot} disabled={busy}>
              {busy ? "Charging & creating…" : "+ Add member slot"}
            </button>
            <span className="text-xs text-navy/50">
              Creating a slot charges the per-member fee, then issues a one-time
              access code.
            </span>
          </div>

          {newCode && (
            <div className="card mb-4 border-gold">
              <div className="text-sm text-navy/70 mb-1">
                New access code — hand it over personally. It works once.
              </div>
              <div className="text-2xl font-bold tracking-widest text-navy">
                {newCode}
              </div>
            </div>
          )}

          <div className="grid gap-2">
            {slots.map((s) => (
              <div
                key={s._id}
                className="card flex items-center justify-between py-3"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      s.redeemed ? "bg-green-500" : "bg-gold"
                    }`}
                  />
                  <span className="font-medium text-navy">{s.displayName}</span>
                </div>
                <span className="text-sm text-navy/60">
                  {s.redeemed ? "Joined" : s.accessCode}
                </span>
              </div>
            ))}
            {slots.length === 0 && (
              <div className="card text-navy/60">
                No member slots yet. Add the first one above.
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
