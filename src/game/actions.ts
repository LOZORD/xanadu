import { Animal } from './animal';
import { Map, isWithinMap } from './map/map';
import Game from '../context/game';
import * as _ from 'lodash';

export interface Action {
  actor: Animal;
  timestamp: number;
  text: string; // what is this used for?
}

// TODO: Option type
export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export interface ActionParserComponent<A extends Action> {
  pattern: RegExp;
  parse: (text: string, actor: Animal, timestamp: number) => A;
  validate: (action: A, gameContext: Game) => ValidationResult;
}

export interface MoveAction extends Action {
  // offset prefix shows that these are relative movents (-1|0|1)
  offsetRow: number;
  offsetCol: number;
}

export const MoveComponent: ActionParserComponent<MoveAction> = {
  pattern: /^go (north|south|east|west)$/i,
  parse(text: string, actor: Animal, timestamp: number): MoveAction {
    const matches = text.match(this.pattern);

    if (!matches) {
      return null;
    } else {
      const dir = matches[1].toLowerCase();

      const ret: MoveAction = {
        actor,
        timestamp,
        text: 'move',
        offsetRow: 0,
        offsetCol: 0
      };

      if (dir === 'north') {
        ret.offsetRow = -1;
      } else if (dir === 'south') {
        ret.offsetRow = 1;
      } else if (dir === 'west') {
        ret.offsetCol = -1;
      } else if (dir === 'east') {
        ret.offsetCol = 1;
      } else {
        return null;
      }

      return ret;
    }
  },
  validate(move: MoveAction, game: Game) {
    const newR = move.actor.row + move.offsetRow;
    const newC = move.actor.col + move.offsetCol;

    if (!isWithinMap(game.map, newR, newC)) {
      return {
        isValid: false,
        error: 'Out of bounds movement!'
      };
    } else if (!game.map.grid[newR][newC].room) {
      return {
        isValid: false,
        error: 'Desired location is not a room!'
      };
    } else {
      return { isValid: true };
    }
  }
};

export const Parsers: ActionParserComponent<Action>[] = [
  MoveComponent
];

export function parseAction(text: string, actor: Animal, timestamp: number): Action {
  const myComponent = getComponent(text);

  if (!myComponent) {
    return null;
  }

  return myComponent.parse(text, actor, timestamp);
}

export function getComponent<A extends Action>(text: string): ActionParserComponent<Action> {
  return _.find(Parsers, comp => comp.pattern.test(text));
}

export function isParsableAction(text: string): boolean {
  return Boolean(getComponent(text));
}
