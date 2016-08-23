import * as _ from 'lodash';
import * as Map from './map';
import * as Cell from './cell';

export default function describeRoom
  (location: Cell.Position, map: Map.Map): string {
  let description = 'It is a dark room.\n';

  const allNeighbors = Cell.getCardinalNeighboringPositions(location);

  const neighborPairs = _.toPairs(allNeighbors);

  const pathNeighbors = _
    .chain(neighborPairs)
    .filter(([ direction, position ]) => Map.isWithinMap(map, position))
    .filter(([ direction, position ]) => Map.getCell(map, position).room)
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
