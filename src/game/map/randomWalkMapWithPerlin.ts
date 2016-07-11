/* Based off the following content:
 * http://www.roguebasin.com/index.php?title=Random_Walk_Cave_Generation
 */

import { Vector } from './perlinNoise';
import { Cell, Position } from './cell';
import { Map } from './map';

const WEIGHT = 20;

function hasCell(p: Position, dim: number): boolean {
    return (
        0 <= p.row &&
        p.row < dim &&
        0 <= p.col &&
        p.col < dim
    );
}

function onEdge(p: Position, dim: number): boolean {
    return (
        p.row === 0 ||
        p.col === 0 ||
        p.row === dim - 1 ||
        p.col === dim - 1
    );
}

function combinePos(a: Position, b: Position): Position {
    return { row: a.row + b.row, col: a.col + b.col };
}

function weightRoomType(p: Position, dim: number, rand: number): number {
    function linearRange(a: Vector, b: Vector): (x: number) => number {
        const slope = (b.y - a.y) / (b.x - a.x);
        const intercept = b.y - (slope * b.x);
        return ((x) => slope * x + intercept);
    }

    function weightFunc(x: number): number {
        let half = dim / 2.0;
        if (x == half) {
            return 0;
        } else if (x < half) {
            return linearRange({ x: 1, y: 1 }, { x: half, y: 0 })(x);
        } else {
            return linearRange({ x: half, y: 0 }, { x: dim - 2, y: 0 })(x);
        }
    }

    return rand * weightFunc(p.row) *  weightFunc(p.col) * WEIGHT;
}

export function createMap(dim: number, percentBarrier: number): Map {
    const startingCell = { row: dim / 2, col: dim / 2 };
    const percentRoom = 100 - percentBarrier;
    const minNumRooms = Math.floor((percentRoom / 100.0) * (dim - 1) * (dim - 1));
    
    // TODO: Everything
    return null;
}

// export default (seed, dim, percentBarrier) => {
//     const startingCell = { row: dim / 2, col: dim / 2 };
//     const percentRoom = 100 - percentBarrier;
//     const minNumRooms = Math.floor((percentRoom / 100.0) * (dim - 1) * (dim - 1));
//
//
//     let map = new F2DA(dim, dim, CELL_TYPES.BARRIER);
//     map.set(dim / 2, dim / 2, CELL_TYPES.PASSAGE_ROOM);
//
//     let numRooms = 1;
//     let rng = new RNG(seed);
//
//     let currPos = startingCell;
//     let rand, updatePos;
//
//     let noUpdate = 0;
//     // XXX: might want to change this value
//     const updateLimit = Math.floor(dim * dim / 4);
//
//     let treasureRoomPlaced = false;
//     let numPassageRooms = 1;
//     const MAX_PASSAGE_ROOMS = 10;
//     const TREASURE_ROOM_THRESHOLD = 99;
//     const PASSAGE_ROOM_THRESHOLD = 98;
//
//
//     // TODO: what are these for?
//     let pRatio = 8;
//
//     let pRange = Math.ceil(dim/pRatio);
//
//     let pGridSize = pRange+1;
//
//     let perlinGrid = new PerlinNoiseGenerator(rng, pGridSize);
//
//
//     // while insufficient number of rooms
//     while (numRooms < minNumRooms) {
//         // take a random step in cardinal direction
//         // don't want any diagonal paths
//
//         let getWeight = function(pos, dr, dc){
//             return Math.ceil(Math.pow(4, 1 + perlinGrid.getValueForPoint({x: Math.min( pRange - 0.01,Math.max(0,(pos.col + dc) / pRatio)),
//                     y:  Math.min(pRange - 0.01, Math.max(0, (pos.row + dr)/ pRatio))})));
//         }
//
//         let upRange = getWeight(currPos,-1,0 );
//         let downRange = upRange + getWeight(currPos,1,0 );
//         let leftRange = downRange + getWeight(currPos,0,-1 );
//         let rightRange = leftRange = getWeight(currPos,-1,0 );
//
//
//
//         rand = rng.intBetween(1,leftRange);
//
//         // TODO (Max H): add Perlin Noise smoothing here to `rand` based on `currPos`
//
//         if (rand <= upRange) {
//             // North
//             updatePos = { row: -1, col: 0 };
//         } else if (rand  <= downRange) {
//             // South
//             updatePos = { row: 1, col: 0 };
//         } else if (rand <= leftRange) {
//             // West
//             updatePos = { row: 0, col: -1 };
//         } else if (rand <= rightRange) {
//             // East
//             updatePos = { row: 0, col: 1 };
//         } else {
//             // do nothing
//         }
//
//         let possibleNewPos = combinePos(currPos, updatePos);
//
//         if (hasCell(possibleNewPos) && !onEdge(possibleNewPos)) {
//             if (map.get(possibleNewPos.row, possibleNewPos.col) === CELL_TYPES.BARRIER) {
//                 currPos = possibleNewPos;
//
//                 /* randomly place either:
//                  * (1) a room
//                  * (2) a passage room
//                  * (3) the treasure room (only placed once)
//                  */
//
//                 let roomTypeRand = weightRoomType(currPos, rng.intBetween(0, 100));
//                 // FIXME: only want to weight towards TreasureRooms BUT NOT PassageRooms
//                 let roomToPlace;
//
//                 if (roomTypeRand >= TREASURE_ROOM_THRESHOLD && !treasureRoomPlaced) {
//                     roomToPlace = CELL_TYPES.TREASURE_ROOM;
//                     treasureRoomPlaced = true;
//                 } else if (roomTypeRand >= PASSAGE_ROOM_THRESHOLD && numPassageRooms < MAX_PASSAGE_ROOMS) {
//                     roomToPlace = CELL_TYPES.PASSAGE_ROOM;
//                     numPassageRooms++;
//                 } else {
//                     roomToPlace = CELL_TYPES.ROOM;
//                 }
//
//                 map.set(currPos.row, currPos.col, roomToPlace);
//
//                 numRooms++;
//             } else {
//                 // XXX: might want to update to possibleNewPos anyway...
//                 currPos = possibleNewPos;
//                 noUpdate++;
//
//                 if (noUpdate >= updateLimit) {
//                     // jump somewhere new on the map
//                     currPos = {
//                         // i.e. not 0 or dim - 1
//                         row: rng.intBetween(1, dim - 2),
//                         col: rng.intBetween(1, dim - 2)
//                     };
//                 }
//             }
//         } else {
//             // do nothing
//         }
//     }
//
//     if (!treasureRoomPlaced) {
//         throw new Error('did not place treasure room');
//     }
//
//     return map;
// };
