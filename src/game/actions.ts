import { Animal } from './animal';
import { Map, isWithinMap } from './map/map';
import Game from '../context/game';
import { moveEntity } from './entity';
import * as _ from 'lodash';

export interface Action {
  actor: Animal;
  timestamp: number;
  key: ComponentKey;
}

// TODO: Option type
export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export type ComponentKey = 'Move' | 'Pass';

export interface ActionParserComponent<A extends Action> {
  pattern: RegExp;
  parse: (text: string, actor: Animal, timestamp: number) => A;
  validate: (action: A, gameContext: Game) => ValidationResult;
  perform: (action: A, game: Game, log: string[]) => string[];
  componentKey: ComponentKey;
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
      const dir = matches[ 1 ].toLowerCase();

      const ret: MoveAction = {
        actor,
        timestamp,
        offsetRow: 0,
        offsetCol: 0,
        key: 'Move'
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
    } else if (!game.map.grid[ newR ][ newC ].room) {
      return {
        isValid: false,
        error: 'Desired location is not a room!'
      };
    } else {
      return { isValid: true };
    }
  },
  perform(move: MoveAction, game: Game, log: string[]): string[] {
    const newPos = {
      row: move.actor.row + move.offsetRow,
      col: move.actor.col + move.offsetCol
    };

    moveEntity(move.actor, newPos);

    // TODO: get movement and room description

    return log;
  },
  componentKey: 'Move'
};

export const PassComponent: ActionParserComponent<Action> = {
  pattern: /^pass$/i,
  parse(text: string, actor: Animal, timestamp: number) {
    return {
      actor,
      timestamp,
      key: 'Pass'
    };
  },
  validate() {
    return { isValid: true };
  },
  perform(passAction: Action, game: Game, log: string[]): string[] {
    // pass (do nothing!)
    return log;
  },
  componentKey: 'Pass'
};

export interface ActionParserComponentMap<A extends Action> {
  [ componentKey: string ]: ActionParserComponent<A>;
};

export const Parsers: ActionParserComponentMap<Action> = {
  'Move': MoveComponent
};

export function parseAction(text: string, actor: Animal, timestamp: number): Action {
  const myComponent = getComponentByText(text);

  if (!myComponent) {
    return null;
  }

  return myComponent.parse(text, actor, timestamp);
}

export function getComponentByText<A extends Action>(text: string): ActionParserComponent<Action> {
  return _.find(Parsers, comp => comp.pattern.test(text));
}

export function getComponentByKey<A extends Action>(key: ComponentKey): ActionParserComponent<Action> {
  return Parsers[ key ];
}

export function isParsableAction(text: string): boolean {
  return Boolean(getComponentByText(text));
}
