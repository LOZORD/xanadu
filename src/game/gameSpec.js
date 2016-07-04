//import { it, before } from 'arrow-mocha/es5';
import { expect } from 'chai';
import _ from 'lodash';

import Game from './game';
import Map from './map/map';
import { TEST_MAP_DATA } from './map/parseGrid';
import Player from './player';

const createGame = () => {
  return new Game({ rng: _.constant(4) });
};

describe('Game', () => {
  describe('constructor', () => {
    it('should not construct without an rng', () => {
      expect(() => (new Game({}))).to.throw(Error);
    });

    it('should set default arguments', () => {
      const g = createGame();
      //const m = createMap();
      expect(g.players).to.eql([]);
      //expect(g.map).to.eql(m);
      expect(g.map.toJSON()).to.eql(TEST_MAP_DATA.characterGrid);
      expect(g.maxPlayers).to.equal(8);
      expect(g.turnNumber).to.equal(0);
      expect(g.hasEnded).to.equal(false);
    });
  });

  describe.skip('changeFields', () => {
    const g = createGame();
    const fields = {
      rng: () => 42,
      players: [new Player({ id: 1 }), new Player({ id: 2 }), new Player({ id: 3 })]
    };
    const changed = g.changeFields(fields);

    it('should change only the given fields', () => {
      Object.keys(fields).forEach((f) => {
        expect(changed[f]).to.equal(fields[f]);
      });
    });

    it('should include all of the unchanged fields', () => {
      Object.keys(_.omit(g, Object.keys(fields))).forEach((f) => {
        expect(changed[f]).to.equal(g[f]);
      });
    });

    it('should return an instance of Game', () => {
      expect(changed instanceof Game).to.equal(true);
    });

    it('should respect constructor defaults', () => {
      const g = changed.changeFields({
        players: null,
        mapOpts: null,
        map: null,
        maxPlayers: null,
        turnNumber: null,
        hasStarted: null,
        hasEnded: null
      });
      //const m = createMap();
      expect(g.players).to.eql([]);
      //expect(g.map).to.eql(m);
      expect(g.map.toJSON()).to.eql(TEST_MAP_DATA.characterGrid);
      expect(g.maxPlayers).to.equal(8);
      expect(g.turnNumber).to.equal(0);
      expect(g.hasStarted).to.equal(false);
      expect(g.hasEnded).to.equal(false);
    });
  });

  describe.skip('handleMessage', () => {
    // TODO
  });

  describe.skip('isRunning', () => {
    it('should be true if the game has started and not ended', () => {
      const g = createGame().changeFields({ hasStarted: true });
      expect(g.isRunning()).to.equal(true);
    });

    it('should be false if the game has started and ended', () => {
      const g = createGame().changeFields({ hasStarted: true, hasEnded: true });
      expect(g.isRunning()).to.equal(false);
    });
  });

  describe.skip('isReadyForNextContext', () => {
    it('should return true when the game has ended');
  });
});
