import MeleeWeapon from './meleeWeapon';

export default class Pickaxe extends MeleeWeapon {
  constructor(kwargs = {}) {
    super(kwargs);
    this.mineRate = 4;
    this.damageAmount = 0; // TODO
  }
}
