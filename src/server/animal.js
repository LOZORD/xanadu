import Entity from './entity';
import _ from 'lodash';

class Animal extends Entity {
  constructor(args = {}) {
    super(args);
    this.health       = args.health       || 100;
    this.MAX_HEALTH   = this.health;
    this.strength     = args.strength     || 100;
    this.intelligence = args.intelligence || 100;
    this.inventory    = args.inventory    || {};
    this.agility      = args.agility      || 100;
    // lineOfSight for both sight AND HEARING
    this.senseRadius  = args.senseRadius  || 1;
  }
  // TODO kwargs may contain combattan info and weapon used
  damage(amount = 0 /*, kwargs = {}*/) {
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

module.exports = Animal;
