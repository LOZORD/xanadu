import { expect } from 'chai';
import * as _ from 'lodash';
import Game from './game';
import * as Map from '../game/map/map';
import { TEST_PARSE_RESULT } from '../game/map/parseGrid';
import { Player, PlayerState } from '../game/player';
import * as Messaging from '../game/messaging';
import * as Character from '../game/character';

const createGame = (players = []): Game => {
  return new Game(8, players);
};

const createPlayer = (id: string, name: string, state: PlayerState): Player => {
  const player = <any> {
    id,
    name,
    state,
    character: {
      nextAction: null,
      characterClass: Character.NoClass,
      allegiance: 'None',
      goldAmount: Character.NoClass.startingGold,
      inventory: Character.NoClass.startingInventory,
      stats: Character.NoClass.startingStats,
      row: 0,
      col: 0,
      modifiers: null
    }
  };

  //player.character.player = player;

  player.character.player = player;

  return <Player> player;
};

describe('Game', () => {
  describe('constructor', () => {
    it.skip('should not construct without an rng', () => {
      // expect(() => (new Game())).to.throw(Error);
    });

    it('should set default arguments', () => {
      const g = createGame();
      // const m = createMap();
      expect(g.players).to.eql([]);
      // expect(g.map).to.eql(m);
      expect(g.map.grid).to.eql(TEST_PARSE_RESULT.grid);
      expect(g.maxPlayers).to.equal(8);
      expect(g.turnNumber).to.equal(0);
      expect(g.hasEnded).to.equal(false);
    });
  });

  describe.skip('changeFields', () => {
    const g = createGame();
    const fields = {
      rng: () => 42,
      players: [
        createPlayer('123', 'Foo', 'Preparing'),
        createPlayer('456', 'Bar', 'Preparing'),
        createPlayer('789', 'Baz', 'Preparing')
      ]
    };
    // const changed = g.changeFields(fields);
    // FIXME: implement or rewrite test
    const changed = null;

    it('should change only the given fields', () => {
      Object.keys(fields).forEach((f) => {
        expect(changed[ f ]).to.equal(fields[ f ]);
      });
    });

    it('should include all of the unchanged fields', () => {
      Object.keys(_.omit(g, Object.keys(fields))).forEach((f) => {
        expect(changed[ f ]).to.equal(g[ f ]);
      });
    });

    it('should return an instance of Game', () => {
      expect(changed instanceof Game).to.equal(true);
    });

    it('should respect constructor defaults', () => {
      const someGame = changed.changeFields({
        players: null,
        mapOpts: null,
        map: null,
        maxPlayers: null,
        turnNumber: null,
        hasStarted: null,
        hasEnded: null
      });
      // const m = createMap();
      expect(someGame.players).to.eql([]);
      // expect(g.map).to.eql(m);
      expect(someGame.map.grid).to.eql(TEST_PARSE_RESULT.grid);
      expect(someGame.maxPlayers).to.equal(8);
      expect(someGame.turnNumber).to.equal(0);
      expect(someGame.hasStarted).to.equal(false);
      expect(someGame.hasEnded).to.equal(false);
    });
  });

  describe('handleMessage', () => {
    context('when given a valid action command', () => {
      it('should update the sender\'s character\'s `nextAction` field');
      it('should send a response to the player confirming their next action');
    });
    context('when given an invalid action command', () => {
      it('should send a response to the player');
    });
    context('when given a communication command', () => {
      it('should be tested!');
    });
  });

  describe('isAcceptingPlayers', () => {
    it('should always return `false`', () => {
      expect(createGame().isAcceptingPlayers()).to.be.false;
    });
  });

  describe('isRunning', () => {
    // `hasEnded = false` upon game creation
    it('should be true if the game has not ended', () => {
      expect(createGame().isRunning()).to.be.true;
    });

    it('should be false if the game has started and ended', () => {
      const game = createGame();
      game.hasEnded = true;
      expect(game.isRunning()).to.equal(false);
    });
  });

  describe('isReadyForNextContext', () => {
    it('should return true when the game has ended');
  });

  // TODO: test if the sorting works
  describe('update', () => {
    beforeEach(function () {
      this.p1 = createPlayer('007', 'James_Bond', 'Playing');
      this.p2 = createPlayer('008', 'Bill', 'Playing');
      this.game = createGame([ this.p1, this.p2 ]);
    });

    it('should work with move actions', function () {
      // a valid movement
      const r1: Messaging.Message[] = this.game.handleMessage({
        player: this.p1,
        content: 'go south',
        timestamp: Date.now()
      });

      // don't really care about the result of p2's command
      this.game.handleMessage({
        player: this.p2,
        content: 'pass',
        timestamp: Date.now()
      });

      const hasNextActionMessage = _
        .chain(<Messaging.Message[]> r1)
        .map('content')
        .some(content => _.includes(content, 'Next action'))
        .value();

      expect(hasNextActionMessage).to.be.true;

      expect(this.p1.character.nextAction.key).to.equal('Move');
      expect(this.p2.character.nextAction.key).to.equal('Pass');

      this.game.update();

      expect(this.p1.character.row).to.equal(2);
      expect(this.p1.character.col).to.equal(1);
    });
  });

  describe('isReadyForUpdate', () => {
    it('should be true iff all players have an action', () => {
      const p1 = createPlayer('007', 'James_Bond', 'Playing');
      const p2 = createPlayer('008', 'Bill', 'Playing');
      const game = createGame([ p1, p2 ]);

      p1.character.nextAction = {
        timestamp: Date.now(),
        actor: p1.character,
        key: 'Pass'
      };

      p2.character.nextAction = null;

      expect(game.isReadyForUpdate()).to.be.false;

      p2.character.nextAction = {
        timestamp: Date.now(),
        actor: p2.character,
        key: 'Pass'
      };

      expect(game.isReadyForUpdate()).to.be.true;
    });
  });
});
