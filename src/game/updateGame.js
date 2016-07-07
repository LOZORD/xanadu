import _ from 'lodash';
import Action, * as Actions from './actions';

export default (game, action) => {
  if (!(action instanceof Action)) {
    // don't do anything
    return game;
  } else {
    switch (action.constructor) {
      case Actions.MoveAction: {
        // TODO
      }
    }
  }
};
