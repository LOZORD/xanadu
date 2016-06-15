import { expect} from 'chai';
import _ from 'lodash';

import Context from './context';

describe('Context', () => {
  describe('constructor', () => {
    it('should set default arguments', () => {
      const c = new Context();

      expect(c.players).to.eql([]);
      expect(c.maxPlayers).to.equal(8);
      expect(c.hasStarted).to.equal(false);
      expect(c.hasEnded).to.equal(false);
    });
  });

  describe('addPlayer', () => {
  });

  describe('removePlayer', () => {
  });

  describe('getPlayer', () => {
  });

  describe('hasPlayer', () => {
  });

  describe('getPlayerWithName', () => {
  });

  describe('hasPlayerWithName', () => {
  });

  describe('handleMessage', () => {
  });

  describe('isAcceptingPlayers', () => {
  });
});
