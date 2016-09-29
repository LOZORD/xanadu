import { Item, ItemStack } from '../items/item';

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

export function getPosition({ row, col }: Cell): Position {
  return { row, col };
}
