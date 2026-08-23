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
