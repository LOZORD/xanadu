import * as _ from 'lodash';

import { ClientMessage, Context } from './context';
import { Player, isReady } from '../game/player';
import { Message, createEchoMessage, gameMessage, talkMessage } from '../game/messaging';

export default class Lobby extends Context {
  isReadyForNextContext() {
    return _.every(this.players, isReady);
  }

  handleMessage(fromClient: ClientMessage): Message[] {
    // XXX: this will need to be updated if we want flip-flopping between
    // games and lobbies
    let responses: Message[] = [ createEchoMessage(fromClient.content, fromClient.player) ];
    switch (fromClient.player.state) {
      case 'Anon': {
        const name = fromClient.content;
        const validationResult = this.validateName(name);
        if (validationResult === 'Valid') {
          this.updatePlayer(fromClient.player.id, { name, state: 'Preparing' });
          responses.push(this.broadcast(`Welcome to Xanadu ${name}! Enter \`ready\` to start.`));
          responses.push(gameMessage('Enter `ready` to start.')([ fromClient.player ]));
        } else {
          let errorMsg = '';
          if (validationResult === 'Taken') {
            errorMsg = `The name '${name}' has already been taken.`;
          } else {
            errorMsg = `The name '${name}' contains invalid characters. `
              + "Use only alphanumeric, underscore, and hyphen characters.";
          }

          responses.push(gameMessage(errorMsg)([ fromClient.player ]));
        }
        break;
      }
      case 'Preparing': {
        const message = fromClient.content;
        const words = message.split(' ');

        if (words[ 0 ] === 'ready') {
          // TODO: maybe do something with the 'rest' of the words for this command
          // for example, maybe allow the player to prefer a certain character class
          // or for them to start with a certain number of modifiers

          this.updatePlayer(fromClient.player.id, { state: 'Ready' });
          responses.push(this.broadcast(`${fromClient.player.name} is ready`));

          // the caller will have to check for `isReadyForNextContext`
        } else {
          responses.push(talkMessage(fromClient.player, fromClient.content)(this.players));
        }
        break;
      }
      case 'Ready': {
        responses.push(talkMessage(fromClient.player, fromClient.content)(this.players));
        break;
      }
      default: {
        // Don't do anything
        break;
      }
    }

    return responses;
  }
}
