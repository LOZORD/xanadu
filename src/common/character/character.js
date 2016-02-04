let _ = require('lodash')

class Character {
  constructor(kwargs = {}) {
    // Static enums
    this.classes = {
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

    this.allegiances = {
      UNDEFINED_ALLEGIANCE:  -1,
      EASTERN:                0,
      WESTERN:                1
    };

    // Field groupings
    this.modifiers = {
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

    this.abilities = {
      canTranslateModern:     false,
      canTranslateAncient:    false,
      canIdentifyPoison:      false,
      isHunter:               false,
      canFillet:              false,
      canSetUpCamp:           false,
      canUpdateMaps:          false,
      canSmelt:               false,
      repairAmount:           0.0,
      healAmount:             0.0,
      lineOfSight:            1,
      craftables:             []
    };

    // Fields w/o groups
    this.name = 'DEFAULT_CHARACTER_NAME';
    this.class = this.classes.UNDEFINED_CLASS;
    this.allegiance = this.allegiances.UNDEFINED_ALLEGIANCE;

    // Use (the child's) arguments
    _.assignIn(this, kwargs);
  }
}

/* TODO
Character.factory = (kwargs = {}) => {
  switch (className) {
  }
};
*/

// TODO: use invisible and export...
