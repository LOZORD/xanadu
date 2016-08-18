import { expect } from 'chai';
import * as _ from 'lodash';
import Game from './game';
import * as Map from '../game/map/map';
import { TEST_PARSE_RESULT } from '../game/map/parseGrid';
import { Player, PlayerState } from '../game/player';
import * as Messaging from '../game/messaging';
import * as Character from '../game/character';
import { Action } from '../game/actions';

const createGame = (players = []): Game => {
  return new Game(8, players);
};

const createPlayer = (id: string, name: string, state: PlayerState): Player => {
  const player = {
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
  } as any;

  //player.character.player = player;

  player.character.player = player;

  return player;
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

  describe('handleMessage', function () {
    function setup(self) {
      self.player1 = createPlayer('vader', 'Darth_Vader', 'Playing');
      self.player2 = createPlayer('yoda', 'Yoda', 'Playing');
      self.player3 = createPlayer('r2d2', 'R2D2', 'Playing');
      self.game = createGame([ self.player1, self.player2, self.player3 ]);
    }
    before(function () {
      setup(this);
    });
    afterEach(function () {
      setup(this);
    });
    describe('when given a valid action command', function () {
      before(function () {
        expect((this.player1.character as Character.Character).nextAction).to.be.null;
        this.responses = (this.game as Game).handleMessage({
          content: 'go south', // a valid movement on the default test map
          player: this.player1,
          timestamp: Date.now()
        });
      });
      it('should update the sender\'s character\'s `nextAction` field', function () {
        expect((this.player1.character as Character.Character).nextAction).to.not.be.null;
      });
      it('should send a response to the player confirming their next action', function () {
        const hasConfirmation =
          _.some(this.responses as Messaging.Message[],
            (message) => _.startsWith(message.content, 'Next action:'));

        expect(hasConfirmation).to.be.true;
      });
    });
    describe('when given an invalid action command', function () {
      before(function () {
        this.responses = (this.game as Game).handleMessage({
          content: 'go north', // north of the starting position is a barrier,
          player: this.player1,
          timestamp: Date.now()
        });
      });
      it('should not update the `nextAction` field', function () {
        expect((this.player1.character as Character.Character).nextAction).to.be.null;
      });
      it('should send a rejection to the player', function () {
        const hasRejection =
          _.some(this.responses as Messaging.Message[],
            (message) => _.startsWith(message.content, 'Invalid action:'));

        expect(hasRejection).to.be.true;
      });
    });
    describe('when given a communication command', function () {
      describe('for talking', function () {
        before(function () {
          this.responses = (this.game as Game).handleMessage({
            content: '/t yod May the force be with you',
            player: this.player1,
            timestamp: Date.now()
          });
        });
        it('should have sent a talk message to the other player', function () {
          const result =
            _.some(this.responses as Messaging.Message[],
              (message) => message.type === 'Talk' && _.startsWith(message.content, 'May the force'));

          expect(result).to.be.true;
        });
      });
      describe('for shouting', function () {
        before(function () {
          this.responses = (this.game as Game).handleMessage({
            content: '/s HELP!',
            player: this.player1,
            timestamp: Date.now()
          });
        });
        it('should have sent a shout message to the other player', function () {
          const shout = _.find(this.responses as Messaging.Message[],
            (message) => message.type === 'Shout');

          expect(shout).to.be.ok;
          expect(shout.content).to.equal('HELP!');
          expect(shout.to)
            .to.include(this.player2).and
            .to.include(this.player3).and
            .to.not.include(this.player1);
        });
      });
      describe('for whispering', function () {
        before(function () {
          this.responses = (this.game as Game).handleMessage({
            content: '/w r2 darth is a sith', // I know that's not how Yoda speaks...
            player: this.player2,
            timestamp: Date.now()
          });
        });
        it('should have sent a whisper message ot the other player', function () {
          const whisper = _.find(this.responses as Messaging.Message[],
            message => message.type === 'Whisper');

          expect(whisper).to.be.ok;
          expect(whisper.to).to.eql([ this.player3 ]);
          expect(whisper.content).to.eql('darth is a sith');
        });
      });
      describe('for unknown communications', function () {
        before(function () {
          this.responses = (this.game as Game).handleMessage({
            content: '/-blarg-',
            player: this.player3,
            timestamp: Date.now()
          });
        });
        it('should have sent a rejection message', function () {
          const result = _.some(this.responses as Messaging.Message[],
            (message) => message.type === 'Game' && _.startsWith(message.content, 'Unknown communication:'));

          expect(result).to.be.true;
        });
      });
    });
    describe('when given an unknown command', function () {
      before(function () {
        this.responses = (this.game as Game).handleMessage({
          content: 'foobarbaz',
          player: this.player1,
          timestamp: Date.now()
        });
      });
      it('should have a rejection message', function () {
        const hasRejection =
          _.some(this.responses as Messaging.Message[],
            (message) => _.startsWith(message.content, 'Unknown command or communication'));

        expect(hasRejection).to.be.true;
      });
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
        .chain(r1 as Messaging.Message[])
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
  describe('getNearbyAnimals', function () {
    before(function () {
      this.player1 = createPlayer('luke', 'Luke', 'Playing');
      this.player2 = createPlayer('leia', 'Leia', 'Playing');
      this.game = createGame([ this.player1, this.player2 ]);
    });

    it('should return the other player', function () {
      const nearby = (this.game as Game).getNearbyAnimals((this.player1.character as Character.Character));

      expect(nearby).to.include(this.player1.character).and.to.include(this.player2.character);
    });
  });
  describe('getSortedActions', function() {
    before(function() {
      this.player1 = createPlayer('123', 'Alice', 'Playing');

      this.player2 = createPlayer('456', 'Bob', 'Playing');

      this.player3 = createPlayer('789', 'Carol', 'Playing');

      this.game = createGame([this.player1, this.player2, this.player3]);

      (this.game as Game).getPlayer('123').character.stats = {
        health: 50,
        intelligence: 50,
        strength: 50,
        agility: 50
      };

      expect(this.game.getPlayer('123').character.stats.agility)
        .to.be.greaterThan(this.game.getPlayer('456').character.stats.agility).and
        .to.be.greaterThan(this.game.getPlayer('789').character.stats.agility);

      (this.game as Game).handleMessage({
        content: 'go south',
        player: this.player2,
        timestamp: 1
      });

      (this.game as Game).handleMessage({
        content: 'go south',
        player: this.player3,
        timestamp: 0
      });

      (this.game as Game).handleMessage({
        content: 'go south',
        player: this.player1,
        timestamp: 2
      });

      this.sortedActions = (this.game as Game).getSortedActions();
    });
    it('should sort first by player agility', function() {
      expect(((this.sortedActions)[0].actor as Character.Character).player.id).to.eql(this.player1.id);
    });
    it('should sort second by timestamp', function() {
      expect(this.sortedActions[1].actor.player.id).to.equal(this.player3.id);
      expect(this.sortedActions[2].actor.player.id).to.equal(this.player2.id);
    });
  });
});
