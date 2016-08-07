import { CellType } from './cell';

export interface Map {
    width: number;
    height: number;
    startingPosition: { row: number, col: number };
    grid: CellType[][];
}

export function isWithinMap(map: Map, row: number, col: number) {
    return 0 <= row &&
            row < map.height &&
            0 <= col &&
            col < map.width;
}

export function mapToReprs(map: Map): string[][] {
    return map.grid.map(row => row.map(cell => cell.repr));
}

export function mapToString(map: Map): string {
    return mapToReprs(map).map(row => row.join('')).join('\n');
}
