import _ from 'lodash';
import Context from './context';
import { PLAYER_STATES } from '../game/player';

export default class Lobby extends Context {
  isReadyForNextContext() {
    return _.every(this.players,
        (player) => player.state === PLAYER_STATES.READY);
  }
  handleMessage(messageObj, player) {
    // XXX: this will need to be updated if we want flip-flopping between
    // games and lobbies
    switch (player.state) {
      case PLAYER_STATES.ANON: {
        return {}; // TODO
      }
      case PLAYER_STATES.NAMED: {
        return {}; // TODO
      }
      case PLAYER_STATES.READY: {
        return {}; // TODO
      }
      default: {
        return {}; // TODO
      }
    }
  }
}
