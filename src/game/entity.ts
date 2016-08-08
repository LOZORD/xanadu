import { Position } from './map/cell';

export interface Entity {
    row: number;
    col: number;
}

export interface MoveableEntity {
    row: number;
    col: number;
}

export function moveEntity(e: MoveableEntity, pos: Position) {
    e.row = pos.row;
    e.col = pos.col;
}
