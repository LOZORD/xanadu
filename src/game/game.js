import _        from 'lodash';

import Player, { PLAYER_STATES } from './player';
import Map      from './map/map';

// TODO: one of the game parameters should be the number of modifiers randomly assigned
export default class Game {
  constructor(players, mapOpts, rng) {
    this.rng        = rng;
    this.players = players;
    this.map = new Map(mapOpts);
    this.turnNumber = 0;
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
