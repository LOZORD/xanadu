import MeleeWeapon from './meleeWeapon';

export default class Knife extends MeleeWeapon {
  constructor(kwargs = {}) {
    super(kwargs);
    this.mineRate = 8;
    this.damageAmount = 0; // TODO
  }
}
