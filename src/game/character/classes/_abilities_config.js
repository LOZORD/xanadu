// This file contains a proposed Bethesda-style
// skill interface, as well as a list of ablities, stats and how different
// classes have different skills
const STATS_FOR_ABILITIES = {
    canTranslateModern: {
        intelligence: 50
    },
    canTranslateAncient: {
        intelligence: 50,
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
    repairSmall: {
        intelligence: 10,
        strength: 10
    },
    repairMedium: {
        intelligence: 20,
        strength: 20
    },
    repairFull: {
        intelligence: 30,
        strength: 30
    },
    healSmall: {
        health: 10,
        intelligence: 30,
        strength: 10
    },
    healMedium: {
        health: 10,
        intelligence: 40,
        strength: 10
    },
    healFull: {
        health: 20,
        intelligence: 50,
        strength: 10
    },
    craftEasy: {
        intelligence: 20,
        agility: 20,
        strength: 20
    },
    craftMedium: {
        intelligence: 40,
        agility: 20,
        strength: 20
    },
    craftDifficult: {
        intelligence: 40,
        agility: 20,
        strength: 30
    }
};

const STATS_FOR_CLASSES = {
    benefactor: {
        health: 30,
        intelligence: 20,
        agility: 40,
        strength: 10
    },
    gunslinger: {
        health: 30,
        intelligence: 10,
        agility: 30,
        strength: 30
    },
    excavator: {
        health: 40,
        intelligence: 10,
        agility: 10,
        strength: 40
    },
    doctor: {
        health: 30,
        intelligence: 50,
        agility: 10,
        strength: 10
    },
    chef: {
        health: 10,
        intelligence: 40,
        agility: 30,
        strength: 20
    },
    shaman: {
        health: 10,
        intelligence: 50,
        agility: 30,
        strength: 10
    },
    caveman: {
        health: 10,
        intelligence: 10,
        agility: 40,
        strength: 40
    },
    cartographer: {
        health: 20,
        intelligence: 40,
        agility: 30,
        strength: 10
    },
    prof: {
        health: 10,
        intelligence: 50,
        agility: 20,
        strength: 20
    },
    smith: {
        health: 10,
        intelligence: 40,
        agility: 20,
        strength: 30
    }
};

let classAbilities = {};

let hasAbility = (abilityStats, classStats) => {
    return (
        (abilityStats.health || 0) <= classStats.health &&
        (abilityStats.intelligence || 0) <= classStats.intelligence &&
        (abilityStats.agility || 0) <= classStats.agility &&
        (abilityStats.strength || 0) <= classStats.strength
    );
};

for (let characterClass in STATS_FOR_CLASSES) {
    classAbilities[characterClass] = [];

    // sanity check
    let stats = STATS_FOR_CLASSES[characterClass];
    let health = stats.health;
    let intelligence = stats.intelligence;
    let agility = stats.agility;
    let strength = stats.strength;

    if (health + intelligence + agility + strength !== 100) {
        throw new Error('stats do not sum to 100');
    }

    for (let ability in STATS_FOR_ABILITIES) {
        let abilityStats = STATS_FOR_ABILITIES[ability];

        if (hasAbility(abilityStats, stats)) {
            classAbilities[characterClass].push(ability);
        }
    }
}

console.log(JSON.stringify(classAbilities, null, 2));
