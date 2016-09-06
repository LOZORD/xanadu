import { Animal } from './animal';
import { createInventory, hasItem, Inventory } from './inventory';
import { meetsRequirements, Stats } from './stats';
import { Player } from './player';
import Game from '../context/game';
import { Position } from './map/cell';

export interface Character extends Animal {
  characterClass: CharacterClass;
  allegiance: Allegiance;
  modifiers: Modifiers;
  goldAmount: number;
  player: Player;
}

export function isPlayerCharacter(actor: Animal | Character): actor is Character {
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

type InventoryCreator = (game: Game) => Inventory;

export const DEFAULT_INVENTORY_SIZE = 10;

export const CLASS_STARTING_INVENTORY: CLASS_DICTIONARY<InventoryCreator> = {
  None: function (game: Game) {
    return createInventory([], DEFAULT_INVENTORY_SIZE);
  },
  Benefactor: function (game: Game) {
    return createInventory([], DEFAULT_INVENTORY_SIZE);
  },
  Gunslinger: function (game: Game) {
    return createInventory([], DEFAULT_INVENTORY_SIZE);
  },
  Excavator: function (game: Game) {
    return createInventory([], DEFAULT_INVENTORY_SIZE);
  },
  Doctor: function (game: Game) {
    return createInventory([], DEFAULT_INVENTORY_SIZE);
  },
  Chef: function (game: Game) {
    return createInventory([], DEFAULT_INVENTORY_SIZE);
  },
  Shaman: function (game: Game) {
    return createInventory([], DEFAULT_INVENTORY_SIZE);
  },
  Caveman: function (game: Game) {
    return createInventory([], DEFAULT_INVENTORY_SIZE);
  },
  Cartographer: function (game: Game) {
    return createInventory([], DEFAULT_INVENTORY_SIZE);
  },
  Professor: function (game: Game) {
    return createInventory([], DEFAULT_INVENTORY_SIZE);
  },
  Smith: function (game: Game) {
    return createInventory([], DEFAULT_INVENTORY_SIZE);
  }
};

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

export function createCharacterClass(className: CharacterClassName, game: Game): CharacterClass {
  return {
    className: className,
    startingStats: CLASS_STARTING_STATS[ className ],
    startingGold: CLASS_STARTING_GOLD[ className ],
    startingInventory: CLASS_STARTING_INVENTORY[ className ](game)
  };
}

export type Allegiance = 'None' | 'Eastern' | 'Western';

// Think of these as achievement that can be unlocked.
// If a property is true, that means we include it when calculating final gold winnings.
// Some "activity log" should be added to characters to keep track of the data that would be used
// to find if these modifier "achievements" have been completed.
export type Modifiers = {
  killer: boolean;
  immortal: boolean;
  psycho: boolean;
  racist: boolean;
  cannibal: boolean;
  fatalist: boolean;
  pacifist: boolean;
  rusky: boolean;
  arsonist: boolean;
  angelOfDeath: boolean;
  collector: boolean;
  scalper: boolean;
  missionary: boolean;
}

export function createEmptyModifiers(): Modifiers {
  return {
    killer: false,
    immortal: false,
    psycho: false,
    racist: false,
    cannibal: false,
    fatalist: false,
    pacifist: false,
    rusky: false,
    arsonist: false,
    angelOfDeath: false,
    collector: false,
    scalper: false,
    missionary: false
  };
}

export function createCharacter(
  game: Game, player: Player, pos: Position,
  className: CharacterClassName = 'None', allegiance: Allegiance = 'None',
  modifiers: Modifiers = createEmptyModifiers()
): Character {
  const characterClass = createCharacterClass(className, game);

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
    nextAction: null
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
