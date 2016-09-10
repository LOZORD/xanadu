import { Position, Cell, isRoom, CellRepresentation } from './cell';

// TODO: use grid.ts

export interface Map {
    width: number;
    height: number;
    startingPosition: Position;
    grid: Cell[][];
}

export function isWithinMap(map: Map, { row, col }: Position): boolean {
    return 0 <= row &&
        row < map.height &&
        0 <= col &&
        col < map.width;
}

export function mapToRepresentations(map: Map): CellRepresentation[][] {
    return map.grid.map(row => row.map(cell => cell.representation));
}

export function mapToString(map: Map): string {
    return mapToRepresentations(map).map(row => row.join('')).join('\n');
}

export function getCell(map: Map, { row, col }: Position): Cell {
    return map.grid[ row ][ col ];
}

export function isValidRoom(map: Map, pos: Position): boolean {
    return isWithinMap(map, pos) && isRoom(getCell(map, pos));
}
