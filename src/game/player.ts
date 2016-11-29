import * as Character from './character';
import { Stats } from './stats';
import { toJSON as inventoryToJSON, InventoryJSON, hasItem } from './inventory';
import { mapToRepresentations } from './map/map';
import { isApproximateSubstring } from '../helpers';
import { omit } from 'lodash';
import { CellRepresentation, Position } from './map/cell';
import * as Animal from './animal';

export type PlayerState = 'Anon' | 'Preparing' | 'Ready' | 'Playing' | 'Dead' | 'Spectating' | 'Absent';

export interface Player {
  // this is the id of the socket on which the player is connected
  id: string;
  name: string | null;
}

export function getPlayerState(player: Player): PlayerState {
  if (isLobbyPlayer(player)) {
    if (player.name === null) {
      return 'Anon';
    } else if (player.isReady) {
      return 'Ready';
    } else {
      return 'Preparing';
    }
  } else if (isGamePlayer(player)) {
    if (player.character.hasEscaped) {
      return 'Spectating';
    } else if (Animal.isAlive(player.character)) {
      return 'Playing';
    } else if (Animal.isDead(player.character)) {
      return 'Dead';
    } else {
      throw new Error(`Unknown PlayerState for GamePlayer: ${JSON.stringify(player)}`);
    }
  } else {
    throw new Error(`Unknown PlayerState for player: ${JSON.stringify(player)}`);
  }
}

export interface LobbyPlayer extends Player {
  primordialCharacter: Character.PrimordialCharacter;
  isReady: boolean;
}

export interface GamePlayer extends Player {
  name: string;
  character: Character.Character;
}

export function isGamePlayer(player: Player): player is GamePlayer {
  return Boolean((player as GamePlayer).character);
}

export function isLobbyPlayer(player: Player): player is LobbyPlayer {
  return Boolean((player as LobbyPlayer).primordialCharacter);
}

export interface PlayerRosterJSON {
  name: string;
  state: PlayerState;
  characterClass?: Character.CharacterClassName;
  goldAmount?: number;
  allegiance?: Character.Allegiance;
  numModifiers?: number;
}

export
  function createPlayer(id: string, name: string): Player {
  return { id, name };
}

export function isAnon(p: Player): boolean {
  return getPlayerState(p) === 'Anon';
}

export function isPreparing(p: Player): boolean {
  return getPlayerState(p) === 'Preparing';
}

export function isReady(p: Player): boolean {
  return getPlayerState(p) === 'Ready';
}

export function isPlaying(p: Player): boolean {
  return getPlayerState(p) === 'Playing';
}

export function isDead(p: Player): boolean {
  return getPlayerState(p) === 'Dead';
}

export function isSpectating(p: Player): boolean {
  return getPlayerState(p) === 'Spectating';
}

export function isAbsent(p: Player): boolean {
  return getPlayerState(p) === 'Absent';
}

export function canCommunicate(p1: GamePlayer, p2: GamePlayer): boolean {
  // two players can always talk if neither of them are playing

  // if both are playing,
  // then they must either be of the same allegiance,
  // or one must have the proper translation skill

  // if only one is playing, they cannot communicate

  if (isPlaying(p1) === isPlaying(p2)) {
    if (isPlaying(p1)) {
      return (p1.character.allegiance === p2.character.allegiance
        || Character.canTranslateModern(p1.character)
        || Character.canTranslateModern(p2.character));
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
  modifiers: Character.ModifierName[],
  effects: Character.CharacterEffects,
  map?: {
    currentPosition: Position,
    grid: CellRepresentation[][]
  };
  gold: number;
  items: InventoryJSON;
};

export function playerDetails(player: GamePlayer): PlayerDetailsJSON {
  const ret: PlayerDetailsJSON = {
    stats: {
      maximum: Character.CLASS_STARTING_STATS[ player.character.characterClass.className ],
      current: player.character.stats
    },
    modifiers: Character.getActiveModifierNames(player.character.modifiers),
    effects: player.character.effects,
    gold: player.character.goldAmount,
    items: inventoryToJSON(player.character.inventory)
  };

  if (hasItem(player.character.inventory, 'Map')) {
    ret.map = {
      currentPosition: {
        row: player.character.row,
        col: player.character.col
      },
      grid: mapToRepresentations(player.character.map)
    };
  }

  return ret;
}

// no interface for this functions return value since it is for debug only
export function debugDetails(player: Player): {} {
  const retObj: any = {};

  retObj.name = player.name;
  retObj.state = getPlayerState(player);

  if (isGamePlayer(player)) {
    retObj.character = {
      row: player.character.row,
      col: player.character.col
    };
    if (player.character.nextAction) {
      const ts = new Date(player.character.nextAction.timestamp);
      // this could be faulty later with richer/more complex action types
      const otherData = omit(player.character.nextAction, [ 'key', 'timestamp', 'actor' ]);
      retObj.character.nextAction = {
        key: player.character.nextAction.key,
        timestamp: ts.toLocaleTimeString(),
        otherData
      };
    }
  }

  return retObj;
}

export function isApproximateName(chunk: string, name: string): boolean {
  return isApproximateSubstring(chunk, name);
}

export function rosterData(player: Player): PlayerRosterJSON {
  let playerName: string;

  if (player.name) {
    playerName = player.name;
  } else {
    playerName = 'Anonymous Player';
  }

  const ret: PlayerRosterJSON = {
    name: playerName,
    state: getPlayerState(player)
  };

  if (isGamePlayer(player)) {
    ret.characterClass = player.character.characterClass.className;
    ret.goldAmount = player.character.goldAmount;
    ret.allegiance = player.character.allegiance;
    ret.numModifiers = Character.getActiveModifierNames(player.character.modifiers).length;
  } else if (isLobbyPlayer(player)) {
    ret.numModifiers = player.primordialCharacter.numModifiers;
    ret.allegiance = player.primordialCharacter.allegiance;
    ret.characterClass = player.primordialCharacter.className;
  } else {
    // do nothing
  }

  return ret;
}

export interface PlayerInfo {
  playerName?: string;
  className?: Character.CharacterClassName;
}

export function getPlayerInfo(player: Player): PlayerInfo {
  const ret = {} as PlayerInfo;

  if (player.name) {
    ret.playerName = player.name;
  }

  if (isGamePlayer(player)) {
    ret.className = player.character.characterClass.className;
  } else if (isLobbyPlayer(player)) {
    const className = player.primordialCharacter.className;

    if (className && className !== 'None') {
      ret.className = className;
    }
  } else {
    // do nothing
  }

  return ret;
}
