import { Item } from './item';
import { PartialStats } from '../stats';
import { extend, find } from 'lodash';

export type FoodName = 'Raw Meat' | 'Cooked Meat' | 'Stew' | 'Honeydew' |
  'Cave Leaf' | 'Nightshade' | 'Dark Poppy';

export type DrinkName = 'Water' | 'Alph Water' | 'Alcohol';

export type MedicineName = 'Morphine' | 'Opium' | 'Medical Kit' | 'Poison Antidote';

export type Name = FoodName | DrinkName | MedicineName;

export const names = [ 'Raw Meat', 'Cooked Meat', 'Stew', 'Honeydew',
  'Cave Leaf', 'Nightshade', 'Dark Poppy', 'Water', 'Alph Water', 'Alcohol',
  'Morphine', 'Opium', 'Medical Kit', 'Poison Antidote' ].sort();

export function stringIsAnIngestibleName(str: string): str is Name {
  return Boolean(stringToIngestibleName(str));
}

export function stringToIngestibleName(str: string): Name {
  const loStr = str.toLowerCase();
  return find(names, (name) => name.toLowerCase() === loStr) as Name;
}

// TODO: Use Maybe type for addiction relief?
// XXX: consider renaming `Ingestible` to `Consumable`?
export interface Ingestible extends Item {
  addictionRelief: number; // the number of turns that the ingestible relieves addiction effects
  hungerRelief: number; // similar for hunger
  exhaustionRelief: number; // similar for exhaustion
  isPoisoned: boolean;
  isAddictive: boolean;
  givesImmortality: boolean;
  curesPoisoning: boolean;
  stats: PartialStats;
}

export function itemIsIngestible(item: Item): item is Ingestible {
  return [ 'addictionRelief', 'hungerRelief', 'exhaustionRelief', 'isPoisoned',
    'isAddictive', 'givesImmortality', 'stats' ].every(
    (prop) => item.hasOwnProperty(prop));
}

export function poison(ingestible: Ingestible): Ingestible {
  return extend({}, ingestible, { isPoisoned: true }) as Ingestible;
}

export function unpoison(ingestible: Ingestible): Ingestible {
  return extend({}, ingestible, { isPoisoned: false }) as Ingestible;
}

export interface Food extends Ingestible {
  name: FoodName;
}

export const RAW_MEAT: Food = {
  name: 'Raw Meat',
  addictionRelief: 0,
  isAddictive: false,
  isPoisoned: false,
  givesImmortality: false,
  stats: {
    health: 10,
    strength: 10
  },
  hungerRelief: 10,
  exhaustionRelief: 0,
  curesPoisoning: false
};

export const COOKED_MEAT: Food = {
  name: 'Cooked Meat',
  addictionRelief: 0,
  isAddictive: false,
  isPoisoned: false,
  givesImmortality: false,
  stats: {
    health: 20,
    strength: 20,
    intelligence: 20
  },
  hungerRelief: 25,
  exhaustionRelief: 0,
  curesPoisoning: false
};

export const STEW: Food = {
  name: 'Stew',
  addictionRelief: 0,
  isAddictive: false,
  isPoisoned: false,
  givesImmortality: false,
  stats: {
    health: 50,
    strength: 50,
    intelligence: 50,
    agility: 50
  },
  hungerRelief: 50,
  exhaustionRelief: 0,
  curesPoisoning: false
};

export const HONEYDEW: Food = {
  name: 'Honeydew',
  addictionRelief: 0,
  isAddictive: false,
  isPoisoned: false,
  givesImmortality: false,
  stats: {
    health: 50,
    strength: 50,
    intelligence: 50,
    agility: 50
  },
  hungerRelief: 100,
  exhaustionRelief: 100,
  curesPoisoning: true
};

export const CAVE_LEAF: Food = {
  name: 'Cave Leaf',
  addictionRelief: 5,
  isAddictive: false,
  isPoisoned: false,
  givesImmortality: false,
  stats: {},
  hungerRelief: 5,
  exhaustionRelief: 5,
  curesPoisoning: false
};

export const NIGHTSHADE: Food = {
  name: 'Nightshade',
  addictionRelief: 5,
  isAddictive: false,
  isPoisoned: true,
  givesImmortality: false,
  stats: {},
  hungerRelief: 5,
  exhaustionRelief: 5,
  curesPoisoning: false
};

export const DARK_POPPY: Food = {
  name: 'Dark Poppy',
  addictionRelief: 10,
  isAddictive: true,
  isPoisoned: false,
  givesImmortality: false,
  stats: {},
  hungerRelief: 5,
  exhaustionRelief: 10,
  curesPoisoning: false
};

export interface Drink extends Ingestible {
  name: DrinkName;
}

export const WATER: Drink = {
  name: 'Water',
  addictionRelief: 0,
  isAddictive: false,
  isPoisoned: false,
  givesImmortality: false,
  stats: {
    strength: 10,
    agility: 10
  },
  hungerRelief: 0,
  exhaustionRelief: 5,
  curesPoisoning: false
};

export const ALPH_WATER: Ingestible = {
  name: 'Alph Water',
  addictionRelief: 0,
  isAddictive: false,
  isPoisoned: false,
  givesImmortality: true,
  stats: {
    strength: 10,
    agility: 10
  },
  hungerRelief: 0,
  exhaustionRelief: 100,
  curesPoisoning: true
};

export const ALCOHOL: Ingestible = {
  name: 'Alcohol',
  addictionRelief: 10,
  isAddictive: true,
  isPoisoned: false,
  givesImmortality: false,
  stats: {
    health: 20,
    strength: 20,
    intelligence: -10,
    agility: -10
  },
  hungerRelief: 10,
  exhaustionRelief: 10,
  curesPoisoning: false
};

export interface Medicine extends Ingestible {
  name: MedicineName;
}

export const MORPHINE: Medicine = {
  name: 'Morphine',
  addictionRelief: 15,
  isPoisoned: false,
  isAddictive: true,
  givesImmortality: false,
  stats: {
    health: 30,
    strength: 10,
    agility: -10,
    intelligence: -5
  },
  hungerRelief: 0,
  exhaustionRelief: 15,
  curesPoisoning: false
};

export const OPIUM: Medicine = {
  name: 'Opium',
  addictionRelief: 20,
  isPoisoned: false,
  isAddictive: true,
  givesImmortality: false,
  stats: {
    health: 15,
    strength: -10,
    agility: -15,
    intelligence: -10
  },
  hungerRelief: 0,
  exhaustionRelief: 5,
  curesPoisoning: false
};

export const MEDICAL_KIT: Medicine = {
  name: 'Medical Kit',
  addictionRelief: 5,
  isPoisoned: false,
  isAddictive: false,
  givesImmortality: false,
  stats: {
    health: 100,
    strength: 100,
    agility: 100,
    intelligence: 100
  },
  hungerRelief: 5,
  exhaustionRelief: 25,
  curesPoisoning: true
};

export const POISON_ANTIDOTE: Medicine = {
  name: 'Poison Antidote',
  addictionRelief: 5,
  isPoisoned: false,
  isAddictive: false,
  givesImmortality: false,
  stats: {
    health: 5,
    strength: 5,
    agility: 5,
    intelligence: 5
  },
  hungerRelief: 0,
  exhaustionRelief: 15,
  curesPoisoning: true
};
