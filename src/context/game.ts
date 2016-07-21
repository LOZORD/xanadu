import * as _ from 'lodash';

import * as Actions from '../game/actions';
import { moveEntity } from '../game/entity';
import { Player } from '../game/player';
import { Map } from '../game/map/map';
import * as Messaging from '../game/messaging';

import { Context, Command } from './context';
import { TEST_PARSE_RESULT } from '../game/map/parseGrid';
import { Message, gameMessage } from "../game/messaging";

// TODO: one of the game parameters should be the number of modifiers randomly assigned
export default class Game extends Context {

    hasEnded: boolean;
    turnNumber: number;
    map: Map;

    constructor(maxPlayers: number, players: Player[], map?: Map) {
        super(maxPlayers, players);
        this.map = map || TEST_PARSE_RESULT;

        this.players.forEach((player) => {
            // set all the players' states to playing
            player.state = 'Playing';
            moveEntity(player.character, this.map.startingPosition);
        });

        this.turnNumber = 0;
        this.hasEnded = false;
    }

    handleCommand(messageObj: Command, player: Player): Message[] {
        let responses: Message[] = [ Messaging.createEchoMessage(messageObj.contents, player) ];

        const component = Actions.getComponent(messageObj.contents);

        const action = component.parse(messageObj.contents, player.character, messageObj.ts);

        const { isValid, error } = component.validate(action, this);

        if (isValid) {
            player.character.nextAction = action;
            responses.push(Messaging.createGameMessage(`Next action: ${ messageObj.contents }`, [player]));
        } else {
            responses.push(Messaging.createGameMessage(`Invalid action: ${ error }`, [player]));
        }

        // TODO: Other action types
        return responses;
    }

    isAcceptingPlayers() {
        // once the game has started (i.e. been created), no new players can join
        return false;
    }

    isRunning() {
        return !this.hasEnded;
    }

    isReadyForNextContext() {
        // XXX: might be more 'correct' to check that no players have their state
        // as `PLAYING` or whatever...
        return this.hasEnded;
    }

    isReadyForUpdate() {
        return _.every(this.players, 'character.nextAction');
    }
}
