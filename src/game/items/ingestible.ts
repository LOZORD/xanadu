import { Item } from './item';
import { PartialStats } from '../stats';

// TODO: Use Maybe type for addiction relief?
export interface Ingestible extends Item {
    addictionRelief: number; // the number of turns that the ingestible relieves addiction effects
    isPoisoned: boolean;
    isAddictive: boolean;
    givesImmortality: boolean;
    stats: PartialStats;
}

export function poison(ingestible: Ingestible): Ingestible {
    return {
        name: ingestible.name,
        addictionRelief: ingestible.addictionRelief,
        isPoisoned: true,
        isAddictive: ingestible.isAddictive,
        givesImmortality: ingestible.givesImmortality,
        stats: ingestible.stats
    };
}

enum FoodType {
    Honeydew = 1,
    Meat,
    Plant,
    Stew
}

export interface Food extends Ingestible {
    type: FoodType
}

export const RawMeat: Food = {
    name: 'raw meat',
    type: FoodType.Meat,
    addictionRelief: 0,
    isAddictive: false,
    isPoisoned: false,
    givesImmortality: false,
    stats: {
        health: 10,
        strength: 10
    }
};

export const CookedMeat: Food = {
    name: 'cooked meat',
    type: FoodType.Meat,
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

export const Stew: Food = {
    name: 'stew',
    type: FoodType.Stew,
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

export const Honeydewy: Food = {
    name: 'honeydew',
    type: FoodType.Honeydew,
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

export const CaveLeaf: Food = {
    name: 'cave leaf',
    type: FoodType.Plant,
    addictionRelief: 5,
    isAddictive: false,
    isPoisoned: false,
    givesImmortality: false,
    stats: {}
};

export const Nightshade: Food = {
    name: 'nightshade',
    type: FoodType.Plant,
    addictionRelief: 5,
    isAddictive: false,
    isPoisoned: true,
    givesImmortality: false,
    stats: {}
};

export const DarkPoppy: Food = {
    name: 'dark poppy',
    type: FoodType.Plant,
    addictionRelief: 10,
    isAddictive: true,
    isPoisoned: false,
    givesImmortality: false,
    stats: {}
};

export const Water: Ingestible = {
    name: 'water',
    addictionRelief: 0,
    isAddictive: false,
    isPoisoned: false,
    givesImmortality: false,
    stats: {
        strength: 10,
        agility: 10
    }
};

export const AlphWater: Ingestible = {
    name: 'alph water',
    addictionRelief: 0,
    isAddictive: false,
    isPoisoned: false,
    givesImmortality: true,
    stats: {
        strength: 10,
        agility: 10
    }
};

export const Alcohol: Ingestible = {
    name: 'alcohol',
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

// TODO

export const Morphine: Item = {
    name: 'Morphine'
};

export const Opium: Item = {
    name: 'Opium'
};

export const MedicalKits: Item = {
    name: 'Medical Kits'
};
