import { useEffect, useState, useCallback } from "react";
import { api } from "../api/client";
import {
  type IndoorLeague,
  type LeagueMember,
  type FlightStanding,
  personId,
  personName,
} from "../api/types";

// Column 0 = unassigned; columns 1..N = flights.
type Columns = LeagueMember[][];

export function Flights() {
  const [leagues, setLeagues] = useState<IndoorLeague[]>([]);
  const [selected, setSelected] = useState("");
  const [cols, setCols] = useState<Columns>([[]]);
  const [ineligible, setIneligible] = useState<LeagueMember[]>([]);
  const [standings, setStandings] = useState<FlightStanding[] | null>(null);
  const [drag, setDrag] = useState<{ id: string; from: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api
      .get("/indoor/leagues")
      .then((res) => setLeagues(res.data?.data ?? []));
  }, []);

  const loadLeague = useCallback(async (id: string) => {
    if (!id) return;
    setError(null);
    setStandings(null);
    const res = await api.get(`/indoor/leagues/${id}`);
    const members: LeagueMember[] = res.data?.data?.members ?? [];
    // Established members (3+ rounds) go on the board; others are not yet
    // eligible for a flight (spec §13).
    const established = members.filter((m) => m.roundsPlayed >= 3);
    setIneligible(members.filter((m) => m.roundsPlayed < 3));

    const flightCount = Math.max(
      1,
      ...established.map((m) => m.flight ?? 0),
    );
    const next: Columns = Array.from({ length: flightCount + 1 }, () => []);
    for (const m of established) {
      const col = m.flight && m.flight >= 1 ? m.flight : 0;
      next[col].push(m);
    }
    // keep each flight ordered by stored flightOrder
    next.forEach((c, i) => {
      if (i > 0) c.sort((a, b) => (a.flightOrder ?? 0) - (b.flightOrder ?? 0));
    });
    setCols(next);
  }, []);

  useEffect(() => {
    if (selected) loadLeague(selected);
  }, [selected, loadLeague]);

  const onDrop = (toCol: number) => {
    const info = drag;
    setDrag(null);
    if (!info || info.from === toCol) return;
    setCols((prev) => {
      const next = prev.map((c) => [...c]);
      const idx = next[info.from].findIndex((m) => personId(m.player) === info.id);
      if (idx === -1) return prev;
      const [member] = next[info.from].splice(idx, 1);
      next[toCol].push(member);
      return next;
    });
  };

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      const allocations = cols.flatMap((col, colIdx) =>
        col.map((m, order) => ({
          player: personId(m.player),
          flight: colIdx === 0 ? null : colIdx,
          flightOrder: colIdx === 0 ? null : order,
        })),
      );
      await api.patch(`/indoor/leagues/${selected}/flights`, { allocations });
      await loadLeague(selected);
    } catch (e: unknown) {
      setError(
        (e as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Could not save flights",
      );
    } finally {
      setSaving(false);
    }
  };

  const loadStandings = async () => {
    const res = await api.get(`/indoor/leagues/${selected}/standings`);
    setStandings(res.data?.data ?? []);
  };

  const colTitle = (i: number) => (i === 0 ? "Unassigned" : `Flight ${i}`);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-navy">Flight Management</h1>
        <select
          className="field w-64"
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
        >
          <option value="">Select a league…</option>
          {leagues.map((l) => (
            <option key={l._id} value={l._id}>
              {l.name}
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
          Pick a league to allocate established players (3+ rounds) into flights.
          Drag between columns; order within a flight is the drop order.
        </div>
      )}

      {selected && (
        <>
          <div className="flex gap-2 mb-4">
            <button
              className="btn-outline text-sm"
              onClick={() => setCols((c) => [...c, []])}
            >
              + Add flight
            </button>
            <button className="btn-gold text-sm" onClick={save} disabled={saving}>
              {saving ? "Saving…" : "Save flights"}
            </button>
            <button className="btn-outline text-sm" onClick={loadStandings}>
              View standings
            </button>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-4">
            {cols.map((col, i) => (
              <FlightColumn
                key={i}
                title={colTitle(i)}
                members={col}
                accent={i === 0}
                onDragStart={(id) => setDrag({ id, from: i })}
                onDropHere={() => onDrop(i)}
              />
            ))}
          </div>

          {ineligible.length > 0 && (
            <div className="card mt-4">
              <div className="font-semibold text-navy mb-2">
                Not yet eligible (needs 3 rounds)
              </div>
              <div className="flex flex-wrap gap-2">
                {ineligible.map((m) => (
                  <span
                    key={personId(m.player)}
                    className="text-sm rounded-lg border border-gray-200 px-3 py-1.5 bg-gray-50 text-navy/60"
                  >
                    {personName(m.player)} · {m.roundsPlayed}/3
                  </span>
                ))}
              </div>
            </div>
          )}

          {standings && (
            <div className="card mt-4">
              <div className="font-semibold text-navy mb-3">Standings</div>
              {standings.length === 0 && (
                <div className="text-navy/50 text-sm">No standings yet.</div>
              )}
              {standings.map((f) => (
                <div key={f.flight} className="mb-4">
                  <div className="text-sm font-semibold text-gold-dark mb-1">
                    {f.flight === 0 ? "Unassigned" : `Flight ${f.flight}`}
                  </div>
                  {f.standings.map((s, i) => (
                    <div
                      key={personId(s.player)}
                      className="flex justify-between text-sm text-navy/80 py-1 border-b border-gray-100"
                    >
                      <span>
                        {i + 1}. {personName(s.player)}
                      </span>
                      <span>{s.points} pts</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function FlightColumn({
  title,
  members,
  accent,
  onDragStart,
  onDropHere,
}: {
  title: string;
  members: LeagueMember[];
  accent?: boolean;
  onDragStart: (id: string) => void;
  onDropHere: () => void;
}) {
  const [over, setOver] = useState(false);
  return (
    <div
      className={`w-60 shrink-0 rounded-xl border bg-white ${
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
      <div
        className={`px-4 py-3 rounded-t-xl font-semibold text-sm ${
          accent ? "bg-gray-100 text-navy/70" : "bg-navy text-white"
        }`}
      >
        {title}
      </div>
      <div className="p-3 min-h-[120px] space-y-2">
        {members.map((m, i) => (
          <div
            key={personId(m.player)}
            draggable
            onDragStart={() => onDragStart(personId(m.player))}
            className="rounded-lg border border-gray-200 px-3 py-2 bg-gray-50 hover:bg-gold/10 cursor-grab active:cursor-grabbing flex items-center justify-between"
          >
            <span className="text-sm text-navy">
              {accent ? "" : `${i + 1}. `}
              {personName(m.player)}
            </span>
            {m.indoorHandicap != null && (
              <span className="text-xs text-navy/50">
                {m.indoorHandicap}
              </span>
            )}
          </div>
        ))}
        {members.length === 0 && (
          <div className="text-center text-navy/40 text-sm py-4">Empty</div>
        )}
      </div>
    </div>
  );
}
