import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { emptyContestConfig, type ContestConfig } from "../api/types";

const holeList = (s: string): number[] =>
  s
    .split(",")
    .map((x) => parseInt(x.trim(), 10))
    .filter((n) => !Number.isNaN(n) && n >= 1 && n <= 18);

export function CreateTournament() {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Event basics
  const [typeName, setTypeName] = useState<"big" | "small">("small");
  const [tournamentName, setTournamentName] = useState("");
  const [tournamentType, setTournamentType] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [city, setCity] = useState("");
  const [courseName, setCourseName] = useState("");
  const [country, setCountry] = useState("US");
  const [courseRating, setCourseRating] = useState(72);
  const [slopeRating, setSlopeRating] = useState(113);
  const [numberOfPlayers, setNumberOfPlayers] = useState(16);
  const [gaggleLength, setGaggleLength] = useState(4);
  const [handicapFrom, setHandicapFrom] = useState(0);
  const [handicapTo, setHandicapTo] = useState(36);
  const [showAmounts, setShowAmounts] = useState(false);

  // Side games
  const [sideGames, setSideGames] = useState(false);
  const [cfg, setCfg] = useState<ContestConfig>(emptyContestConfig());
  const [kpHolesStr, setKpHolesStr] = useState("3, 7, 11, 16");
  const [ldHolesStr, setLdHolesStr] = useState("");

  const set = <K extends keyof ContestConfig>(k: K, v: ContestConfig[K]) =>
    setCfg((c) => ({ ...c, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const contestConfig: ContestConfig | undefined = sideGames
        ? {
            ...cfg,
            kpHoles: holeList(kpHolesStr),
            longDriveHoles: holeList(ldHolesStr),
          }
        : undefined;

      const body = {
        typeName,
        tournamentName: tournamentName || undefined,
        tournamentType: tournamentType || undefined,
        date,
        time,
        city,
        courseName,
        country,
        courseRating: Number(courseRating),
        slopeRating: Number(slopeRating),
        numberOfPlayers: Number(numberOfPlayers),
        ...(typeName === "big" ? { gaggleLength: Number(gaggleLength) } : {}),
        ...(typeName === "small"
          ? {
              handicapFromRange: Number(handicapFrom),
              handicapToRange: Number(handicapTo),
            }
          : {}),
        showAmounts,
        contestConfig,
      };

      await api.post("/tournament/create", body);
      navigate("/tournaments");
    } catch (err: unknown) {
      setError(
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Could not create tournament",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="max-w-3xl">
      <h1 className="text-2xl font-bold text-navy mb-5">Create Tournament</h1>
      {error && (
        <div className="mb-4 text-sm text-red-600 bg-red-50 rounded px-3 py-2">
          {error}
        </div>
      )}

      <div className="card mb-4">
        <h2 className="font-semibold text-navy mb-3">Event</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Type</label>
            <select
              className="field"
              value={typeName}
              onChange={(e) => setTypeName(e.target.value as "big" | "small")}
            >
              <option value="small">Small</option>
              <option value="big">Big (club)</option>
            </select>
          </div>
          <div>
            <label className="label">Tournament name</label>
            <input
              className="field"
              value={tournamentName}
              onChange={(e) => setTournamentName(e.target.value)}
            />
          </div>
          {typeName === "small" && (
            <div>
              <label className="label">Format</label>
              <input
                className="field"
                value={tournamentType}
                onChange={(e) => setTournamentType(e.target.value)}
                placeholder="e.g. Stroke play"
              />
            </div>
          )}
          <div>
            <label className="label">Date</label>
            <input
              className="field"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="label">Time</label>
            <input
              className="field"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="label">City</label>
            <input
              className="field"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="label">Course</label>
            <input
              className="field"
              value={courseName}
              onChange={(e) => setCourseName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="label">Country (ISO-2, for payout cap)</label>
            <input
              className="field"
              value={country}
              onChange={(e) => setCountry(e.target.value.toUpperCase())}
              maxLength={2}
            />
          </div>
          <div>
            <label className="label">Course rating</label>
            <input
              className="field"
              type="number"
              step="0.1"
              value={courseRating}
              onChange={(e) => setCourseRating(Number(e.target.value))}
            />
          </div>
          <div>
            <label className="label">Slope rating</label>
            <input
              className="field"
              type="number"
              value={slopeRating}
              onChange={(e) => setSlopeRating(Number(e.target.value))}
            />
          </div>
          <div>
            <label className="label">Players</label>
            <input
              className="field"
              type="number"
              value={numberOfPlayers}
              onChange={(e) => setNumberOfPlayers(Number(e.target.value))}
            />
          </div>
          {typeName === "big" ? (
            <div>
              <label className="label">Gaggle length</label>
              <input
                className="field"
                type="number"
                value={gaggleLength}
                onChange={(e) => setGaggleLength(Number(e.target.value))}
              />
            </div>
          ) : (
            <>
              <div>
                <label className="label">Handicap from</label>
                <input
                  className="field"
                  type="number"
                  value={handicapFrom}
                  onChange={(e) => setHandicapFrom(Number(e.target.value))}
                />
              </div>
              <div>
                <label className="label">Handicap to</label>
                <input
                  className="field"
                  type="number"
                  value={handicapTo}
                  onChange={(e) => setHandicapTo(Number(e.target.value))}
                />
              </div>
            </>
          )}
        </div>
      </div>

      <div className="card mb-4">
        <label className="flex items-center gap-2 font-semibold text-navy">
          <input
            type="checkbox"
            checked={sideGames}
            onChange={(e) => setSideGames(e.target.checked)}
          />
          Configure side games (skins, KP, long drive)
        </label>

        {sideGames && (
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <label className="label">Scoring format</label>
              <select
                className="field"
                value={cfg.scoringFormat}
                onChange={(e) =>
                  set("scoringFormat", e.target.value as "gross" | "net")
                }
              >
                <option value="gross">Gross</option>
                <option value="net">Net</option>
              </select>
            </div>
            <div>
              <label className="label">Payout mode</label>
              <select
                className="field"
                value={cfg.payoutMode}
                onChange={(e) =>
                  set("payoutMode", e.target.value as ContestConfig["payoutMode"])
                }
              >
                <option value="poolSplit">Pool split</option>
                <option value="carryover">Carryover</option>
              </select>
            </div>
            <div>
              <label className="label">Skins pot</label>
              <input
                className="field"
                type="number"
                value={cfg.skinsPot}
                onChange={(e) => set("skinsPot", Number(e.target.value))}
              />
            </div>
            <div>
              <label className="label">KP pot</label>
              <input
                className="field"
                type="number"
                value={cfg.kpPot}
                onChange={(e) => set("kpPot", Number(e.target.value))}
              />
            </div>
            <div>
              <label className="label">KP holes (comma-separated)</label>
              <input
                className="field"
                value={kpHolesStr}
                onChange={(e) => setKpHolesStr(e.target.value)}
              />
            </div>
            <div>
              <label className="label">Long-drive holes</label>
              <input
                className="field"
                value={ldHolesStr}
                onChange={(e) => setLdHolesStr(e.target.value)}
              />
            </div>
            <div>
              <label className="label">Skins deduction — mid band %</label>
              <input
                className="field"
                type="number"
                value={cfg.skinsDeductMidPercent}
                onChange={(e) =>
                  set("skinsDeductMidPercent", Number(e.target.value))
                }
              />
            </div>
            <div>
              <label className="label">Skins deduction — plus band %</label>
              <input
                className="field"
                type="number"
                value={cfg.skinsDeductPlusPercent}
                onChange={(e) =>
                  set("skinsDeductPlusPercent", Number(e.target.value))
                }
              />
            </div>
            <label className="flex items-center gap-2 text-sm text-navy/80">
              <input
                type="checkbox"
                checked={cfg.kpLiveEnabled}
                onChange={(e) => set("kpLiveEnabled", e.target.checked)}
              />
              KP Live (on-course camera measuring)
            </label>
            <label className="flex items-center gap-2 text-sm text-navy/80">
              <input
                type="checkbox"
                checked={cfg.guestsInSideGames}
                onChange={(e) => set("guestsInSideGames", e.target.checked)}
              />
              Guests compete in side games
            </label>
          </div>
        )}
      </div>

      <div className="card mb-4">
        <label className="flex items-center gap-2 text-sm text-navy/80">
          <input
            type="checkbox"
            checked={showAmounts}
            onChange={(e) => setShowAmounts(e.target.checked)}
          />
          Show dollar amounts in the app (off by default; hidden over the country
          cap regardless)
        </label>
      </div>

      <div className="flex gap-3">
        <button className="btn-gold" disabled={saving}>
          {saving ? "Creating…" : "Create Tournament"}
        </button>
        <button
          type="button"
          className="btn-outline"
          onClick={() => navigate("/tournaments")}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
