import { canTranslateModern, Character, CharacterClass, Allegiance, CharacterClassName } from './character';
import { Stats } from './stats';
import { Item } from './items/item';
import { toJSON as inventoryToJSON, InventoryJSON } from './inventory';
import { Map } from './map/map';
import { omit, startsWith } from 'lodash';

// TODO: find a way to remove this (as most if not all can be computed from player properties)
export type PlayerState = 'Anon' | 'Preparing' | 'Ready' | 'Playing' | 'Dead' | 'Spectating' | 'Absent';

export interface Player {
  // this is the id of the socket on which the player is connected
  id: string;
  name: string;
  character?: Character;
  state: PlayerState;
}

export interface PlayerRosterJSON {
  name: string;
  state: PlayerState;
  characterClass?: CharacterClassName;
  goldAmount?: number;
  allegiance?: Allegiance;
}

export function createPlayer(id: string, name: string, state: PlayerState, character: Character = null): Player {
  return { id, name, state, character };
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

export type PlayerDetailsJSON = {
  stats: {
    maximum: Stats; // Stats should be inherently 'JSON'
    current: Stats;
  }
  // TODO: modifiers
  // TODO: effects
  // TODO: this is the character's representation of the game's map (the type/interface will likely be different)
  map?: Map;
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
      col: player.character.col
    };
    if (player.character.nextAction) {
      const ts = new Date(player.character.nextAction.timestamp);
      // this could be faulty later with richer/more complex action types
      const otherData = omit(player.character.nextAction, ['key', 'timestamp', 'actor']);
      retObj.character.nextAction = {
        key: player.character.nextAction.key,
        timestamp: ts.toLocaleTimeString(),
        otherData: otherData
      };
    }
  }

  return retObj;
}

export function isApproximateName(chunk: string, name: string): boolean {
  return startsWith(name.toLowerCase(), chunk.toLowerCase());
}

export function rosterData(player: Player): PlayerRosterJSON {
  const ret: PlayerRosterJSON = {
    name: player.name,
    state: player.state
  };

  if (player.character) {
    ret.characterClass = player.character.characterClass.className;
    ret.goldAmount = player.character.goldAmount;
    ret.allegiance = player.character.allegiance;
  }

  return ret;
}

export interface PlayerInfo {
  playerName?: string;
  className?: CharacterClassName;
}

export function getPlayerInfo(player: Player): PlayerInfo {
  const ret = {} as PlayerInfo;

  if (!isAnon(player)) {
    ret.playerName = player.name;
  }

  if (player.character) {
    ret.className = player.character.characterClass.className;
  }

  return ret;
}
