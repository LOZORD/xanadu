import * as _ from 'lodash';

import { Command, Context } from './context';
import { Player, isReady } from '../game/player';
import * as Messaging from '../game/messaging';

export default class Lobby extends Context {
    isReadyForNextContext() {
        return _.every(this.players, isReady);
    }

    broadcast(message: string): Messaging.Dispatch {
        return Messaging.gameMessage(message)(this.players.map(p => p.id));
    }
    
    handleCommand(messageObj: Command, player: Player) {
        // XXX: this will need to be updated if we want flip-flopping between
        // games and lobbies
        let responses: Messaging.Dispatch[] = [ Messaging.echoMessage(player.id, messageObj.contents) ];
        switch (player.state) {
            case 'Anon': {
                const name = messageObj.contents;
                const validationResult = this.validateName(name);
                if (validationResult === 'Valid') {
                    this.updatePlayer(player.id, { name, state: 'Preparing' });
                    responses.push(this.broadcast(`Welcome to Xanadu ${ name }! Enter \`ready\` to start.`));
                    responses.push(Messaging.gameMessage('Enter `ready` to start.')([player.id]));
                } else {
                    let errorMsg = '';
                    if (validationResult === 'Taken') {
                        errorMsg = `The name '${ name }' has already been taken.`;
                    } else {
                        errorMsg = `The name '${ name }' contains invalid characters. Use only alphanumeric, underscore, and hyphen characters.`;
                        responses.push(Messaging.gameMessage(errorMsg)([player.id]));
                    }
                }
                break;
            }
            case 'Named': {
                const message = messageObj.contents;
                const words   = message.split(' ');
                
                if (words[0] === 'ready') {
                    // TODO: maybe do something with the 'rest' of the words for this command
                    // for example, maybe allow the player to prefer a certain character class
                    // or for them to start with a certain number of modifiers
                    
                    this.updatePlayer(player.id, { state: 'Preparing' });
                    responses.push(this.broadcast(`${player.name} is ready`));
                    
                    // the caller will have to check for `isReadyForNextContext`
                } else {
                    responses.push(Messaging.talkMessage(player.id, messageObj.contents)(this.players.map(p => p.id)));
                }
                break;
            }
            case 'Ready': {
                responses.push(Messaging.talkMessage(player.id, messageObj.contents)(this.players.map(p => p.id)));
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
