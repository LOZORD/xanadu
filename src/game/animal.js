import MoveableEntity from './moveableEntity';
import _ from 'lodash';
import Inventory from './inventory';

export default class Animal extends MoveableEntity {
  constructor(args = {}) {
    super(args);
    this.health       = args.health       || 100;
    this.maxHealth    = this.health;
    this.strength     = args.strength     || 100;
    this.intelligence = args.intelligence || 100;
    this.inventory    = args.inventory    || new Inventory();
    this.agility      = args.agility      || 100;
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
