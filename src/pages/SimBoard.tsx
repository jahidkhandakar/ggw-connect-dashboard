import { useEffect, useState, useCallback } from "react";
import { api } from "../api/client";
import {
  type SimSession,
  type SimPerson,
  personId,
  personName,
} from "../api/types";

interface Drag {
  playerId: string;
  from: number; // bay index, or -1 for the unassigned tray
}

export function SimBoard() {
  const [sessions, setSessions] = useState<SimSession[]>([]);
  const [selected, setSelected] = useState<string>("");
  const [session, setSession] = useState<SimSession | null>(null);
  const [drag, setDrag] = useState<Drag | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const loadSessions = useCallback(async () => {
    const res = await api.get("/indoor/sessions");
    setSessions(res.data?.data ?? []);
  }, []);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  const loadSession = useCallback(async (id: string) => {
    if (!id) return setSession(null);
    const res = await api.get(`/indoor/sessions/${id}`);
    setSession(res.data?.data ?? null);
  }, []);

  useEffect(() => {
    loadSession(selected);
  }, [selected, loadSession]);

  const perBayCap = session
    ? session.hoursPerSim + (session.allowExtraPerSim ? 1 : 0)
    : 0;

  const baysPlayers = (i: number): SimPerson[] =>
    session?.bays.find((b) => b.bayIndex === i)?.players ?? [];

  const assignedIds = new Set(
    session?.bays.flatMap((b) => b.players.map(personId)) ?? [],
  );
  const unassigned = (session?.roster ?? []).filter(
    (p) => !assignedIds.has(personId(p)),
  );

  const assign = async (player: string, bayIndex: number) => {
    if (!session) return;
    try {
      await api.patch(`/indoor/sessions/${session._id}/assign-bay`, {
        player,
        bayIndex,
      });
      await loadSession(session._id);
    } catch (e: unknown) {
      setError(
        (e as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Could not move player",
      );
    }
  };

  const onDrop = (toBay: number) => {
    const info = drag;
    setDrag(null);
    if (!info || info.from === toBay) return;
    assign(info.playerId, toBay);
  };

  const addPlayer = async () => {
    const id = prompt("Add player by user ID:")?.trim();
    if (id) await assign(id, -1); // -1 → unassigned pool
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-navy">Sim Board</h1>
        <div className="flex gap-2">
          <select
            className="field w-64"
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
          >
            <option value="">Select a session…</option>
            {sessions.map((s) => (
              <option key={s._id} value={s._id}>
                {s.title} {s.isSocialRound ? "· Social" : ""}
              </option>
            ))}
          </select>
          <button className="btn-outline text-sm" onClick={() => setShowCreate((v) => !v)}>
            + New session
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 text-sm text-red-600 bg-red-50 rounded px-3 py-2">
          {error}
        </div>
      )}

      {showCreate && (
        <CreateSession
          onCreated={async (id) => {
            setShowCreate(false);
            await loadSessions();
            setSelected(id);
          }}
        />
      )}

      {!selected && !showCreate && (
        <div className="card text-navy/60">
          Pick a session, or create one. Drag players into bays — no self-pairing,
          the creator arranges the board.
        </div>
      )}

      {session && (
        <>
          <div className="text-sm text-navy/60 mb-3">
            {session.sims} sims · up to {perBayCap} per bay
            {session.isSocialRound ? " · Sim Social Round" : ""}
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4">
            {Array.from({ length: session.sims }, (_, i) => (
              <BayColumn
                key={i}
                index={i}
                players={baysPlayers(i)}
                capacity={perBayCap}
                onDragStart={(pid) => setDrag({ playerId: pid, from: i })}
                onDropHere={() => onDrop(i)}
              />
            ))}
          </div>

          <div
            className="card mt-4"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              onDrop(-1);
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="font-semibold text-navy">
                Unassigned ({unassigned.length})
              </div>
              <button className="btn-outline text-xs py-1" onClick={addPlayer}>
                + Add player
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {unassigned.map((p) => (
                <PlayerChip
                  key={personId(p)}
                  label={personName(p)}
                  onDragStart={() =>
                    setDrag({ playerId: personId(p), from: -1 })
                  }
                />
              ))}
              {unassigned.length === 0 && (
                <span className="text-sm text-navy/40">Everyone has a bay.</span>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function BayColumn({
  index,
  players,
  capacity,
  onDragStart,
  onDropHere,
}: {
  index: number;
  players: SimPerson[];
  capacity: number;
  onDragStart: (playerId: string) => void;
  onDropHere: () => void;
}) {
  const [over, setOver] = useState(false);
  const full = players.length >= capacity;
  return (
    <div
      className={`w-56 shrink-0 rounded-xl border bg-white ${
        over ? "border-gold ring-2 ring-gold/40" : "border-gray-200"
      }`}
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
        <span className="font-semibold text-sm">Bay {index + 1}</span>
        <span
          className={`text-xs px-2 py-0.5 rounded-full ${
            full ? "bg-red-500/80" : "bg-gold text-navy"
          }`}
        >
          {players.length}/{capacity}
        </span>
      </div>
      <div className="p-3 min-h-[120px] space-y-2">
        {players.map((p) => (
          <PlayerChip
            key={personId(p)}
            label={personName(p)}
            block
            onDragStart={() => onDragStart(personId(p))}
          />
        ))}
        {players.length === 0 && (
          <div className="text-center text-navy/40 text-sm py-4">Empty</div>
        )}
      </div>
    </div>
  );
}

function PlayerChip({
  label,
  onDragStart,
  block,
}: {
  label: string;
  onDragStart: () => void;
  block?: boolean;
}) {
  return (
    <div
      draggable
      onDragStart={onDragStart}
      className={`${
        block ? "block" : "inline-block"
      } rounded-lg border border-gray-200 px-3 py-2 bg-gray-50 hover:bg-gold/10 cursor-grab active:cursor-grabbing text-sm text-navy`}
    >
      {label}
    </div>
  );
}

function CreateSession({ onCreated }: { onCreated: (id: string) => void }) {
  const [title, setTitle] = useState("Sim Social Round");
  const [sims, setSims] = useState(2);
  const [hoursPerSim, setHours] = useState(4);
  const [allowExtraPerSim, setExtra] = useState(false);
  const [isSocialRound, setSocial] = useState(true);
  const [busy, setBusy] = useState(false);

  const create = async () => {
    setBusy(true);
    try {
      const res = await api.post("/indoor/sessions", {
        title,
        sims,
        hoursPerSim,
        allowExtraPerSim,
        isSocialRound,
        roster: [],
      });
      onCreated(res.data?.data?._id);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="card mb-4 grid grid-cols-2 gap-4 max-w-2xl">
      <div className="col-span-2">
        <label className="label">Session title</label>
        <input className="field" value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>
      <div>
        <label className="label">Simulators</label>
        <input className="field" type="number" value={sims} onChange={(e) => setSims(Number(e.target.value))} />
      </div>
      <div>
        <label className="label">Hours per sim</label>
        <input className="field" type="number" value={hoursPerSim} onChange={(e) => setHours(Number(e.target.value))} />
      </div>
      <label className="flex items-center gap-2 text-sm text-navy/80">
        <input type="checkbox" checked={allowExtraPerSim} onChange={(e) => setExtra(e.target.checked)} />
        Allow one extra per sim
      </label>
      <label className="flex items-center gap-2 text-sm text-navy/80">
        <input type="checkbox" checked={isSocialRound} onChange={(e) => setSocial(e.target.checked)} />
        Sim Social Round
      </label>
      <div className="col-span-2">
        <button className="btn-gold" onClick={create} disabled={busy}>
          {busy ? "Creating…" : "Create session"}
        </button>
      </div>
    </div>
  );
}
