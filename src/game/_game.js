/* eslint-disable */
/* DEPRECATED -- ONLY HERE (TEMPORARILY) FOR REFERENCE */

export default class Game extends Emitter {
  attemptToStart() {
    console.log(this.players.map(player => [player.name, player.state]));
    if (this.players.every((player) => player.state === PLAYER_STATES.READY)) {
      this.hasStarted = true;
      console.log('GAME STARTED!');
      // sort the players by id (for testing/deterministic reasons)
      // maybe by (lowercased) name might be better
      this.players = _.sortBy(this.players, (player) => player.id());
      _.forEach(this.players, (player) => {
        player.message('The game has begun!');
      });

      // configure the starting messages for each player...
      let startingResults = {};

      _.forEach(this.players, (player) => {
        startingResults[player.id()] = `${ player.name }, you are a ${ player.character.constructor.name }!`;
      });

      // give the players their basic details
      this.sendUpdatesToClients(startingResults);

      // start the game loop
      this.update();
    }
  }
}
