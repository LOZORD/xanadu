import { expect } from 'chai';
import * as Weapon from './weapon';

describe('Weapon', function () {
  describe('stringToAttackWeaponName', function () {
    it('should return the weapon name insensitive to case', function () {
      expect(Weapon.stringToAttackWeaponName('rifle')).to.eql('Rifle');
    });
    it('should return undefined if it is not a weapon name', function () {
      expect(Weapon.stringToAttackWeaponName('foobar')).to.be.undefined;
    });
  });
  describe('stringIsAttackWeaponName', function () {
    it('should return true when correct', function () {
      expect(Weapon.stringIsAttackWeaponName('fIsT')).to.be.true;
    });
    it('should return false otherwise', function () {
      expect(Weapon.stringIsAttackWeaponName('Stew')).to.be.false;
    });
  });
  describe('isWeaponGun', function () {
    it('should return true when the weapon is a gun', function () {
      expect(Weapon.isWeaponGun(Weapon.REVOLVER)).to.be.true;
    });
    it('should return false otherwise', function () {
      expect(Weapon.isWeaponGun(Weapon.FIST)).to.be.false;
    });
  });
});
