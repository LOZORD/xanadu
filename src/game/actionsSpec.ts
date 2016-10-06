import { expect } from 'chai';
import * as _ from 'lodash';
import * as Actions from './actions';
import Game from '../context/game';
import * as Player from './player';
import * as Character from './character';
import * as Inventory from './inventory';
import * as Stats from './stats';
import * as Ingestible from './items/ingestible';

describe('Actions', () => {
  describe('isParsableAction', () => {
    context('when given a valid action command', () => {
      it('should return true', () => {
        expect(Actions.isParsableAction('go south')).to.be.true;
      });
    });
    context('when given an invalid action command', () => {
      it('should return false', () => {
        // sadly false
        expect(Actions.isParsableAction('listen to 2112')).to.be.false;
      });
    });
  });
  describe('MoveAction', () => {
    // remember: we are using the test map!
    before(function () {
      this.game = new Game(8, []);
      this.player = Player.createPlayer('007', 'James_Bond', 'Playing');
      this.player.character = Character.createCharacter(this.game, this.player, this.game.map.startingPosition, 'None');
      this.game.players.push(this.player);
    });
    describe('parse', () => {
      it('parsing should return a MoveAction', function () {
        // all locations are based off of starting position (1,1)
        const locations = {
          'north': {
            r: 0, c: 1
          },
          'south': {
            r: 2, c: 1
          },
          'west': {
            r: 1, c: 0
          },
          'east': {
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
    describe('validate', () => {
      context('when the move is valid', () => {
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
  describe('PassAction', () => {
    before(function () {
      this.game = new Game(8, []);
      this.player = Player.createPlayer('007', 'James_Bond', 'Playing');
      this.player.character = Character.createCharacter(this.game, this.player, this.game.map.startingPosition, 'None');
      this.game.players.push(this.player);
    });

    describe('parse', () => {
      it('parsing should return a PassAction', function () {
        const passAction = Actions.parseAction('pass', this.player.character, Date.now()) as Actions.PassAction;
        expect(passAction).to.be.ok;
      });
    });
    describe('validate', () => {
      it('should return true', function () {
        const passAction = Actions.parseAction('pass', this.player.character, Date.now()) as Actions.PassAction;
        expect(Actions.PASS_COMPONENT.validate(passAction, this.game).isValid).to.be.true;
      });
    });
  });
  describe('Unknown Inputs', () => {
    it('should return null', function () {
      const ret = Actions.parseAction('foobarbaz123', null, Date.now());
      expect(ret).to.be.null;
    });
  });
  describe('RestAction', () => {
    describe('parse', function () {
      it('should be tested!');
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
  describe('IngestAction', () => {
    beforeEach(function () {
      this.player = Player.createPlayer('007', 'James_Bond', 'Playing');
      this.game = new Game(8, [ this.player ]);
      this.player = (this.game as Game).getPlayer('007');
      this.player.character = Character.createCharacter(
        this.game, this.player
      );

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
        it('should return null', function () {
          const parse = Actions.INGEST_COMPONENT.parse('quaff pickaxe', this.player.character, Date.now());

          expect(parse).to.be.null;
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
});
