import _        from 'lodash';

import Player, { PLAYER_STATES } from './player';
import Map      from './map/map';
import {
  Response, EchoResponse, BroadcastResponse, GameResponse,
  PlayerResponse, WhisperResponse,
  MultiplePlayerResponse,ChatResponse, ShoutResponse
} from './messaging';

import Context from '../context/context';
import { TEST_MAP_DATA } from './map/parseGrid';
import actionParser from './actionParser';

// TODO: one of the game parameters should be the number of modifiers randomly assigned
// TODO: Game should extend Context (other subclass is Lobby)
export default class Game extends Context {
  constructor(kwargs = {}) {
    super(kwargs);

    this.rng        = kwargs.rng;

    if (!this.rng) {
      throw new Error('No default value for missing RNG!');
    }

    //const characterGrid = kwargs.characterGrid || TEST_MAP_DATA;
    this.map        = kwargs.map        ||
      new Map(TEST_MAP_DATA.characterGrid, TEST_MAP_DATA.startingPosition, this.rng);

    // place all the players in the starting position on the map's grid
    this.players.forEach((player) => {
      player.character.setPosition({
        row: this.map.startingPassageRoom.row,
        col: this.map.startingPassageRoom.col
      });
    });

    this.turnNumber = kwargs.turnNumber || 0;
    //this.hasStarted = kwargs.hasStarted || false;
    this.hasEnded   = kwargs.hasEnded   || false;
  }

  handleMessage(messageObj, player) {
    const message = messageObj.message;
    const actionFunc = actionParser.parseAction(message);

    if (actionFunc) {
      // we can test if this is a valid action

    } else {
      // it may be a communication command
      // otherwise, it is garbage
    }


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
        (acc, player) => _.assign(acc, { [player.id] : player.getDetails() }),
        {}
    );
  }

  isReadyForNextContext() {
    // XXX: might be more 'correct' to check that no players have their state
    // as `PLAYING` or whatever...
    return this.hasEnded;
  }

  isReadyForUpdate() {
    return _
      .chain(this.players)
      .map((player) => player.character)
      .every('character.nextAction')
      .value();
  }

  update() {
    const actions = _.map(this.players, 'character.nextAction');
    return performActions(this, actions);
  }
}

// All updates to the game are represented as an immutable tuple of
// game state and updates to the message log
class _GameUpdate {
  constructor(game, log) {
    this.game = game;
    this.log = log;
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
const update = (game, action) => game;

const foldActions = (game, actions) => _.reduce(actions, update, GameUpdate(game, []));

const sortActions = (actions) => _.sortBy(actions, ['character.agility', 'timestamp']);

const performActions = (game, msgs) => foldActions(game, sortActions(msgs));
