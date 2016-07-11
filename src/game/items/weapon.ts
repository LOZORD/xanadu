import { Item } from './item';

export interface Weapon extends Item {
    damageAmount: number;
}

export interface MeleeWeapon extends Weapon {
    mineRate: number;
}

export const Knife: MeleeWeapon = {
    damageAmount: 5,
    mineRate: 8,
    name: 'knife'
};

export const Pickaxe: MeleeWeapon = {
    damageAmount: 1,
    mineRate: 4,
    name: 'pickaxe'
};

// This is a silly interface...
export interface BulletType extends Item {
    bulletType: string,
}

export const Bullet: BulletType = {
    name: 'bullet',
    bulletType: 'standard'
};

export const RifleBullet: BulletType = {
    name: 'rifleBullet',
    bulletType: 'rifle'
};

export const RevolverBullet: BulletType = {
    name: 'revolverBullet',
    bulletType: 'revolver'
};

export interface Gun extends Weapon {
    accuracy: number;   // integer percentage coefficient of how accurate this gun will be
                        // when firing, given the wielder's agility and strength and the gun's
                        // current condition/quality, as well as the distance to the target
    bullet: BulletType; // the type of bullet
    bulletDistance: number; // a number 1 - 3 (how many rooms away)
    currentClipAmount: number; // how many bullets are currently loaded
    totalClipAmount: number; // how many bullets can be loaded at a time
}

export const Pistol: Gun = {
    name: 'pistol',
    damageAmount: 10,
    accuracy: 0.5,
    bullet: Bullet,
    bulletDistance: 1,
    currentClipAmount: 15,
    totalClipAmount: 15
};

export const Rifle: Gun = {
    name: 'rifle',
    damageAmount: 20,
    accuracy: 0.5,
    bullet: RifleBullet,
    bulletDistance: 2,
    currentClipAmount: 5,
    totalClipAmount: 5
};

export const Revolver: Gun = {
    name: 'revolver',
    damageAmount: 15,
    accuracy: 0.5,
    bullet: RevolverBullet,
    bulletDistance: 1,
    currentClipAmount: 6,
    totalClipAmount: 6
};