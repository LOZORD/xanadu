import { Position } from './map/cell';

// TODO: cruft?
export interface Entity extends Position {
};

// TODO: cruft?
export interface MoveableEntity extends Entity {
};

export function moveEntity(e: MoveableEntity, pos: Position) {
    e.row = pos.row;
    e.col = pos.col;
}
