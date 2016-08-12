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
    // because of all the setup and file i/o, let 500 ms be considered "slow"
    this.slow(500);

    before(function () {
      const htmlPath = Path.resolve(__dirname,
        '..', '..', 'assets', 'client', 'index.html');
      const jqueryPath = Path.resolve(__dirname,
        '..', '..', 'node_modules', 'jquery', 'dist', 'jquery.min.js');
      const bootstrapPath = Path.resolve(__dirname,
        '..', '..', 'node_modules', 'bootstrap', 'dist', 'js', 'bootstrap.min.js');

      this.windowPromise = new Promise<Window>((resolve, reject) => {
        // XXX: should virtualConsole be set?
        jsdom.env({
          file: htmlPath,
          scripts: [ jqueryPath, bootstrapPath ],
          done: (error, window) => {
            if (error) {
              reject(error);
            } else {
              resolve(window);
            }
          }
        });
      });

      this.testSelectorsPromise = new Promise<Client.JQueryDetailSelectors>((resolve, reject) => {
        this.windowPromise.then(
          (window) => {
            if (window.$) {
              resolve(Client.createSelectors(window.$));
            } else {
              reject(new Error('jQuery ($) not attached to window!'));
            }
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

    after(function () {
      this.windowPromise.then(window => window.close());
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
});
