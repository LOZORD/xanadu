import { Animal } from './animal';
import { createInventory, hasItem, Inventory } from './inventory';
import { meetsRequirements, Stats, changeStats } from './stats';
import { GamePlayer } from './player';
import Game from '../context/game';
import { Position } from './map/cell';
import * as Item from './items/item';
import { CharacterMap, createCharacterMap } from './map/characterMap';
import { createItem } from './items/itemCreator';
import * as ItemName from './items/itemName';
import * as _ from 'lodash';
import * as Actions from './actions';

export interface Character extends Animal {
  characterClass: CharacterClass;
  allegiance: Allegiance;
  modifiers: Modifiers;
  goldAmount: number;
  player: GamePlayer;
  map: CharacterMap;
  effects: CharacterEffects;
}

export interface PrimordialCharacter {
  className: CharacterClassName;
  allegiance: Allegiance;
  numModifiers: number;
};

export function isPlayerCharacter(actor: Animal): actor is Character {
  return Boolean((actor as Character).player);
}

export interface CharacterClass {
  className: CharacterClassName;
  startingStats: Stats;
  startingGold: number;
  startingInventory: Inventory;
}

export type CharacterClassName = 'None' | 'Benefactor' | 'Gunslinger' |
  'Excavator' | 'Doctor' | 'Chef' | 'Shaman' | 'Caveman' | 'Cartographer' |
  'Professor' | 'Smith';

export const CHARACTER_CLASS_NAMES = [
  'Benefactor', 'Gunslinger', 'Excavator', 'Doctor', 'Chef', 'Shaman',
  'Caveman', 'Cartographer', 'Professor', 'Smith'
].sort() as CharacterClassName[];

export type CLASS_DICTIONARY<V> = {
  None: V,
  Benefactor: V,
  Gunslinger: V,
  Excavator: V,
  Doctor: V,
  Chef: V,
  Shaman: V,
  Caveman: V,
  Cartographer: V,
  Professor: V,
  Smith: V
};

export const CLASS_STARTING_STATS: CLASS_DICTIONARY<Stats> = {
  None: {
    health: 1,
    agility: 1,
    intelligence: 1,
    strength: 1
  },
  Benefactor: {
    health: 30,
    intelligence: 20,
    agility: 40,
    strength: 10
  },
  Gunslinger: {
    health: 30,
    intelligence: 10,
    agility: 30,
    strength: 30
  },
  Excavator: {
    health: 40,
    intelligence: 10,
    agility: 10,
    strength: 40
  },
  Doctor: {
    health: 30,
    intelligence: 50,
    agility: 10,
    strength: 10
  },
  Chef: {
    health: 10,
    intelligence: 40,
    agility: 30,
    strength: 20
  },
  Shaman: {
    health: 10,
    intelligence: 50,
    agility: 30,
    strength: 10
  },
  Caveman: {
    health: 10,
    intelligence: 10,
    agility: 40,
    strength: 40
  },
  Cartographer: {
    health: 20,
    intelligence: 40,
    agility: 30,
    strength: 10
  },
  Professor: {
    health: 10,
    intelligence: 50,
    agility: 20,
    strength: 20
  },
  Smith: {
    health: 10,
    intelligence: 40,
    agility: 20,
    strength: 30
  }
};

type PrimordialStack = {
  name: ItemName.ItemName;
  stackAmount?: number;
  maxAmount: number;
};

