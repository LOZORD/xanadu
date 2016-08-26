import { Animal } from './animal';
import { ModernTranslationBook } from './items/books';
import * as Ingestible from './items/ingestible';
import { createInventory, hasItem, Inventory } from './inventory';
import { meetsRequirements, Stats } from './stats';
import { Player } from './player';

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

// XXX: warning - maybe these CharacterClass objects should be frozen/immutable?

export const NoClass: CharacterClass = {
  className: 'None',
  startingStats: {
    health: 0,
    strength: 0,
    intelligence: 0,
    agility: 0
  },
  startingGold: 0,
  startingInventory: createInventory([], 0)
};

export const Benefactor: CharacterClass = {
  className: 'Benefactor',
  startingStats: {
    health: 30,
    intelligence: 20,
    agility: 40,
    strength: 10
  },
  startingGold: 0,
  startingInventory: createInventory([], 0)
};

export const Gunslinger: CharacterClass = {
  className: 'Gunslinger',
  startingStats: {
    health: 30,
    intelligence: 10,
    agility: 30,
    strength: 30
  },
  startingGold: 0,
  startingInventory: createInventory([], 0)
};

export const Excavator: CharacterClass = {
  className: 'Excavator',
  startingStats: {
    health: 40,
    intelligence: 10,
    agility: 10,
    strength: 40
  },
  startingGold: 0,
  startingInventory: createInventory([], 0)
};

export const Doctor: CharacterClass = {
  className: 'Doctor',
  startingStats: {
    health: 30,
    intelligence: 50,
    agility: 10,
    strength: 10
  },
  startingGold: 0,
  // TODO: max stack amounts should be global
  startingInventory: createInventory([
    {
      item: Ingestible.Morphine,
      stackAmount: 1,
      maxStackAmount: 5
    },
    {
      item: Ingestible.Opium,
      stackAmount: 1,
      maxStackAmount: 5
    },
    {
      item: Ingestible.MedicalKits,
      stackAmount: 1,
      maxStackAmount: 5
    }
  ], 0) // FIXME
};

export const Chef: CharacterClass = {
  className: 'Chef',
  startingStats: {
    health: 10,
    intelligence: 40,
    agility: 30,
    strength: 20
  },
  startingGold: 0,
  startingInventory: createInventory([], 0)
};

export const Shaman: CharacterClass = {
  className: 'Shaman',
  startingStats: {
    health: 10,
    intelligence: 50,
    agility: 30,
    strength: 10
  },
  startingGold: 0,
  startingInventory: createInventory([], 0)
};

export const Caveman: CharacterClass = {
  className: 'Caveman',
  startingStats: {
    health: 10,
    intelligence: 10,
    agility: 40,
    strength: 40
  },
  startingGold: 0,
  startingInventory: createInventory([], 0)
};

export const Cartographer: CharacterClass = {
  className: 'Cartographer',
  startingStats: {
    health: 20,
    intelligence: 40,
    agility: 30,
    strength: 10
  },
  startingGold: 0,
  startingInventory: createInventory([], 0)
};

export const Professor: CharacterClass = {
  className: 'Professor',
  startingStats: {
    health: 10,
    intelligence: 50,
    agility: 20,
    strength: 20
  },
  startingGold: 0,
  startingInventory: createInventory([], 0)
};

export const Smith: CharacterClass = {
  className: 'Smith',
  startingStats: {
    health: 10,
    intelligence: 40,
    agility: 20,
    strength: 30
  },
  startingGold: 0,
  startingInventory: createInventory([], 0)
};

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

export function canTranslateModern(c: Character): boolean {
  return hasItem(c.inventory, ModernTranslationBook) || meetsRequirements(c.stats, {
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
