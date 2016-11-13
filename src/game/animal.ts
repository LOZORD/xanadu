import { Action } from './actions';
import { MoveableEntity } from './entity';
import { Inventory } from './inventory';
import { Stats } from './stats';

export interface Animal extends MoveableEntity {
  stats: Stats;
  inventory: Inventory;
  nextAction: Action | null;
}

export function isAlive(animal: Animal): boolean {
  return animal.stats.health > 0;
}

export function hasNextAction(actor: Animal): boolean {
  return actor.nextAction !== null;
}
