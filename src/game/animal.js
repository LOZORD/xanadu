import MoveableEntity from './moveableEntity';
import _ from 'lodash';
import Inventory from './inventory';

export default class Animal extends MoveableEntity {
  constructor(stats = {}, inventory = null, row = 0, col = 0) {
    super(row, col);
    this.health       = stats.health       || 10;
    this.maxHealth    = this.health;
    this.strength     = stats.strength     || 10;
    this.maxStrength  = this.strength;
    this.intelligence = stats.intelligence || 10;
    this.maxIntelligence = this.intelligence;
    this.agility      = stats.agility      || 10;
    this.maxAgility   = this.agility;
    this.inventory    = inventory    || new Inventory();
    // TODO: lineOfSight for both sight AND HEARING -- deprecated for now
    //this.senseRadius  = 1;
    this.nextAction = null;
  }
  damage(amount = 0) {
    this.health = _.max([0, this.health - amount]);
  }
  // TODO: this incorporates effects into the character's update
  update({ healthF, strengthF, intelligenceF, agilityF } = {}) {
    this.health       = healthF ? healthF(this) : this.health;
    this.strength     = strengthF ? strengthF(this) : this.strength;
    this.intelligence = intelligenceF ? intelligenceF(this) : this.strength;
    this.agility      = agilityF ? agilityF(this) : this.agility;
  }
  isAlive() {
    return this.health > 0;
  }
}
