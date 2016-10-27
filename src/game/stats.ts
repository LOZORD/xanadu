import * as _ from 'lodash';

export interface Stats {
  health: number;
  strength: number;
  intelligence: number;
  agility: number;
}

export interface PartialStats {
  health?: number;
  strength?: number;
  intelligence?: number;
  agility?: number;
}

export function partialStatsToCompleteStats(partial: PartialStats): Stats {
  const ret: Stats = {
    health: 0,
    strength: 0,
    intelligence: 0,
    agility: 0
  };

  if (partial.health !== undefined && _.isFinite(partial.health)) {
    ret.health = partial.health;
  }

  if (partial.intelligence !== undefined && _.isFinite(partial.intelligence)) {
    ret.intelligence = partial.intelligence;
  }

  if (partial.strength !== undefined && _.isFinite(partial.strength)) {
    ret.strength = partial.strength;
  }

  if (partial.agility !== undefined && _.isFinite(partial.agility)) {
    ret.agility = partial.agility;
  }

  return ret;
}

export function changeStats(
  stats: Stats, changes: PartialStats,
  min: Stats = { health: 0, agility: 0, intelligence: 0, strength: 0 },
  max: Stats = { health: Infinity, agility: Infinity, intelligence: Infinity, strength: Infinity }
): Stats {
  const completeChange = partialStatsToCompleteStats(changes);

  stats.health = _.clamp(
    stats.health + completeChange.health, min.health, max.health
  );
  stats.strength = _.clamp(
    stats.strength + completeChange.strength, min.strength, max.strength
  );
  stats.intelligence = _.clamp(
    stats.intelligence + completeChange.intelligence, min.intelligence, max.intelligence
  );
  stats.agility = _.clamp(
    stats.agility + completeChange.agility, min.agility, max.agility
  );

  return stats;
}

export function meetsRequirements(stats: Stats, requirements: PartialStats): boolean {
  return _.every([
    requirements.health ? stats.health >= requirements.health : true,
    requirements.strength ? stats.strength >= requirements.strength : true,
    requirements.intelligence ? stats.intelligence >= requirements.intelligence : true,
    requirements.agility ? stats.agility >= requirements.agility : true
  ]);
}
