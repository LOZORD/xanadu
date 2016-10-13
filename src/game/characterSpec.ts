import { expect } from 'chai';
import * as Character from './character';
import * as Player from './player';
import Game from '../context/game';
import * as Inventory from './inventory';
import { cloneDeep } from 'lodash';
import { changeStats } from './stats';

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
    context('when the character is exhausted', function () {
      before(function () {
        this.origStats = cloneDeep(this.player.character.stats);
        (this.player.character as Character.Character).effects.exhaustion.current = 0;

        (this.player.character as Character.Character).nextAction = {
          actor: this.player.character,
          timestamp: Date.now(),
          key: 'Pass'
        };

        this.log = Character.updateCharacter(this.player.character);
      });
      it('should apply the negative exhaustion stat change', function () {
        expect(this.player.character.stats).to.eql(
          changeStats(this.origStats, Character.EXHAUSTED.statChange)
        );
      });
      it('should give the proper log message', function () {
        expect(this.log).to.contain('James_Bond is exhausted');
      });
    });
    context('when the character is hungry', function () {
      before(function () {
        this.origStats = cloneDeep(this.player.character.stats);
        (this.player.character as Character.Character).effects.hunger.current = 0;

        (this.player.character as Character.Character).nextAction = {
          actor: this.player.character,
          timestamp: Date.now(),
          key: 'Pass'
        };

        this.log = Character.updateCharacter(this.player.character);
      });
      it('should apply the negative hunger stat change', function () {
        expect(this.player.character.stats).to.eql(
          changeStats(this.origStats, Character.HUNGRY.statChange)
        );
      });
      it('should give the proper log message', function () {
        expect(this.log).to.contain('James_Bond is hungry');
      });
    });
    context('when the character is poisoned', function () {
      before(function () {
        this.origStats = cloneDeep(this.player.character.stats);
        (this.player.character as Character.Character).effects.poison.isActive = true;

        (this.player.character as Character.Character).nextAction = {
          actor: this.player.character,
          timestamp: Date.now(),
          key: 'Pass'
        };

        this.log = Character.updateCharacter(this.player.character);
      });
      it('should apply the poisoned stat change', function () {
        expect(this.player.character.stats).to.eql(
          changeStats(this.origStats, Character.POISONED.statChange)
        );
      });
      it('should give the proper log message', function () {
        expect(this.log).to.contain('James_Bond is poisoned');
      });
    });
    context('when the character is immortal', function () {
      it('should be tested!');
    });
    context('when the character is addicted', function () {
      before(function () {
        this.origStats = cloneDeep(this.player.character.stats);

        this.player.character.effects.addiction.isActive = true;
        this.player.character.effects.addiction.current = 0;

        this.player.character.nextAction = {
          actor: this.player.character,
          timestamp: Date.now(),
          key: 'Pass'
        };

        this.log = Character.updateCharacter(this.player.character);
      });
      it('should apply the addicted stat change', function () {
        expect(this.player.character.stats).to.eql(
          changeStats(this.origStats, Character.ADDICTED.statChange)
        );
      });
      it('should give the proper log message', function () {
        expect(this.log).to.contain('James_Bond is in withdrawal');
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
    context('when the player doesn\'t have an action', function () {
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
      it('should not decrease their exhaustion meter', function () {
        (this.player.character as Character.Character).inventory = Inventory.addToInventory(
          this.player.character.inventory, 'Cave Leaf', 1, 5
        );

        const origExhaustion = this.player.character.effects.exhaustion.current;

        (this.game as Game).handleMessage({
          content: 'eat cave leaf',
          player: this.player,
          timestamp: Date.now()
        });

        this.game.update();

        const newExhaustion = this.player.character.effects.exhaustion.current;

        expect(newExhaustion).to.eql(origExhaustion);
      });
    });
    context('when the player is addicted and ingested something that relieves addiction', function () {
      it('should not decrease their addiction meter', function () {
        (this.player.character as Character.Character).inventory = Inventory.addToInventory(
          this.player.character.inventory, 'Cave Leaf', 1, 5
        );

        this.player.character.effects.addiction.isActive = true;

        const origAddiction = this.player.character.effects.addiction.current;

        (this.game as Game).handleMessage({
          content: 'eat cave leaf',
          player: this.player,
          timestamp: Date.now()
        });

        this.game.update();

        const newAddiction = this.player.character.effects.addiction.current;

        expect(newAddiction).to.eql(origAddiction);
      });
    });
    context('when the player did not ingest or rest', function () {
      function getMeters(character: Character.Character) {
        return [
          character.effects.addiction.current,
          character.effects.exhaustion.current,
          character.effects.hunger.current,
        ];
      }
      it('should decrease their meters', function () {
        const [ a0, e0, h0 ] = getMeters(this.player.character);

        this.game.handleMessage({
          content: 'pass',
          player: this.player,
          timestamp: Date.now()
        });

        this.game.update();

        const [ a1, e1, h1 ] = getMeters(this.player.character);

        expect(a1).to.eql(a0); // not addicted
        expect(e1).to.be.lessThan(e0);
        expect(h1).to.be.lessThan(h0);

        this.player.character.effects.addiction.isActive = true;

        this.game.handleMessage({
          content: 'pass',
          player: this.player,
          timestamp: Date.now()
        });

        this.game.update();

        const [ a2, e2, h2 ] = getMeters(this.player.character);

        expect(a2).to.be.lessThan(a1); // now addicted
        expect(e2).to.be.lessThan(e1);
        expect(h2).to.be.lessThan(h1);
      });
    });
    context('when the player has no action', function () {
      it('should throw an error', function () {
        const badUpdate = () => Character.updateEffectMeters(this.player.character);
        expect(badUpdate).to.throw(Error);
      });
    });
  });
});
