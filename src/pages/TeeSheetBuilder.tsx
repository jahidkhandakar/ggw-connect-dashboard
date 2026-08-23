import { useEffect, useState, useCallback } from "react";
import { api } from "../api/client";
import {
  type Tournament,
  type TeeGroup,
  type TeePlayer,
  playerId,
  playerName,
} from "../api/types";

interface DragInfo {
  userId: string;
  fromGroup: string;
}

export function TeeSheetBuilder() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [selected, setSelected] = useState<string>("");
  const [groups, setGroups] = useState<TeeGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [drag, setDrag] = useState<DragInfo | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.get("/tournament/get-all").then((res) => {
      const data = res.data?.data;
      setTournaments(data?.result ?? data?.results ?? data ?? []);
    });
  }, []);

  const loadGroups = useCallback(async (tournamentId: string) => {
    if (!tournamentId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/tee-sheet/find/${tournamentId}`);
      setGroups(res.data?.data ?? []);
    } catch (e: unknown) {
      setError(
        (e as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Could not load the tee sheet",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selected) loadGroups(selected);
  }, [selected, loadGroups]);

  const generate = async () => {
    setBusy(true);
    try {
      await api.post(`/tee-sheet/generate/${selected}`);
      await loadGroups(selected);
    } catch (e: unknown) {
      setError(
        (e as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Could not generate groups",
      );
    } finally {
      setBusy(false);
    }
  };

  const onDrop = async (toGroup: string) => {
    const info = drag;
    setDrag(null);
    if (!info || info.fromGroup === toGroup) return;

    // Optimistic move, then persist.
    setGroups((prev) =>
      prev.map((g) => {
        if (g.groupName === info.fromGroup) {
          const moved = g.players.find((p) => playerId(p) === info.userId);
          return moved
            ? { ...g, players: g.players.filter((p) => playerId(p) !== info.userId) }
            : g;
        }
        if (g.groupName === toGroup) {
          const src = prev.find((x) => x.groupName === info.fromGroup);
          const moved = src?.players.find((p) => playerId(p) === info.userId);
          return moved ? { ...g, players: [...g.players, moved] } : g;
        }
        return g;
      }),
    );

    try {
      await api.post("/tee-sheet/move-player", {
        tournamentId: selected,
        fromGroup: info.fromGroup,
        toGroup,
        userId: info.userId,
      });
      await loadGroups(selected); // reconcile with server truth
    } catch (e: unknown) {
      setError(
        (e as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Move rejected",
      );
      await loadGroups(selected); // revert to server state
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-navy">Tee-Sheet Builder</h1>
        <select
          className="field w-72"
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
        >
          <option value="">Select a tournament…</option>
          {tournaments.map((t) => (
            <option key={t._id} value={t._id}>
              {t.tournamentName ?? t.courseName} — {t.date}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="mb-4 text-sm text-red-600 bg-red-50 rounded px-3 py-2">
          {error}
        </div>
      )}

      {!selected && (
        <div className="card text-navy/60">
          Pick a tournament to arrange its groups. Drag players between groups to
          re-pair them.
        </div>
      )}

      {selected && loading && <div className="text-navy/50">Loading…</div>}

      {selected && !loading && groups.length === 0 && (
        <div className="card">
          <p className="text-navy/70 mb-3">
            No groups yet for this tournament.
          </p>
          <button className="btn-gold" onClick={generate} disabled={busy}>
            {busy ? "Generating…" : "Generate groups"}
          </button>
        </div>
      )}

      {selected && groups.length > 0 && (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {groups.map((g) => (
            <GroupColumn
              key={g._id}
              group={g}
              onDragStart={(userId) =>
                setDrag({ userId, fromGroup: g.groupName })
              }
              onDropHere={() => onDrop(g.groupName)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function GroupColumn({
  group,
  onDragStart,
  onDropHere,
}: {
  group: TeeGroup;
  onDragStart: (userId: string) => void;
  onDropHere: () => void;
}) {
  const [over, setOver] = useState(false);
  const full = group.players.length >= group.filled + group.remaining;

  return (
    <div
      className={`w-64 shrink-0 rounded-xl border ${
        over ? "border-gold ring-2 ring-gold/40" : "border-gray-200"
      } bg-white`}
      onDragOver={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        onDropHere();
      }}
    >
      <div className="px-4 py-3 bg-navy text-white rounded-t-xl flex items-center justify-between">
        <div>
          <div className="font-semibold text-sm">{group.groupName}</div>
          {group.teeTime && (
            <div className="text-white/60 text-xs">{group.teeTime}</div>
          )}
        </div>
        <span
          className={`text-xs px-2 py-0.5 rounded-full ${
            full ? "bg-red-500/80" : "bg-gold text-navy"
          }`}
        >
          {group.players.length}/{group.players.length + group.remaining}
        </span>
      </div>
      <div className="p-3 min-h-[120px] space-y-2">
        {group.players.map((p: TeePlayer) => (
          <div
            key={playerId(p)}
            draggable
            onDragStart={() => onDragStart(playerId(p))}
            className="rounded-lg border border-gray-200 px-3 py-2 bg-gray-50 hover:bg-gold/10 cursor-grab active:cursor-grabbing flex items-center justify-between"
          >
            <span className="text-sm text-navy">{playerName(p)}</span>
            {p.handicap != null && (
              <span className="text-xs text-navy/50">HCP {p.handicap}</span>
            )}
          </div>
        ))}
        {group.players.length === 0 && (
          <div className="text-center text-navy/40 text-sm py-4">
            Drop players here
          </div>
        )}
      </div>
    </div>
  );
}
