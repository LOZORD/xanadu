import _ from 'lodash';
import Action, * as Actions from './actions';
import Room from './map/room';

export default (game, action) => {
  if (!(action instanceof Action)) {
    return {
      isValid: false,
      reason: `Not an Action subclass: ${ action ? action.constructor.name : String(action) }`
    };
  } else {
    switch (action.constructor) {
      case Actions.MoveAction: {
        const currPos = action.actor.position;
        
        const desiredPos = action.newPosition();

        const boundsOK = game.map.withinBounds(desiredPos.row, desiredPos.col);

        if (!boundsOK) {
          return {
            isValid: false,
            reason: 'Out of bounds movement!'
          };
        }

        const isRoom =
          game.map.grid.get(desiredPos.row, desiredPos.col) instanceof Room;

        //return boundsOK && isRoom;

        if (!isRoom) {
          return {
            isValid: false,
            reason: 'Desired location is not a room!'
          };
        }

        return {
          isValid: true
        };
      }
      default: {
        return {
          isValid: false,
          reason: 'Cannot validate unknown Action subclass'
        };
      }
    }
  }
};
