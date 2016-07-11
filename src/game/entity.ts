export interface Entity {
    row: number;
    col: number;
}

export interface MoveableEntity {
    row: number;
    col: number;
    move: (row: number, col: number) => MoveableEntity; // this is bad
}