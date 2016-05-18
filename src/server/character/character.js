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

export const ALLEGIANCES = {
  UNDEFINED_ALLEGIANCE:  -1,
  EASTERN:                0,
  WESTERN:                1
};

export default class Character extends Animal {
  constructor(kwargs = {}) {

    super(kwargs);

    // Field groupings
    // TODO: we have defaults, now _actually_ set things...
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

    _.forEach(kwargs.modifiers, (_v, modifierName) => {
      this.modifiers[modifierName] = true;
    });

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
      //lineOfSight:            1, applicable to all animals (called senseRadius)
      craftables:             []
    };

    // Fields w/o groups
    //this.name = 'DEFAULT_CHARACTER_NAME'; not nec.
    this.characterClass = CLASSES.UNDEFINED_CLASS;
    this.allegiance = ALLEGIANCES.UNDEFINED_ALLEGIANCE;

    this.nextMove = {
      phrase: '',
      timeStamp: 0
    };

    // Use (the child's) arguments
    //_.assignIn(this, args);
    // Actually set up fields if this has any
  }
  setNextMove(newMove) {
    this.nextMove = newMove;
  }
  getNextMove() {
    return this.nextMove;
  }
  performMove(move) {
    // TODO:  implement this (@zthomae :3 )
    // XXX:   might need to have a ref to the game object to do this right
    console.log(`${ this.name } will perform "${ move }"`);
  }
}
