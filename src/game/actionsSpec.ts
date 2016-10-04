import { expect } from 'chai';
import * as _ from 'lodash';
import * as Actions from './actions';
import Game from '../context/game';
import * as Player from './player';
import * as Character from './character';
import * as Inventory from './inventory';

describe('Actions', () => {
  describe('isParsableAction', () => {
    context('when given a valid action command', () => {
      it('should return true', () => {
        expect(Actions.isParsableAction('go south')).to.be.true;
      });
    });
    context('when given an invalid action command', () => {
      it('should return false', () => {
        // sadly false
        expect(Actions.isParsableAction('listen to 2112')).to.be.false;
      });
    });
  });
  describe('MoveAction', () => {
    // remember: we are using the test map!
    before(function () {
      this.game = new Game(8, []);
      this.player = Player.createPlayer('007', 'James_Bond', 'Playing');
      this.player.character = Character.createCharacter(this.game, this.player, this.game.map.startingPosition, 'None');
      this.game.players.push(this.player);
    });
    describe('parse', () => {
      it('parsing should return a MoveAction', function () {
        // all locations are based off of starting position (1,1)
        const locations = {
          'north': {
            r: 0, c: 1
          },
          'south': {
            r: 2, c: 1
          },
          'west': {
            r: 1, c: 0
          },
          'east': {
            r: 1, c: 2
          }
        };

        _.forEach(locations, ({ r, c }, dir) => {
          const action = Actions.parseAction(`go ${dir}`, this.player.character, Date.now()) as Actions.MoveAction;

          expect(action).to.be.ok;

          const newR = this.player.character.row + action.offsetRow;
          const newC = this.player.character.col + action.offsetCol;

          expect(newR).to.equal(r, `when moving ${dir}`);
          expect(newC).to.equal(c, `when moving ${dir}`);
        });
      });
    });
    describe('validate', () => {
      context('when the move is valid', () => {
        it('should have `isValid` = `true`', function () {
          const action = Actions.MOVE_COMPONENT.parse('go south', this.player.character, Date.now());
          const { isValid } = Actions.MOVE_COMPONENT.validate(action, this.game);

          expect(isValid).to.be.true;
        });
      });
      context('when the move is not into a room', function () {
        before(function () {
          this.invalidAction = Actions.MOVE_COMPONENT.parse('go north', this.player.character, Date.now());
          this.validationResult = Actions.MOVE_COMPONENT.validate(this.invalidAction, this.game);
        });
        it('should have `isValid` = `false`', function () {
          expect(this.validationResult.isValid).to.be.false;
        });
        it('should have the correct error message', function () {
          expect(this.validationResult.error).to.include('not a room');
        });
      });
      context('when the move is out of bounds', function () {
        before(function () {
          this.initRow = this.player.character.row;
          this.initPlayers = this.game.players;

          this.player.character.row = 0;
          this.game.players = [ this.player ];

          this.invalidAction = Actions.MOVE_COMPONENT.parse('go north', this.player.character, Date.now());
          this.validationResult = Actions.MOVE_COMPONENT.validate(this.invalidAction, this.game);
        });
        after(function () {
          this.player.character.row = this.initRow;
          this.game.players = this.initPlayers;
        });
        it('should have `isValid` = `false`', function () {
          expect(this.validationResult.isValid).to.be.false;
        });
        it('should have the correct error message', function () {
          expect(this.validationResult.error).to.include('bounds');
        });
      });
    });
  });
  describe('PassAction', () => {
    before(function () {
      this.game = new Game(8, []);
      this.player = Player.createPlayer('007', 'James_Bond', 'Playing');
      this.player.character = Character.createCharacter(this.game, this.player, this.game.map.startingPosition, 'None');
      this.game.players.push(this.player);
    });

    describe('parse', () => {
      it('parsing should return a PassAction', function () {
        const passAction = Actions.parseAction('pass', this.player.character, Date.now()) as Actions.PassAction;
        expect(passAction).to.be.ok;
      });
    });
    describe('validate', () => {
      it('should return true', function () {
        const passAction = Actions.parseAction('pass', this.player.character, Date.now()) as Actions.PassAction;
        expect(Actions.PASS_COMPONENT.validate(passAction, this.game).isValid).to.be.true;
      });
    });
  });
  describe('Unknown Inputs', () => {
    it('should return null', function () {
      const ret = Actions.parseAction('foobarbaz123', null, Date.now());
      expect(ret).to.be.null;
    });
  });
  describe('RestAction', () => {
    describe('parse', function () {
      it('should be tested!');
    });
    describe('validate', function () {
      context('when the player is at a camp', function () {
        it('should validate positively');
      });
      context('when the player is NOT at a camp', function () {
        it('should validate negatively');
      });
    });
    describe('perform', function () {
      it('should be tested!');
    });
  });
  describe('IngestAction', () => {
    beforeEach(function () {
      this.player = Player.createPlayer('007', 'James_Bond', 'Playing');
      this.game = new Game(8, [ this.player ]);
      this.player = (this.game as Game).getPlayer('007');
      this.player.character = Character.createCharacter(
        this.game, this.player
      );

      this.player.character.inventory = Inventory.addToInventory(
        this.player.character.inventory, 'Stew', 3, 5
      );
    });
    describe('parse', function () {
      context('when given a valid input', function () {
        it('should return a correctly parsed action', function () {
          const parse = Actions.INGEST_COMPONENT.parse('drink water', this.player.character, Date.now());

          expect(parse.itemName).to.equal('Water');
        });
      });
      context('when given a non-ingestible', function () {
        it('should return null', function () {
          const parse = Actions.INGEST_COMPONENT.parse('quaff pickaxe', this.player.character, Date.now());

          expect(parse).to.be.null;
        });
      });
    });
    describe('validate', function () {
      context('when the requested ingestible is in the player\'s inventory', function () {
        it('should validate positively', function () {
          const parse = Actions.INGEST_COMPONENT.parse('consume stew', this.player.character, Date.now());

          const validation = Actions.INGEST_COMPONENT.validate(parse, this.game);

          expect(validation.isValid).to.be.true;
        });
      });
      context('when the requested ingestible is not in the player\'s inventory', function () {
        it('should validate negatively', function () {
          const parse = Actions.INGEST_COMPONENT.parse('eat raw meat', this.player.character, Date.now());

          const validation = Actions.INGEST_COMPONENT.validate(parse, this.game);

          expect(validation.isValid).to.be.false;
          expect(validation.error).to.equal('Missing Raw Meat in inventory!');
        });
      });
    });
    describe('perform', function () {
      it('should remove the ingestible from the inventory');
      it('should apply the ingestible\'s stat change to the actor');
      it('should poison the actor if the ingestible is poisoned');
      it('should cure the actor\'s poisoning');
      it('should repoison if it is a "poisoned cure"');
      it('should have a chance of getting the player addicted if addictive');
      it('should give immortality if applicable');
      it('should update the addiction meter');
      it('should update the exhaustion meter');
      it('should update the hunger meter');
      it('should throw an error if the item chosen is not ingestible');
    });
  });
});
