import Animal from '../animal';
import _ from 'lodash';

export const CLASSES = {
  UNDEFINED_CLASS: -1,
  BENEFACTOR:       0,
  GUNSLINGER:       1,
  EXCAVATOR:        2,
  DOCTOR:           3,
  CHEF:             4,
  SHAMAN:           5,
  CAVEMAN:          6,
  CARTOGRAPHER:     7,
  PROF:             8,
  SMITH:            9
};

export const ABILITIES = {
  canTranslateModern: {
      intelligence: 50
  },
  canTranslateAncient: {
      intelligence: 50
  },
  canIdentifyPoison: {
      intelligence: 50
  },
  canIdentifyTraps: {
      intelligence: 30,
      agility: 30
  },
  isHunter: {
      intelligence: 10,
      agility: 30,
      strength: 30
  },
  canFillet: {
      intelligence: 10,
      strength: 30
  },
  canSetUpCamp: {
      strength: 40
  },
  canSmelt: {
      intelligence: 20,
      strength: 30
  },
  canRepairSmall: {
      intelligence: 10,
      strength: 10
  },
  canRepairMedium: {
      intelligence: 20,
      strength: 20
  },
  canRepairFull: {
      intelligence: 30,
      strength: 30
  },
  canHealSmall: {
      health: 10,
      intelligence: 30,
      strength: 10
  },
  canHealMedium: {
      health: 10,
      intelligence: 40,
      strength: 10
  },
  canHealFull: {
      health: 20,
      intelligence: 50,
      strength: 10
  },
  canCraftEasy: {
      intelligence: 20,
      agility: 20,
      strength: 20
  },
  canCraftMedium: {
      intelligence: 40,
      agility: 20,
      strength: 20
  },
  canCraftDifficult: {
      intelligence: 40,
      agility: 20,
      strength: 30
  }
};

export const ALLEGIANCES = {
  UNDEFINED_ALLEGIANCE:  -1,
  EASTERN:                0,
  WESTERN:                1
};

// TODO: figure out how we want to model these in the character class
// we may need to have "more" data than just booleans
export const MODIFIERS = {
  KILLER:         false,
  IMMORTAL:       false,
  PSYCHO:         false,
  RACIST:         false,
  CANNIBAL:       false,
  FATALIST:       false,
  PACIFIST:       false,
  RUSKY:          false,
  ARSONIST:       false,
  ANGEL_OF_DEATH: false,
  COLLECTOR:      false,
  SCALPER:        false,
  MISSIONARY:     false
};

class Character extends Animal {
  constructor(kwargs = {}) {

    super(kwargs);

    this.goldAmount = 0;

    // TODO: set up modifiers
    this.modifiers = {};

    // TODO: effects
    this.effects = {};

    // Fields w/o groups
    this.characterClass = CLASSES.UNDEFINED_CLASS;
    this.allegiance = ALLEGIANCES.UNDEFINED_ALLEGIANCE;
    this.player = kwargs.player;
  }
  hasAbility(abilityName) {
    const abilityStats = ABILITIES[abilityName];

    if (!abilityStats) {
      throw new Error(`Unknown ability: ${ abilityName }`);
    }

    const requiredStats = {
      health: abilityStats.health || 0,
      intelligence: abilityStats.intelligence || 0,
      agility: abilityStats.agility || 0,
      strength: abilityStats.strength || 0
    };

    return (
              this.health >= requiredStats.health &&
              this.intelligence >= requiredStats.intelligence &&
              this.agility >= requiredStats.agility &&
              this.strength >= requiredStats.strength
    );
  }
  attackPlayerWithFists(otherPlayer) {
    // TODO
  }
  attackPlayerWithMelee(weapon, otherPlayer) {
    // TODO
  }
  attackPlayerWithGun(gun, numShots, otherPlayer) {
    // TODO
  }
  getDetails() {
    return {
      stats: {
        health: {
          cur: this.health,
          max: this.maxHealth
        },
        intelligence: {
          cur: this.intelligence,
          max: this.maxIntelligence
        },
        agility: {
          cur: this.agility,
          max: this.maxAgility
        },
        strength: {
          cur: this.strength,
          max: this.maxStrength
        }
      },
      modifiers: this.modifiers,
      effects: this.effects,
      map: this.characterMap ? this.characterMap.toJSON() : null,
      gold: this.goldAmount,
      items: this.inventory
    };
  }
}

// A little metaprogramming...
_.keys(ABILITIES).forEach((abilityName) => {
  Character.prototype[abilityName] = (() => this.hasAbility(abilityName));
});

export default Character;
