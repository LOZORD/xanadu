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
  changeFields(fields) {
    // don't use an explicit constructor
    // this allows us to return the correct context type
    // e.g. calling `game.changeFields` will return a `Game`
    return new (this.constructor)(_.extend({}, this, fields));
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
  namedContext() {
    // this helper method allows us to return the name of the context
    // the caller will most likely want, for example:
    // `myGame.addPlayer` will return a `game` field (not `context`)
    return this.constructor.name.toLowerCase();
  }
  addPlayer(id) {
    if (this.isAcceptingPlayers()) {
      const newPlayer = new Player({ id });
      const newPlayersList = _.concat(this.players, [ newPlayer ]);
      const newContext = this.changeFields({ players: newPlayersList });
      return {
        player: newPlayer,
        [this.namedContext()]: newContext,
        context: newContext
      };
    } else {
      return { player: undefined, [this.namedContext()]: this };
    }
  }
  removePlayer(id) {
    const player = this.getPlayer(id);
    const newPlayersList = _.filter(this.players, (player) => player.id !== id);
    const context = this.changeFields({ players: newPlayersList });
    return { [this.namedContext()]: context, player };
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
