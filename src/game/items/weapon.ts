import { Item } from './item';

export type BulletName = 'Rifle Bullet' | 'Revolver Bullet';
export type MeleeWeaponName = 'Knife' | 'Pickaxe';
export type GunName = 'Rifle' | 'Revolver';
export type Names = BulletName | MeleeWeaponName | GunName;

export interface Weapon extends Item {
  damageAmount: number;
}

export interface MeleeWeapon extends Weapon {
  mineRate: number;
}

export const KNIFE: MeleeWeapon = {
  damageAmount: 5,
  mineRate: 8,
  name: 'Knife'
};

export const PICKAXE: MeleeWeapon = {
  damageAmount: 1,
  mineRate: 4,
  name: 'Pickaxe'
};

export interface Bullet {
  name: BulletName;
}

export interface Gun extends Weapon {
  accuracy: number;   // integer percentage coefficient of how accurate this gun will be
  // when firing, given the wielder's agility and strength and the gun's
  // current condition/quality, as well as the distance to the target
  bullet: BulletName; // the type of bullet
  bulletDistance: number; // a number 1 - 3 (how many rooms away)
  currentClipAmount: number; // how many bullets are currently loaded
  totalClipAmount: number; // how many bullets can be loaded at a time
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
  accuracy: 0.5,
  bullet: 'Rifle Bullet',
  bulletDistance: 2,
  currentClipAmount: 5,
  totalClipAmount: 5
};

export const REVOLVER: Gun = {
  name: 'Revolver',
  damageAmount: 15,
  accuracy: 0.5,
  bullet: 'Revolver Bullet',
  bulletDistance: 1,
  currentClipAmount: 6,
  totalClipAmount: 6
};
