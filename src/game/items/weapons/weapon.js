import Item from '../item';

export default class Weapon extends Item {
  constructor(damageAmount = 0, row = 0, col = 0) {
    super(row, col);
    this.damageAmount = damageAmount; // how much damage this weapon does 'on hit'
  }
}