export const CLASS_PRIMORDIAL_INVENTORY_STACKS: CLASS_DICTIONARY<PrimordialStack[]> = {
  None: [
    { name: 'Map', maxAmount: 1 }
  ],
  Benefactor: [
    { name: 'Map', maxAmount: 1 },
    { name: 'Ancient Translation Book', maxAmount: 1 },
    { name: 'Revolver', maxAmount: 1 },
    { name: 'Revolver Bullet', maxAmount: 12 }
  ],
  Gunslinger: [
    { name: 'Rifle', maxAmount: 1 },
    { name: 'Rifle Bullet', maxAmount: 20 },
    { name: 'Revolver', maxAmount: 1 },
    { name: 'Revolver Bullet', maxAmount: 24 },
    { name: 'Knife', maxAmount: 1 }
  ],
  Excavator: [
    { name: 'Pickaxe', maxAmount: 1 },
    { name: 'Dynamite', maxAmount: 5 },
  ],
  Doctor: [
    { name: 'Morphine', maxAmount: 5 },
    { name: 'Opium', maxAmount: 5 },
    { name: 'Medical Kit', maxAmount: 5 },
    { name: 'Poison Antidote', maxAmount: 5 },
    { name: 'Modern Translation Book', maxAmount: 1 }
  ],
  Chef: [
    { name: 'Knife', maxAmount: 2 },
    { name: 'Camp Supplies', maxAmount: 2 },
    { name: 'Stew', maxAmount: 10 }
  ],
  Shaman: [
    { name: 'Knife', maxAmount: 2 }
  ],
  Caveman: [
    { name: 'Knife', maxAmount: 1 },
    { name: 'Pickaxe', maxAmount: 1 }
  ],
  Cartographer: [
    { name: 'Map', maxAmount: 1 },
    { name: 'Modern Translation Book', maxAmount: 1 },
    { name: 'Ancient Translation Book', maxAmount: 1 },
    { name: 'Camp Supplies', maxAmount: 1 }
  ],
  Professor: [
    { name: 'Modern Translation Book', maxAmount: 1 },
    { name: 'Ancient Translation Book', maxAmount: 1 }
  ],
  Smith: [
    { name: 'Camp Supplies', maxAmount: 2 },
    { name: 'Pickaxe', maxAmount: 1 }
  ]
};

export const DEFAULT_INVENTORY_SIZE = 10;

export function createClassInventory(className: CharacterClassName): Inventory {
  const primordialStacks = CLASS_PRIMORDIAL_INVENTORY_STACKS[ className ] as PrimordialStack[];

  const stacks = primordialStacks.map(primordialStack => {
    const newItem = createItem(primordialStack.name);
    const initialAmount = primordialStack.stackAmount || primordialStack.maxAmount;
    return Item.createItemStack(newItem, initialAmount, primordialStack.maxAmount);
  });

  return createInventory(stacks, DEFAULT_INVENTORY_SIZE);
}

export const DEFAULT_GOLD_AMOUNT = 500;

export const CLASS_STARTING_GOLD: CLASS_DICTIONARY<number> = {
  None: DEFAULT_GOLD_AMOUNT,
  Benefactor: DEFAULT_GOLD_AMOUNT,
  Gunslinger: DEFAULT_GOLD_AMOUNT,
  Excavator: DEFAULT_GOLD_AMOUNT,
  Doctor: DEFAULT_GOLD_AMOUNT,
  Chef: DEFAULT_GOLD_AMOUNT,
  Shaman: DEFAULT_GOLD_AMOUNT,
  Caveman: DEFAULT_GOLD_AMOUNT,
  Cartographer: DEFAULT_GOLD_AMOUNT,
  Professor: DEFAULT_GOLD_AMOUNT,
  Smith: DEFAULT_GOLD_AMOUNT
};

export function createCharacterClass(className: CharacterClassName): CharacterClass {
  return {
    className: className,
    startingStats: CLASS_STARTING_STATS[ className ],
    startingGold: CLASS_STARTING_GOLD[ className ],
    startingInventory: createClassInventory(className)
  };
}

export type Allegiance = 'None' | 'Eastern' | 'Western';

export const ALLEGIANCES = [ 'Eastern', 'Western' ].sort() as Allegiance[];

export type ModifierName = 'Killer' | 'Immortal' | 'Psycho' | 'Racist' |
  'Cannibal' | 'Fatalist' | 'Pacifist' | 'Rusky' | 'Arsonist' | 'Angel of Death' |
  'Collector' | 'Scalper' | 'Missionary';

// Think of these as achievement that can be unlocked.
// If a property is true, that means we include it when calculating final gold winnings.
// Some "activity log" should be added to characters to keep track of the data that would be used
// to find if these modifier "achievements" have been completed.
export type Modifiers = {
  'Killer': boolean;
  'Immortal': boolean;
  'Psycho': boolean;
  'Racist': boolean;
  'Cannibal': boolean;
  'Fatalist': boolean;
  'Pacifist': boolean;
  'Rusky': boolean;
  'Arsonist': boolean;
  'Angel of Death': boolean;
  'Collector': boolean;
  'Scalper': boolean;
  'Missionary': boolean;
}

