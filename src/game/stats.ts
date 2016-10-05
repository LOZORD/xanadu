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

export function changeStats(stats: Stats, changes: PartialStats): Stats {
    ['health', 'strength', 'intelligence', 'agility'].map(s => {
        if (changes[s]) {
            stats[s] += changes[s];
        }
    });

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
