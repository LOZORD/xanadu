import { Item, ItemStack } from '../items/item';
import { range } from 'lodash';

export interface Position {
  row: number;
  col: number;
};

export type CellRepresentation = '_' | 'X' | '^' | '#' | '%' | '?' | ' ';

interface AbstractCell extends Position {
  representation: CellRepresentation;
};

export interface UnknownCell extends AbstractCell {
  representation: '?';
}

export interface PermanentBarrier extends AbstractCell {
  representation: '#';
};

export interface ExcavatableBarrier extends AbstractCell {
  health: number;
  representation: '%';
};

export type Barrier = PermanentBarrier | ExcavatableBarrier;

interface AbstractRoom extends AbstractCell {
  items: ItemStack<Item>[];
  hasCamp: boolean;
};

export interface SimpleRoom extends AbstractRoom {
  representation: '_';
};

export interface TreasureRoom extends AbstractRoom {
  representation: 'X';
};

export interface PassageRoom extends AbstractRoom {
  representation: '^';
};

export type Room = SimpleRoom | TreasureRoom | PassageRoom;

export function isRoom(cell: AbstractCell): cell is Room {
  return Boolean((cell as Room).items);
}

export function isBarrier(cell: AbstractCell): cell is Barrier {
  return !isRoom(cell);
}

export function isPermanentBarrier(barrier: Barrier): barrier is PermanentBarrier {
  return barrier.representation === '#';
}

export function isExcavatableBarrier(barrier: Barrier): barrier is ExcavatableBarrier {
  return barrier.representation === '%';
}

export function isTreasureRoom(room: Room): room is TreasureRoom {
  return room.representation === 'X';
}

export function isPassageRoom(room: Room): room is PassageRoom {
  return room.representation === '^';
}

export interface FromRepresentationOptions {
  health: number;
  items: ItemStack<Item>[];
}

export type Cell = Barrier | Room | UnknownCell;

export function isCellRepresentation(cr: string): cr is CellRepresentation {
  return ([ '_', 'X', '^', '#', '%', '?', ' ' ].indexOf(cr) >= 0);
}

export type CellName = 'Unknown' | 'PermanentBarrier' | 'ExcavatableBarrier' |
  'SimpleRoom' | 'TreasureRoom' | 'PassageRoom';

export function
fromRepresentation(cr: CellRepresentation, { row, col }: Position, opts: FromRepresentationOptions): Cell {
  switch (cr) {
    case '#':
      return { row, col, representation: '#' };
    case '%':
      return { row, col, representation: '%', health: opts.health };
    case '_':
      return { row, col, representation: '_', items: opts.items, hasCamp: false };
    case 'X':
      return { row, col, representation: 'X', items: opts.items, hasCamp: false };
    case '^':
      return { row, col, representation: '^', items: opts.items, hasCamp: false };
    case '?':
      return { row, col, representation: '?' };
    default:
      return { row, col, representation: '#' };
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
    east: { row, col: col + 1 },
    south: { row: row + 1, col },
    west: { row, col: col - 1 }
  };
}

// The distance it would take moving in one cardinal direction at a time.
export function cardinalPositionDistance(p1: Position, p2: Position): number {
  return Math.abs(p1.row - p2.row) + Math.abs(p1.col - p2.col);
}

// p1 is to the left of or above p2
export function getPositionsBetween(p1: Position, p2: Position): Position[] {
  // if (p1.row !== p2.row && p1.col !== p2.col) {
  //   throw new Error('Can only get cells between using straight lines');
  // }

  // p2 is actually to the left of or above p1
  if (p1.row > p2.row || p1.col > p2.col) {
    return getPositionsBetween(p2, p1);
  }

  if (p1.row === p2.row) {
    return range(p1.col, p2.col + 1).map(colInd => {
      return {
        row: p1.row,
        col: colInd
      };
    });
  } else if (p1.col === p2.col) {
    return range(p1.row, p2.row + 1).map(rowInd => {
      return {
        row: rowInd,
        col: p1.col
      };
    });
  } else {
    throw new Error('Can only get cells between using straight lines');
  }
}
