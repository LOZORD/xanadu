import _        from 'lodash';

import Player, { PLAYER_STATES } from './player';
import Map      from './map/map';

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
    this.server     = kwargs.server     || null;

    if (!this.server) {
      console.warn('A game might want to be aware of its server...');
    }
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
  extractFields(game = this) {
    return _.pick(game, [
        'players',
        'rng',
        'map',
        'maxPlayers',
        'turnNumber',
        'hasStarted',
        'hasEnded',
        'server'
    ]);
  }
  removePlayer(socketId, game = this) {
    let removedPlayer = game.getPlayer(socketId);
    let newPlayerList = _.filter(game.players, (player) => player !== removedPlayer);

    let newGameFields = game.extractFields(game);

    newGameFields.players = newPlayerList;

    return {
      game: new Game(newGameFields),
      player: removedPlayer
    };
  }
  isAcceptingPlayers(game = this) {
    return !game.hasStarted && game.players.length < game.maxPlayers;
  }
  addPlayer(socketId, game = this) {
    // TODO
    throw new Error('IMPLEMENT ME');
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
