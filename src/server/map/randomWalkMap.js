/* Based off the following content:
 * http://www.roguebasin.com/index.php?title=Random_Walk_Cave_Generation
 */

let PNOISE = require('./perlinNoise.js')
let RNG = require('random-seed');
let F2DA = require('fixed-2d-array');

const CELL_TYPES = {
  ROOM: '_',
  BARRIER: '#',
  TREASURE_ROOM: 'X',
  PASSAGE_ROOM: '^'
};

let RandomWalkMapGenerator = (seed, dim, percentBarrier) => {
  const startingCell = { row: dim / 2, col: dim / 2 };
  const percentRoom = 100 - percentBarrier;
  const minNumRooms = Math.floor((percentRoom / 100.0) * (dim - 1) * (dim - 1));
  const hasCell = ({ row, col }) => {
    return (
        0 <= row &&
        row < dim &&
        0 <= col &&
        col < dim
    );
  };

  const onEdge = ({ row, col }) => {
    return (
        row === 0 ||
        col === 0 ||
        row === dim - 1 ||
        col === dim - 1
    );
  };

  const combinePos = ({ row: r1, col: c1 }, { row: r2, col: c2 }) => {
    return { row: r1 + r2, col: c1 + c2 };
  };

  // we want to lean towards placing the treasure room on the edge of the map
  const weightRoomType = ({ row, col }, rand) => {

    const linearRange = ([ x1, y1 ], [ x2, y2 ]) => {
      // the `m` in y = mx + b
      let slope = ((y2 - y1) * 1.0)/(x2 - x1);

      // the `b` in y = mx + b
      let intercept = y2 - (slope * x2);

      return ((x) => slope * x + intercept);
    };

    // like an absval function
    // full weight => 1
    // no weight = 0
    // since regular Rooms occupy the lower range of the threshold (see 133)
    const weightFunc = (x) => {
      let half = dim / 2.0;
      if (x == half) {
        return 0;
      } else if (x < half) {
        let beginRange = linearRange([ 1, 1 ], [ half, 0 ]);
        return beginRange(x);
      } else { // x > half
        let endRange = linearRange([ half, 0 ], [ dim - 2, 0 ]);
        return endRange(x);
      }
    };

    let rowWeight = weightFunc(row);
    let colWeight = weightFunc(col);
    let weightWeight = 20;

    console.log(row, col, rand, rand * rowWeight * colWeight * weightWeight);

    return rand * (rowWeight * colWeight * weightWeight);
  };

  let map = new F2DA(dim, dim, CELL_TYPES.BARRIER);
  map.set(dim / 2, dim / 2, CELL_TYPES.PASSAGE_ROOM);

  let numRooms = 1;
  let rng = new RNG(seed);

  let currPos = startingCell;
  let rand, updatePos;

  let noUpdate = 0;
  // XXX: might want to change this value
  const updateLimit = Math.floor(dim * dim / 4);

  let treasureRoomPlaced = false;
  let numPassageRooms = 1;
  const MAX_PASSAGE_ROOMS = 10;
  const TREASURE_ROOM_THRESHOLD = 99;
  const PASSAGE_ROOM_THRESHOLD = 98;


  let pRatio = 8;

  let pRange = Math.ceil(dim/pRatio);

  let pGridSize = pRange+1;

  let perlinGrid = PNOISE.getPerlinGrid(rng, pGridSize);


  // while insufficient number of rooms
  while (numRooms < minNumRooms) {
    if (false && numRooms % 10 === 0) {
      console.log(`numRooms: ${ numRooms } ||| minNumRooms: ${ minNumRooms }`);
    }

    // take a random step in cardinal direction
    // don't want any diagonal paths

    let getWeight = function(pos, dr, dc){
      return Math.ceil(Math.pow(4, 1 + perlinGrid.getValueForPoint({x: Math.min( pRange - 0.01,Math.max(0,(pos.col + dc) / pRatio)), 
        y:  Math.min(pRange - 0.01, Math.max(0, (pos.row + dr)/ pRatio))})));
    }

    let upRange = getWeight(currPos,-1,0 );
    let downRange = upRange + getWeight(currPos,1,0 );
    let leftRange = downRange + getWeight(currPos,0,-1 );
    let rightRange = leftRange = getWeight(currPos,-1,0 );



    rand = rng.intBetween(1,leftRange);

    // TODO (Max H): add Perlin Noise smoothing here to `rand` based on `currPos`

    if (rand <= upRange) {
      // North
      updatePos = { row: -1, col: 0 };
    } else if (rand  <= downRange) {
      // South
      updatePos = { row: 1, col: 0 };
    } else if (rand <= leftRange) {
      // West
      updatePos = { row: 0, col: -1 };
    } else if (rand <= rightRange) {
      // East
      updatePos = { row: 0, col: 1 };
    } else {
      // do nothing
    }

    let possibleNewPos = combinePos(currPos, updatePos);

    if (hasCell(possibleNewPos) && !onEdge(possibleNewPos)) {
      if (map.get(possibleNewPos.row, possibleNewPos.col) === CELL_TYPES.BARRIER) {
        currPos = possibleNewPos;

        /* randomly place either:
         * (1) a room
         * (2) a passage room
         * (3) the treasure room (only placed once)
         */

        let roomTypeRand = weightRoomType(currPos, rng.intBetween(0, 100));
        // FIXME: only want to weight towards TreasureRooms BUT NOT PassageRooms
        let roomToPlace;

        if (roomTypeRand >= TREASURE_ROOM_THRESHOLD && !treasureRoomPlaced) {
          roomToPlace = CELL_TYPES.TREASURE_ROOM;
          treasureRoomPlaced = true;
        } else if (roomTypeRand >= PASSAGE_ROOM_THRESHOLD && numPassageRooms < MAX_PASSAGE_ROOMS) {
          roomToPlace = CELL_TYPES.PASSAGE_ROOM;
          numPassageRooms++;
        } else {
          roomToPlace = CELL_TYPES.ROOM;
        }

        map.set(currPos.row, currPos.col, roomToPlace);

        numRooms++;
      } else {
        // XXX: might want to update to possibleNewPos anyway...
        currPos = possibleNewPos;
        noUpdate++;

        if (noUpdate >= updateLimit) {
          // jump somewhere new on the map
          currPos = {
            // i.e. not 0 or dim - 1
            row: rng.intBetween(1, dim - 2),
            col: rng.intBetween(1, dim - 2)
          };
        }
      }
    } else {
      // do nothing
    }
  }

  if (!treasureRoomPlaced) {
    throw 'did not place treasure room';
  }

  return map;
};

module.exports = RandomWalkMapGenerator;
