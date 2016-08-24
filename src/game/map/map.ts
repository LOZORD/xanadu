import { Position, Cell } from './cell';

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

export function mapToReprs(map: Map): string[][] {
    return map.grid.map(row => row.map(cell => cell.representation));
}

export function mapToString(map: Map): string {
    return mapToReprs(map).map(row => row.join('')).join('\n');
}

export function getCell(map: Map, { row, col }: Position): Cell {
    return map.grid[ row ][ col ];
}
