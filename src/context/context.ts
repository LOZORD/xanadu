import * as _ from 'lodash';
import * as Player from '../game/player';
import { Message, createGameMessage } from '../game/messaging';
import { PerformResult } from '../game/actions';

export const validName: RegExp = /^\w+$/;

export type NameValidation = 'Valid' | 'Taken' | 'Invalid characters';

type Player = Player.Player;

export interface ClientMessage {
  player: Player.Player;
  content: string;
  timestamp: number;
}

// A Context is a mutable container of Players. Other classes, like Game,
// can own a Context that they use for dispatch.
export abstract class Context {
  players: Player[];
  maxPlayers: number;

  constructor(maxPlayers: number, players: Player[] = []) {
    this.maxPlayers = maxPlayers;
    this.players = players;
  }

  getPlayer(id: string): Player {
    return _.find(this.players, (player) => player.id === id);
  }

  getPlayerByName(name: string): Player {
    return _.find(this.players, (player) => player.name === name);
  }

  hasPlayer(id: string): boolean {
    return this.getPlayer(id) !== undefined;
  }

  hasPlayerByName(name: string): boolean {
    return this.getPlayerByName(name) !== undefined;
  }

  addPlayer(id: string, name = '[ANON#PLAYER]', state: Player.PlayerState = 'Anon'): void {
    if (this.hasPlayer(id)) {
      throw new Error(`Player with id ${id} already exists!`);
    } else if (this.isAcceptingPlayers()) {
      this.players.push({ id, name, state });
    } else {
      throw new Error('Attempted to add a player when not accepting!');
    }
  }

  removePlayer(id: string): Player {
    const removedPlayer = this.getPlayer(id);
    this.players = _.filter(this.players, p => p.id !== id);
    return removedPlayer;
  }

  updatePlayer(id: string, update: { state?: Player.PlayerState, name?: string }): void {
    const player = _.find(this.players, p => p.id === id);

    if (!player) {
      throw new Error('Could not find player to update with id: ' + id);
    }

    if (update.name) {
      player.name = update.name;
    }
    if (update.state) {
      player.state = update.state;
    }
  }

  isAcceptingPlayers(): boolean {
    return this.players.length < this.maxPlayers;
  }

  validateName(name: string): NameValidation {
    const similarNameExists = _.some(this.players, player => {
      // do a bidirectional test (either could be subset of the other)
      return (
        Player.isApproximateName(name, player.name) ||
        Player.isApproximateName(player.name, name)
      );
    });

    if (similarNameExists) {
      return 'Taken';
    } else if (!validName.test(name)) {
      return 'Invalid characters';
    } else {
      return 'Valid';
    }
  }

  playersWithout(playersToLeaveOut = []): Player[] {
    return _.difference(this.players, playersToLeaveOut);
  }

  broadcast(message: string, filterOut = []): Message {
    return createGameMessage(message, this.playersWithout(filterOut));
  }

  broadcastFromPlayer(message: string, player: Player): Message {
    // broadcast to all other players except this one
    return this.broadcast(message, [player]);
  }

  getRosterData(): Player.PlayerRosterJSON[] {
    return _
    .chain(this.players)
    .filter(player => !Player.isAnon(player))
    .map(player => Player.rosterData(player))
    .value();
  }

  // Signal to the server whether it is time to create a new context for the players
  // (Example: everyone in a Lobby is ready, so start a game)
  abstract isReadyForNextContext(): boolean;

  abstract isReadyForUpdate(): boolean;

  abstract update(): PerformResult;

  abstract handleMessage(m: ClientMessage): Message[];
}

export default Context;
