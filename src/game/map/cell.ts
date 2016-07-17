import { Animal } from '../animal';
import { Item, ItemStack } from '../items/item';

// a Map is made by an NxN grid of Cells
/* Things that extend Cell
 - Room
 - TreasureRoom (extends Room)
 - PassageRoom (extends Room)
 - Barrier/Wall (a solid rock that can be excavated into a room)
 */

export interface Position {
    row: number,
    col: number
}

export interface Cell extends Position {
    type: CellType
}

export interface CellType {
    repr: string;
    room: boolean;
}

export const Barrier: CellType = {
    repr: '#',
    room: false
};

export const PassageRoom: CellType = {
    repr: '^',
    room: true
};

export const TreasureRoom: CellType = {
    repr: 'X',
    room: true
};

export interface Room extends CellType {
    animals: Animal[],
    items: ItemStack<Item>[]
}

export const EmptyRoom: Room = {
    repr: '_',
    room: true,
    animals: [],
    items: []
};

export function areSameCellType(a: CellType, b: CellType): boolean {
    // TODO: This is primitive
    return a.repr === b.repr;
}

export function fromRepr(c: string): CellType {
    switch (c[0]) {
        case '#':
            return Barrier;
        case '^':
            return PassageRoom;
        case 'X':
            return TreasureRoom;
        case '_':
            return EmptyRoom;
        default:
            throw new Error(`Unknown room type: ${c[0]}`); // Not a fan...
    }
}
