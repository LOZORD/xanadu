import Item from '../item';

export default class Weapon extends Item {
  constructor(kwargs = {}) {
    super(kwargs);
    this.damageAmount = 0; // how much damage this weapon does 'on hit'
  }
}
