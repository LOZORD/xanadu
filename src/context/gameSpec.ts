import { expect } from 'chai';
import * as _ from 'lodash';
import Game from './game';
import { TEST_PARSE_RESULT } from '../game/map/parseGrid';
import { PlayerState, GamePlayer, Player } from '../game/player';
import * as Messaging from '../game/messaging';
import * as Character from '../game/character';
import Lobby from './lobby';

const createGame = (players: Player[] = []): Game => {
  return new Game(8, players);
};

const createPlayer = (id: string, name: string, state: PlayerState): Player => {
  return { id, name, state };
};

describe('Game', () => {
  describe('constructor', () => {
    it('should set default arguments', () => {
      const g = createGame();
      expect(g.players).to.eql([]);
      expect(g.map.grid).to.eql(TEST_PARSE_RESULT.grid);
      expect(g.maxPlayers).to.equal(8);
      expect(g.turnNumber).to.equal(0);
      expect(g.hasEnded).to.equal(false);
    });
  });

  describe('handleMessage', function () {
    before(function () {
      this.game = createGame([
        createPlayer('vader', 'Darth_Vader', 'Playing'),
        createPlayer('yoda', 'Yoda', 'Playing'),
        createPlayer('r2d2', 'R2D2', 'Playing')
      ]);

      this.player1 = (this.game as Game).getPlayer('vader');
      this.player2 = (this.game as Game).getPlayer('yoda');
      this.player3 = (this.game as Game).getPlayer('r2d2');

      // now, force all the players to the same allegiance so they can communicate freely
      [this.player1, this.player2, this.player3].forEach((player: GamePlayer) => {
        player.character.allegiance = 'Eastern';
      });
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
      after(function () {
        (this.game as Game).handleMessage({
          content: 'go north', // after the tests, reverse the movement
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
        (this.player1 as GamePlayer).character.nextAction = null;
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
        it('should have sent a shout message to the other players', function () {
          const shout = _.find(this.responses as Messaging.Message[],
            (message) => message.type === 'Shout');

          expect(shout).to.be.ok;
          expect(shout.content).to.equal('HELP!');
          expect(shout.to.length).to.equal(2);
          expect(shout.to.map(player => player.id))
            .to.include(this.player2.id).and
            .to.include(this.player3.id).and
            .to.not.include(this.player1.id);
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
          expect(whisper.to[0].id).to.eql(this.player3.id);
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
    before(function () {
      this.game = createGame([
        createPlayer('123', 'Alice', 'Playing'),
        createPlayer('456', 'Bob', 'Playing')
      ]);

      this.p1 = (this.game as Game).getPlayerByName('Alice');
      this.p2 = (this.game as Game).getPlayerByName('Bob');
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
      const game = createGame([
        createPlayer('007', 'James_Bond', 'Playing'),
        createPlayer('008', 'Bill', 'Playing')
      ]);

      const p1 = game.getPlayer('007');
      const p2 = game.getPlayer('008');

      if (!p1 || !p2) {
        throw new Error('Test players not present!');
      }

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
      this.game = createGame([
        createPlayer('luke', 'Luke', 'Playing'),
        createPlayer('leia', 'Leia', 'Playing')
      ]);

      this.player1 = (this.game as Game).getPlayer('luke');
      this.player2 = (this.game as Game).getPlayer('leia');
    });

    it('should return the other player', function () {
      const nearby = (this.game as Game).getNearbyAnimals((this.player1.character as Character.Character));

      expect(nearby).to.include(this.player1.character).and.to.include(this.player2.character);
    });
  });

  describe('getSortedActions', function () {
    before(function () {
      this.game = createGame([
        createPlayer('123', 'Alice', 'Playing'),
        createPlayer('456', 'Bob', 'Playing'),
        createPlayer('789', 'Carol', 'Playing')
      ]);

      this.player1 = (this.game as Game).getPlayer('123');
      this.player2 = (this.game as Game).getPlayer('456');
      this.player3 = (this.game as Game).getPlayer('789');

      this.player1.character.stats = {
        health: 50,
        intelligence: 50,
        strength: 50,
        agility: 50
      };

      (this.player2 as GamePlayer).character.stats.agility = 1;
      (this.player3 as GamePlayer).character.stats.agility = 1;

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

      // the order should be [p1, p3, p2]
      // p1 has highest agility
      // p3's timestamp is before p2's timestamp
      this.sortedActions = (this.game as Game).getSortedActions();
    });
    it('should sort first by player agility', function () {
      expect(((this.sortedActions)[ 0 ].actor as Character.Character).playerId).to.eql(this.player1.id);
    });
    it('should sort second by timestamp', function () {
      expect(this.sortedActions[ 1 ].actor.playerId).to.equal(this.player3.id);
      expect(this.sortedActions[ 2 ].actor.playerId).to.equal(this.player2.id);
    });
  });

  describe('convertPlayer', function() {
    before(function() {
      this.game = new Game(8, [{
        id: '123', name: 'Alice', state: 'Playing'
      }], {
        numModifiers: {
          maximum: Character.MAX_NUM_MODIFIERS,
          minimum: 0
        },
        seed: Date.now()
      });
    });
    context('when given a GamePlayer', function() {
      it('should return the player', function() {
        const gamePlayer = (this.game as Game).getPlayer('123');

        if (!gamePlayer) {
          throw new Error('Test player not present!');
        }

        expect((this.game as Game).convertPlayer(gamePlayer)).to.eql(gamePlayer);
      });
    });
    context('when given a LobbyPlayer', function() {
      before(function() {
        this.lobby = new Lobby(8, []);

        (this.lobby as Lobby).addPlayer('007', 'James_Bond', 'Preparing');

        this.player = (this.lobby as Lobby).getPlayer('007');

        (this.lobby as Lobby).handleMessage({
          player: this.player,
          timestamp: Date.now(),
          content: 'ready c=gunslinger a=western m=3'
        });

        expect(this.player.primordialCharacter.className).to.equal('Gunslinger');
      });
      it('should build off of the primordial character', function() {
        const gamePlayer = (this.game as Game).convertPlayer(this.player);

        expect(gamePlayer.state).to.equal('Playing');
        expect(gamePlayer.character.characterClass.className).to.equal('Gunslinger');
        expect(gamePlayer.character.allegiance).to.equal('Western');
        expect(Character.getActiveModifierNames(gamePlayer.character.modifiers)).to.have.lengthOf(3);
      });
    });
  });
});
