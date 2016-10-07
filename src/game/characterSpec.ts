import { expect } from 'chai';
import * as Character from './character';
import * as Player from './player';
import Game from '../context/game';

describe('Character', function () {
  describe('updateCharacter', function () {
    function setup(self) {
      self.player = Player.createPlayer('007', 'James_Bond', 'Playing');

      self.game = new Game(8, [ self.player ]);

      self.player = (self.game as Game).getPlayer('007');

      self.player.character = Character.createCharacter(self.game, self.player);
    }
    before(function () {
      setup(this);
    });
    afterEach(function () {
      setup(this);
    });
    context('when the character has no active effects', function () {
      before(function () {
        // assign a pass action
        (this.player.character as Character.Character).nextAction = {
          actor: (this.player.character as Character.Character),
          timestamp: Date.now(),
          key: 'Pass'
        };
      });
      it('should return the proper log message', function () {
        const log = Character.updateCharacter(this.player.character);

        expect(log).to.include('James_Bond has no active effects');
      });
    });
  });
  describe('updateEffectMeters', function () {
    beforeEach(function () {
      this.player = Player.createPlayer('404', 'Missingno', 'Ready');

      this.game = new Game(8, [ this.player ]);

      this.player = (this.game as Game).getPlayer('404');

      this.player.character = Character.createCharacter(this.game, this.player);
    });
    it('should decrement the exhaustion meter if the player is not resting', function() {
      const origExhaustion = (this.player.character as Character.Character).effects.exhaustion.current;

      (this.game as Game).handleMessage({
        content: 'go south',
        player: this.player,
        timestamp: Date.now()
      });

      expect(this.game.isReadyForUpdate()).to.be.true;

      this.game.update();

      const newExhaustion = (this.player.character as Character.Character).effects.exhaustion.current;

      expect(newExhaustion).to.be.lessThan(origExhaustion);
    });
  });
});
