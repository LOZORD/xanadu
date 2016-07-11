import * as _ from 'lodash';
import { readFileSync } from 'fs';
import * as path from 'path';

import { Map } from './map';
import { CellType, fromRepr } from './cell';

export function gridRowsFromFile(fileName: string): { startingPosition: { row: number, col: number }, gridRows: string[] } {
    const rawContents = readFileSync(fileName, 'utf8');
    const lines = rawContents.trim().split('\n');
    const firstLine = _.head(lines);
    const gridRows = _.tail(lines);

    const startingPosSplit = firstLine.split(' ');
    const row = parseInt(startingPosSplit[0], 10) - 1;
    const col = parseInt(startingPosSplit[1], 10) - 1;

    return {
        gridRows,
        startingPosition: { row, col }
    };
}

function validateGrid(grid: CellType[][]): boolean {
    return _.every(_.flatten(grid));
}

const parseGrid = (gridRows: string[], startingPosition: { row: number, col: number }): Map => {
    const grid = _.map(gridRows, row => _.map(row, col => fromRepr[gridRows[row][col]]));
    if (!validateGrid(grid)) throw new Error("you have a bad map!");

    return {
        width: gridRows.length,
        height: gridRows[0].length,
        startingPosition,
        grid
    };
};

export default parseGrid;

export const TEST_FILE = path.join(__dirname, 'testMap.txt');

export const TEST_MAP_DATA = gridRowsFromFile(TEST_FILE);

export const TEST_GRID_PARSE = parseGrid(
    TEST_MAP_DATA.gridRows,
    TEST_MAP_DATA.startingPosition
);
