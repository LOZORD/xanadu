import _ from 'lodash';
import Action, * as Actions from './actions';
import actionValidator from './actionValidator';

// TODO: incorporate the GameUpdate object in `game.ts`
export default ({ game, log }, action, validate = false) => {

  if (validate) {
    const validation = actionValidator(game, action);
    if (!validation.isValid) {
      throw new Error(`Invalid action involved in game update! Reason: ${ validation.reason }`);
    }
  }
  if (!(action instanceof Action)) {
    // don't do anything
    return { game, log };
  } else {
    switch (action.constructor) {
      case Actions.MoveAction: {
        const { row: oldRow, col: oldCol } = action.actor.position;
        const { row: newRow, col: newCol } = action.newPosition();

        // TODO: do a pure state change instead
        action.actor.setPosition(newRow, newCol);

        log.push(`Moved ${ action.actor.player.id } from (${ oldRow }, ${ oldCol }) to (${ newRow }, ${ newCol })`);
      }
    }

    return { game, log };
  }
};