export function createEmptyModifiers(): Modifiers {
  return {
    'Killer': false,
    'Immortal': false,
    'Psycho': false,
    'Racist': false,
    'Cannibal': false,
    'Fatalist': false,
    'Pacifist': false,
    'Rusky': false,
    'Arsonist': false,
    'Angel of Death': false,
    'Collector': false,
    'Scalper': false,
    'Missionary': false
  };
}

export const MODIFIER_NAMES = _.keys(createEmptyModifiers()).sort() as ModifierName[];

export const MAX_NUM_MODIFIERS = MODIFIER_NAMES.length;

export function getActiveModifierNames(modifiers: Modifiers): ModifierName[] {
  return MODIFIER_NAMES.filter(name => Boolean(modifiers[ name ]));
}

export function createCharacter(
  game: Game, player: GamePlayer, pos: Position = game.map.startingPosition,
  className: CharacterClassName = 'None', allegiance: Allegiance = 'None',
  modifiers: Modifiers = createEmptyModifiers()
): Character {

  if (className === 'None') {
    className = game.rng.pickone(CHARACTER_CLASS_NAMES);
  }

  if (allegiance === 'None') {
    allegiance = game.rng.pickone(ALLEGIANCES);
  }

  const characterClass = createCharacterClass(className);

  return {
    player,
    characterClass,
    modifiers,
    row: pos.row,
    col: pos.col,
    allegiance: allegiance,
    goldAmount: characterClass.startingGold,
    stats: characterClass.startingStats,
    inventory: characterClass.startingInventory,
    nextAction: null,
    map: createCharacterMap(game.map),
    effects: {
      poison: {
        isActive: false
      },
      immortality: {
        isActive: false
      },
      addiction: {
        isActive: false,
        current: ADDICTED.meter.current,
        maximum: ADDICTED.meter.maximum
      },
      exhaustion: {
        current: EXHAUSTED.meter.current,
        maximum: EXHAUSTED.meter.maximum
      },
      hunger: {
        current: HUNGRY.meter.current,
        maximum: HUNGRY.meter.maximum
      }
    }
  };
}

export function canTranslateModern(c: Character): boolean {
  return hasItem(c.inventory, 'Modern Translation Book') || meetsRequirements(c.stats, {
    intelligence: 50
  });
}

export function canTranslateAncient(c: Character): boolean {
  return meetsRequirements(c.stats, {
    intelligence: 50
  });
}

export function canIdentifyPoison(c: Character): boolean {
  return meetsRequirements(c.stats, {
    intelligence: 50
  });
}

export function canIdentifyTraps(c: Character): boolean {
  return meetsRequirements(c.stats, {
    intelligence: 30,
    agility: 30
  });
}

export function isHunter(c: Character): boolean {
  return meetsRequirements(c.stats, {
    intelligence: 10,
    agility: 30,
    strength: 30
  });
}

export function canFillet(c: Character): boolean {
  return meetsRequirements(c.stats, {
    intelligence: 10,
    strength: 30
  });
}

export function canSetUpCamp(c: Character): boolean {
  return meetsRequirements(c.stats, {
    strength: 40
  });
}

export function canSmelt(c: Character): boolean {
  return meetsRequirements(c.stats, {
    intelligence: 20,
    strength: 30
  });
}

export function canRepairSmall(c: Character): boolean {
  return meetsRequirements(c.stats, {
    intelligence: 10,
    strength: 10
  });
}

export function canRepairMedium(c: Character): boolean {
  return meetsRequirements(c.stats, {
    intelligence: 20,
    strength: 20
  });
}

export function canRepairFull(c: Character): boolean {
  return meetsRequirements(c.stats, {
    intelligence: 30,
    strength: 30
  });
}

export function canHealSmall(c: Character): boolean {
  return meetsRequirements(c.stats, {
    health: 10,
    intelligence: 30,
    strength: 10
  });
}

export function canHealMedium(c: Character): boolean {
  return meetsRequirements(c.stats, {
    health: 10,
    intelligence: 40,
    strength: 10
  });
}

export function canHealFull(c: Character): boolean {
  return meetsRequirements(c.stats, {
    health: 20,
    intelligence: 50,
    strength: 10
  });
}

export function canCraftEasy(c: Character): boolean {
  return meetsRequirements(c.stats, {
    intelligence: 20,
    agility: 20,
    strength: 20
  });
}

