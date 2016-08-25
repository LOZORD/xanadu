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
    row: room.row,
    col: room.col
  });

  const pathNeighbors = _.pickBy(allNeighbors, (pos) => Map.isValidRoom(map, pos));

  const pathDirections = _.keys(pathNeighbors);

  if (pathDirections.length === 1) {
    description += `There is one path to the ${pathDirections[ 0 ]}.`;
  } else {
    const dirStr = `${_.initial(pathDirections).join(', ')} and ${_.last(pathDirections)}`;
    description += `There are paths to the ${dirStr}.`;
  }

  return description;
}
