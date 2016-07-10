import Character from '../character'
//import Morphine from '../../items';

export default class Doctor extends Character {
  constructor(stats = {}, inventory = null, row = 0, col = 0) {
    super(stats, inventory, row, col);
    this.health = 30;
    this.maxHealth = 30;
    this.intelligence = 50;
    this.agility = 10;
    this.strength = 10;
    // TODO: actually construct new items etc.
    this.inventory.push('morphine');
    this.inventory.push('opium');
    this.inventory.push('medical kits');
  }
}
