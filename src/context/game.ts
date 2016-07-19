import * as _ from 'lodash';

import { makeDirection, makeMoveAction, Move } from '../game/actions';
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
        let responses: Message[] = [ Messaging.createEchoMessage(player, messageObj.contents) ];
        if (Move.key.test(messageObj.contents)) {
            const move = makeMoveAction(
                player.character,
                messageObj.ts,
                makeDirection(messageObj.contents.split(' ')[1])
            );
            if (Move.validate(move)) {
                player.character.nextAction = move;
                responses.push(gameMessage(`Next action: move to ${[move.row, move.col]}`)([player]));
            } else {
                responses.push(gameMessage('You cannot move in that direction')([player]));
            }
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
