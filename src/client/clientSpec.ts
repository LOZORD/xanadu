import { expect } from 'chai';
import * as Client from './client';
import * as jsdom from 'jsdom';
import { Promise } from 'es6-promise';
import * as Path from 'path';
import { PlayerDetailsJSON } from '../game/player';
import * as _ from 'lodash';
import { TEST_PARSE_RESULT } from '../game/map/parseGrid';
import { mapToRepresentations } from '../game/map/map';

describe('Client', () => {
  function normalize(rawText: string): string {
    return rawText.replace(/\s+/g, ' ').trim();
  }

  function getText($selectors: Client.JQueryDetailSelectors, idSelector: string): string {
    return normalize($selectors._JQUERY_(idSelector).text());
  }

  // FIXME: this is not as nice as handling the actual event, but that would require using `Client.onDocumentReady`
  function createFakeEvent(preventFunc = _.noop): JQueryEventObject {
    return {
      preventDefault: preventFunc
    } as JQueryEventObject;
  }

  function elemIsHidden($elem: JQuery): boolean {
    return $elem.css('display') === 'none';
  }

  function elemIsVisible($elem: JQuery): boolean {
    return !elemIsHidden($elem);
  }

  before(function () {
    // because of all the setup and file i/o, let 500 ms be considered "slow"
    this.slow(500);
    const htmlPath = Path.resolve(__dirname,
      '..', '..', 'assets', 'client', 'index.html');
    const jqueryPath = Path.resolve(__dirname,
      '..', '..', 'node_modules', 'jquery', 'dist', 'jquery.min.js');
    const bootstrapPath = Path.resolve(__dirname,
      '..', '..', 'node_modules', 'bootstrap', 'dist', 'js', 'bootstrap.min.js');

    return this.windowPromise = new Promise<Window>((resolve) => {
      // XXX: should virtualConsole be set?
      jsdom.env({
        file: htmlPath,
        scripts: [ jqueryPath, bootstrapPath ],
        done: (error, window) => {
          if (error) {
            throw error;
          } else {
            if ((window as any).$) {
              (window as any).$(window.document).ready(function () {
                resolve(window);
              });
            } else {
              throw new Error('jQuery not attached to window!');
            }
          }
        }
      });
    });
  });
  after(function () {
    return this.windowPromise.then((window) => {
      window.close();
    }, (error) => {
      throw error;
    });
  });
  describe('processServerMessage', () => {
    it('should work for the `Game` type', () => {
      expect(Client.processServerMessage({
        type: 'Game',
        message: 'aloha'
      })).to.eql({
        content: 'aloha',
        styleClasses: [ 'Game' ]
      });
    });
    it('should work for the `Echo` type', () => {
      expect(Client.processServerMessage({
        type: 'Echo',
        message: 'go north'
      })).to.eql({
        styleClasses: [ 'Echo' ],
        content: 'go north'
      });
    });
    it('should work for the `Whisper` type', () => {
      expect(Client.processServerMessage({
        type: 'Whisper',
        message: 'greetings',
        from: {
          name: 'Carol'
        }
      })).to.eql({
        styleClasses: [ 'Whisper' ],
        content: 'Carol whispered: greetings'
      });
    });
    it('should work for the `Talk` type', () => {
      expect(Client.processServerMessage({
        type: 'Talk',
        message: 'hola',
        from: {
          name: 'Alice'
        }
      })).to.eql({
        styleClasses: [ 'Talk' ],
        content: 'Alice said: hola'
      });
    });
    it('should work for the `Shout` type', () => {
      expect(Client.processServerMessage({
        type: 'Shout',
        message: 'help!',
        from: {
          name: 'Bob'
        }
      })).to.eql({
        styleClasses: [ 'Shout' ],
        content: 'Bob shouted: help!'
      });
    });
    it('should default to `Unknown`');
  });
  describe('updateDetails', function () {
    before(function () {
      const testDetails: PlayerDetailsJSON = {
        stats: {
          current: {
            health: 3,
            intelligence: 5,
            strength: 6,
            agility: 4
          },
          maximum: {
            health: 13,
            intelligence: 15,
            strength: 16,
            agility: 14
          }
        },
        gold: 7890,
        items: [],
        map: {
          currentPosition: TEST_PARSE_RESULT.startingPosition,
          grid: mapToRepresentations(TEST_PARSE_RESULT)
        },
        modifiers: [],
        effects: {
          addiction: {
            isActive: false,
            maximum: 50,
            current: 50
          },
          exhaustion: {
            maximum: 50,
            current: 50
          },
          poison: {
            isActive: false
          },
          immortality: {
            isActive: false
          },
          hunger: {
            current: 50,
            maximum: 50
          }
        }
      };

      this.TEST_DETAILS = testDetails;

      this.createPostUpdatePromise = (details: PlayerDetailsJSON) => {
        return new Promise<Client.JQueryDetailSelectors>(resolve => {
          this.windowPromise.then(window => {
            const $ = window.$ as Client.JQueryCreator;
            const $selectors = Client.createSelectors($);

            resolve(Client.updateDetails($selectors, details));
            return window;
          });
        });
      };

      this.revertToOriginalTestDetails = (doneFunc: MochaDone): void => {
        this.createPostUpdatePromise(this.TEST_DETAILS).then(() => doneFunc());
      };

      this.testDetailsUpdatePromise = this.createPostUpdatePromise(testDetails);

      return this.testDetailsUpdatePromise;
    });

    describe('Stats', function () {
      before(function () {
        this.statsPromise = new Promise(resolve => {
          this.testDetailsUpdatePromise.then($selectors => {
            const gt = _.curry(getText)($selectors);

            resolve({
              'HLT 3/13': gt('#details-health'),
              'AGL 4/14': gt('#details-agility'),
              'INT 5/15': gt('#details-intelligence'),
              'STR 6/16': gt('#details-strength')
            });

            return $selectors;
          });
        });
      });
      it('should have updated the stats', function () {
        return this.statsPromise.then((results) => {
          _.forEach(results, (actual, expected) => {
            expect(expected).to.eql(actual);
          });

          return results;
        });
      });
    });
    describe('Modifiers', function () {
      it('should be implemented and tested!');
    });
    describe('Effects', function () {
      context('when the character is immortal', function () {
        before(function () {
          const newDetails: PlayerDetailsJSON = _.cloneDeep(this.TEST_DETAILS);

          newDetails.effects.immortality.isActive = true;

          this.immortalUpdatePromise = this.createPostUpdatePromise(newDetails);

          return this.immortalUpdatePromise;
        });
        after(function (done) {
          this.revertToOriginalTestDetails(done);
        });
        it('should show the immortality meter', function () {
          return this.immortalUpdatePromise.then(($selectors: Client.JQueryDetailSelectors) => {
            expect(elemIsVisible($selectors.effects.$immortalityBox)).to.be.true;
            expect(
              $selectors.effects.$immortalityBox.find('.progress-bar').width()
            ).to.eql(100);
            return $selectors;
          });
        });
        it('should max the intransient meters', function () {
          return this.immortalUpdatePromise.then(($selectors: Client.JQueryDetailSelectors) => {
            const intransientMeters = [
              $selectors.effects.$exhaustionBox, $selectors.effects.$hungerBox
            ];

            intransientMeters.forEach($elem => {
              expect(elemIsVisible($elem)).to.be.true;
              expect($elem.find('.progress-bar').width()).to.eql(100);
            });

            return $selectors;
          });
        });
      });
      context('when the character is addicted', function () {
        before(function () {
          this.newDetails = _.cloneDeep(this.TEST_DETAILS);

          this.newDetails.effects.addiction.isActive = true;

          this.addictedUpdatePromise = this.createPostUpdatePromise(this.newDetails);

          return this.addictedUpdatePromise;
        });
        after(function (done) {
          this.revertToOriginalTestDetails(done);
        });
        it('should show the addiction meter', function () {
          return this.addictedUpdatePromise.then(($selectors: Client.JQueryDetailSelectors) => {
            expect(elemIsVisible($selectors.effects.$addictionBox.find('.progress-bar'))).to.be.true;
            return $selectors;
          });
        });
        it('should have the correct amount for the addiction meter', function () {
          return this.addictedUpdatePromise.then(($selectors: Client.JQueryDetailSelectors) => {
            const expectedPercent =
              100.0 *
              this.newDetails.effects.addiction.current /
              this.newDetails.effects.addiction.maximum;

            expect($selectors.effects.$addictionBox.find('.progress-bar').width()).to.eql(expectedPercent);

            return $selectors;
          });
        });
      });
      context('when the character is poisoned', function () {
        before(function () {
          this.newDetails = _.cloneDeep(this.TEST_DETAILS);

          this.newDetails.effects.poison.isActive = true;

          this.poisonedUpdatePromise = this.createPostUpdatePromise(this.newDetails);

          return this.poisonedUpdatePromise;
        });
        after(function (done) {
          this.revertToOriginalTestDetails(done);
        });
        it('should show the poison meter', function () {
          return this.poisonedUpdatePromise.then(($selectors: Client.JQueryDetailSelectors) => {
            expect(elemIsVisible($selectors.effects.$poisonBox.find('.progress-bar'))).to.be.true;

            return $selectors;
          });
        });
        it('should be set to full width (100%)', function () {
          return this.poisonedUpdatePromise.then(($selectors: Client.JQueryDetailSelectors) => {
            expect($selectors.effects.$poisonBox.find('.progress-bar').width()).to.eql(100.0);

            return $selectors;
          });
        });
      });
    });
    describe('Map', function () {
      context('when map data is present', function () {
        it('should render the map', function () {
          return this.testDetailsUpdatePromise.then(($selectors: Client.JQueryDetailSelectors) => {

            expect(elemIsVisible($selectors.$playerMap)).to.be.true;

            // this is not nec. what players will see since the map is completely revealed
            const normalizedText = normalize($selectors.$playerMap.text());

            const expectedMap = mapToRepresentations(TEST_PARSE_RESULT) as string[][];

            // add the "current position" marker to the map
            expectedMap[ TEST_PARSE_RESULT.startingPosition.row ][ TEST_PARSE_RESULT.startingPosition.col ] = '*';

            const expectedText = expectedMap.map(row => row.join('')).join('');

            expect(normalizedText).to.equal(expectedText);

            return $selectors;
          });
        });
      });
      context('when map data is NOT present', function () {
        before(function () {
          const detailsWithoutMap = _.extend({}, this.TEST_DETAILS, { map: null });
          this.hiddenMapPromise = this.createPostUpdatePromise(detailsWithoutMap);
        });
        after(function (done) {
          this.revertToOriginalTestDetails(done);
        });
        it('should hide the map', function () {
          return this.hiddenMapPromise.then(($selectors: Client.JQueryDetailSelectors) => {
            expect(elemIsHidden($selectors.$playerMap));
            expect(normalize($selectors.$playerMap.text())).to.equal('');
            return $selectors;
          });
        });
      });
    });
    describe('Gold', function () {
      it('should appear in the view', function () {
        return this.testDetailsUpdatePromise.then(($selectors: Client.JQueryDetailSelectors) => {
          expect(getText($selectors, '#gold-row')).to.equal('Gold: 7890');
          return $selectors;
        });
      });
    });
    describe('Items', function () {
      context('when there are items', () => {
        before(function () {
          // TODO: add items to this array!
          this.items = [];

          this.testDetailsWithItems = _.assign({}, this.TEST_DETAILS, {
            items: this.items
          });

          this.itemsPromise = this.createPostUpdatePromise(this.testDetailsWithItems);
        });
        after(function (done) {
          this.revertToOriginalTestDetails(done);
        });
        it('should be tested!');
      });
      context('when there are NO items', () => {
        it('should show the proper message', function () {
          return this.testDetailsUpdatePromise.then(($selectors: Client.JQueryDetailSelectors) => {
            expect(getText($selectors, '#items-wrapper')).to.equal('Your inventory is empty.');

            return $selectors;
          });
        });
      });
    });
  });
  describe('Player Info', function () {
    describe('updatePlayerInfo', function () {
      it('should be tested!');
    });
  });
  describe('Roster', function () {
    describe('updateRoster', function () {
      before(function () {
        return this.windowPromise.then(window => {
          const $ = window.$ as Client.JQueryCreator;

          Client.updatePlayerInfo({
            playerName: 'Alice'
          }, $);

          Client.updateRoster([
            {
              name: 'Carol',
              state: 'Preparing'
            },
            {
              name: 'Alice',
              state: 'Preparing'
            }, {
              name: 'Bob',
              state: 'Preparing'
            }
          ], $);

          return window;
        });
      });
      it('should have the names listed alphabetically', function () {
        return this.windowPromise.then(window => {
          const $ = window.$ as Client.JQueryCreator;

          const namesInOrder = [ 'Alice', 'Bob', 'Carol' ];

          const names = $('.roster-name').toArray().map(
            (elem => normalize($(elem).text())));

          expect(names).to.eql(namesInOrder);

          return window;
        });
      });
    });
    describe('handleRosterNameClick', function () {
      before(function () {
        return this.windowPromise.then(window => {
          const $ = window.$ as Client.JQueryCreator;

          Client.updatePlayerInfo({
            playerName: 'Alice'
          }, $);

          Client.updateRoster([
            {
              name: 'Alice',
              state: 'Preparing'
            }, {
              name: 'Bob',
              state: 'Preparing'
            }
          ], $);

          // finally, empty the input of any content
          $('#main-input').val('');

          return window;
        });
      });
      describe('when there is no message', function () {
        it('should create a new talk message with the clicked name', function () {
          return this.windowPromise.then(window => {
            const $ = window.$ as Client.JQueryCreator;

            const $input = $('#main-input');

            // expect($input.length).to.equal(1);
            // expect($input.val()).to.eql('');

            const $nameAnchor = $('.me .roster-name a');

            expect($nameAnchor.length).to.equal(1);

            //FIXME: this is preferable: $nameAnchor.click();
            // however, we would need to set up the handlers via `Client.onDocumentReady`

            Client.handleRosterNameClick($nameAnchor, $input, createFakeEvent());

            const newContent = $input.val();

            expect(newContent).to.equal('/t Alice ');

            return window;
          });
        });
      });
      describe('when the input already has text', function () {
        it('should just append the clicked name', function () {
          return this.windowPromise.then(window => {
            const $ = window.$ as Client.JQueryCreator;

            const $input = $('#main-input');

            $input.val('/t Bob hello from');

            const $nameAnchor = $('.me .roster-name a');

            Client.handleRosterNameClick($nameAnchor, $input, createFakeEvent());

            const newContent = $input.val();

            expect(newContent).to.equal('/t Bob hello from Alice ');

            return window;
          });
        });
      });
    });
  });
  describe('Context Change', function () {
    describe('handleContextChange', function () {
      context('to Game', function () {
        it('should show game information', function () {
          return this.windowPromise.then(window => {
            const $ = window.$ as Client.JQueryCreator;

            Client.handleContextChange('Game', $);

            expect(elemIsVisible($('#game-info-tab'))).to.be.true;

            return window;
          });
        });
      });
      context('to Lobby', function () {
        it('should hide game information', function () {
          return this.windowPromise.then(window => {
            const $ = window.$ as Client.JQueryCreator;

            Client.handleContextChange('Lobby', $);

            expect(elemIsHidden($('#game-info-tab'))).to.be.true;

            return window;
          });
        });
      });
    });
  });
});
