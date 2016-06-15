import _ from 'lodash';

// TODO: move player into its own directory
import Player from '../game/player';
import { EchoResponse } from '../game/messaging';

export default class Context {
  constructor(kwargs = {}) {
    this.players    = kwargs.players || [];
    this.maxPlayers = kwargs.maxPlayers || 8;
    // ignoring these fields for now (seem unnec.)
    //this.hasStarted = kwargs.hasStarted || false;
    //this.hasEnded   = kwargs.hasEnded || false;
  }
  updateContext(fields) {
    return new Context(_.extend({}, this, fields));
  }
  getPlayer(id) {
    return _.find(this.players, (player) => player.id === id);
  }
  hasPlayer(id) {
    return this.getPlayer(id) !== undefined;
  }
  getPlayerWithName(name) {
    return _.find(this.players, (player) => player.name === name);
  }
  hasPlayerWithName(name) {
    return this.getPlayerWithName(name) !== undefined;
  }
  addPlayer(id) {
    if (this.isAcceptingPlayers()) {
      const newPlayer = new Player({ id });
      const newPlayersList = _.concat(this.players, [ newPlayer ]);
      return {
        player: newPlayer,
        context: this.updateContext({ players: newPlayersList })
      };
    } else {
      return { player: undefined, context: this };
    }
  }
  removePlayer(id) {
    const player = this.getPlayer(id);
    const newPlayersList = _.filter(this.players, (player) => player.id !== id);
    const context = this.updateContext({ players: newPlayersList });
    return { context, player };
  }
  isAcceptingPlayers() {
    return this.players.length < this.maxPlayers;
  }
  // an abstract method implemented by subclasses
  isReadyForNextContext() {
    return undefined;
  }
  // an abstract method implemented by subclasses
  handleMessage(messageObj, player) {
    return [
      new EchoResponse({
        message: messageObj.message,
        to: player.id
      })
    ];
  }
}
