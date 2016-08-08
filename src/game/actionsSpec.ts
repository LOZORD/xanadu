import { expect } from 'chai';
import * as _ from 'lodash';
import * as Actions from './actions';
import Game from '../context/game';
import { isWithinMap } from './map/map';

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
  describe.skip('Base Action', () => {
    it('should be tested!');
  });
  describe('MoveAction', () => {
    beforeEach(function () {
      this.player = {
        id: '007',
        name: 'James_Bond',
        state: 'Preparing',
        character: {
          row: 1,
          col: 1
        }
      };
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
          const action = <Actions.MoveAction> Actions.parseAction(`go ${dir}`, this.player.character, Date.now());

          expect(action).to.be.ok;

          const newR = this.player.character.row + action.offsetRow;
          const newC = this.player.character.col + action.offsetCol;

          expect(newR).to.equal(r, `when moving ${dir}`);
          expect(newC).to.equal(c, `when moving ${dir}`);
        });
      });
    });
    describe('validate', () => {
      // remember: we are using the test map!
      before(function () {
        this.game = new Game(8, [ this.player ]);
      });
      context('when the move is valid', () => {
        it('should have `isValid` = `true`', function () {
          const action = Actions.MoveComponent.parse('go south', this.player.character, Date.now());
          const { isValid } = Actions.MoveComponent.validate(action, this.game);

          expect(isValid).to.be.true;
        });
      });
      context('when the move is not into a room', function () {
        before(function () {
          this.invalidAction = Actions.MoveComponent.parse('go north', this.player.character, Date.now());
          this.validationResult = Actions.MoveComponent.validate(this.invalidAction, this.game);
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

          this.invalidAction = Actions.MoveComponent.parse('go north', this.player.character, Date.now());
          this.validationResult = Actions.MoveComponent.validate(this.invalidAction, this.game);
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
      this.player = {
        id: '007',
        name: 'James_Bond',
        state: 'Playing',
        character: {}
      };
      this.game = new Game(8, [ this.player ]);
    });

    describe('parse', () => {
      it('parsing should return a PassAction', function () {
        const passAction = <Actions.PassAction> Actions.parseAction('pass', this.player.character, Date.now());
        expect(passAction).to.be.ok;
      });
    });
    describe('validate', () => {
      it('should return true', function() {
        const passAction = <Actions.PassAction> Actions.parseAction('pass', this.player.character, Date.now());
        expect(Actions.PassComponent.validate(passAction, this.game).isValid).to.be.true;
      });
    });
  });
  describe('Unknown Inputs', () => {
    it('should return null', function () {
      const ret = Actions.parseAction('foobarbaz123', null, Date.now());
      expect(ret).to.be.null;
    });
  });
});
