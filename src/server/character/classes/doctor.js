import Character from '../character'
//import Morphine from '../../items';

export default class Doctor extends Character {
  constructor(kwargs = {}) {
    super(kwargs);
    // TODO: actually construct new items etc.
    this.inventory.push('morphine');
    this.inventory.push('opium');
    this.inventory.push('medical kits');
  }
}
