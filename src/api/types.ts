// Shared shapes mirroring the backend contest/tournament model.

export type PayoutMode = "poolSplit" | "carryover";

export interface ContestConfig {
  holePars: number[];
  scoringFormat?: "gross" | "net";
  kpHoles: number[];
  longDriveHoles: number[];
  payoutMode: PayoutMode;
  skinsPot: number;
  kpPot: number;
  longDrivePot: number;
  useCategories: boolean;
  skinsDeductMidPercent: number;
  skinsDeductPlusPercent: number;
  kpLiveEnabled: boolean;
  guestsInSideGames: boolean;
}

export interface Tournament {
  _id?: string;
  tournamentName?: string;
  tournamentType?: string;
  typeName: "big" | "small";
  date: string;
  time: string;
  city: string;
  courseName: string;
  country?: string;
  courseRating: number;
  slopeRating: number;
  numberOfPlayers: number;
  gaggleLength?: number;
  handicapFromRange?: number;
  handicapToRange?: number;
  showAmounts?: boolean;
  contestConfig?: ContestConfig;
  status?: string;
}

// ── Tee sheet ──────────────────────────────────────────────────────────────
export interface TeePlayer {
  user: { _id: string; name?: string; email?: string; image?: string } | string;
  handicap?: number;
}

export interface TeeGroup {
  _id: string;
  groupName: string;
  groupIndex?: number;
  teeDate?: string;
  teeTime?: string;
  players: TeePlayer[];
  filled: number;
  remaining: number;
  isFull: boolean;
}

export const playerId = (p: TeePlayer): string =>
  typeof p.user === "string" ? p.user : p.user._id;

export const playerName = (p: TeePlayer): string =>
  typeof p.user === "string" ? p.user : (p.user.name ?? p.user.email ?? "Player");

// ── Indoor sim sessions ──────────────────────────────────────────────────
export type SimPerson = { _id: string; name?: string; image?: string } | string;

export interface SimBay {
  bayIndex: number;
  players: SimPerson[];
}

export interface SimSession {
  _id: string;
  title: string;
  isSocialRound: boolean;
  sims: number;
  hoursPerSim: number;
  allowExtraPerSim: boolean;
  roster: SimPerson[];
  bays: SimBay[];
}

export const personId = (p: SimPerson): string =>
  typeof p === "string" ? p : p._id;

export const personName = (p: SimPerson): string =>
  typeof p === "string" ? p : (p.name ?? "Player");

// ── Indoor leagues + flights ─────────────────────────────────────────────
export interface LeagueMember {
  _id: string;
  player: SimPerson;
  indoorHandicap?: number | null;
  roundsPlayed: number;
  flight?: number | null;
  flightOrder?: number | null;
  points?: number;
}

export interface IndoorLeague {
  _id: string;
  name: string;
  facilityName: string;
  totalRounds: number;
}

export interface LeagueDetail {
  league: IndoorLeague;
  capacity: number;
  entryOpen: boolean;
  members: LeagueMember[];
}

export interface FlightStanding {
  flight: number;
  standings: {
    player: SimPerson;
    indoorHandicap?: number | null;
    points: number;
  }[];
}

// ── Private clubs + member slots ─────────────────────────────────────────
export interface CreatorClub {
  _id: string;
  name?: string;
  isPrivate?: boolean;
}

export interface MemberSlot {
  _id: string;
  displayName: string;
  accessCode: string;
  redeemed: boolean;
  createdAt?: string;
}

export const DEFAULT_PARS = [
  4, 4, 3, 5, 4, 4, 3, 4, 5, 4, 3, 4, 5, 4, 4, 3, 4, 5,
];

export const emptyContestConfig = (): ContestConfig => ({
  holePars: [...DEFAULT_PARS],
  scoringFormat: "gross",
  kpHoles: [],
  longDriveHoles: [],
  payoutMode: "poolSplit",
  skinsPot: 0,
  kpPot: 0,
  longDrivePot: 0,
  useCategories: false,
  skinsDeductMidPercent: 0,
  skinsDeductPlusPercent: 0,
  kpLiveEnabled: true,
  guestsInSideGames: false,
});
