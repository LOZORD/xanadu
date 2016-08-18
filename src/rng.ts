export type Seed = number;

export type MinMax = {
  min: number;
  max: number;
};

export interface SeededRNG {
  integer(range: MinMax): number;
  pickone<T>(list: T[]): T;
  pickset<T>(list: T[], n: number): T[];
  shuffle<T>(list: T[]): T[];
  weighted<T>(list: T[], weights: number[]): T;
};
