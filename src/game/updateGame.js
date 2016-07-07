import _ from 'lodash';
import Action, * as Actions from './actions';
import actionValidator from './actionValidator';

// TODO: incorporate the GameUpdate object in `game.js`
export default (game, action, validate = false) => {

  if (validate) {
    const validation = actionValidator(game, action);
    if (!validation.isValid) {
      throw new Error(`Invalid action involved in game update! Reason: ${ validation.reason }`);
    }
  }
  if (!(action instanceof Action)) {
    // don't do anything
    return game;
  } else {
    //const newGame = _.clone(game);
    switch (action.constructor) {
      case Actions.MoveAction: {
        const newPos = action.newPosition();

        // TODO: do a pure state change instead
        action.actor.setPosition(newPos);
      }
    }

    //return newGame;
    return game;
  }
};
