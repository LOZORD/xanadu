import { Item } from './item';
import { find } from 'lodash';
import { caseInsensitiveFind } from '../../helpers';

export type BulletName = 'Rifle Bullet' | 'Revolver Bullet';
export type MeleeWeaponName = 'Knife' | 'Pickaxe' | 'Fist';
export type GunName = 'Rifle' | 'Revolver';
export type ExplosiveName = 'Dynamite';
export type AttackWeaponName = MeleeWeaponName | GunName;
export type Name = BulletName | MeleeWeaponName | GunName | ExplosiveName;

export const gunNames: GunName[] = [ 'Rifle', 'Revolver' ];

export const namesForAttacking: AttackWeaponName[]
  = [ 'Knife', 'Pickaxe', 'Fist', 'Rifle', 'Revolver' ];

export function stringIsAttackWeaponName(str: string): str is AttackWeaponName {
  return Boolean(stringToAttackWeaponName(str));
}

export function stringToAttackWeaponName(str: string): AttackWeaponName | undefined {
  const needle = caseInsensitiveFind(namesForAttacking, str);

  if (needle) {
    return needle as AttackWeaponName;
  } else {
    return undefined;
  }
}

export interface Weapon extends Item {
  damageAmount: number;
  name: Name;
  range: number;
}

export interface MeleeWeapon extends Weapon {
  mineRate: number;
  name: MeleeWeaponName;
}

export const FIST: MeleeWeapon = {
  damageAmount: 3,
  mineRate: 12,
  range: 0,
  name: 'Fist'
};

export const KNIFE: MeleeWeapon = {
  damageAmount: 5,
  mineRate: 8,
  name: 'Knife',
  range: 0
};

export const PICKAXE: MeleeWeapon = {
  damageAmount: 1,
  mineRate: 4,
  name: 'Pickaxe',
  range: 0
};

export interface Bullet {
  name: BulletName;
}

export const RIFLE_BULLET = {
  name: 'Rifle Bullet'
};

export const REVOLVER_BULLET = {
  name: 'Revolver Bullet'
};

export interface Gun extends Weapon {
  accuracy: number;   // integer percentage coefficient of how accurate this gun will be
  // when firing, given the wielder's agility and strength and the gun's
  // current condition/quality, as well as the distance to the target
  bullet: BulletName; // the type of bullet
  currentClipAmount: number; // how many bullets are currently loaded
  totalClipAmount: number; // how many bullets can be loaded at a time
  name: GunName;
}

export function isWeaponGun(weapon: Weapon): weapon is Gun {
  return find(gunNames, name => name === weapon.name) !== undefined;
}

// XXX: not currently supported
// export const Pistol: Gun = {
//   name: 'pistol',
//   damageAmount: 10,
//   accuracy: 0.5,
//   bullet: Bullet,
//   bulletDistance: 1,
//   currentClipAmount: 15,
//   totalClipAmount: 15
// };

export const RIFLE: Gun = {
  name: 'Rifle',
  damageAmount: 20,
  accuracy: 50,
  bullet: 'Rifle Bullet',
  range: 2,
  currentClipAmount: 5,
  totalClipAmount: 5
};

export const REVOLVER: Gun = {
  name: 'Revolver',
  damageAmount: 15,
  accuracy: 50,
  bullet: 'Revolver Bullet',
  range: 1,
  currentClipAmount: 6,
  totalClipAmount: 6
};

export interface Explosive extends Weapon {
  radius: number;
  countdown: number;
  name: ExplosiveName;
  // effect
};

export const DYNAMITE: Explosive = {
  radius: 2,
  countdown: 3,
  damageAmount: 40,
  name: 'Dynamite',
  range: 1
};

export type AttackWeapon = MeleeWeapon | Gun;
