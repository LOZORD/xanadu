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
