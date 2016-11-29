import { expect } from 'chai';
import Lobby from './lobby';
import { Player } from '../game/player';
import * as Messaging from '../game/messaging';

describe('Context (tested via Lobby)', () => {

  // for the sake of clarity:
  const testContext = context;

  describe('addPlayer', () => {
    beforeEach(function () {
      this.context = new Lobby(2, []);
    });
    testContext('when there is room available', () => {
      it('should add the player', function () {
        this.context.addPlayer('007');
        expect(this.context.hasPlayer('007')).to.be.true;
      });
    });
    testContext('when the id is already present', () => {
      it('should throw an error', function () {
        const add007 = () => this.context.addPlayer('007');
        // not present
        expect(add007).not.to.throw(Error);
        // present
        expect(add007).to.throw(Error);
      });
    });
    testContext('when the game is full', () => {
      it('should throw an error', function () {
        const ap = (id) => (() => this.context.addPlayer(id));
        expect(ap('foo')).not.to.throw(Error);
        expect(ap('bar')).not.to.throw(Error);
        expect(ap('baz')).to.throw(Error);
      });
    });
  });

  describe('removePlayer', () => {
    beforeEach(function () {
      this.context = new Lobby(8, [ {
        name: 'James_Bond',
        id: '007'
      }]);
    });
    testContext('when the player is present', () => {
      it('should remove and return the player', function () {
        const bond = this.context.removePlayer('007');
        expect(bond.id).to.equal('007');
        expect(this.context.hasPlayer('007')).to.be.false;
        expect(this.context.players.length).to.equal(0);
      });
    });
    testContext('when the player is NOT present', () => {
      it('should return undefined', function () {
        const noOne = this.context.removePlayer('foobar');
        expect(noOne).to.be.undefined;
      });
    });
  });

  describe('broadcast', () => {
    before(function () {
      const players: Player[] = [
        { name: 'Alex', id: 'guitar' },
        { name: 'Geddy', id: 'bass' },
        { name: 'Neil', id: 'drums' }
      ];

      this.players = players;

      this.context = new Lobby(8, this.players);
    });
    it('should return a game message addressed to all players', function () {
      const msg = this.context.broadcast('hello world') as Messaging.Message;
      expect(msg.to).to.eql(this.context.players);
    });
  });

  describe('validateName', () => {
    it('should validate against "subset" names', () => {
      const player1: Player = {
        id: '007',
        name: 'James_Bond'
      };

      const player2: Player = {
        id: '2112',
        name: 'Geddy_Lee'

      };

      const context = new Lobby(8, [ player1, player2 ]);

      // test name superset of present name
      expect(context.validateName('James_Bond_Imposter')).to.equal('Taken');

      // test name subset of present name
      expect(context.validateName('Geddy')).to.equal('Taken');
    });
  });

  describe('getRosterData', function () {
    before(function () {
      const lobby = new Lobby(8, []);

      lobby.addPlayer('abc');
      lobby.addPlayer('def', 'Darwin');
      lobby.addPlayer('ghi', 'Georgia');

      this.lobby = lobby;
    });
    it('should not include anonymous players', function () {
      const rosterData = (this.lobby as Lobby).getRosterData();

      expect(rosterData).to.have.lengthOf(2);
    });
    it('should include character information if available');
  });
});
