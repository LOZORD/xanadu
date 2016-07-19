import { canTranslateModern, Character } from './character';
import { Stats } from './stats';
import { Item } from './items/item';
import { toJSON as inventoryToJSON, InventoryJSON } from './inventory';

export type PlayerState = 'Anon' | 'Preparing' | 'Ready' | 'Playing' | 'Dead' | 'Spectating' | 'Absent';

export interface Player {
  // this is the id of the socket on which the player is connected
  id: string;
  name: string;
  character?: Character;
  state: PlayerState;
}

// TODO: implement a `createPlayer` function

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

export type PlayerDetailsJSON = {
  stats: {
    maximum: Stats; // Stats should be inherently 'JSON'
    current: Stats;
  }
  // TODO: modifiers
  // TODO: effects
  // TODO: (character's representation of the) map
  gold: number;
  items: InventoryJSON;
};

export function playerDetails(player: Player): PlayerDetailsJSON {
  return {
    stats: {
      maximum: player.character.characterClass.startingStats,
      current: player.character.stats
    },
    gold: player.character.goldAmount,
    items: inventoryToJSON(player.character.inventory)
  };
}

// no interface for this functions return value since it is for debug only
export function debugDetails(player: Player): {} {
  const retObj: any = {};

  retObj.name = player.name;
  retObj.state = player.state;

  if (player.character) {
    retObj.character = {
      row: player.character.row,
      col: player.character.col,
      nextAction: player.character.nextAction
    };
  }

  return retObj;
}
