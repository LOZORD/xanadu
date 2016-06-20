import _ from 'lodash';
import Context from './context';
import { PLAYER_STATES } from '../game/player';
import { BroadcastResponse, EchoResponse, GameResponse } from '../game/messaging';

export const NAME_VALIDATIONS = {
  REGEX: /^\w+$/,
  VALID: 0,
  TAKEN: 1,
  INVALID_CHARACTERS: 2
};

export default class Lobby extends Context {
  isReadyForNextContext() {
    return _.every(this.players,
        (player) => player.state === PLAYER_STATES.READY);
  }
  handleMessage(messageObj, player) {
    // XXX: this will need to be updated if we want flip-flopping between
    // games and lobbies
    let responses = [
        new EchoResponse({
          message: messageObj.message,
          to: player.id
        })
    ];
    switch (player.state) {
      case PLAYER_STATES.ANON: {
        const name = messageObj.message;
        const validationResult = this.validateName(name);
        if (validationResult === NAME_VALIDATIONS.VALID) {
          player.name = name;
          player.state = PLAYER_STATES.NAMED;
          responses.push(new GameResponse({
            message: `Welcome to Xanadu ${ name }! Enter \`ready\` to start.`,
            to: player
          }));
          responses.push(new BroadcastResponse({
            message: `Player '${ name }' has joined the game!`,
            from: player.id
          }));
        } else if (validationResult == NAME_VALIDATIONS.TAKEN) {
          responses.push(new GameResponse({
            message: `The name '${ name }' has already been taken.`,
            to: player.id
          }));
        } else if (validationResult == NAME_VALIDATIONS.INVALID_CHARACTERS) {
          responses.push(new GameResponse({
            message: `The name '${ name }' contains invalid characters. Use only alphanumeric, underscore, and hyphen characters.`,
            to: player.id
          }));
        } else {
          responses.push(new GameResponse({
            message: `The name '${ name }' is invalid.`,
            to: player.id
          }));
        }

        break;
      }
      case PLAYER_STATES.NAMED: {
        const message = messageObj.message;
        const words   = message.split(' ');

        if (words[0] === 'ready') {
          // TODO: maybe do something with the 'rest' of the words for this command
          // for example, maybe allow the player to prefer a certain character class
          // or for them to start with a certain number of modifiers

          player.state = PLAYER_STATES.READY;

          responses.push(new BroadcastResponse({
            message: 'READY!',
            from: player.id
          }));

          // the caller will have to check for `isReadyForNextContext`
        } else {
          // TODO: handle using some modular communication function
          // something similar to 'handleMessage' in Game
        }

        break;
      }
      case PLAYER_STATES.READY: {
        // TODO: similar communication logic can happen here
        break;
      }
      default: {
        // Don't do anything
        break;
      }
    }

    return responses;
  }
  validateName(name) {
    if (this.hasPlayerWithName(name)) {
      return NAME_VALIDATIONS.TAKEN;
    } else if (!NAME_VALIDATIONS.REGEX.test(name)) {
      return NAME_VALIDATIONS.INVALID_CHARACTERS;
    } else {
      return NAME_VALIDATIONS.VALID;
    }
  }
}
