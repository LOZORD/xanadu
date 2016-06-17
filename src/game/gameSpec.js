import { expect } from 'chai';
import _ from 'lodash';

import Game from './game';
import Map from './map/map';
import Player from './player';

const createGame = () => (new Game({rng: () => 4}));

describe('Game', () => {
  describe('constructor', () => {
    it('should not construct without an rng', () => {
      expect(() => (new Game({}))).to.throw();
    });

    it('should set default arguments', () => {
      const g = createGame();
      expect(g.players).to.eql([]);
      expect(g.map).to.eql((new Map({})));
      expect(g.maxPlayers).to.equal(8);
      expect(g.turnNumber).to.equal(0);
      expect(g.hasStarted).to.equal(false);
      expect(g.hasEnded).to.equal(false);
    });
  });

  describe('addPlayer', () => {
    const g = createGame();

    it('should return a game and a player', () => {
      const { game, player } = g.addPlayer(1);
      expect(game.players.length).to.equal(1);
      expect(player).not.to.be.undefined;
    });

    it('should not modify the original game', () => {
      g.addPlayer(1);
      expect(g.players.length).to.equal(0);
    });

    it('should return an instance of Game', () => {
      const { game } = g.addPlayer(1);
      expect(game instanceof Game).to.equal(true);
    });
  });

  describe('removePlayer', () => {
    const g = createGame();
    const { game } = g.addPlayer(1);

    it('should return a game and a player', () => {
      const result = game.removePlayer(1);
      expect(result.game.players.length).to.equal(0);
      expect(result.player).not.to.be.undefined;
    });

    it('should not modify the original game', () => {
      game.removePlayer(1);
      expect(game.players.length).to.equal(1);
    });

    it('should return an instance of Game', () => {
      const result = game.removePlayer(1);
      expect(result.game instanceof Game).to.equal(true);
    });
  });

  const addPlayer = g => id => g.addPlayer(id).game;

  describe('getPlayer', () => {
    const g = createGame();
    const withAdded = addPlayer(g);

    it('should not find a player if not present', () => {
      expect(g.getPlayer(1)).to.be.undefined;
      const g1 = withAdded(2);
      expect(g1.getPlayer(1)).to.be.undefined;
    });

    it('should be able to find a present player', () => {
      const g = withAdded(1);
      expect(g.getPlayer(1)).to.eql((new Player({id: 1})));
    });
  });

  describe('hasPlayer', () => {
    const g = createGame();
    const withAdded = addPlayer(g);

    it('should not find a player if not present', () => {
      expect(g.hasPlayer(1)).to.equal(false);
      const g1 = withAdded(2);
      expect(g1.hasPlayer(1)).to.equal(false);
    });

    it('should be able to find a present player', () => {
      const g = withAdded(1);
      expect(g.hasPlayer(1)).to.equal(true);
    });
  });

  describe('getPlayerWithName', () => {
    const g = createGame();
    const { game, player } = g.addPlayer(1);
    player.name = 'test';

    it('should not get a player that does not exist', () => {
      expect(game.getPlayerWithName('blah')).to.be.undefined;
    });

    it('should get an existing player', () => {
      expect(game.getPlayerWithName(player.name)).to.eql(player);
    });
  });

  describe('hasPlayerWithName', () => {
    const g = createGame();
    const { game, player } = g.addPlayer(1);
    player.name = 'test';

    it('should not get a player that does not exist', () => {
      expect(game.hasPlayerWithName('blah')).to.equal(false);
    });

    it('should get an existing player', () => {
      expect(game.hasPlayerWithName(player.name)).to.equal(true);
    });
  });

  describe('changeFields', () => {
    const g = createGame();
    const fields = {
      rng: () => 42,
      players: [1, 2, 3]
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
      expect(g.players).to.eql([]);
      expect(g.map).to.eql((new Map({})));
      expect(g.maxPlayers).to.equal(8);
      expect(g.turnNumber).to.equal(0);
      expect(g.hasStarted).to.equal(false);
      expect(g.hasEnded).to.equal(false);
    });
  });

  describe('handleChatMessage', () => {
    // TODO
  });

  describe('isAcceptingPlayers', () => {
    it('should be true if the number of players is less than maxPlayers', () => {
      const g = createGame();
      expect(g.isAcceptingPlayers()).to.equal(true);
      const other = g.changeFields({ maxPlayers: 1 });
      expect(other.isAcceptingPlayers()).to.equal(true);
    });

    it('should be false if the number of players is greater than or equal to maxPlayers', () => {
      const game = createGame().changeFields({ maxPlayers: 1, players: [1] });
      expect(game.isAcceptingPlayers()).to.equal(false);
      const other = game.changeFields({ players: [1, 2] });
      expect(other.isAcceptingPlayers()).to.equal(false);
    });
  });

  describe('isRunning', () => {
    it('should be false if the game has not started', () => {
      const g = createGame();
      expect(g.isRunning()).to.equal(false);
    });

    it('should be true if the game has started and not ended', () => {
      const g = createGame().changeFields({ hasStarted: true });
      expect(g.isRunning()).to.equal(true);
    });

    it('should be false if the game has started and ended', () => {
      const g = createGame().changeFields({ hasStarted: true, hasEnded: true });
      expect(g.isRunning()).to.equal(false);
    });
  });

  describe('isReadyForNextContext', () => {
    it('should return true when the game has ended');
  });
});
