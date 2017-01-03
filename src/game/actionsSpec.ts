import { expect } from 'chai';
import * as _ from 'lodash';
import * as Actions from './actions';
import Game from '../context/game';
import * as Player from './player';
import * as Character from './character';
import * as Inventory from './inventory';
import * as Stats from './stats';
import * as Ingestible from './items/ingestible';
import * as Weapon from './items/weapon';
import * as Map from './map/map';
import { createItem } from './items/itemCreator';
import * as Item from './items/item';

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
      this.player = Player.createPlayer('007', 'James_Bond');
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
      this.player = Player.createPlayer('007', 'James_Bond');
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
      this.player = Player.createPlayer('darth', 'Darth_Vader');
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
      this.player = Player.createPlayer('007', 'James_Bond');

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
      const p1 = Player.createPlayer('alice', 'Alice');
      const p2 = Player.createPlayer('bob', 'Bob');

      this.game = new Game(8, [ p1, p2 ]);

      // let's give Alice some weapons!
      this.p1 = (this.game as Game).getPlayer('alice');
      this.p2 = (this.game as Game).getPlayer('bob');

      const aliceOrigInv = (this.p1.character as Character.Character).inventory;

      aliceOrigInv.maximumCapacity = 100;

      // remove any rifle bullets if she has any already
      if (Inventory.hasItem(aliceOrigInv, 'Rifle Bullet')) {
        Inventory.getItem(aliceOrigInv, 'Rifle Bullet').stackAmount = 0;
      }

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
    describe('perform', function () {
      context('when using a melee weapon', function () {
        beforeEach(function () {
          const knifeAttack: Actions.AttackAction = {
            actor: this.p1.character,
            weaponName: 'Knife',
            times: 3,
            targetName: 'Bob',
            timestamp: Date.now(),
            key: 'Attack'
          };

          this.threeKnifeDamage = Weapon.KNIFE.damageAmount * 3;
          this.attackAction = knifeAttack;
          this.log = [];
          this.origBobHealth = this.p2.character.stats.health;
          this.result = Actions.ATTACK_COMPONENT.perform(this.attackAction, this.game, this.log);
          this.actorAttackResultMessage = _.find(
            (this.result as Actions.PerformResult).messages,
            message => message.content.indexOf('You attacked') > -1
          );

          this.targetAttackResultMessage = _.find(
            (this.result as Actions.PerformResult).messages,
            message => message.content.indexOf('attacked you') > -1
          );
        });
        it('should attack the full number of times', function () {
          expect(this.actorAttackResultMessage.content).to.contain('You attacked Bob 3 time(s)');
        });
        it('should cause the correct amount of damage', function () {
          expect(this.p2.character.stats.health + this.threeKnifeDamage).to.be.at.least(this.origBobHealth);
        });
        it('should give the correct attack damage', function () {
          expect(this.actorAttackResultMessage.content).to.contain(`a total of ${this.threeKnifeDamage} damage`);
        });
        it('should send a message to the target', function () {
          expect(this.targetAttackResultMessage.content).to.contain('Alice attacked you');
          expect(this.targetAttackResultMessage.content).to.contain(`for ${this.threeKnifeDamage} damage`);
        });
      });
      context('when using a ranged weapon', function () {
        beforeEach(function () {
          const rifleAction: Actions.AttackAction = {
            actor: this.p1.character,
            weaponName: 'Rifle',
            times: 9,
            targetName: 'bob',
            timestamp: Date.now(),
            key: 'Attack'
          };

          this.attackAction = rifleAction;

          this.expectedNumberOfAttacks = Math.floor(
            Weapon.RIFLE.accuracy * 9 / 100.0
          );

          this.expectedDamage = Weapon.RIFLE.damageAmount * this.expectedNumberOfAttacks;

          this.log = [];
          this.origBobHealth = this.p2.character.stats.health;
          this.result = Actions.ATTACK_COMPONENT.perform(
            this.attackAction, this.game, this.log
          );

          this.actorAttackResultMessage = _.find(
            (this.result as Actions.PerformResult).messages,
            message => message.content.indexOf('You attacked') > -1
          );

          this.targetAttackResultMessage = _.find(
            (this.result as Actions.PerformResult).messages,
            message => message.content.indexOf('attacked you') > -1
          );
        });
        it('should give the correct attack damage', function () {
          expect(
            this.p2.character.stats.health + this.expectedDamage
          ).to.at.least(
            this.origBobHealth
            );
        });
        it('should factor in weapon accuracy', function () {
          expect(
            this.targetAttackResultMessage.content
          ).to.contain(`attacked you for ${this.expectedDamage} damage`);
        });
        it('should remove the correct number of bullets from the inventory', function () {
          const bulletStack = Inventory.getItem(this.p1.character.inventory, 'Rifle Bullet');
          expect(bulletStack.stackAmount).to.equal(1);
        });
      });
    });
  });
  describe('PickupAction', function () {
    beforeEach(function () {
      const p: Player.Player = {
        id: '007',
        name: 'James_Bond'
      };

      const game = new Game(4, [ p ]);

      this.game = game;
      this.player = game.getPlayer('007');

      this.caveLeafStack = Item.createItemStack(createItem('Cave Leaf'), 5, 5);

      (this.game as Game).startingRoom.items = [ this.caveLeafStack ];

      expect(Item.hasItem(this.game.startingRoom.items, 'Cave Leaf'));
      expect(this.game.startingRoom.items).to.have.lengthOf(1);
    });
    describe('parse', function () {
      context('when given a valid input', function () {
        it('should return a correctly parsed action', function () {
          const now = Date.now();
          const action = Actions.PICKUP_ACTION.parse(
            'GET honeydew', this.player.character, now
          );

          expect(action.actor).to.be.ok;
          expect(action.timestamp).to.eql(now);
          expect(action.itemName).to.eql('Honeydew');
          expect(action.key).to.eql('Pickup');
        });
      });
      context('when given an invalid input', function () {
        it('should throw an error', function () {
          expect(
            () => Actions.PICKUP_ACTION.parse(
              'grab foobar', this.player.character, Date.now()
            )
          ).to.throw(Error);
        });
      });
    });
    describe('validate', function () {
      context('when the actor is not in a room', function () {
        beforeEach(function () {
          (this.player as Player.GamePlayer).character.row -= 1;
          expect(Map.isValidRoom(this.game.map, this.player.character)).to.be.false;
        });
        it('should throw an error', function () {
          const action = Actions.PICKUP_ACTION.parse('get honeydew', this.player.character, Date.now());
          expect(() => Actions.PICKUP_ACTION.validate(action, this.game)).to.throw(Error);
        });
      });
      context('when room does not have the requested item in it', function () {
        it('should not be valid', function () {
          const action = Actions.PICKUP_ACTION.parse('grab honeydew', this.player.character, 0);
          const validation = Actions.PICKUP_ACTION.validate(action, this.game);
          expect(validation.isValid).to.be.false;
          expect(validation.error).to.contain('Honeydew is not in the room');
        });
      });
      context('when the player\'s inventory is full', function () {
        beforeEach(function () {
          const inventory = (this.player as Player.GamePlayer).character.inventory;
          inventory.maximumCapacity = inventory.itemStacks.length;
          expect(Inventory.inventoryIsFull(inventory)).to.be.true;
        });
        it('should not be valid', function () {
          const action = Actions.PICKUP_ACTION.parse('pick up cave leaf', this.player.character, 1);
          const validation = Actions.PICKUP_ACTION.validate(action, this.game);
          expect(validation.isValid).to.be.false;
          expect(validation.error).to.contain('is full');
        });
      });
      context('when the player already has the item', function () {
        beforeEach(function () {
          this.player.character.inventory = Inventory.addToInventory(
            this.player.character.inventory, 'Cave Leaf', 3, 5
          );

          expect(Inventory.getItem(this.player.character.inventory, 'Cave Leaf')).to.be.ok;
        });
        context('and their stack is not full', function () {
          it('should be valid', function () {
            const action = Actions.PICKUP_ACTION.parse('get cave leaf', this.player.character, 1);
            const validation = Actions.PICKUP_ACTION.validate(action, this.game);
            expect(validation.isValid).to.be.true;
          });
        });
        context('and their stack is full', function () {
          beforeEach(function () {
            this.player.character.inventory = Inventory.addToInventory(
              this.player.character.inventory, 'Cave Leaf', 2, 5
            );
            const stack = Inventory.getItem(this.player.character.inventory, 'Cave Leaf');
            expect(Item.stackIsFull(stack)).to.be.true;
          });
          it('should not be valid', function () {
            const action = Actions.PICKUP_ACTION.parse('get cave leaf', this.player.character, 1);
            const validation = Actions.PICKUP_ACTION.validate(action, this.game);
            expect(validation.isValid).to.be.false;
            expect(validation.error).to.contain('current Cave Leaf stack is full');
          });
        });
      });
      context('when the player\'s inventory has room and the player does not have the item', function () {
        beforeEach(function () {
          expect(Inventory.inventoryIsFull(this.player.character.inventory)).to.be.false;
          expect(Inventory.hasItem(this.player.character.inventory, 'Cave Leaf')).to.be.false;
        });
        it('should be valid', function () {
          const action = Actions.PICKUP_ACTION.parse('get cave leaf', this.player.character, 1);
          const validation = Actions.PICKUP_ACTION.validate(action, this.game);
          expect(validation.isValid).to.be.true;
        });
      });
    });
    describe('perform', function () {
      context('when the player already has the item', function () {
        beforeEach(function () {
          this.player.character.inventory =
            Inventory.addToInventory(this.player.character.inventory, 'Cave Leaf', 3, 5);
          expect(Inventory.hasItem(this.player.character.inventory, 'Cave Leaf')).to.be.true;

          const action = Actions.PICKUP_ACTION.parse('get cave leaf', this.player.character, 1);
          expect(Actions.PICKUP_ACTION.validate(action, this.game).isValid).to.be.true;

          this.result = Actions.PICKUP_ACTION.perform(action, this.game, []);
        });
        it('should leave leftovers in the room', function () {
          const playerStack = Inventory.getItem((this.player as Player.GamePlayer).character.inventory, 'Cave Leaf');
          expect(playerStack).to.be.ok;
          expect(Item.stackIsFull(playerStack)).to.be.true;

          const roomStack = Item.getItem((this.game as Game).startingRoom.items, 'Cave Leaf');
          expect(roomStack).to.be.ok;
          expect(Item.stackIsFull(roomStack)).to.be.false;

          const beforeAmount = 3;
          const roomStackAmount = 5;
          const amountTaken = roomStackAmount - beforeAmount;
          expect(roomStack.stackAmount).to.eql(roomStackAmount - amountTaken);
        });
      });
      context('when the player does not already have the item', function () {
        beforeEach(function () {
          expect(Inventory.hasItem(this.player.character.inventory, 'Cave Leaf')).to.be.false;

          const action = Actions.PICKUP_ACTION.parse('get cave leaf', this.player.character, 1);
          expect(Actions.PICKUP_ACTION.validate(action, this.game).isValid).to.be.true;

          this.result = Actions.PICKUP_ACTION.perform(action, this.game, []);
        });
        it('should take the whole stack', function () {
          const room = (this.game as Game).startingRoom;

          expect(Item.hasItem(room.items, 'Cave Leaf')).to.be.false;

          const playerStack = Inventory.getItem(this.player.character.inventory, 'Cave Leaf');

          expect(playerStack).to.eql(this.caveLeafStack);
        });
        it('should send the correct message', function () {
          const pickupMessage = _.find(
            (this.result as Actions.PerformResult).messages,
            message => {
              return message.type === 'Game' &&
                _.includes(message.content, 'picked up 5 Cave Leaf');
            });

          expect(pickupMessage).to.be.ok;
        });
      });
    });
  });
});
