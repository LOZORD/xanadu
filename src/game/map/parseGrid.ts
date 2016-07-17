import * as _ from 'lodash';
import { readFileSync } from 'fs';
import * as path from 'path';

import { Map } from './map';
import { areSameCellType, CellType, fromRepr, Position, TreasureRoom } from './cell';

export function gridRowsFromFile(fileName: string): { startingPosition: Position, gridRows: string[] } {
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

type ValidationResult = boolean | string;

function validateGrid(grid: CellType[][], startingPosition: Position): ValidationResult {
    if (!_.some(_.flatten(grid), cell => areSameCellType(cell, TreasureRoom))) {
        return 'There is no treasure room';
    }
    const startCell = grid[startingPosition.row][startingPosition.col];
    if (!startCell.room) {
        return 'The starting position is not a room';
    } else if (areSameCellType(startCell, TreasureRoom)) {
        return 'The starting position is the treasure room';
    }

    return true;
}

const parseGrid = (gridRows: string[], startingPosition: Position): Map => {
    const grid = _.map(gridRows, row => _.map(row, col => fromRepr(gridRows[row][col])));
    const validation = validateGrid(grid, startingPosition);
    if (validation !== true) throw new Error(validation as string);

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
