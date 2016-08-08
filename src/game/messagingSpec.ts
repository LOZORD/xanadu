import { expect } from 'chai';
import * as _ from 'lodash';
import * as Messaging from './messaging';
import { Player } from './player';

describe('Server Messaging ', () => {
  before(function() {
    this.player1 = {
      id: '007',
      name: 'James_Bond',
      state: 'Ready',
      character: null
    };

    this.player2 = {
      id: '117',
      name: 'Master_Chief',
      state: 'Ready',
      character: null
    };
  });
  describe('Game Message', () => {
    it('should return the correct JSON', () => {
      const gbr = Messaging.createGameMessage('welcome to the game', []);

      expect(Messaging.show(gbr)).to.eql({
        type: 'Game',
        message: 'welcome to the game'
      });
    });
  });
  describe('Echo Message', () => {
    it('should return the correct JSON', function() {
      const em = Messaging.createEchoMessage('go north', this.player1);

      expect(Messaging.show(em)).to.eql({
        type: 'Echo',
        message: 'go north'
      });
    });
  });
  describe('Whisper Message', () => {
    it('should return the correct JSON', function() {
      const wm = Messaging.createWhisperMessage(this.player1, 'wazzup', this.player2);

      expect(Messaging.show(wm)).to.eql({
        from: {
          name: 'James_Bond'
        },
        message: 'wazzup',
        type: 'Whisper'
      });
    });
  });
  describe('Talk Message', () => {
    it('should return the correct JSON', function() {
      const tm = Messaging.createTalkMessage(this.player1, 'greetings', [this.player2]);

      expect(Messaging.show(tm)).to.eql({
        from: {
          name: 'James_Bond'
        },
        message: 'greetings',
        type: 'Talk'
      });
    });
  });
  describe('Shout Message', () => {
    it('should return the correct JSON', function() {
      const sm = Messaging.createShoutMessage(this.player1, 'hooray', [this.player2]);

      expect(Messaging.show(sm)).to.eql({
        from: {
          name: 'James_Bond'
        },
        message: 'hooray',
        type: 'Shout'
      });
    });
  });
});
