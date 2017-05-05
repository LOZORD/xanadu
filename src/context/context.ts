import * as _ from 'lodash';
import * as Player from '../game/player';
import { Message, createGameMessage } from '../game/messaging';
import { PerformResult } from '../game/actions';

export const validName: RegExp = /^\w+$/;

export type NameValidation = 'Valid' | 'Taken' | 'Invalid characters';

type Player = Player.Player;

export interface ClientMessage<P extends Player> {
  player: P;
  content: string;
  timestamp: number;
}

export interface PersistentIdMessage {
  id: string | null;
}

// A Context is a mutable container of Players. Other classes, like Game,
// can own a Context that they use for dispatch.
export abstract class Context<P extends Player> {
  players: P[];
  maxPlayers: number;

  getPlayerByPersistentId(persistentId: string): P | undefined {
    return _.find(this.players, player => player.persistentId === persistentId);
  }

  getPlayerBySocketId(socketId: string): P | undefined {
    return _.find(this.players, (player) => player.socketId === socketId);
  }

  getPlayerByName(name: string): P | undefined {
    return _.find(this.players, (player) => player.name === name);
  }

  hasPlayerByPersistentId(persistentId: string): boolean {
    return this.getPlayerByPersistentId(persistentId) !== undefined;
  }

  hasPlayerBySocketId(socketId: string): boolean {
    return this.getPlayerBySocketId(socketId) !== undefined;
  }

  hasPlayerByName(name: string): boolean {
    return this.getPlayerByName(name) !== undefined;
  }

  addPlayer(socketId: string, persistentId: string, name: string | null = null): Player.Player {
    if (this.hasPlayerBySocketId(socketId)) {
      throw new Error(`Player with id ${socketId} already exists!`);
    } else if (this.isAcceptingPlayers()) {
      const newPlayer = this.convertPlayer({ socketId, persistentId, name });
      this.players.push(newPlayer);
      return newPlayer;
    } else {
      throw new Error('Attempted to add a player when not accepting!');
    }
  }

  removePlayer(socketId: string): P | undefined {
    const removedPlayer = this.getPlayerBySocketId(socketId);
    this.players = _.filter(this.players, p => p.socketId !== socketId);
    return removedPlayer;
  }

  isAcceptingPlayers(): boolean {
    return this.players.length < this.maxPlayers;
  }

  validateName(name: string): NameValidation {
    const similarNameExists = _.some(this.players, player => {
      // do a bidirectional test (either could be subset of the other)
      return player.name && (
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

  playersWithout(playersToLeaveOut: P[] = []): P[] {
    return _.difference(this.players, playersToLeaveOut);
  }

  broadcast(message: string, filterOut: P[] = []): Message {
    return createGameMessage(message, this.playersWithout(filterOut));
  }

  broadcastFromPlayer(message: string, player: P): Message {
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

  abstract handleMessage(m: ClientMessage<P>): Message[];

  abstract convertPlayer(player: Player): P;
}

export default Context;
