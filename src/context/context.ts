import * as _ from 'lodash';

// TODO: move player into its own directory
import { Dispatch } from '../game/messaging';
import { Player, PlayerState } from '../game/player';

export interface Command {
    player: Player;
    contents: string;
}

// A Context is a mutable container of Players. Other classes, like Game,
// can own a Context that they use for dispatch.
export abstract class Context {
    players: Player[];
    maxPlayers: number;

    constructor(maxPlayers: number) {
        this.maxPlayers = maxPlayers;
        this.players = [];
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
            state: 'Anon'
        });
    }

    removePlayer(id: number): void {
        this.players = _.filter(this.players, p => p.id === id);
    }

    updatePlayer(id: number, update: { state?: PlayerState, name?: string }): void {
        const i = _.findIndex(this.players, p => p.id === id);
        const newPlayer = {
            id: this.players[i].id,
            character: this.players[i].character,
            name: update.name || this.players[i].name,
            state: update.state || this.players[i].state
        };
        this.players[i] = newPlayer;
    }

    isAcceptingPlayers(): boolean {
        return this.players.length < this.maxPlayers;
    }

    // Signal to the server whether it is time to create a new context for the players
    // (Example: everyone in a Lobby is ready, so start a game)
    abstract isReadyForNextContext(): boolean;

    abstract handleCommand(m: Command, p: Player): Dispatch[];
}
