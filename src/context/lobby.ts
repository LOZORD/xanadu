import * as _ from 'lodash';

import { ClientMessage, Context } from './context';
import { Player, isReady } from '../game/player';
import { Message, createEchoMessage, createGameMessage, createTalkMessage } from '../game/messaging';

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
          responses.push(
            createGameMessage(`Welcome to Xanadu ${name}! Enter \`ready \` to start.`, [ fromClient.player ])
          );
          responses.push(
            this.broadcastFromPlayer(`${name} has joined the game!`, fromClient.player)
          );
        } else {
          let errorMsg = '';
          if (validationResult === 'Taken') {
            errorMsg = `The name '${name}' has already been taken.`;
          } else {
            errorMsg = `The name '${name}' contains invalid characters. `
              + "Use only alphanumeric, underscore, and hyphen characters.";
          }

          responses.push(createGameMessage(errorMsg, [ fromClient.player ]));
        }
        break;
      }
      case 'Preparing': {
        const message = fromClient.content;
        const words = message.split(' ');

        if (words[ 0 ].toLowerCase() === 'ready') {
          // TODO: maybe do something with the 'rest' of the words for this command
          // for example, maybe allow the player to prefer a certain character class
          // or for them to start with a certain number of modifiers

          this.updatePlayer(fromClient.player.id, { state: 'Ready' });
          responses.push(this.broadcastFromPlayer(`${fromClient.player.name} is ready`, fromClient.player));

          // the caller will have to check for `isReadyForNextContext`
        } else {
          responses.push(
            createTalkMessage(fromClient.player, fromClient.content, this.playersWithout([fromClient.player]))
          );
        }

        break;
      }
      case 'Ready': {
        responses.push(
          createTalkMessage(fromClient.player, fromClient.content, this.playersWithout([fromClient.player]))
        );
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
