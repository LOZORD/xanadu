import * as _ from 'lodash';

// TODO: move player into its own directory
import { Dispatch, gameMessage } from '../game/messaging';
import { Player, PlayerState } from '../game/player';

export const validName: RegExp = /^\w+$/;

export type NameValidation = 'Valid' | 'Taken' | 'Invalid characters';

export interface Command {
    player: Player;
    contents: string;
    ts: number;
}

// A Context is a mutable container of Players. Other classes, like Game,
// can own a Context that they use for dispatch.
export abstract class Context {
    players: Player[];
    maxPlayers: number;

    constructor(maxPlayers: number, players?: Player[]) {
        this.maxPlayers = maxPlayers;
        this.players = players || [];
    }
    
    getPlayer(id: number): Player {
        return _.find(this.players, (player) => player.id === id);
    }

    getPlayerByName(name: string): Player {
        return _.find(this.players, (player) => player.name === name);
    }

    hasPlayer(id: number): boolean {
        return this.getPlayer(id) !== undefined;
    }

    hasPlayerByName(name: string): boolean {
        return this.getPlayerByName(name) !== undefined;
    }

    addPlayer(id: number): void {
        if (this.hasPlayer(id)) {
            throw new Error(`Player with id ${id} already exists!`);
        }
        this.players.push({
            id,
            name: '', // This is odd
            state: 'Anon'
        });
    }

    removePlayer(id: number): void {
        this.players = _.filter(this.players, p => p.id === id);
    }

    updatePlayer(id: number, update: { state?: PlayerState, name?: string }): void {
        const player = _.find(this.players, p => p.id === id);
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
        // TODO: validate against "subset" names
        // e.g. "James_Bond" and "James_Bond_007"
        if (this.hasPlayerByName(name)) {
            return 'Taken';
        } else if (!validName.test(name)) {
            return 'Invalid characters';
        } else {
            return 'Valid';
        }
    }

    broadcast(message: string): Dispatch {
        return gameMessage(message)(this.players.map(p => p.id));
    }

    // Signal to the server whether it is time to create a new context for the players
    // (Example: everyone in a Lobby is ready, so start a game)
    abstract isReadyForNextContext(): boolean;

    abstract handleCommand(m: Command, p: Player): Dispatch[];
}
