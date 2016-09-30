import { Animal } from './animal';
import { Character, isPlayerCharacter, meterIsActive } from './character';
import * as Map from './map/map';
import * as Cell from './map/cell';
import Game from '../context/game';
import { moveEntity } from './entity';
import * as _ from 'lodash';
import * as Messaging from './messaging';
import describeRoom from './map/describeRoom';
import { reveal } from './map/characterMap';
import * as Inventory from './inventory';
import * as Ingestible from './items/ingestible';

export interface Action {
  actor: Animal;
  timestamp: number;
  key: ComponentKey;
};

export type ValidationResult =  {
  isValid: boolean,
  error?: string
};

export type ComponentKey = 'Move' | 'Pass' | 'Ingest' | 'Rest';

// TODO rename to PerformanceResult
export type PerformResult = {
  log: string[];
  messages: Messaging.Message[];
};

export interface ActionParserComponent<A extends Action> {
  pattern: RegExp;
  parse: (text: string, actor: Animal, timestamp: number) => A;
  validate: (action: A, gameContext: Game) => ValidationResult;
  perform: (action: A, game: Game, log: string[]) => PerformResult;
  componentKey: ComponentKey;
}

export interface MoveAction extends Action {
  // offset prefix shows that these are relative movents (-1|0|1)
  offsetRow: number;
  offsetCol: number;
}

export interface IngestAction extends Action {
  itemName: Ingestible.Name;
}

// nothing special about pass or rest actions
export type PassAction = Action;
export type RestAction = Action;

export const MOVE_COMPONENT: ActionParserComponent<MoveAction> = {
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
    const newPos = {
      row: newR,
      col: newC
    };

    if (!Map.isWithinMap(game.map, newPos)) {
      return {
        isValid: false,
        error: 'Out of bounds movement!'
      };
    } else if (!Cell.isRoom(Map.getCell(game.map, newPos))) {
      return {
        isValid: false,
        error: 'Desired location is not a room!'
      };
    } else {
      return { isValid: true };
    }
  },
  perform(move: MoveAction, game: Game, log: string[]): PerformResult {
    const oldPos = {
      row: move.actor.row,
      col: move.actor.col
    };

    const newPos = {
      row: oldPos.row + move.offsetRow,
      col: oldPos.col + move.offsetCol
    };

    moveEntity(move.actor, newPos);

    const messages = [];

    if (isPlayerCharacter(move.actor)) {
      const player = (move.actor as Character).player;

      log.push(`${player.name} from ${JSON.stringify(oldPos)} to ${JSON.stringify(newPos)}`);

      messages.push(Messaging.createGameMessage('You moved!', [ player ]));

      const newRoom = Map.getCell(game.map, newPos) as Cell.Room;

      messages.push(Messaging.createGameMessage(describeRoom(newRoom, game.map), [ player ]));

      if (Inventory.hasItem(player.character.inventory, 'Map')) {
        reveal(player.character.map, Map.getCell(game.map, newPos));
      }
    }

    return {
      log,
      messages
    };
  },
  componentKey: 'Move'
};

export const PASS_COMPONENT: ActionParserComponent<PassAction> = {
  pattern: /^pass$/i,
  parse(text: string, actor: Animal, timestamp: number) {
    return {
      actor,
      timestamp,
      key: 'Pass'
    };
  },
  validate(passAction: PassAction, game: Game) {
    return { isValid: Boolean(passAction) };
  },
  perform(passAction: Action, game: Game, log: string[]): PerformResult {
    // pass (do nothing!)

    const messages = [];

    if (isPlayerCharacter(passAction.actor)) {
      const player = (passAction.actor as Character).player;

      messages.push(Messaging.createGameMessage('You performed no action.', [player]));
    }

    return {
      log,
      messages
    };
  },
  componentKey: 'Pass'
};

export const REST_COMPONENT: ActionParserComponent<RestAction> = {
  pattern: /^rest$/i,
  parse(text: string, actor: Animal, timestamp: number) {
    return {
      actor,
      timestamp,
      key: 'Rest'
    };
  },
  validate(restAction: RestAction, game: Game): ValidationResult {
    const actor = restAction.actor;
    if (isPlayerCharacter(actor)) {
      const currCell = Map.getCell(game.map, actor);

      if (Cell.isRoom(currCell)) {
        if (currCell.hasCamp) {
          return { isValid: true };
        } else {
          return {
            isValid: false,
            error: 'Cannot rest without camp setup!'
          };
        }
      } else {
        throw new Error('Expected player to be in room!');
      }
    } else {
      return { isValid: true };
    }
  },
  perform(restAction: RestAction, game: Game, log: string[]): PerformResult {
    const messages = [];
    const actor = restAction.actor;

    // TODO: update the actors's stats

    if (isPlayerCharacter(actor)) {
      const wasExhausted = meterIsActive(actor.effects.exhaustion);
      actor.effects.exhaustion.current = actor.effects.exhaustion.maximum;

      if (wasExhausted) {
        messages.push('You rested at the camp.');
      } else {
        messages.push('You rested at the camp and no longer feel exhausted.');
      }
    }

    return {
      log,
      messages
    };
  },
  componentKey: 'Rest'
};

export const INGEST_COMPONENT: ActionParserComponent<IngestAction> = {
  pattern: new RegExp(`^(eat|consume|ingest|use|drink) (${Ingestible.names.join('|')})$`, 'i'),
  parse(text: string, actor: Animal, timestamp: number): IngestAction {
    const matches = text.match(this.pattern);

    if (!matches) {
      return null;
    } else {
      const ingestibleInput = matches[2].toLowerCase();

      if (Ingestible.stringIsAnIngestibleName(ingestibleInput)) {
        return {
          actor,
          timestamp,
          itemName: (ingestibleInput as Ingestible.Name),
          key: 'Ingest'
        };
      } else {
        return null;
      }
    }
  },
  validate(ingestAction: IngestAction, game: Game): ValidationResult {
    const inventory = ingestAction.actor.inventory;

    if (Inventory.hasItem(inventory, ingestAction.itemName)) {
      return {
        isValid: true
      };
    } else {
      return {
        isValid: false,
        error: `Missing ${ ingestAction.itemName } in inventory!`
      };
    }
  },
  perform(ingestAction: IngestAction, game: Game, log: string[]): PerformResult {
    // first remove a single item from the item stack in the inventory

    // then apply the item's stats to the actor

    // then update any effects on the actor

    return null; // TODO
  },
  componentKey: 'Ingest'
};

export interface ActionParserComponentMap<A extends Action> {
  [ componentKey: string ]: ActionParserComponent<A>;
};

export const PARSERS: ActionParserComponentMap<Action> = {
  'Move': MOVE_COMPONENT,
  'Pass': PASS_COMPONENT,
  'Rest': REST_COMPONENT,
  'Ingest': INGEST_COMPONENT
};

export function parseAction(text: string, actor: Animal, timestamp: number): Action {
  const myComponent = getComponentByText(text);

  if (!myComponent) {
    return null;
  }

  return myComponent.parse(text, actor, timestamp);
}

export function getComponentByText<A extends Action>(text: string): ActionParserComponent<Action> {
  return _.find(PARSERS, comp => comp.pattern.test(text));
}

export function getComponentByKey<A extends Action>(key: ComponentKey): ActionParserComponent<Action> {
  return PARSERS[ key ];
}

export function isParsableAction(text: string): boolean {
  return Boolean(getComponentByText(text));
}
