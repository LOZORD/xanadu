import MoveableEntity from './moveableEntity';
import _ from 'lodash';
import Inventory from './inventory';

export default class Animal extends MoveableEntity {
  constructor(args = {}) {
    super(args);
    this.health       = args.health       || 10;
    this.maxHealth    = this.health;
    this.strength     = args.strength     || 10;
    this.maxStrength  = this.strength;
    this.intelligence = args.intelligence || 10;
    this.maxIntelligence = this.intelligence;
    this.agility      = args.agility      || 10;
    this.maxAgility   = this.agility;
    this.inventory    = args.inventory    || new Inventory();
    // lineOfSight for both sight AND HEARING
    this.senseRadius  = args.senseRadius  || 1;
  }
  damage(amount = 0) {
    this.health = _.max([0, this.health - amount]);
  }
  update(args) {
    this.health       = args.healthF(this)        || this.health;
    this.strength     = args.strengthF(this)      || this.strength;
    this.intelligence = args.intelligenceF(this)  || this.intelligence;
    this.agility      = args.agilityF(this)       || this.agility;
  }
  isAlive() {
    return this.health > 0;
  }
}
