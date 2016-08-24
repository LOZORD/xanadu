import * as _ from 'lodash';
import * as Map from './map';
import * as Cell from './cell';

export default function describeRoom(room: Cell.Room, map: Map.Map): string {
  let description: string;

  if (Cell.isTreasureRoom(room)) {
    description = 'Behold! The riches of Xanadu!\nYou have found the treasure room!\n';
  } else if (Cell.isPassageRoom(room)) {
    description = 'You have reached a passage room!\n';
  } else {
    description = 'It is a dark room.\n';
  }

  const allNeighbors = Cell.getCardinalNeighboringPositions({
    row: room.col,
    col: room.col
  });

  const neighborPairs = _.toPairs(allNeighbors);

  const pathNeighbors = _
    .chain(neighborPairs)
    .filter(([ direction, position ]) => Map.isWithinMap(map, position))
    .filter(([ direction, position ]) => Cell.isRoom(Map.getCell(map, position)))
    .fromPairs()
    .value();

  const numPaths = _.size(pathNeighbors);

  if (numPaths === 1) {
    description += `There is one path to the ${_.keys(pathNeighbors)[ 0 ]}.`;
  } else {
    const directions = _.keys(pathNeighbors);
    const dirStr = `${_.initial(directions).join(', ')} and ${_.last(directions)}`;
    description += `There are paths to the ${dirStr}.`;
  }

  return description;
}
