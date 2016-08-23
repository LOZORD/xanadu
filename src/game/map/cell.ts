import { Animal } from '../animal';
import { Item, ItemStack } from '../items/item';

// a Map is made by an NxN grid of Cells
/* Things that extend Cell
 - Room
 - TreasureRoom (extends Room)
 - PassageRoom (extends Room)
 - Barrier/Wall (a solid rock that can be excavated into a room)
 */

// TODO: all of this needs to be reworked (needs more natural composition)

export interface Position {
    row: number;
    col: number;
}

export interface Cell extends Position {
    type: CellType;
}

export interface CellType {
    repr: string;
    room: boolean;
}

export const Barrier: CellType = {
    repr: '#',
    room: false
};

export interface Room extends CellType {
    animals: Animal[];
    items: ItemStack<Item>[];
}

export const PassageRoom: Room = {
    repr: '^',
    room: true,
    items: [],
    animals: []
};

export const TreasureRoom: Room = {
    repr: 'X',
    room: true,
    items: [],
    animals: []
};

export const EmptyRoom: Room = {
    repr: '_',
    room: true,
    animals: [],
    items: []
};

export function isRoom(cellType: CellType): cellType is Room {
    return cellType.room;
}

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

export interface CardinalNeighboringPositions {
    north: Position;
    east: Position;
    south: Position;
    west: Position;
};

export function getCardinalNeighboringPositions({ row, col }: Position): CardinalNeighboringPositions {
    return {
        north: { row: row - 1, col },
        east: { row, col: col + 1},
        south: { row: row +  1, col },
        west: { row, col: col - 1}
    };
}
