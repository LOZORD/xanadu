import { expect } from 'chai';
import * as Client from './client';
import * as jsdom from 'jsdom';
import { Promise } from 'es6-promise';
import * as Path from 'path';
import { PlayerDetailsJSON } from '../game/player';
import * as _ from 'lodash';

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

  before(function () {
    // because of all the setup and file i/o, let 500 ms be considered "slow"
    this.slow(500);
    const htmlPath = Path.resolve(__dirname,
      '..', '..', 'assets', 'client', 'index.html');
    const jqueryPath = Path.resolve(__dirname,
      '..', '..', 'node_modules', 'jquery', 'dist', 'jquery.min.js');
    const bootstrapPath = Path.resolve(__dirname,
      '..', '..', 'node_modules', 'bootstrap', 'dist', 'js', 'bootstrap.min.js');

    return this.windowPromise = new Promise<Window>((resolve, reject) => {
      // XXX: should virtualConsole be set?
      jsdom.env({
        file: htmlPath,
        scripts: [ jqueryPath, bootstrapPath ],
        done: (error, window) => {
          if (error) {
            reject(error);
          } else {
            // resolve(window);
            // const $ = (window as any).$ as JQuery;
            // $.ready(() => resolve(window));

            (window as any).$(window.document).ready(function () {
              resolve(window);
            });
          }
        }
      });
    });
  });
  after(function () {
    this.windowPromise.then(window => window.close());
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
    it('should default to `Unknown`', () => {
      expect(Client.processServerMessage({
        type: null,
        message: 'blarg'
      })).to.eql({
        styleClasses: [ 'Unknown' ],
        content: 'Unknown type for message: `blarg` (null)'
      });
    });
  });
  describe('updateDetails', function () {
    before(function () {
      this.testSelectorsPromise = new Promise<Client.JQueryDetailSelectors>((resolve, reject) => {
        this.windowPromise.then(
          (window) => {
            if (window.$) {
              resolve(Client.createSelectors(window.$));
            } else {
              reject(new Error('jQuery ($) not attached to window!'));
            }

            return window;
          },
          (error) => reject(error)
        );
      });

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
        items: []
      };

      this.TEST_DETAILS = testDetails;

      this.createPostUpdatePromise = (details: PlayerDetailsJSON) => {
        return new Promise<Client.JQueryDetailSelectors>((resolve, reject) => {
          this.testSelectorsPromise.then(($selectors: Client.JQueryDetailSelectors) => {
            resolve(Client.updateDetails($selectors, details));
          }, reject);
        });
      };

      this.testDetailsUpdatePromise = this.createPostUpdatePromise(this.TEST_DETAILS);
    });

    describe('Stats', function () {
      it('should have updated the stats', function () {
        return this.testDetailsUpdatePromise.then(($selectors: Client.JQueryDetailSelectors) => {

          const gt = _.curry(getText)($selectors);

          expect(gt('#details-health')).to.equal('HLT 3/13');
          expect(gt('#details-agility')).to.equal('AGL 4/14');
          expect(gt('#details-intelligence')).to.equal('INT 5/15');
          expect(gt('#details-strength')).to.equal('STR 6/16');
        });
      });
    });
    describe('Modifiers', function () {
      it('should be implemented and tested!');
    });
    describe('Effects', function () {
      it('should be implemented and tested!');
    });
    describe('Map', function () {
      it('should be implemented and tested!');
    });
    describe('Gold', function () {
      it('should appear in the view', function () {
        return this.testDetailsUpdatePromise.then(($selectors: Client.JQueryDetailSelectors) => {
          expect(getText($selectors, '#gold-row')).to.equal('Gold: 7890');
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
        it('should be tested!');
      });
      context('when there are NO items', () => {
        it('should show the proper message', function () {
          return this.testDetailsUpdatePromise.then(($selectors: Client.JQueryDetailSelectors) => {
            expect(getText($selectors, '#items-wrapper')).to.equal('Your inventory is empty.');
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
      it('should be tested!');
    });
    describe('handleRosterNameClick', function () {
      before(function () {
        return this.windowPromise.then(window => {
          const $ = window.$ as Client.JQueryCreator;

          // $(window.document).ready(function() {
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
      it('should be tested!');
    });
  });
});
