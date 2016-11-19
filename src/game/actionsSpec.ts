import { expect } from 'chai';
import * as _ from 'lodash';
import * as Actions from './actions';
import Game from '../context/game';
import * as Player from './player';
import * as Character from './character';
import * as Inventory from './inventory';
import * as Stats from './stats';
import * as Ingestible from './items/ingestible';

describe('Actions', function () {
  describe('isParsableAction', function () {
    context('when given a valid action command', function () {
      it('should return true', function () {
        expect(Actions.isParsableAction('go south')).to.be.true;
      });
    });
    context('when given an invalid action command', function () {
      it('should return false', function () {
        // sadly false
        expect(Actions.isParsableAction('listen to 2112')).to.be.false;
      });
    });
  });
  describe('MoveAction', function () {
    // remember: we are using the test map!
    before(function () {
      this.game = new Game(8, []);
      this.player = Player.createPlayer('007', 'James_Bond', 'Playing');
      this.player.character = Character.createCharacter(this.game, this.player, this.game.map.startingPosition, 'None');
      this.game.players.push(this.player);
    });
    describe('parse', function () {
      it('parsing should return a MoveAction', function () {
        // all locations are based off of starting position (1,1)
        const locations = {
          north: {
            r: 0, c: 1
          },
          south: {
            r: 2, c: 1
          },
          west: {
            r: 1, c: 0
          },
          east: {
            r: 1, c: 2
          }
        };

        _.forEach(locations, ({ r, c }, dir) => {
          const action = Actions.parseAction(`go ${dir}`, this.player.character, Date.now()) as Actions.MoveAction;

          expect(action).to.be.ok;

          const newR = this.player.character.row + action.offsetRow;
          const newC = this.player.character.col + action.offsetCol;

          expect(newR).to.equal(r, `when moving ${dir}`);
          expect(newC).to.equal(c, `when moving ${dir}`);
        });
      });
    });
    describe('validate', function () {
      context('when the move is valid', function () {
        it('should have `isValid` = `true`', function () {
          const action = Actions.MOVE_COMPONENT.parse('go south', this.player.character, Date.now());
          const { isValid } = Actions.MOVE_COMPONENT.validate(action, this.game);

          expect(isValid).to.be.true;
        });
      });
      context('when the move is not into a room', function () {
        before(function () {
          this.invalidAction = Actions.MOVE_COMPONENT.parse('go north', this.player.character, Date.now());
          this.validationResult = Actions.MOVE_COMPONENT.validate(this.invalidAction, this.game);
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

          this.invalidAction = Actions.MOVE_COMPONENT.parse('go north', this.player.character, Date.now());
          this.validationResult = Actions.MOVE_COMPONENT.validate(this.invalidAction, this.game);
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
  describe('PassAction', function () {
    before(function () {
      this.game = new Game(8, []);
      this.player = Player.createPlayer('007', 'James_Bond', 'Playing');
      this.player.character = Character.createCharacter(this.game, this.player, this.game.map.startingPosition, 'None');
      this.game.players.push(this.player);
    });

    describe('parse', function () {
      it('parsing should return a PassAction', function () {
        const passAction = Actions.parseAction('pass', this.player.character, Date.now()) as Actions.PassAction;
        expect(passAction).to.be.ok;
      });
    });
    describe('validate', function () {
      it('should return true', function () {
        const passAction = Actions.parseAction('pass', this.player.character, Date.now()) as Actions.PassAction;
        expect(Actions.PASS_COMPONENT.validate(passAction, this.game).isValid).to.be.true;
      });
    });
  });
  describe('Unknown Inputs', function () {
    it('should return null', function () {
      const someAnimal = {
        stats: {
          health: 0,
          intelligence: 0,
          strength: 0,
          agility: 0
        },
        inventory: Inventory.createInventory([], 1),
        nextAction: null,
        row: -1,
        col: -1
      };

      const ret = Actions.parseAction('foobarbaz123', someAnimal, Date.now());
      expect(ret).to.be.null;
    });
  });
  describe('RestAction', function () {
    before(function () {
      this.player = Player.createPlayer('darth', 'Darth_Vader', 'Playing');
      this.game = new Game(8, [ this.player ]);
    });
    describe('parse', function () {
      it('should return a RestAction', function () {
        const restAction = Actions.parseAction('rest', this.player.character, Date.now());
        expect(restAction).to.be.ok;
      });
    });
    describe('validate', function () {
      context('when the player is at a camp', function () {
        it('should validate positively');
      });
      context('when the player is NOT at a camp', function () {
        it('should validate negatively');
      });
    });
    describe('perform', function () {
      it('should be tested!');
    });
  });
  describe('IngestAction', function () {
    beforeEach(function () {
      this.player = Player.createPlayer('007', 'James_Bond', 'Playing');

      this.game = new Game(8, [ this.player ]);

      this.player = (this.game as Game).getPlayer('007');

      // make the player's character's inventory big enough for the testing items
      (this.player.character as Character.Character).inventory.maximumCapacity = 100;

      this.player.character.inventory = Inventory.addToInventory(
        this.player.character.inventory, 'Stew', 3, 5
      );
    });
    describe('parse', function () {
      context('when given a valid input', function () {
        it('should return a correctly parsed action', function () {
          const parse = Actions.INGEST_COMPONENT.parse('drink water', this.player.character, Date.now());

          expect(parse.itemName).to.equal('Water');
        });
      });
      context('when given a non-ingestible', function () {
        it('should throw an error', function () {
          const parse = () =>
            Actions.INGEST_COMPONENT.parse(
              'quaff pickaxe', this.player.character, Date.now()
            );

          expect(parse).to.throw('Could not parse');
        });
      });
    });
    describe('validate', function () {
      context('when the requested ingestible is in the player\'s inventory', function () {
        it('should validate positively', function () {
          const parse = Actions.INGEST_COMPONENT.parse('consume stew', this.player.character, Date.now());

          const validation = Actions.INGEST_COMPONENT.validate(parse, this.game);

          expect(validation.isValid).to.be.true;
        });
      });
      context('when the requested ingestible is not in the player\'s inventory', function () {
        it('should validate negatively', function () {
          const parse = Actions.INGEST_COMPONENT.parse('eat raw meat', this.player.character, Date.now());

          const validation = Actions.INGEST_COMPONENT.validate(parse, this.game);

          expect(validation.isValid).to.be.false;
          expect(validation.error).to.equal('Missing Raw Meat in inventory!');
        });
      });
    });
    describe('perform', function () {
      beforeEach(function () {
        // another item...
        this.player.character.inventory = Inventory.addToInventory(
          this.player.character.inventory, 'Alcohol', 2, 5
        );

        // something poisonous...
        this.player.character.inventory = Inventory.addToInventory(
          this.player.character.inventory, 'Nightshade', 2, 5
        );

        // something that cures poisoning...
        this.player.character.inventory = Inventory.addToInventory(
          this.player.character.inventory, 'Poison Antidote', 2, 5
        );

        // something addictive
        this.player.character.inventory = Inventory.addToInventory(
          this.player.character.inventory, 'Morphine', 2, 5
        );

        // something that gives immortality
        this.player.character.inventory = Inventory.addToInventory(
          this.player.character.inventory, 'Honeydew', 2, 5
        );
      });
      it('should remove an ingestible stack element from the inventory', function () {
        const origStewStackSize = Inventory.getItem(this.player.character.inventory, 'Stew').stackAmount;

        const action = Actions.INGEST_COMPONENT.parse('eat stew', this.player.character, Date.now());

        Actions.INGEST_COMPONENT.perform(action, this.game, []);

        const newStewStackSize = Inventory.getItem(this.player.character.inventory, 'Stew').stackAmount;

        expect(newStewStackSize).to.equal(origStewStackSize - 1);
      });
      it('should apply the ingestible\'s stat change to the actor', function () {
        const origStats = _.cloneDeep((this.player.character as Character.Character).stats);

        const alcoholStats = _.cloneDeep(Ingestible.ALCOHOL.stats);

        const action = Actions.INGEST_COMPONENT.parse('drink Alcohol', this.player.character, Date.now());

        Actions.INGEST_COMPONENT.perform(action, this.game, []);

        const newStats = _.cloneDeep((this.player.character as Character.Character).stats);

        expect(newStats).to.eql(Stats.changeStats(origStats, alcoholStats));
      });
      it('should poison the actor if the ingestible is poisoned', function () {
        expect(
          Character.toggleIsActive((this.player.character as Character.Character).effects.poison)
        ).to.be.false;

        const action = Actions.INGEST_COMPONENT.parse('eat Nightshade', this.player.character, Date.now());

        Actions.INGEST_COMPONENT.perform(action, this.game, []);

        expect(
          Character.toggleIsActive((this.player.character as Character.Character).effects.poison)
        ).to.be.true;
      });
      it('should cure the actor\'s poisoning if applicable', function () {
        // force the player to be poisoned
        this.player.character.effects.poison.isActive = true;

        const action = Actions.INGEST_COMPONENT.parse('ingest poison Antidote', this.player.character, Date.now());

        Actions.INGEST_COMPONENT.perform(action, this.game, []);

        expect(
          Character.toggleIsActive((this.player.character as Character.Character).effects.poison)
        ).to.be.false;
      });
      it('should repoison if it is a "poisoned cure"', function () {
        // poison the cure
        const antidote = Inventory.getItem(
          this.player.character.inventory, 'Poison Antidote'
        ).item as Ingestible.Ingestible;

        antidote.isPoisoned = true;

        const action = Actions.INGEST_COMPONENT.parse('drink poison antidote', this.player.character, Date.now());

        Actions.INGEST_COMPONENT.perform(action, this.game, []);

        expect(
          Character.toggleIsActive((this.player.character as Character.Character).effects.poison)
        ).to.be.true;
      });
      it('should have a chance of getting the player addicted if addictive', function () {
        // force the addiction to occur (man, that sounds depressing...)
        (this.game as Game).rng.pickone = (_list) => true;

        const action = Actions.INGEST_COMPONENT.parse('consume morphine', this.player.character, Date.now());

        Actions.INGEST_COMPONENT.perform(action, this.game, []);

        expect(
          Character.toggleIsActive((this.player.character as Character.Character).effects.addiction)
        ).to.be.true;
      });
      it('should give immortality if applicable', function () {
        const action = Actions.INGEST_COMPONENT.parse('eat honeydew', this.player.character, Date.now());

        Actions.INGEST_COMPONENT.perform(action, this.game, []);

        expect(
          Character.toggleIsActive((this.player.character as Character.Character).effects.immortality)
        ).to.be.true;
      });
      it('should update the addiction meter', function () {
        const origAddiction = (this.player.character as Character.Character).effects.addiction.current -= 5;

        const action = Actions.INGEST_COMPONENT.parse('ingest morphine', this.player.character, Date.now());

        Actions.INGEST_COMPONENT.perform(action, this.game, []);

        const newAddiction = (this.player.character as Character.Character).effects.addiction.current;

        expect(newAddiction).to.be.greaterThan(origAddiction);

        expect(newAddiction).to.be.at.most((this.player.character as Character.Character).effects.addiction.maximum);
      });
      it('should update the exhaustion meter', function () {
        const origExhaustion = this.player.character.effects.exhaustion.current -= 5;

        const action = Actions.INGEST_COMPONENT.parse('ingest morphine', this.player.character, Date.now());

        Actions.INGEST_COMPONENT.perform(action, this.game, []);

        const newExhaustion = this.player.character.effects.exhaustion.current;

        expect(newExhaustion).to.be.greaterThan(origExhaustion);

        expect(newExhaustion).to.be.at.most(this.player.character.effects.exhaustion.maximum);
      });
      it('should update the hunger meter', function () {
        const origHunger = this.player.character.effects.hunger.current -= 5;

        const action = Actions.INGEST_COMPONENT.parse('EAT STEW', this.player.character, Date.now());

        Actions.INGEST_COMPONENT.perform(action, this.game, []);

        const newHunger = this.player.character.effects.hunger.current;

        expect(newHunger).to.be.greaterThan(origHunger);

        expect(newHunger).to.be.at.most(this.player.character.effects.hunger.maximum);
      });
      it('should throw an error if the item chosen is not ingestible');
    });
  });
  describe('AttackAction', function () {
    beforeEach(function () {
      const p1 = Player.createPlayer('alice', 'Alice', 'Playing');
      const p2 = Player.createPlayer('bob', 'Bob', 'Playing');

      this.game = new Game(8, [ p1, p2 ]);

      // let's give Alice some weapons!
      this.p1 = (this.game as Game).getPlayer('alice');
      this.p2 = (this.game as Game).getPlayer('bob');

      (this.p1.character as Character.Character).inventory.maximumCapacity = 100;
      const aliceInv1 = Inventory.addToInventory((this.p1.character as Character.Character).inventory, 'Knife', 1, 1);
      const aliceInv2 = Inventory.addToInventory(aliceInv1, 'Rifle', 1, 1);
      const aliceInv3 = Inventory.addToInventory(aliceInv2, 'Rifle Bullet', 10, 10);

      // But take away her Revolver and Revolver Bullets, if she has any
      let aliceInv4: Inventory.Inventory;
      let aliceInv5: Inventory.Inventory;

      if (Inventory.hasItem(aliceInv3, 'Revolver')) {
        aliceInv4 = Inventory.removeFromInventory(aliceInv3, 'Revolver', Infinity).inventory;
      } else {
        aliceInv4 = aliceInv3;
      }

      if (Inventory.hasItem(aliceInv4, 'Revolver Bullet')) {
        aliceInv5 = Inventory.removeFromInventory(aliceInv4, 'Revolver Bullet', Infinity).inventory;
      } else {
        aliceInv5 = aliceInv4;
      }

      (this.p1.character as Character.Character).inventory = aliceInv5;
    });
    describe('parse', function () {
      context('when given a valid input', function () {
        it('should return a correctly parsed attack action', function () {
          const parse = Actions.ATTACK_COMPONENT.parse('attack bob knife 2', this.p1.character, Date.now());

          expect(parse).to.be.ok;
          expect(parse.key).to.eql('Attack');
          expect(parse.targetName).to.eql('bob');
          expect(parse.times).to.eql(2);
          expect(parse.weaponName).to.eql('Knife');
        });
      });
      context('when given an invalid input', function () {
        it('should throw an error', function () {
          expect(
            () => Actions.ATTACK_COMPONENT.parse('foobarbaz123', this.p1.character, Date.now())
          ).to.throw(Error);
        });
      });
    });
    describe('validate', function () {
      context('when the item is not in the inventory', function () {
        it('should not be valid', function () {
          const missingItemAction: Actions.AttackAction = {
            actor: this.p1.character,
            times: 1,
            timestamp: Date.now(),
            targetName: 'Bob',
            weaponName: 'Revolver',
            key: 'Attack'
          };

          const result = Actions.ATTACK_COMPONENT.validate(missingItemAction, this.game);

          expect(result.isValid).to.be.false;
          expect(result.error).to.contain('Missing Revolver in inventory!');
        });
      });
      context('when the number of attack times is bad', function () {
        it('should not be valid', function () {
          const nanAttackAction: Actions.AttackAction = {
            actor: this.p1.character,
            times: NaN,
            timestamp: Date.now(),
            targetName: 'Bob',
            weaponName: 'Knife',
            key: 'Attack'
          };

          const negativeAttackAction: Actions.AttackAction = {
            actor: this.p1.character,
            times: -1,
            timestamp: Date.now(),
            targetName: 'Bob',
            weaponName: 'Knife',
            key: 'Attack'
          };

          [ nanAttackAction, negativeAttackAction ].forEach(action => {
            const result = Actions.ATTACK_COMPONENT.validate(action, this.game);

            expect(result.isValid).to.be.false;
            expect(result.error).to.contain('Bad number of times attacking');
          });
        });
      });
      context('when the target DNE', function () {
        it('should not be valid', function () {
          const missingTargetAction: Actions.AttackAction = {
            actor: this.p1.character,
            times: 1,
            timestamp: Date.now(),
            targetName: 'Carlo',
            weaponName: 'Fist',
            key: 'Attack'
          };

          const result = Actions.ATTACK_COMPONENT.validate(missingTargetAction, this.game);

          expect(result.isValid).to.be.false;
          expect(result.error).to.contain("No player with name 'Carlo'");
        });
      });
      context('when the target is beyond the attack range', function () {
        beforeEach(function () {
          // move Bob south
          this.p2.character.row += 1;
        });
        afterEach(function () {
          // move Bob back to the starting position
          this.p2.character.row -= 1;
        });
        it('should not be valid', function () {
          const outOfRangeAction: Actions.AttackAction = {
            actor: this.p1.character,
            timestamp: Date.now(),
            times: 1,
            targetName: 'bo',
            weaponName: 'Knife',
            key: 'Attack'
          };

          const result = Actions.ATTACK_COMPONENT.validate(outOfRangeAction, this.game);

          expect(result.isValid).to.be.false;
          expect(result.error).to.contain('Bob is out of Knife\'s attack range!');
        });
      });
      context('when the gun shot is not in a straight line', function () {
        beforeEach(function () {
          this.p2.character.row = 0;
          this.p2.character.col = 0;
        });
        afterEach(function () {
          this.p2.character.row = 1;
          this.p2.character.col = 1;
        });
        it('should not be valid', function () {
          const diagonalShotAction: Actions.AttackAction = {
            actor: this.p1.character,
            targetName: 'bob',
            times: 3,
            weaponName: 'Rifle',
            timestamp: Date.now(),
            key: 'Attack'
          };

          const result = Actions.ATTACK_COMPONENT.validate(diagonalShotAction, this.game);

          expect(result.isValid).to.be.false;
          expect(result.error).to.contain('You can only shoot in straight lines!');
        });
      });
      context('when the gun shot is obstructed by a barrier', function () {
        beforeEach(function () {
          this.p2.character.col = 3;
        });
        afterEach(function () {
          this.p2.character.col = 1;
        });
        it('should not be valid', function () {
          const obstructedShotAction: Actions.AttackAction = {
            actor: this.p1.character,
            targetName: 'b',
            times: 2,
            weaponName: 'Rifle',
            timestamp: Date.now(),
            key: 'Attack'
          };

          const result = Actions.ATTACK_COMPONENT.validate(obstructedShotAction, this.game);

          expect(result.isValid).to.be.false;
          expect(result.error).to.contain('Your shot is obstructed by a barrier!');
        });
      });
      context('when the attacker doesn\'t have the required bullets', function () {
        beforeEach(function () {
          this.origInventory = _.cloneDeep(this.p1.character.inventory);

          this.p1.character.inventory = Inventory.addToInventory(this.p1.character.inventory, 'Revolver', 1, 1);
        });
        afterEach(function () {
          this.p1.character.inventory = this.origInventory;
        });
        it('should not be valid', function () {
          const missingBulletsAction: Actions.AttackAction = {
            actor: this.p1.character,
            targetName: 'bob',
            weaponName: 'Revolver',
            times: 1,
            timestamp: Date.now(),
            key: 'Attack'
          };

          const result = Actions.ATTACK_COMPONENT.validate(missingBulletsAction, this.game);

          expect(result.isValid).to.be.false;
          expect(result.error).to.contain('You don\'t have Revolver Bullets for your Revolver!');
        });
      });
      context('when the attacker doesn\'t have enough bullets', function () {
        it('should not be valid', function () {
          const notEnoughBulletsAction: Actions.AttackAction = {
            actor: this.p1.character,
            times: 20,
            weaponName: 'Rifle',
            key: 'Attack',
            timestamp: Date.now(),
            targetName: 'Bob'
          };

          const result = Actions.ATTACK_COMPONENT.validate(notEnoughBulletsAction, this.game);

          expect(result.isValid).to.be.false;
          expect(result.error).to.contain('You cannot shoot 20 time(s) because you only have 10 bullet(s)!');
        });
      });
    });
  });
});
