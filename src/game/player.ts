import { canTranslateModern, Character } from './character';

export type PlayerState = 'Anon' | 'Preparing' | 'Ready' | 'Playing' | 'Dead' | 'Spectating' | 'Absent';

export interface Player {
    id: number,
    name: string,
    character?: Character,
    state: PlayerState
}

export function isAnon(p: Player): boolean {
    return p.state === 'Anon';
}

export function isPreparing(p: Player): boolean {
    return p.state === 'Preparing';
}

export function isReady(p: Player): boolean {
    return p.state === 'Ready';
}

export function isPlaying(p: Player): boolean {
    return p.state === 'Playing';
}

export function isDead(p: Player): boolean {
    return p.state === 'Dead';
}

export function isSpectating(p: Player): boolean {
    return p.state === 'Spectating';
}

export function isAbsent(p: Player): boolean {
    return p.state === 'Absent';
}

export function canCommunicate(p1: Player, p2: Player): boolean {
    // two players can always talk if neither of them are playing

    // if both are playing,
    // then they must either be of the same alliance,
    // or one must have the proper translation skill

    // if only one is playing, they cannot communicate

    if (isPlaying(p1) === isPlaying(p2)) {
        if (isPlaying(p1)) {
            return (p1.character.allegiance === p2.character.allegiance
            || canTranslateModern(p1.character)
            || canTranslateModern(p2.character));
        } else {
            return true;
        }
    } else {
        return false;
    }
}
