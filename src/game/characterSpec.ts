import { expect } from 'chai';
import * as Character from './character';
import * as Player from './player';
import Game from '../context/game';
import * as Inventory from './inventory';

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
    context('when the player doesn\'t have an action', function() {
      it('should throw an error');
    });
    context('when the player rested', function () {
      it('should not decrease their exhaustion meter', function () {
        //place camp at starting position
        (this.game as Game).startingRoom.hasCamp = true;

        const origExhaustion = this.player.character.effects.exhaustion.current;

        (this.game as Game).handleMessage({
          content: 'rest',
          player: this.player,
          timestamp: Date.now()
        });

        expect((this.game as Game).isReadyForUpdate()).to.be.true;

        this.game.update();

        const newExhaustion = this.player.character.effects.exhaustion.current;

        expect(newExhaustion).to.eql(origExhaustion);
      });
    });
    context('when the player did NOT rest', function () {
      it('should decrease the exhaustion meter', function () {
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
    context('when the player ingested something that relieves hunger', function () {
      it('should not decrease their hunger meter', function () {
        (this.player.character as Character.Character).inventory = Inventory.addToInventory(
          this.player.character.inventory, 'Stew', 1, 5
        );

        const origHunger = this.player.character.effects.hunger.current;

        (this.game as Game).handleMessage({
          content: 'eat stew',
          player: this.player,
          timestamp: Date.now()
        });

        this.game.update();

        const newHunger = this.player.character.effects.hunger.current;

        expect(newHunger).to.eql(origHunger);
      });
    });
    context('when the player ingested something that relieves exhaustion', function () {
      it('should not decrease their exhaustion meter');
    });
    context('when the player is addicted and ingested something that relieves addiction', function () {
      it('should not decrease their addiction meter');
    });
    context('when the player did not ingest or rest', function () {
      it('should decrease their meters');
    });
  });
});
