import { Action } from './actions';
import { MoveableEntity } from './entity';
import { Inventory } from './inventory';
import { Stats } from './stats';
import Game from '../context/game';

export interface Animal extends MoveableEntity {
  stats: Stats;
  inventory: Inventory;
  nextAction: Action;
  // effects: {
  //   isPoisoned: boolean,
  //   isImmortal: boolean,
  //   isAddicted: boolean,
  //   isRested: boolean
  // }
}

// XXX: might want to move this to Character instead?
export interface Effect {
  statChange: Stats;
}

export interface EffectWithInitialChange extends Effect {
  initialChange: Stats;
}

export interface PermanentEffect extends Effect {
  turnReactivation: {
    maximum: number;
    current: number;
  };
}

export interface TemporaryEffect extends Effect {
  turnsUntilRemoved: number;
}

export const POISONED: Effect = {
  statChange: {
    health: -5,
    agility: -1,
    intelligence: 0,
    strength: -1
  }
};

export const IMMORTAL: Effect = {
  statChange: {
    health: Infinity,
    agility: Infinity,
    intelligence: Infinity,
    strength: Infinity
  }
};

export const ADDICTED: PermanentEffect = {
  statChange: {
    health: 0,
    agility: -1,
    intelligence: -1,
    strength: -5
  },
  turnReactivation: {
    maximum: 10,
    current: 10
  }
};

export const RESTED: TemporaryEffect & EffectWithInitialChange = {
  statChange: {
    health: 0,
    intelligence: 0,
    agility: 0,
    strength: 0
  },
  initialChange: {
    health: 10,
    strength: 10,
    agility: 10,
    intelligence: 10
  },
  turnsUntilRemoved: 10
};

// TODO: TIRED, HUNGRY, others?

export function updateAnimal(game: Game, animal: Animal): string {
  // TODO
  return null;
}
