import _ from 'lodash';
import Action, * as Actions from './actions';
import Room from './map/room';

export default (game, action) => {
  if (!(action instanceof Action)) {
    return false;
  } else {
    switch (action.constructor) {
      case Actions.MoveAction: {
        const currPos = action.actor.position;

        const desiredPos = _.clone(currPos);

        switch (action.direction) {
          case 'north':
            desiredPos.row -= 1;
            break;
          case 'south':
            desiredPos.row += 1;
            break;
          case 'east':
            desiredPos.col += 1;
            break;
          case 'west':
            desiredPos.col -= 1;
            break;
          default:
            return false;
        }

        const boundsOK = game.map.withinBounds(desiredPos.row, desiredPos.col);

        const isRoom =
          game.map.grid.get(desiredPos.row, desiredPos.col) instanceof Room;

        return boundsOK && isRoom;
      }
      default: {
        return false;
      }
    }
  }
};
