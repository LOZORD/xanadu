import { it, beforeEach } from 'arrow-mocha/es5';
import { expect } from 'chai';
import _ from 'lodash';
import Player, { PLAYER_STATES } from '../game/player';
import Lobby, { NAME_VALIDATIONS } from './lobby';
import { BroadcastResponse, EchoResponse, GameResponse } from '../game/messaging';

describe('Lobby', () => {
  // again, for the sake of clarity
  const testContext = context;

  describe('isReadyForNextContext', () => {
    testContext('when all players are ready', () => {
      it('should return `true`', () => {
        const createPlayer = () => new Player({ id: Math.random() });
        let players = [createPlayer(), createPlayer(), createPlayer()];
        const lobby = new Lobby({ players });
        _.each(players, (player) => player.state = PLAYER_STATES.READY);
        expect(lobby.isReadyForNextContext()).to.be.true;
      });
    });
    testContext('when NOT all players are ready', () => {
      it('should return `false`', () => {
        const createPlayer = () => new Player({ id: Math.random() });
        const p1 = createPlayer();
        p1.state = PLAYER_STATES.READY;
        const p2 = createPlayer();
        p2.state = PLAYER_STATES.READY;
        const p3 = createPlayer();
        // p3 is NOT ready
        const players = [p1, p2, p3];
        const lobby = new Lobby({ players });
        expect(lobby.isReadyForNextContext()).to.be.false;
      });
    });
  });
  describe('handleMessage', () => {
    testContext('when the player is anonymous', () => {
      testContext('when the name given is valid', () => {
        beforeEach((test) => {
          test.l1 = new Lobby();

          const { lobby: l2, player: p1 } = test.l1.addPlayer('007');

          test.p1 = p1;
          test.l2 = l2;

          test.responses =
            test.l2.handleMessage({ message: 'James_Bond' }, test.p1);
        });
        it('should make their first message their name', (test) => {
          expect(test.l2.hasPlayerWithName('James_Bond')).to.be.true;
          expect(test.p1.state).to.equal(PLAYER_STATES.NAMED)
        });
        it('should broadcast their name', (test) => {
          const theBroadcast = _.find(test.responses, (response) => response instanceof BroadcastResponse);

          expect(theBroadcast).to.exist;

          expect(theBroadcast.message).to.include('James_Bond');
        });
      });
      testContext('when the name given is NOT valid', () => {
        it('should ask for another name', () => {
          const l1 = new Lobby();

          const { lobby: l2, player: p1 } = l1.addPlayer('007');

          const r1 = l2.handleMessage({ message: 'James_Bond' }, p1);

          // now to work with invalid naming attempts

          const { lobby: l3, player: p2 } = l2.addPlayer('008');

          const r2 = l3.handleMessage({ message: 'James_Bond' }, p2);

          expect(p2.name).to.not.equal('James_Bond');

          const takenResponse = _.find(r2, (response) => response instanceof GameResponse);

          expect(takenResponse).to.exist;

          expect(takenResponse.message).to.include('already been taken');

          // now for an invalid character name

          const r3 = l3.handleMessage({ message: 'James^&^Bond' }, p2);

          const patternResponse = _.find(r3, (response) => response instanceof GameResponse);

          expect(patternResponse).to.exist;

          expect(patternResponse.message)
            .to.include('only alphanumeric, underscore, and hyphen characters');
        });
      });
    });
    testContext('when the player is named', () => {
      // do we really need to test these here?
      //it('should broadcast all non-whisper messages');
      //it('should send whisper messages');
      it('should change the player\'s state on `ready` and broadcast', () => {
        const l0 = new Lobby();

        const { lobby: l1, player: p1 } = l0.addPlayer('007');

        const r1 = l1.handleMessage({ message: 'James_Bond' }, p1);

        const r2 = l1.handleMessage({ message: 'Shaken, not stirred' }, p1);

        expect(p1.state).to.not.equal(PLAYER_STATES.READY);

        const r3 = l1.handleMessage({ message: 'ready' }, p1);

        expect(p1.state).to.equal(PLAYER_STATES.READY);

        const theBroadcast = _.find(r3, (response) => response instanceof BroadcastResponse);

        expect(theBroadcast.message).to.include('READY');
      });
    });
    testContext('when the player is ready', () => {
      // do we really need to test these here?
      //it('should broadcast all non-whisper messages');
      //it('should send whisper messages');
    });
    testContext('when the player is in another state', () => {
      it('should produce no responses', () => {
        const l1 = new Lobby();

        const { lobby: l2, player: p1 } = l1.addPlayer('007');

        // should never happen :^)
        p1.state = PLAYER_STATES.DEAD;

        const r1 = l2.handleMessage({ message: 'James_Bond' }, p1);

        expect(p1.name).to.not.equal('James_Bond');

        expect(r1.length).to.equal(1);

        expect(r1[0]).to.be.an.instanceof(EchoResponse);
      });
    });
  });
  describe('validateName', () => {
    testContext('when the name is valid', () => {
      it('should return `NAME_VALIDATIONS.VALID`', () => {
        const lobby = new Lobby();

        const validName = 'James_Bond';

        // since the lobby is empty, there should be no one with the same name
        expect(lobby.validateName(validName)).to.equal(NAME_VALIDATIONS.VALID);
      });
    });
    testContext('when the name is NOT valid', () => {
      testContext('when the name has been taken', () => {
        it('should return NAME_VALIDATIONS.TAKEN', () => {
          const l1 = new Lobby();

          const validName = 'James_Bond';

          const { lobby: l2, player: p1 } = l1.addPlayer('007');

          p1.name = validName;

          const { lobby: l3, player: p2 } = l2.addPlayer('008');

          expect(l3.validateName(validName)).to.equal(NAME_VALIDATIONS.TAKEN);
        });
      });
      testContext('when the name has invalid characters', () => {
        it('should return NAME_VALIDATIONS.INVALID_CHARACTERS', () => {
          const lobby = new Lobby();

          const invalidName = 'James( )Bond$%^&';

          expect(lobby.validateName(invalidName))
          .to.equal(NAME_VALIDATIONS.INVALID_CHARACTERS);
        });
      });
    });
  });
});
