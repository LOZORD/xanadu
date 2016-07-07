import _ from 'lodash';
import Action, * as Actions from './actions';
import actionValidator from './actionValidator';

export default (game, action, validate = false) => {
  if (!(action instanceof Action)) {
    // don't do anything
    return game;
  } else {
    if (validate) {
      if (!actionValidator(action)) {
        throw new Error(`Invalid action involved in game update: ${ JSON.stringify(action) }`);
      }
    }
    switch (action.constructor) {
      case Actions.MoveAction: {
        const pos = action.newPosition();

        // TODO: return new game, don't mutate
        action.actor.setPos(pos);
      }
    }
  }
};
