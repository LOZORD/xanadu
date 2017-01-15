import { expect } from 'chai';
import * as Character from './character';
import * as Player from './player';
import Game from '../context/game';
import * as Inventory from './inventory';
import { cloneDeep } from 'lodash';
import { changeStats, Stats } from './stats';

describe('Character', function () {
  describe('updateCharacter', function () {
    // type UpdateSetup = {
    //   player: Player.GamePlayer;
    //   game: Game;
    // };

    // function setup(setup: UpdateSetup) {
    //   setup.game = new Game(8, [ {id: '007', name: 'James_Bond'} ]);

    //   setup.player = setup.game.getPlayer('007')!;

    //   // self.player.character = Character.createCharacter(self.game, self.player);
    // }

    let game: Game;
    let player: Player.GamePlayer;

    // before(function () {
    //   setup(this);
    // });
    // afterEach(function () {
    //   setup(this);
    // });

    beforeEach(() => {
      game = new Game(8, [ { id: '007', name: 'James_Bond' }]);
      player = game.getPlayer('007') !;
    });
    context('when the character has no active effects', function () {
      beforeEach(function () {
        // assign a pass action
        player.character.nextAction = {
          actor: player.character,
          timestamp: Date.now(),
          key: 'Pass'
        };
      });
      it('should return the proper log message', function () {
        const log = Character.updateCharacter(player.character, 'James_Bond');

        expect(log).to.include('James_Bond has no active effects');
      });
    });
    context('when the character is exhausted', function () {
      let origStats: Stats;
      let log: string;
      beforeEach(function () {
        origStats = cloneDeep(player.character.stats);
        player.character.effects.exhaustion.current = 0;

        player.character.nextAction = {
          actor: player.character,
          timestamp: Date.now(),
          key: 'Pass'
        };

        log = Character.updateCharacter(player.character, 'James_Bond');
      });
      it('should apply the negative exhaustion stat change', function () {
        expect(player.character.stats).to.eql(
          changeStats(origStats, Character.EXHAUSTED.statChange)
        );
      });
      it('should give the proper log message', function () {
        expect(log).to.contain('James_Bond is exhausted');
      });
    });
    context('when the character is hungry', function () {
      let origStats: Stats;
      let log: string;
      beforeEach(function () {
        origStats = cloneDeep(player.character.stats);
        player.character.effects.hunger.current = 0;

        player.character.nextAction = {
          actor: player.character,
          timestamp: Date.now(),
          key: 'Pass'
        };

        log = Character.updateCharacter(player.character, 'James_Bond');
      });
      it('should apply the negative hunger stat change', function () {
        expect(player.character.stats).to.eql(
          changeStats(origStats, Character.HUNGRY.statChange)
        );
      });
      it('should give the proper log message', function () {
        expect(log).to.contain('James_Bond is hungry');
      });
    });
    context('when the character is poisoned', function () {
      let origStats: Stats;
      let log: string;
      beforeEach(function () {
        origStats = cloneDeep(player.character.stats);
        player.character.effects.poison.isActive = true;

        player.character.nextAction = {
          actor: player.character,
          timestamp: Date.now(),
          key: 'Pass'
        };

        log = Character.updateCharacter(player.character, 'James_Bond');
      });
      it('should apply the poisoned stat change', function () {
        expect(player.character.stats).to.eql(
          changeStats(origStats, Character.POISONED.statChange)
        );
      });
      it('should give the proper log message', function () {
        expect(log).to.contain('James_Bond is poisoned');
      });
    });
    context('when the character is immortal', function () {
      let origStats: Stats;
      let log: string;
      beforeEach(function () {
        origStats = cloneDeep(player.character.stats);
        player.character.effects.immortality.isActive = true;
        player.character.effects.exhaustion.current = 0;
        player.character.effects.hunger.current = 0;
        player.character.effects.poison.isActive = true;
        player.character.effects.addiction.isActive = true;
        player.character.effects.addiction.current = 0;

        player.character.nextAction = {
          actor: player.character,
          timestamp: Date.now(),
          key: 'Pass'
        };

        log = Character.updateCharacter(player.character, 'James_Bond');
      });
      it('should not modify the character\'s stats', function () {
        expect(player.character.stats).to.eql(origStats);
      });
      it('should give the proper log message', function () {
        expect(log).to.contain('James_Bond is immortal');
      });
    });
    context('when the character is addicted', function () {
      let origStats: Stats;
      let log: string;
      beforeEach(function () {
        origStats = cloneDeep(player.character.stats);

        player.character.effects.addiction.isActive = true;
        player.character.effects.addiction.current = 0;

        player.character.nextAction = {
          actor: player.character,
          timestamp: Date.now(),
          key: 'Pass'
        };

        log = Character.updateCharacter(player.character, 'James_Bond');
      });
      it('should apply the addicted stat change', function () {
        expect(player.character.stats).to.eql(
          changeStats(origStats, Character.ADDICTED.statChange)
        );
      });
      it('should give the proper log message', function () {
        expect(log).to.contain('James_Bond is in withdrawal');
      });
    });
  });
  describe('updateEffectMeters', function () {
    let game: Game;
    let player: Player.GamePlayer;
    beforeEach(function () {
      game = new Game(8, [ { id: '404', name: 'Missingno' }]);

      player = game.getPlayer('404') !;

      // this.player.character = Character.createCharacter(this.game, this.player.id);
    });
    context('when the player doesn\'t have an action', function () {
      it('should throw an error');
    });
    context('when the player rested', function () {
      it('should not decrease their exhaustion meter', function () {
        //place camp at starting position
        game.startingRoom.hasCamp = true;

        const origExhaustion = player.character.effects.exhaustion.current;

        game.handleMessage({
          player,
          content: 'rest',
          timestamp: Date.now()
        });

        expect(game.isReadyForUpdate()).to.be.true;

        game.update();

        const newExhaustion = player.character.effects.exhaustion.current;

        expect(newExhaustion).to.eql(origExhaustion);
      });
    });
    context('when the player ingested something that relieves hunger', function () {
      it('should not decrease their hunger meter', function () {
        player.character.inventory = Inventory.addToInventory(
          player.character.inventory, 'Stew', 1, 5
        );

        const origHunger = player.character.effects.hunger.current;

        game.handleMessage({
          player,
          content: 'eat stew',
          timestamp: Date.now()
        });

        game.update();

        const newHunger = player.character.effects.hunger.current;

        expect(newHunger).to.eql(origHunger);
      });
    });
    context('when the player ingested something that relieves exhaustion', function () {
      it('should not decrease their exhaustion meter', function () {
        player.character.inventory = Inventory.addToInventory(
          player.character.inventory, 'Cave Leaf', 1, 5
        );

        const origExhaustion = player.character.effects.exhaustion.current;

        game.handleMessage({
          player,
          content: 'eat cave leaf',
          timestamp: Date.now()
        });

        game.update();

        const newExhaustion = player.character.effects.exhaustion.current;

        expect(newExhaustion).to.eql(origExhaustion);
      });
    });
    context('when the player is addicted and ingested something that relieves addiction', function () {
      it('should not decrease their addiction meter', function () {
        player.character.inventory = Inventory.addToInventory(
          player.character.inventory, 'Cave Leaf', 1, 5
        );

        player.character.effects.addiction.isActive = true;

        const origAddiction = player.character.effects.addiction.current;

        game.handleMessage({
          player,
          content: 'eat cave leaf',
          timestamp: Date.now()
        });

        game.update();

        const newAddiction = player.character.effects.addiction.current;

        expect(newAddiction).to.eql(origAddiction);
      });
    });
    context('when the player did not ingest or rest', function () {
      function getMeters(character: Character.Character) {
        return [
          character.effects.addiction.current,
          character.effects.exhaustion.current,
          character.effects.hunger.current
        ];
      }
      it('should decrease their meters', function () {
        const [ a0, e0, h0 ] = getMeters(player.character);

        game.handleMessage({
          player,
          content: 'pass',
          timestamp: Date.now()
        });

        game.update();

        const [ a1, e1, h1 ] = getMeters(player.character);

        expect(a1).to.eql(a0); // not addicted
        expect(e1).to.be.lessThan(e0);
        expect(h1).to.be.lessThan(h0);

        player.character.effects.addiction.isActive = true;

        game.handleMessage({
          player,
          content: 'pass',
          timestamp: Date.now()
        });

        game.update();

        const [ a2, e2, h2 ] = getMeters(player.character);

        expect(a2).to.be.lessThan(a1); // now addicted
        expect(e2).to.be.lessThan(e1);
        expect(h2).to.be.lessThan(h1);
      });
    });
    context('when the player has no action', function () {
      it('should throw an error', function () {
        const badUpdate = () => Character.updateEffectMeters(player.character);
        expect(badUpdate).to.throw(Error);
      });
    });
    context('when the character is immortal', function () {
      let origStats: Stats;
      beforeEach(function () {
        player.character.effects.immortality.isActive = true;
        origStats = cloneDeep(player.character.stats);
        game.handleMessage({
          player,
          content: 'pass',
          timestamp: Date.now()
        });
      });
      it('should not change the stats', function () {
        expect(player.character.stats).to.eql(origStats);
      });
    });
  });
  describe('createCharacter', function () {
    let game: Game;
    before(function () {
      const p1 = Player.createPlayer('1', 'Alice');
      const p2 = Player.createPlayer('2', 'Bob');

      game = new Game(8, [ p1, p2 ]);

      const gp1 = (game as Game).getPlayer('1');
      const gp2 = (game as Game).getPlayer('2');

      if (gp1 && gp2) {
        gp1.character = Character.createCharacter(game, gp1.id, game.startingRoom, 'Shaman');
        gp2.character = Character.createCharacter(game, gp2.id, game.startingRoom, 'Shaman');
      } else {
        throw new Error('Test players are not present!');
      }
    });
    it('should create distinct characters', function () {
      const gp1 = game.getPlayer('1');
      const gp2 = game.getPlayer('2');

      if (gp1 && gp2) {
        const origHealth = gp1.character.stats.health;

        gp1.character.stats.health -= 5;

        expect(Character.CLASS_STARTING_STATS.Shaman.health).to.eql(origHealth);

        const h1 = gp1.character.stats.health;

        const h2 = gp2.character.stats.health;

        expect(h1).to.be.lessThan(h2);

        const bob = game.getPlayerByName('Bob');

        if (bob) {
          const {inventory: newInv} = Inventory.removeFromInventory(bob.character.inventory, 'Knife', 2);

          expect(Inventory.hasItem(newInv, 'Knife')).to.be.false;

          expect(Inventory.hasItem(gp1.character.inventory, 'Knife')).to.be.true;
        } else {
          throw new Error('Test player Bob is not present!');
        }
      } else {
        throw new Error('Test players are not present!');
      }
    });
  });
});
