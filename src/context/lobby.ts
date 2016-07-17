import * as _ from 'lodash';

import { Command, Context } from './context';
import { Player } from '../game/player';
import * as Messaging from '../game/messaging';

export const validName: RegExp = /^\w+$/;

export type NameValidation = 'Valid' | 'Taken' | 'Invalid characters';

export function validateName(name: string): NameValidation {
    // TODO: validate against "subset" names
    // e.g. "James_Bond" and "James_Bond_007"
    if (this.hasPlayerWithName(name)) {
        return 'Taken';
    } else if (!NAME_VALIDATIONS.REGEX.test(name)) {
        return 'Invalid characters';
    } else {
        return 'Valid';
    }
}

export default class Lobby extends Context {
    isReadyForNextContext() {
        return _.every(this.players, (player) => player.isReady());
    }

    broadcast(message: string): void {
        for (let i = 0; i < this.players.length; i++) {
            responses.push(Messaging.gameMessage(message)(this.players[i].id));
        }
    }
    
    handleMessage(messageObj: Command, player: Player) {
        // XXX: this will need to be updated if we want flip-flopping between
        // games and lobbies
        let responses: Dispatch[] = [ Messaging.echoMessage(player.id, messageObj.contents) ];
        switch (player.state) {
            case 'Anon': {
                const name = messageObj.message;
                const validationResult = validateName(name);
                if (validationResult === 'Valid') {
                    this.updatePlayer(player.id, { name, state: 'Named' });
                    this.broadcast(`Welcome to Xanadu ${ name }! Enter \`ready\` to start.`);
                    for (let i = 0; i < this.players.length; i++) {
                        responses.push(Messaging.gameMessage(`${ name } has entered the game`)(this.players[i].id));
                    }
                    responses.push(Messaging.gameMessage('Enter `ready` to start.')(player.id));
                } else {
                    let errorMsg = '';
                    if (validationResult === 'Taken') {
                        errMsg = `The name '${ name }' has already been taken.`;
                    } else {
                        errMsg = `The name '${ name }' contains invalid characters. Use only alphanumeric, underscore, and hyphen characters.`;
                        this.responses.push(Messaging.gameMessage(errMsg)(player.id));
                    }
                }
                break;
            }
            case 'Named': {
                const message = messageObj.message;
                const words   = message.split(' ');
                
                if (words[0] === 'ready') {
                    // TODO: maybe do something with the 'rest' of the words for this command
                    // for example, maybe allow the player to prefer a certain character class
                    // or for them to start with a certain number of modifiers
                    
                    this.updatePlayer(player.id, { state: 'Ready' });
                    this.broadcast(`${player.name} is ready`);
                    
                    // the caller will have to check for `isReadyForNextContext`
                } else {
                    for (let i = 0; i < this.players.length; i++) {
                        responses.push(Messaging.talkMessage(player.id, messageObj.message)(this.players[i].id));
                    }
                }
                break;
            }
            case 'Ready': {
                for (let i = 0; i < this.players.length; i++) {
                    responses.push(Messaging.talkMessage(player.id, messageObj.message)(this.players[i].id));
                }
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
