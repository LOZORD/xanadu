import { Animal } from './animal';
import { Map, isWithinMap } from './map/map';

export interface Action {
    actor: Animal;
    timestamp: number;
    text: string;
}

export type Direction = 'North' | 'South' | 'East' | 'West';

export interface MoveAction extends Action {
    row: number;
    col: number;
}

export function makeMoveAction(a: Animal, timestamp: number, dir: Direction): MoveAction {
    let row = 0;
    let col = 0;
    if (dir === 'North') {
        row = 1;
    } else if (dir === 'South') {
        row = -1;
    } else if (dir === 'East') {
        col = 1;
    } else if (dir === 'West') {
        col = -1;
    }
    return {
        actor: a,
        timestamp: timestamp,
        text: 'move',
        row: row,
        col: col
    };
}

// TODO: Option type
export interface ValidationResult {
    isValid: boolean;
    error?: string;
}

// TODO: These types are awful
export interface ActionParser {
    action: (...args: any[]) => Action;
    key: RegExp;
    validate: (a: Action, ...rest: any[]) => ValidationResult;
}

function validateMoveAction(action: MoveAction, map: Map): ValidationResult {
    if (!isWithinMap(map, action.row, action.col)) {
        return {
            isValid: false,
            error: 'Out of bounds movement!'
        };
    } else if (!map.grid[action.row][action.col].room) {
        return {
            isValid: false,
            error: 'Desired location is not a room!'
        };
    } else {
        return {
            isValid: true
        };
    }
}

export const Move: ActionParser = {
    action: makeMoveAction,
    key: /^go (north|south|east|west)$/,
    validate: validateMoveAction
};

// This is dumb
export function makeDirection(s: string): Direction {
    if (s === 'north') {
        return 'North';
    }
    if (s === 'south') {
        return 'South';
    }
    if (s === 'east') {
        return 'East';
    }
    if (s === 'west') {
        return 'West';
    }
}
