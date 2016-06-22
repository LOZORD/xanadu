import { expect } from 'chai';
import _ from 'lodash';

import Context from './context';
import { EchoResponse } from '../game/messaging';

describe('Context', () => {

  // for the sake of clarity:
  const testContext = context;

  describe('constructor', () => {
    it('should set default arguments', () => {
      const c = new Context();

      expect(c.players).to.eql([]);
      expect(c.maxPlayers).to.equal(8);
      // these fields seem unnec.
      //expect(c.hasStarted).to.equal(false);
      //expect(c.hasEnded).to.equal(false);
    });
  });

  describe('addPlayer', () => {
    testContext('when there is room available', () => {
      let c = new Context();

      it('should return a context and a player', () => {
        const { context, player } = c.addPlayer('007');
        expect(context.players.length).to.equal(1);
        expect(player).to.be.ok;
        expect(player.id).to.equal('007');
      });

      it('should not modify the original context', () => {
        c.addPlayer('007');
        expect(c.players.length).to.equal(0);
      });
    });

    testContext('when the context is full', () => {
      let c;

      beforeEach(() => {
        c = new Context();
        _.times(c.maxPlayers, () => {
          const { context }  = c.addPlayer(Math.random());
          c = context;
        });
      });

      it('should not add the player in the update', () => {
        const { context } = c.addPlayer('007');

        expect(context.hasPlayer('007')).to.be.false;
      });

      it('should return `player` as `undefined`', () => {
        const { player } = c.addPlayer('007');

        expect(player).to.be.undefined;
      });
    });

    // not explicity tested: returning a new context and last optional arg
  });

  describe('removePlayer', () => {
    testContext('when present', () => {
      it('should return an updated context and the player', () => {
        const c = new Context();
        const { context: addContext, player: addPlayer } = c.addPlayer('007');
        const { context: remContext, player: remPlayer } = addContext.removePlayer('007');
        expect(addContext.players.length).to.be.above(remContext.players.length);
        expect(addPlayer).to.eql(remPlayer);
      });
    });

    testContext('when not present', () => {
      it('should return `player` as `undefined`', () => {
        const c = new Context();
        const { player } = c.removePlayer('007');
        expect(player).to.be.undefined;
      });

      it('should not modify the context', () => {
        const c = new Context();
        const { context: remContext } = c.removePlayer('007');
        expect(remContext).to.eql(c);
      });
    });
  });

  describe('getPlayer', () => {
    testContext('when present', () => {
      it('should return the player if it is present', () => {
        const c = new Context();
        const { context, player } = c.addPlayer('007');
        expect(context.getPlayer('007')).to.eql(player);
      });
    });

    testContext('when not present', () => {
      it('should return `undefined` if the player is not present', () => {
        const c = new Context();
        expect(c.getPlayer('007')).to.be.undefined;
      });
    });
  });

  describe('hasPlayer', () => {
    testContext('when present', () => {
      it('should return `true`', () => {
        const c = new Context();
        const { context } = c.addPlayer('007');
        expect(context.hasPlayer('007')).to.be.true;
      });
    });

    testContext('when not present', () => {
      it('should return `false`', () => {
        const c = new Context();
        expect(c.hasPlayer('007')).to.be.false;
      });
    });
  });

  describe('getPlayerWithName', () => {
    testContext('when present', () => {
      it('should return the player', () => {
        const c1 = new Context();
        const { context: c2, player } = c1.addPlayer('007');
        player.name = 'James Bond';
        expect(c2.getPlayerWithName('James Bond')).to.eql(player);
      });
    });

    testContext('when not present', () => {
      it('should return `undefined`', () => {
        const c1 = new Context();
        expect(c1.getPlayerWithName('James Bond')).to.be.undefined;
      });
    });
  });

  describe('hasPlayerWithName', () => {
    testContext('when present', () => {
      it('should return `true`', () => {
        const c1 = new Context();
        const { context: c2, player } = c1.addPlayer('007');
        player.name = 'James Bond';
        expect(c2.hasPlayerWithName('James Bond')).to.be.true;
      });
    });

    testContext('when not present', () => {
      it('should return `false`', () => {
        const c1 = new Context();
        expect(c1.hasPlayerWithName('James Bond')).to.be.false;
      });
    });
  });

  describe('handleMessage', () => {
    it('should send an echo response', () => {
      const messageObj = {
        message: 'hello world'
      };

      let c = new Context();

      let { context, player } = c.addPlayer('007');

      c = context;

      const responses = c.handleMessage(messageObj, player);

      expect(_.isArray(responses)).to.be.true;

      expect(responses.length).to.equal(1);

      const echo = responses[0];

      expect(echo instanceof EchoResponse).to.be.true;

      expect(echo.toJSON()).to.eql({
        type: 'echo',
        message: 'hello world',
        to: {
          id: '007',
          name: '[NO NAME]'
        }
      });
    });
  });

  describe('isAcceptingPlayers', () => {
    testContext('when spots are available', () => {
      it('should return `true`', () => {
        let c = new Context();

        _.times(c.maxPlayers, () => {
          expect(c.isAcceptingPlayers()).to.be.true;
          let { context } = c.addPlayer(Math.random());
          c = context;
        });
      });
    });
    testContext('when the context is full', () => {
      let c = new Context();

      _.times(c.maxPlayers, () => {
        let { context } = c.addPlayer(Math.random());
        c = context;
      });

      expect(c.isAcceptingPlayers()).to.be.false;
    });
  });

  describe('isReadyForNextContext', () => {
    it('should exist [abstract method]', () => {
      const c = new Context();
      expect(c.isReadyForNextContext).to.exist;
    });
  });

  describe('changeFields', () => {
    it('should return a clone if no fields are given', () => {
      const c1 = new Context();
      const c2 = c1.changeFields({});
      expect(c2).to.eql(c1);
    });

    it('should not modify the callee Context', () => {
      const c1 = new Context();
      const c2 = _.cloneDeep(c1);
      c1.changeFields({});
      expect(c1).to.eql(c2);
    });
  });
});
