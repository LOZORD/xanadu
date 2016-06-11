import _        from 'lodash';

import Player, { PLAYER_STATES } from './player';
import Map      from './map/map';
import {
  Response, EchoResponse, BroadcastResponse, GameResponse,
  PlayerResponse, WhisperResponse,
  MultiplePlayerResponse,ChatResponse, ShoutResponse
} from './messaging';

// TODO: one of the game parameters should be the number of modifiers randomly assigned
export default class Game {
  constructor(kwargs = {}) {
    this.rng        = kwargs.rng;

    if (!this.rng) {
      throw new Error('No default value for missing RNG!');
    }

    this.players    = kwargs.players    || [];
    let mapOpts     = kwargs.mapOptions || {};
    this.map        = kwargs.map        || new Map(mapOpts);
    this.maxPlayers = kwargs.maxPlayers || 8;
    this.turnNumber = kwargs.turnNumber || 0;
    this.hasStarted = kwargs.hasStarted || false;
    this.hasEnded   = kwargs.hasEnded   || false;
  }
  
  getPlayer(socketId, game = this) {
    return _.find(game.players, (player) => player.id === socketId);
  }
  
  hasPlayer(socketId, game = this) {
    return game.getPlayer(socketId) !== undefined;
  }
  
  getPlayerWithName(name, game = this) {
    return _.find(game.players, (player) => player.name === name);
  }
  
  hasPlayerWithName(name, game = this) {
    return game.getPlayerWithName(name) !== undefined;
  }
  
  handleChatMessage(messageObj, player, game = this) {
    if (player.state === PLAYER_STATES.ANON) {
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
          const recipient = game.getPlayerWithName(words[1]);
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
  }
  
  isAcceptingPlayers(game = this) {
    return !game.hasStarted && game.players.length < game.maxPlayers;
  }
  
  removePlayer(socketId, game = this) {
    const removedPlayer = game.getPlayer(socketId);
    return {
      game: game.changeFields({
        players: _.filter(game.players, (player) => player !== removedPlayer)
      }),
      player: removedPlayer
    };
  }
  
  addPlayer(socketId, game = this) {
    const newPlayer = new Player({
      id: socketId,
      game
    });
    return {
      game: game.changeFields({
        players: _.concat(game.players, [ newPlayer ])
      }),
      player: newPlayer
    };
  }
  
  isRunning(game = this) {
    return game.hasStarted && !game.hasEnded;
  }

  changeFields(fields, game = this) {
    return new Game(_.extend({}, game, fields));
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

// TODO: given an initial game state and a move to perform, return new game state
const update = (game, move) => game;

const foldMoves = (game, moves) => _.reduce(moves, update, GameUpdate(game, []));

const sortMoves = (moves) => _.sortBy(moves, ['player.character.agility', 'move.timestamp']);

const performMoves = (game, msgs) => foldMoves(game, sortMoves(msgs));
