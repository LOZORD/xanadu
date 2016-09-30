import { Item } from './item';
import { PartialStats } from '../stats';
import { extend } from 'lodash';

export type FoodName = 'Raw Meat' | 'Cooked Meat' | 'Stew' | 'Honeydew' |
  'Cave Leaf' | 'Nightshade' | 'Dark Poppy';

export type DrinkName = 'Water' | 'Alph Water' | 'Alcohol';

export type MedicineName = 'Morphine' | 'Opium' | 'Medical Kit' | 'Poison Antidote';

export type Name = FoodName | DrinkName | MedicineName;

export const names = [ 'Raw Meat', 'Cooked Meat', 'Stew', 'Honeydew',
  'Cave Leaf', 'Nightshade', 'Dark Poppy', 'Water', 'Alph Water', 'Alcohol',
  'Morphine', 'Opium', 'Medical Kit', 'Poison Antidote' ].sort();

export function stringIsAnIngestibleName(str: string): str is Name {
  return names.map(name => name.toLowerCase()).indexOf(str.toLowerCase()) >= 0;
}

// TODO: Use Maybe type for addiction relief?
// XXX: consider renaming `Ingestible` to `Consumable`?
export interface Ingestible extends Item {
  addictionRelief: number; // the number of turns that the ingestible relieves addiction effects
  isPoisoned: boolean;
  isAddictive: boolean;
  givesImmortality: boolean;
  stats: PartialStats;
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
  }
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
  }
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
  }
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
  }
};

export const CAVE_LEAF: Food = {
  name: 'Cave Leaf',
  addictionRelief: 5,
  isAddictive: false,
  isPoisoned: false,
  givesImmortality: false,
  stats: {}
};

export const NIGHTSHADE: Food = {
  name: 'Nightshade',
  addictionRelief: 5,
  isAddictive: false,
  isPoisoned: true,
  givesImmortality: false,
  stats: {}
};

export const DARK_POPPY: Food = {
  name: 'Dark Poppy',
  addictionRelief: 10,
  isAddictive: true,
  isPoisoned: false,
  givesImmortality: false,
  stats: {}
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
  }
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
  }
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
  }
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
    // TODO
  }
};

export const OPIUM: Medicine = {
  name: 'Opium',
  addictionRelief: 20,
  isPoisoned: false,
  isAddictive: true,
  givesImmortality: false,
  stats: {
    // TODO
  }
};

export const MEDICAL_KIT: Medicine = {
  name: 'Medical Kit',
  addictionRelief: 5,
  isPoisoned: false,
  isAddictive: false,
  givesImmortality: false,
  stats: {
    // TODO
  }
};

export const POISON_ANTIDOTE: Medicine = {
  name: 'Poison Antidote',
  addictionRelief: 3,
  isPoisoned: false,
  isAddictive: false,
  givesImmortality: false,
  stats: {
    // TODO
  }
};
