import _        from 'lodash';

import Player, { PLAYER_STATES } from './player';
import Map      from './map/map';
import {
  Response, EchoResponse, BroadcastResponse, GameResponse,
  PlayerResponse, WhisperResponse,
  MultiplePlayerResponse, ChatResponse, ShoutResponse
} from './messaging';

import Context from '../context/context';
import { TEST_MAP_DATA } from './map/parseGrid';
import actionParser from './actionParser';
import communicationHandler from '../context/communicationHandler';
import updateGame from './updateGame';

const logging = false;

// TODO: one of the game parameters should be the number of modifiers randomly assigned
// TODO: Game should extend Context (other subclass is Lobby)
export default class Game extends Context {
  constructor(kwargs = {}) {
    super(kwargs);

    this.rng = kwargs.rng;

    if (!this.rng) {
      throw new Error('No default value for missing RNG!');
    }

    //const characterGrid = kwargs.characterGrid || TEST_MAP_DATA;
    this.map = kwargs.map ||
      new Map(TEST_MAP_DATA.characterGrid, TEST_MAP_DATA.startingPosition, this.rng);

    this.players.forEach((player) => {
      // set all the players' states to playing
      player.state = PLAYER_STATES.PLAYING;
      // place all the players in the starting position on the map's grid
      player.character.setPosition(
        this.map.startingPassageRoom.row,
        this.map.startingPassageRoom.col
      );
    });

    this.turnNumber = kwargs.turnNumber || 0;
    //this.hasStarted = kwargs.hasStarted || false;
    this.hasEnded = kwargs.hasEnded || false;
  }

  handleMessage(messageObj, player) {
    const message = messageObj.message;
    let responses = [
      (new EchoResponse(message, player))
    ];

    // is the player sending an action?
    if (actionParser.isParsableAction(message)) {
      const actionArgs = [player.character, messageObj.ts, message];

      const newAction = actionParser.parseAction(message).apply(null, actionArgs);

      player.character.nextAction = newAction;
      responses.push(new GameResponse(`Next move: ${ newAction.text }`, player));
    } else {
      // TODO: ok for now until communicationHandler is made more flexible
      // XXX: what to do with non-action, non-communication junk messages?
      responses.push(
        communicationHandler(messageObj, player, this)
      );
    }

    return responses;

    /*
    if (player.isAnonymous()) {
      player.name = messageObj.message;
      player.state = PLAYER_STATES.NAMED;

      return [
        (new EchoResponse({
          message: player.name,
          to: player
        })),
        (new GameResponse({
          message: `Welcome to Xanadu ${ player.name }! Enter \`ready\` to start.`,
          to: player
        }))
      ];
    } else {
      const words = messageObj.message.split(" ");
      switch (words[0]) {
        case 'whisper':
        {
          const recipient = this.getPlayerWithName(words[1]);
          if (recipient) {
            const message = {
              from: player,
              to: recipient,
              message: words.splice(2).join(" "),
              type: 'whisper'
            };
            return [(new WhisperResponse(message))];
          } else {
            console.log('Invalid message recipient', messageObj, recipient);
            return;
          }
        }
        case 'broadcast':
        {
          const message = {
            from: player,
            message: words.splice(1).join(" "),
            type: 'broadcast'
          };
          return [(new BroadcastResponse(message))];
        }
        default:
        {
          return [];
        }
      }
    }
    */
  }

  isAcceptingPlayers() {
    //return !this.hasStarted && this.players.length < this.maxPlayers;
    // once the game has started (i.e. been created), no new players can join
    return false;
  }

  isRunning() {
    //return this.hasStarted && !this.hasEnded;
    return !this.hasEnded;
  }

  getPlayerDetails() {
    return _.reduce(
      this.players,
      (acc, player) => _.assign(acc, { [player.id]: player.getDetails() }),
      {}
    );
  }

  isReadyForNextContext() {
    // XXX: might be more 'correct' to check that no players have their state
    // as `PLAYING` or whatever...
    return this.hasEnded;
  }

  isReadyForUpdate() {
    return _.every(this.players, 'character.nextAction');
  }

  update() {
    const actions = _.map(this.players, 'character.nextAction');

    const { game: updatedGame, log } = performActions(this, actions);

    if (logging) {
      console.log('Got log: ' + JSON.stringify(log));
    }

    updatedGame.turnNumber = this.turnNumber + 1;

    if (logging) {
      console.log(`
        \t\tCOMPLETED ROUND
        \t\tNEXT ROUND: #${ updatedGame.turnNumber }
      `);
    }

    return updatedGame;
  }
}

// All updates to the game are represented as an immutable tuple of
// game state and updates to the message log
class _GameUpdate {
  constructor(game, log) {
    this._game = game;
    this._log = log;
  }
  get game() {
    return this._game;
  }
  get log() {
    return this._log;
  }
  set game(g) {
    throw new Error("Can't set 'game' field on GameUpdate");
  }

  set log(l) {
    throw new Error("Can't set 'log' field on GameUpdate");
  }
}

// Factory function for game updates
const GameUpdate = (game, log) => new _GameUpdate(game, log);

// TODO: given an initial game state and an action to perform, return new game state
//const update = (game, action) => game;
// true arg -> validate actions (useful for debugging)
const update = ({ game, log }, action) => updateGame({ game, log }, action, true);

// TODO: go back to using GameUpdate (sorry Zach!)
//const foldActions = (game, actions) => _.reduce(actions, update, GameUpdate(game, []));

const foldActions = (game, actions) => _.reduce(actions, update, { log: [], game });

const sortActions = (actions) => _.sortBy(actions, ['actor.agility', 'timestamp']);

const performActions = (game, actions) => foldActions(game, sortActions(actions));
