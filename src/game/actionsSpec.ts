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
import * as Messaging from './messaging';

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
    let game: Game;
    let player: Player.GamePlayer;
    before(function () {
      game = new Game(8, [ {
        socketId: '007',
        persistentId: '007',
        name: 'James_Bond'
      }]);
      player = game.getPlayerBySocketId('007') !;
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
          const action = Actions.parseAction(`go ${dir}`, player.character, Date.now()) as Actions.MoveAction;

          expect(action).to.be.ok;

          const newR = player.character.row + action.offsetRow;
          const newC = player.character.col + action.offsetCol;

          expect(newR).to.equal(r, `when moving ${dir}`);
          expect(newC).to.equal(c, `when moving ${dir}`);
        });
      });
    });
    describe('validate', function () {
      context('when the move is valid', function () {
        it('should have `isValid` = `true`', function () {
          const action = Actions.MOVE_COMPONENT.parse('go south', player.character, Date.now());
          const { isValid } = Actions.MOVE_COMPONENT.validate(action, game);

          expect(isValid).to.be.true;
        });
      });
      context('when the move is not into a room', function () {
        let invalidAction: Actions.MoveAction;
        let validationResult: Actions.ValidationResult;
        before(function () {
          invalidAction = Actions.MOVE_COMPONENT.parse('go north', player.character, Date.now());
          validationResult = Actions.MOVE_COMPONENT.validate(invalidAction, game);
        });
        it('should have `isValid` = `false`', function () {
          expect(validationResult.isValid).to.be.false;
        });
        it('should have the correct error message', function () {
          expect(validationResult.error).to.include('not a room');
        });
      });
      context('when the move is out of bounds', function () {
        let initRow: number;
        let initPlayers: Player.GamePlayer[];
        let invalidAction: Actions.MoveAction;
        let validationResult: Actions.ValidationResult;
        before(function () {
          initRow = player.character.row;
          initPlayers = game.players;

          player.character.row = 0;
          game.players = [ player ];

          invalidAction = Actions.MOVE_COMPONENT.parse('go north', player.character, Date.now());
          validationResult = Actions.MOVE_COMPONENT.validate(invalidAction, game);
        });
        after(function () {
          player.character.row = initRow;
          game.players = initPlayers;
        });
        it('should have `isValid` = `false`', function () {
          expect(validationResult.isValid).to.be.false;
        });
        it('should have the correct error message', function () {
          expect(validationResult.error).to.include('bounds');
        });
      });
    });
  });
  describe('PassAction', function () {
    let game: Game;
    let player: Player.GamePlayer;
    before(function () {
      game = new Game(8, [ {
        socketId: '007',
        persistentId: '007',
        name: 'James_Bond'
      }]);
      player = game.getPlayerBySocketId('007') !;
    });

    describe('parse', function () {
      it('parsing should return a PassAction', function () {
        const passAction = Actions.parseAction('pass', player.character, Date.now()) as Actions.PassAction;
        expect(passAction).to.be.ok;
      });
    });
    describe('validate', function () {
      it('should return true', function () {
        const passAction = Actions.parseAction('pass', player.character, Date.now()) as Actions.PassAction;
        expect(Actions.PASS_COMPONENT.validate(passAction, game).isValid).to.be.true;
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
    let game: Game;
    let player: Player.GamePlayer;
    before(function () {
      game = new Game(8, [ {
        socketId: '007',
        persistentId: '007',
        name: 'James_Bond'
      }]);

      player = game.getPlayerBySocketId('007') !;
    });
    describe('parse', function () {
      it('should return a RestAction', function () {
        const restAction = Actions.parseAction('rest', player.character, Date.now());
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
    let game: Game;
    let player: Player.GamePlayer;
    beforeEach(function () {
      game = new Game(8, [ {
        socketId: '007',
        persistentId: '007',
        name: 'James_Bond'
      }]);

      player = game.getPlayerBySocketId('007') !;

      // make the player's character's inventory big enough for the testing items
      player.character.inventory.maximumCapacity = 100;

      player.character.inventory = Inventory.addToInventory(
        player.character.inventory, 'Stew', 3, 5
      );
    });
    describe('parse', function () {
      context('when given a valid input', function () {
        it('should return a correctly parsed action', function () {
          const parse = Actions.INGEST_COMPONENT.parse('drink water', player.character, Date.now());

          expect(parse.itemName).to.equal('Water');
        });
      });
      context('when given a non-ingestible', function () {
        it('should throw an error', function () {
          const parse = () =>
            Actions.INGEST_COMPONENT.parse(
              'quaff pickaxe', player.character, Date.now()
            );

          expect(parse).to.throw('Could not parse');
        });
      });
    });
    describe('validate', function () {
      context('when the requested ingestible is in the player\'s inventory', function () {
        it('should validate positively', function () {
          const parse = Actions.INGEST_COMPONENT.parse('consume stew', player.character, Date.now());

          const validation = Actions.INGEST_COMPONENT.validate(parse, game);

          expect(validation.isValid).to.be.true;
        });
      });
      context('when the requested ingestible is not in the player\'s inventory', function () {
        it('should validate negatively', function () {
          const parse = Actions.INGEST_COMPONENT.parse('eat raw meat', player.character, Date.now());

          const validation = Actions.INGEST_COMPONENT.validate(parse, game);

          expect(validation.isValid).to.be.false;
          expect(validation.error).to.equal('Missing Raw Meat in inventory!');
        });
      });
    });
    describe('perform', function () {
      beforeEach(function () {
        // another item...
        player.character.inventory = Inventory.addToInventory(
          player.character.inventory, 'Alcohol', 2, 5
        );

        // something poisonous...
        player.character.inventory = Inventory.addToInventory(
          player.character.inventory, 'Nightshade', 2, 5
        );

        // something that cures poisoning...
        player.character.inventory = Inventory.addToInventory(
          player.character.inventory, 'Poison Antidote', 2, 5
        );

        // something addictive
        player.character.inventory = Inventory.addToInventory(
          player.character.inventory, 'Morphine', 2, 5
        );

        // something that gives immortality
        player.character.inventory = Inventory.addToInventory(
          player.character.inventory, 'Honeydew', 2, 5
        );
      });
      it('should remove an ingestible stack element from the inventory', function () {
        const origStewStackSize = Inventory.getItem(player.character.inventory, 'Stew') !.stackAmount;

        const action = Actions.INGEST_COMPONENT.parse('eat stew', player.character, Date.now());

        Actions.INGEST_COMPONENT.perform(action, game, []);

        const newStewStackSize = Inventory.getItem(player.character.inventory, 'Stew') !.stackAmount;

        expect(newStewStackSize).to.equal(origStewStackSize - 1);
      });
      it('should apply the ingestible\'s stat change to the actor', function () {
        const origStats = _.cloneDeep((player.character as Character.Character).stats);

        const alcoholStats = _.cloneDeep(Ingestible.ALCOHOL.stats);

        const action = Actions.INGEST_COMPONENT.parse('drink Alcohol', player.character, Date.now());

        Actions.INGEST_COMPONENT.perform(action, game, []);

        const newStats = _.cloneDeep((player.character as Character.Character).stats);

        expect(newStats).to.eql(Stats.changeStats(origStats, alcoholStats));
      });
      it('should poison the actor if the ingestible is poisoned', function () {
        expect(
          Character.toggleIsActive((player.character as Character.Character).effects.poison)
        ).to.be.false;

        const action = Actions.INGEST_COMPONENT.parse('eat Nightshade', player.character, Date.now());

        Actions.INGEST_COMPONENT.perform(action, game, []);

        expect(
          Character.toggleIsActive((player.character as Character.Character).effects.poison)
        ).to.be.true;
      });
      it('should cure the actor\'s poisoning if applicable', function () {
        // force the player to be poisoned
        player.character.effects.poison.isActive = true;

        const action = Actions.INGEST_COMPONENT.parse('ingest poison Antidote', player.character, Date.now());

        Actions.INGEST_COMPONENT.perform(action, game, []);

        expect(
          Character.toggleIsActive((player.character as Character.Character).effects.poison)
        ).to.be.false;
      });
      it('should repoison if it is a "poisoned cure"', function () {
        // poison the cure
        const antidote = Inventory.getItem(
          player.character.inventory, 'Poison Antidote'
        ) !.item as Ingestible.Ingestible;

        antidote.isPoisoned = true;

        const action = Actions.INGEST_COMPONENT.parse('drink poison antidote', player.character, Date.now());

        Actions.INGEST_COMPONENT.perform(action, game, []);

        expect(
          Character.toggleIsActive((player.character as Character.Character).effects.poison)
        ).to.be.true;
      });
      it('should have a chance of getting the player addicted if addictive', function () {
        // force the addiction to occur (man, that sounds depressing...)
        (game as Game).rng.pickone = (_list) => true;

        const action = Actions.INGEST_COMPONENT.parse('consume morphine', player.character, Date.now());

        Actions.INGEST_COMPONENT.perform(action, game, []);

        expect(
          Character.toggleIsActive((player.character as Character.Character).effects.addiction)
        ).to.be.true;
      });
      it('should give immortality if applicable', function () {
        const action = Actions.INGEST_COMPONENT.parse('eat honeydew', player.character, Date.now());

        Actions.INGEST_COMPONENT.perform(action, game, []);

        expect(
          Character.toggleIsActive((player.character as Character.Character).effects.immortality)
        ).to.be.true;
      });
      it('should update the addiction meter', function () {
        const origAddiction = (player.character as Character.Character).effects.addiction.current -= 5;

        const action = Actions.INGEST_COMPONENT.parse('ingest morphine', player.character, Date.now());

        Actions.INGEST_COMPONENT.perform(action, game, []);

        const newAddiction = (player.character as Character.Character).effects.addiction.current;

        expect(newAddiction).to.be.greaterThan(origAddiction);

        expect(newAddiction).to.be.at.most((player.character as Character.Character).effects.addiction.maximum);
      });
      it('should update the exhaustion meter', function () {
        const origExhaustion = player.character.effects.exhaustion.current -= 5;

        const action = Actions.INGEST_COMPONENT.parse('ingest morphine', player.character, Date.now());

        Actions.INGEST_COMPONENT.perform(action, game, []);

        const newExhaustion = player.character.effects.exhaustion.current;

        expect(newExhaustion).to.be.greaterThan(origExhaustion);

        expect(newExhaustion).to.be.at.most(player.character.effects.exhaustion.maximum);
      });
      it('should update the hunger meter', function () {
        const origHunger = player.character.effects.hunger.current -= 5;

        const action = Actions.INGEST_COMPONENT.parse('EAT STEW', player.character, Date.now());

        Actions.INGEST_COMPONENT.perform(action, game, []);

        const newHunger = player.character.effects.hunger.current;

        expect(newHunger).to.be.greaterThan(origHunger);

        expect(newHunger).to.be.at.most(player.character.effects.hunger.maximum);
      });
      it('should throw an error if the item chosen is not ingestible');
    });
  });
  describe('AttackAction', function () {
    let game: Game;
    let p1: Player.GamePlayer;
    let p2: Player.GamePlayer;
    beforeEach(function () {
      game = new Game(8, [ {
        socketId: 'alice',
        persistentId: 'alice',
        name: 'Alice'
      }, {
        socketId: 'bob',
        persistentId: 'bob',
        name: 'Bob'
      }]);

      // let's give Alice some weapons!
      p1 = game.getPlayerBySocketId('alice') !;
      p2 = game.getPlayerBySocketId('bob') !;

      const aliceOrigInv = p1.character.inventory;

      aliceOrigInv.maximumCapacity = 100;

      // remove any rifle bullets if she has any already
      if (Inventory.hasItem(aliceOrigInv, 'Rifle Bullet')) {
        Inventory.getItem(aliceOrigInv, 'Rifle Bullet') !.stackAmount = 0;
      }

      const aliceInv1 = Inventory.addToInventory((p1.character as Character.Character).inventory, 'Knife', 1, 1);
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

      p1.character.inventory = aliceInv5;
    });
    describe('parse', function () {
      context('when given a valid input', function () {
        it('should return a correctly parsed attack action', function () {
          const parse = Actions.ATTACK_COMPONENT.parse('attack bob knife 2', p1.character, Date.now());

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
            () => Actions.ATTACK_COMPONENT.parse('foobarbaz123', p1.character, Date.now())
          ).to.throw(Error);
        });
      });
    });
    describe('validate', function () {
      context('when the item is not in the inventory', function () {
        it('should not be valid', function () {
          const missingItemAction: Actions.AttackAction = {
            actor: p1.character,
            times: 1,
            timestamp: Date.now(),
            targetName: 'Bob',
            weaponName: 'Revolver',
            key: 'Attack'
          };

          const result = Actions.ATTACK_COMPONENT.validate(missingItemAction, game);

          expect(result.isValid).to.be.false;
          expect(result.error).to.contain('Missing Revolver in inventory!');
        });
      });
      context('when the number of attack times is bad', function () {
        it('should not be valid', function () {
          const nanAttackAction: Actions.AttackAction = {
            actor: p1.character,
            times: NaN,
            timestamp: Date.now(),
            targetName: 'Bob',
            weaponName: 'Knife',
            key: 'Attack'
          };

          const negativeAttackAction: Actions.AttackAction = {
            actor: p1.character,
            times: -1,
            timestamp: Date.now(),
            targetName: 'Bob',
            weaponName: 'Knife',
            key: 'Attack'
          };

          [ nanAttackAction, negativeAttackAction ].forEach(action => {
            const result = Actions.ATTACK_COMPONENT.validate(action, game);

            expect(result.isValid).to.be.false;
            expect(result.error).to.contain('Bad number of times attacking');
          });
        });
      });
      context('when the target DNE', function () {
        it('should not be valid', function () {
          const missingTargetAction: Actions.AttackAction = {
            actor: p1.character,
            times: 1,
            timestamp: Date.now(),
            targetName: 'Carlo',
            weaponName: 'Fist',
            key: 'Attack'
          };

          const result = Actions.ATTACK_COMPONENT.validate(missingTargetAction, game);

          expect(result.isValid).to.be.false;
          expect(result.error).to.contain("No player with name 'Carlo'");
        });
      });
      context('when the target is beyond the attack range', function () {
        beforeEach(function () {
          // move Bob south
          p2.character.row += 1;
        });
        afterEach(function () {
          // move Bob back to the starting position
          p2.character.row -= 1;
        });
        it('should not be valid', function () {
          const outOfRangeAction: Actions.AttackAction = {
            actor: p1.character,
            timestamp: Date.now(),
            times: 1,
            targetName: 'bo',
            weaponName: 'Knife',
            key: 'Attack'
          };

          const result = Actions.ATTACK_COMPONENT.validate(outOfRangeAction, game);

          expect(result.isValid).to.be.false;
          expect(result.error).to.contain('Bob is out of Knife\'s attack range!');
        });
      });
      context('when the gun shot is not in a straight line', function () {
        beforeEach(function () {
          p2.character.row = 0;
          p2.character.col = 0;
        });
        afterEach(function () {
          p2.character.row = 1;
          p2.character.col = 1;
        });
        it('should not be valid', function () {
          const diagonalShotAction: Actions.AttackAction = {
            actor: p1.character,
            targetName: 'bob',
            times: 3,
            weaponName: 'Rifle',
            timestamp: Date.now(),
            key: 'Attack'
          };

          const result = Actions.ATTACK_COMPONENT.validate(diagonalShotAction, game);

          expect(result.isValid).to.be.false;
          expect(result.error).to.contain('You can only shoot in straight lines!');
        });
      });
      context('when the gun shot is obstructed by a barrier', function () {
        beforeEach(function () {
          p2.character.col = 3;
        });
        afterEach(function () {
          p2.character.col = 1;
        });
        it('should not be valid', function () {
          const obstructedShotAction: Actions.AttackAction = {
            actor: p1.character,
            targetName: 'b',
            times: 2,
            weaponName: 'Rifle',
            timestamp: Date.now(),
            key: 'Attack'
          };

          const result = Actions.ATTACK_COMPONENT.validate(obstructedShotAction, game);

          expect(result.isValid).to.be.false;
          expect(result.error).to.contain('Your shot is obstructed by a barrier!');
        });
      });
      context('when the attacker doesn\'t have the required bullets', function () {
        let origInventory: Inventory.Inventory;
        beforeEach(function () {
          origInventory = _.cloneDeep(p1.character.inventory);

          p1.character.inventory = Inventory.addToInventory(p1.character.inventory, 'Revolver', 1, 1);
        });
        afterEach(function () {
          p1.character.inventory = origInventory;
        });
        it('should not be valid', function () {
          const missingBulletsAction: Actions.AttackAction = {
            actor: p1.character,
            targetName: 'bob',
            weaponName: 'Revolver',
            times: 1,
            timestamp: Date.now(),
            key: 'Attack'
          };

          const result = Actions.ATTACK_COMPONENT.validate(missingBulletsAction, game);

          expect(result.isValid).to.be.false;
          expect(result.error).to.contain('You don\'t have Revolver Bullets for your Revolver!');
        });
      });
      context('when the attacker doesn\'t have enough bullets', function () {
        it('should not be valid', function () {
          const notEnoughBulletsAction: Actions.AttackAction = {
            actor: p1.character,
            times: 20,
            weaponName: 'Rifle',
            key: 'Attack',
            timestamp: Date.now(),
            targetName: 'Bob'
          };

          const result = Actions.ATTACK_COMPONENT.validate(notEnoughBulletsAction, game);

          expect(result.isValid).to.be.false;
          expect(result.error).to.contain('You cannot shoot 20 time(s) because you only have 10 bullet(s)!');
        });
      });
    });
    describe('perform', function () {
      context('when using a melee weapon', function () {
        let threeKnifeDamage: number;
        let attackAction: Actions.AttackAction;
        let log: string[];
        let origBobHealth: number;
        let result: Actions.PerformResult;
        let actorAttackResultMessage: Messaging.Message;
        let targetAttackResultMessage: Messaging.Message;
        beforeEach(function () {
          const knifeAttack: Actions.AttackAction = {
            actor: p1.character,
            weaponName: 'Knife',
            times: 3,
            targetName: 'Bob',
            timestamp: Date.now(),
            key: 'Attack'
          };

          threeKnifeDamage = Weapon.KNIFE.damageAmount * 3;
          attackAction = knifeAttack;
          log = [];
          origBobHealth = p2.character.stats.health;
          result = Actions.ATTACK_COMPONENT.perform(attackAction, game, log);
          actorAttackResultMessage = _.find(
            result.messages,
            message => message.content.indexOf('You attacked') > -1
          ) !;

          expect(actorAttackResultMessage).to.be.ok;

          targetAttackResultMessage = _.find(
            result.messages,
            message => message.content.indexOf('attacked you') > -1
          ) !;

          expect(targetAttackResultMessage).to.be.ok;
        });
        it('should attack the full number of times', function () {
          expect(actorAttackResultMessage.content).to.contain('You attacked Bob 3 time(s)');
        });
        it('should cause the correct amount of damage', function () {
          expect(p2.character.stats.health + threeKnifeDamage).to.be.at.least(origBobHealth);
        });
        it('should give the correct attack damage', function () {
          expect(actorAttackResultMessage.content).to.contain(`a total of ${threeKnifeDamage} damage`);
        });
        it('should send a message to the target', function () {
          expect(targetAttackResultMessage.content).to.contain('Alice attacked you');
          expect(targetAttackResultMessage.content).to.contain(`for ${threeKnifeDamage} damage`);
        });
      });
      context('when using a ranged weapon', function () {
        let attackAction: Actions.AttackAction;
        let expectedNumberOfAttacks: number;
        let expectedDamage: number;
        let log: string[];
        let origBobHealth: number;
        let result: Actions.PerformResult;
        let actorAttackResultMessage: Messaging.Message;
        let targetAttackResultMessage: Messaging.Message;
        beforeEach(function () {
          const rifleAction: Actions.AttackAction = {
            actor: p1.character,
            weaponName: 'Rifle',
            times: 9,
            targetName: 'bob',
            timestamp: Date.now(),
            key: 'Attack'
          };

          attackAction = rifleAction;

          expectedNumberOfAttacks = Math.floor(
            Weapon.RIFLE.accuracy * 9 / 100.0
          );

          expectedDamage = Weapon.RIFLE.damageAmount * expectedNumberOfAttacks;

          log = [];
          origBobHealth = p2.character.stats.health;
          result = Actions.ATTACK_COMPONENT.perform(
            attackAction, game, log
          );

          actorAttackResultMessage = _.find(
            result.messages,
            message => message.content.indexOf('You attacked') > -1
          ) !;

          expect(actorAttackResultMessage).to.be.ok;

          targetAttackResultMessage = _.find(
            result.messages,
            message => message.content.indexOf('attacked you') > -1
          ) !;

          expect(targetAttackResultMessage).to.be.ok;
        });
        it('should give the correct attack damage', function () {
          expect(
            p2.character.stats.health + expectedDamage
          ).to.at.least(
            origBobHealth
            );
        });
        it('should factor in weapon accuracy', function () {
          expect(
            targetAttackResultMessage.content
          ).to.contain(`attacked you for ${expectedDamage} damage`);
        });
        it('should remove the correct number of bullets from the inventory', function () {
          const bulletStack = Inventory.getItem(p1.character.inventory, 'Rifle Bullet') !;
          expect(bulletStack.stackAmount).to.equal(1);
        });
      });
    });
  });
  describe('PickupAction', function () {
    let game: Game;
    let player: Player.GamePlayer;
    let caveLeafStack: Item.ItemStack<Item.Item>;
    beforeEach(function () {
      const p: Player.Player = {
        socketId: '007',
        persistentId: '007',
        name: 'James_Bond'
      };

      game = new Game(4, [ p ]);

      player = game.getPlayerBySocketId('007') !;

      caveLeafStack = Item.createItemStack(createItem('Cave Leaf'), 5, 5);

      game.startingRoom.items = [ caveLeafStack ];

      expect(Item.hasItem(game.startingRoom.items, 'Cave Leaf'));
      expect(game.startingRoom.items).to.have.lengthOf(1);
    });
    describe('parse', function () {
      context('when given a valid input', function () {
        it('should return a correctly parsed action', function () {
          const now = Date.now();
          const action = Actions.PICKUP_ACTION.parse(
            'GET honeydew', player.character, now
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
              'grab foobar', player.character, Date.now()
            )
          ).to.throw(Error);
        });
      });
    });
    describe('validate', function () {
      context('when the actor is not in a room', function () {
        beforeEach(function () {
          player.character.row -= 1;
          expect(Map.isValidRoom(game.map, player.character)).to.be.false;
        });
        it('should throw an error', function () {
          const action = Actions.PICKUP_ACTION.parse('get honeydew', player.character, Date.now());
          expect(() => Actions.PICKUP_ACTION.validate(action, game)).to.throw(Error);
        });
      });
      context('when the transaction amount is non-positive', () => {
        let validation: Actions.ValidationResult;
        beforeEach(() => {
          const action = Actions.PICKUP_ACTION.parse('grab 0 cave leaf', player.character, 1);
          validation = Actions.PICKUP_ACTION.validate(action, game);
        });
        it('should not be valid', () => {
          expect(validation.isValid).to.be.false;
          expect(validation.error).to.contain('positive');
        });
      });
      context('when room does not have the requested item in it', function () {
        it('should not be valid', function () {
          const action = Actions.PICKUP_ACTION.parse('grab honeydew', player.character, 0);
          const validation = Actions.PICKUP_ACTION.validate(action, game);
          expect(validation.isValid).to.be.false;
          expect(validation.error).to.contain('Honeydew is not in the room');
        });
      });
      context('when the player\'s inventory is full', function () {
        context('and they have a non-full stack of the item', () => {
          beforeEach(() => {
            player.character.inventory = Inventory.addToInventory(player.character.inventory, 'Cave Leaf', 3, 5);
            const inventory = player.character.inventory;
            inventory.maximumCapacity = inventory.itemStacks.length;
            expect(Inventory.inventoryIsFull(inventory)).to.be.true;

          });
          it('should be ok when the stack does not overflow', () => {
            const action = Actions.PICKUP_ACTION.parse('grab 2 cave leaf', player.character, 1);
            const result = Actions.PICKUP_ACTION.validate(action, game);
            expect(result.isValid).to.be.true;
          });
          it('should be invalid when the stack overflows', () => {
            const action = Actions.PICKUP_ACTION.parse('grab 3 CAVE LEAF', player.character, 1);
            const result = Actions.PICKUP_ACTION.validate(action, game);
            expect(result.isValid).to.be.false;
            expect(result.error).to.contain('5 Cave Leaf(s)!');
          });
        });
        context('and they have a full stack of the item', () => {
          let action: Actions.ItemTransaction;
          let result: Actions.ValidationResult;
          beforeEach(() => {
            player.character.inventory = Inventory.addToInventory(player.character.inventory, 'Cave Leaf', 5, 5);
            const inventory = player.character.inventory;
            inventory.maximumCapacity = inventory.itemStacks.length;
            expect(Inventory.inventoryIsFull(inventory)).to.be.true;

            action = Actions.PICKUP_ACTION.parse('pick up 2 cave leaf', player.character, 1);
            result = Actions.PICKUP_ACTION.validate(action, game);
          });
          it('should not be valid', () => {
            expect(result.isValid).to.be.false;
            expect(result.error).to.contain('Your current stack of Cave Leaf is full!');
          });
        });
        context('and they do not have a stack of the item', () => {
          beforeEach(() => {
            const inventory = player.character.inventory;
            inventory.maximumCapacity = inventory.itemStacks.length;
            expect(Inventory.inventoryIsFull(inventory)).to.be.true;
          });
          it('should not be valid', function () {
            const action = Actions.PICKUP_ACTION.parse('pick up cave leaf', player.character, 1);
            const validation = Actions.PICKUP_ACTION.validate(action, game);
            expect(validation.isValid).to.be.false;
            expect(validation.error).to.contain('is full');
          });
        });
      });
      context('when the player already has the item', function () {
        beforeEach(function () {
          player.character.inventory = Inventory.addToInventory(
            player.character.inventory, 'Cave Leaf', 3, 5
          );

          expect(Inventory.getItem(player.character.inventory, 'Cave Leaf')).to.be.ok;
        });
        context('and their stack is not full', function () {
          it('should be valid', function () {
            const action = Actions.PICKUP_ACTION.parse('get cave leaf', player.character, 1);
            const validation = Actions.PICKUP_ACTION.validate(action, game);
            expect(validation.isValid).to.be.true;
          });
        });
        context.skip('and their stack is full', function () {
          beforeEach(function () {
            player.character.inventory = Inventory.addToInventory(
              player.character.inventory, 'Cave Leaf', 2, 5
            );
            const stack = Inventory.getItem(player.character.inventory, 'Cave Leaf') !;
            expect(Item.stackIsFull(stack)).to.be.true;
            expect(Inventory.inventoryIsFull(player.character.inventory)).to.be.false;
          });
          it('should be valid', function () {
            const action = Actions.PICKUP_ACTION.parse('get cave leaf', player.character, 1);
            const validation = Actions.PICKUP_ACTION.validate(action, game);

            // When performed, it should just create another stack!
            expect(validation.isValid).to.be.true;
          });
        });
      });
      context('when the player\'s inventory has room and the player does not have the item', function () {
        beforeEach(function () {
          expect(Inventory.inventoryIsFull(player.character.inventory)).to.be.false;
          expect(Inventory.hasItem(player.character.inventory, 'Cave Leaf')).to.be.false;
        });
        it('should be valid', function () {
          const action = Actions.PICKUP_ACTION.parse('get cave leaf', player.character, 1);
          const validation = Actions.PICKUP_ACTION.validate(action, game);
          expect(validation.isValid).to.be.true;
        });
      });
      // TODO: case where there are multiple stacks of the same item in the same room
      context('when the player requests more than there is available in the room', () => {
        it('should not be valid', () => {
          const action = Actions.PICKUP_ACTION.parse('get 6 cave leaf', player.character, 1);
          const validation = Actions.PICKUP_ACTION.validate(action, game);
          expect(validation.isValid).to.be.false;
          expect(validation.error).to.contain('5 Cave Leaf(s) in the room');
        });
      });
    });
    describe('perform', function () {
      let result: Actions.PerformResult;
      context('when the player does not give a transactionAmount', () => {
        context('when the player already has the item', function () {
          beforeEach(function () {
            player.character.inventory =
              Inventory.addToInventory(player.character.inventory, 'Cave Leaf', 3, 5);
            expect(Inventory.hasItem(player.character.inventory, 'Cave Leaf')).to.be.true;

            const action = Actions.PICKUP_ACTION.parse('get cave leaf', player.character, 1);
            expect(Actions.PICKUP_ACTION.validate(action, game).isValid).to.be.true;

            result = Actions.PICKUP_ACTION.perform(action, game, []);
          });
          it('should not leave leftovers in the room', function () {
            const playerStack = Inventory.getItem(player.character.inventory, 'Cave Leaf');
            expect(playerStack).to.be.ok;
            expect(Item.stackIsFull(playerStack!)).to.be.true;

            const roomStack = Item.getItem(game.startingRoom.items, 'Cave Leaf');
            expect(roomStack).to.be.undefined;
          });
        });
        context('when the player does not already have the item', function () {
          beforeEach(function () {
            expect(Inventory.hasItem(player.character.inventory, 'Cave Leaf')).to.be.false;

            const action = Actions.PICKUP_ACTION.parse('get cave leaf', player.character, 1);
            expect(Actions.PICKUP_ACTION.validate(action, game).isValid).to.be.true;

            result = Actions.PICKUP_ACTION.perform(action, game, []);
          });
          it('should take the whole stack', function () {
            const room = game.startingRoom;

            expect(Item.hasItem(room.items, 'Cave Leaf')).to.be.false;

            expect(Inventory.hasItem(player.character.inventory, 'Cave Leaf'));
            const playerStack = Inventory.getItem(player.character.inventory, 'Cave Leaf')!;
            expect(Item.stackIsFull(playerStack));
          });
          it('should send the correct message', function () {
            const pickupMessage = _.find(
              result.messages,
              message => {
                return message.type === 'Game' &&
                  _.includes(message.content, 'picked up 5 Cave Leaf');
              });

            expect(pickupMessage).to.be.ok;
          });
        });
      });
      context('when the player gives a transactionAmount', () => {
        let performResult: Actions.PerformResult;
        let itemAmount = {before: 0, after: 0};
        let log: string[];
        beforeEach(() => {
          expect(Inventory.hasItem(player.character.inventory, 'Cave Leaf')).to.be.false;
          const action = Actions.PICKUP_ACTION.parse('pick up 2 cave leaf', player.character, 1);
          const validation = Actions.PICKUP_ACTION.validate(action, game);

          expect(validation.isValid).to.be.true;

          log = [];
          performResult = Actions.PICKUP_ACTION.perform(action, game, log);

          itemAmount.after = Inventory.getItem(player.character.inventory, 'Cave Leaf')!.stackAmount;
        });
        it('should pick up the correct amount', () => {
          expect(itemAmount.before + 2).to.eql(itemAmount.after);
        });
      });
    });
  });
  describe('DropAction', () => {
    let game: Game;
    let player: Player.GamePlayer;

    beforeEach(() => {
      game = new Game(4, [ { socketId: '007', name: 'James_Bond', persistentId: '007' }]);
      player = game.getPlayerBySocketId('007') !;

      expect(Inventory.hasItem(player.character.inventory, 'Nightshade')).to.be.false;
      player.character.inventory = Inventory.addToInventory(player.character.inventory, 'Nightshade', 4, 5);
      expect(Inventory.hasItem(player.character.inventory, 'Nightshade')).to.be.true;
    });
    describe('parse', () => {
      context('when the actor gives a drop count', () => {
        context('and the drop count is valid', () => {
          it('should have the correct drop count', () => {
            const result = Actions.DROP_ACTION.parse('drop 3 nightshade', player.character, 1);

            expect(result.transactionAmount).to.eql(3);
            expect(result.itemName).to.eql('Nightshade');
          });
        });
      });
      context('when the actor does not give a drop count', () => {
        it('should not parse one', () => {
          const result = Actions.DROP_ACTION.parse('drop nightSHAde', player.character, 1);

          expect(result.transactionAmount).to.be.undefined;
        });
      });
    });
    describe('validate', () => {
      context('when the item is not in the actor\'s inventory', () => {
        it('should not be valid', () => {
          expect(Inventory.hasItem(player.character.inventory, 'Honeydew')).to.be.false;
          const action = Actions.DROP_ACTION.parse('drop honeydew', player.character, 1);
          const result = Actions.DROP_ACTION.validate(action, game);
          expect(result.isValid).to.be.false;
        });
      });
      context('when the dropCount is nonpositive', () => {
        it('should not be valid', () => {
          const action = Actions.DROP_ACTION.parse('drop 0 nightshade', player.character, 1);
          const result = Actions.DROP_ACTION.validate(action, game);
          expect(result.isValid).to.be.false;
        });
      });
      context('when the dropCount exceeds the stackAmount', () => {
        it('should not be valid', () => {
          const action = Actions.DROP_ACTION.parse('drop 12345 nightshade', player.character, 1);
          const result = Actions.DROP_ACTION.validate(action, game);
          expect(result.isValid).to.be.false;
        });
      });
      context('when the item is in the actors\'s inventory', () => {
        context('and there is no dropCount', () => {
          it('should be valid', () => {
            const action = Actions.DROP_ACTION.parse('drop nightshade', player.character, 1);
            const result = Actions.DROP_ACTION.validate(action, game);
            expect(result.isValid).to.be.true;
          });
        });
        context('and there is a finite, correctly bounded dropCount', () => {
          it('should be valid', () => {
            const action = Actions.DROP_ACTION.parse('drop 3 NIGHTSHADE', player.character, 1);
            const result = Actions.DROP_ACTION.validate(action, game);
            expect(result.isValid).to.be.true;
          });
        });
      });
    });
    describe('perform', () => {
      context('when a dropCount is given', () => {
        let result: Actions.PerformResult;
        let log: string[] = [];
        beforeEach(() => {
          const action = Actions.DROP_ACTION.parse('drop 3 nightSHAde', player.character, 1);
          result = Actions.DROP_ACTION.perform(action, game, log);
        });
        afterEach(() => {
          // Empty the room of items.
          game.startingRoom.items = [];
        });
        it('should only drop the correct amount', () => {
          const playerStack = Inventory.getItem(player.character.inventory, 'Nightshade') !;
          expect(playerStack).to.be.ok;
          expect(playerStack.stackAmount).to.eql(1);
          const roomStack = Item.getItem(game.startingRoom.items, 'Nightshade') !;
          expect(roomStack).to.be.ok;
          expect(roomStack.stackAmount).to.eql(3);
        });
        it('should give the correct game message', () => {
          const playerMessage = _.find(result.messages, (message) => message.to[ 0 ].socketId === player.socketId) !;
          expect(playerMessage).to.exist;
          expect(playerMessage.content).to.contain('dropped 3 Nightshade');
        });
      });
      context('when no dropCount is given', () => {
        let result: Actions.PerformResult;
        let log: string[] = [];
        beforeEach(() => {
          const action = Actions.DROP_ACTION.parse('drop nightshade', player.character, 1);
          result = Actions.DROP_ACTION.perform(action, game, log);
        });
        it('should drop the full stack', () => {
          expect(Inventory.hasItem(player.character.inventory, 'Nightshade')).to.be.false;
          expect(Item.hasItem(game.startingRoom.items, 'Nightshade')).to.be.true;
          const roomStack = Item.getItem(game.startingRoom.items, 'Nightshade') !;
          expect(roomStack.stackAmount).to.eql(4);
          expect(roomStack.maxStackAmount).to.eql(5);
        });
      });
    });
  });
});