export function canCraftMedium(c: Character): boolean {
  return meetsRequirements(c.stats, {
    intelligence: 40,
    agility: 20,
    strength: 20
  });
}

export function canCraftDifficult(c: Character): boolean {
  return meetsRequirements(c.stats, {
    intelligence: 40,
    agility: 20,
    strength: 30
  });
}

export interface Toggle {
  isActive: boolean;
}

export interface Meter {
  current: number;
  maximum: number;
}

export interface CharacterEffects {
  poison: Toggle;
  immortality: Toggle;
  addiction: Toggle & Meter;
  exhaustion: Meter;
  hunger: Meter;
};

export interface Effect {
  statChange: Stats;
}

export interface ToggledEffect extends Toggle, Effect { };

export interface MeteredEffect extends Effect {
  meter: Meter;
}

export function meterIsActive(meter: Meter): boolean {
  return meter.current <= 0;
}

export function toggleIsActive(toggle: Toggle): boolean {
  return toggle.isActive;
}

export function updateMeterCurrentValue(meter: Meter, amount: number): number {
  const newCurrentVal = _.clamp(meter.current + amount, 0, meter.maximum);
  meter.current = newCurrentVal;
  return newCurrentVal;
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

export const ADDICTED: MeteredEffect & ToggledEffect = {
  statChange: {
    health: 0,
    agility: -1,
    intelligence: -1,
    strength: -5
  },
  meter: {
    maximum: 10,
    current: 10,
  },
  isActive: false
};

export const EXHAUSTED: MeteredEffect = {
  statChange: {
    agility: -1,
    intelligence: -1,
    strength: -1,
    health: 0
  },
  meter: {
    maximum: 50,
    current: 50,
  }
};

export const HUNGRY: MeteredEffect = {
  statChange: {
    agility: -1,
    intelligence: -1,
    strength: -1,
    health: 0
  },
  meter: {
    maximum: 30,
    current: 30,
  }
};

// XXX: maybe have a(n) (in)sanity effect?
// e.g. no communication for a while leads to reduced intelligence?
// XXX: stamina stat: the rate at which characters become hungry, tired, etc.

export function anyActiveEffects(effects: CharacterEffects): boolean {
  if (toggleIsActive(effects.addiction) && meterIsActive(effects.addiction)) {
    return true;
  } else if (meterIsActive(effects.exhaustion)) {
    return true;
  } else if (meterIsActive(effects.hunger)) {
    return true;
  } else if (toggleIsActive(effects.immortality)) {
    return true;
  } else if (toggleIsActive(effects.poison)) {
    return true;
  } else {
    return false;
  }
}

export function updateEffectMeters(character: Character): void {
  const action = character.nextAction;

  // if any of the keys were 'Rest' or 'Ingest', `performing` them would
  // set the meters back to their maximum

  if (!action) {
    throw new Error('Tried to update character with no action!');
  } else if (Actions.isActionTypeOf(action, Actions.REST_COMPONENT)) {
    // TODO
  } else if (Actions.isActionTypeOf(action, Actions.INGEST_COMPONENT)) {
    // TODO
  } else {
    updateMeterCurrentValue(character.effects.exhaustion, -1);
  }
}

export function updateCharacter(character: Character): string {
  const name = character.player.name;

  updateEffectMeters(character);

  if (anyActiveEffects(character.effects)) {
    if (toggleIsActive(character.effects.immortality)) {
      return `${name} is immortal -- no other effects matter`;
    }

    const log = [];

    if (meterIsActive(character.effects.exhaustion)) {
      changeStats(character.stats, EXHAUSTED.statChange);
      log.push(`${name} is exhausted`);
    }

    if (meterIsActive(character.effects.hunger)) {
      changeStats(character.stats, HUNGRY.statChange);
      log.push(`${name} is hungry`);
    }

    if (toggleIsActive(character.effects.poison)) {
      changeStats(character.stats, POISONED.statChange);
      log.push(`${name} is poisoned`);
    }

    const inWithdrawal = toggleIsActive(character.effects.addiction) &&
      meterIsActive(character.effects.addiction);

    if (inWithdrawal) {
      changeStats(character.stats, ADDICTED.statChange);
      log.push(`${name} is in withdrawal`);
    }

    return log.join('\n');
  } else {
    return `${name} has no active effects`;
  }
}
