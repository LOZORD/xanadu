import { expect } from 'chai';
import * as Client from './client';
import * as jsdom from 'jsdom';
import { Promise } from 'es6-promise';
import * as Path from 'path';

describe('Client', () => {
  describe('processServerMessage', () => {
    // TODO: other types
    it('should work for the `Game` type', () => {
      const result = Client.processServerMessage({
        type: 'Game',
        message: 'aloha'
      });

      expect(result.content).to.equal('aloha');
      expect(result.styleClasses).to.include('Game');
    });
    it('should default to `Unknown`');
  });
  describe('updateDetails', function() {
    // because of all the setup and file i/o, let 500 ms be considered "slow"
    this.slow(500);

    before(function () {
      const htmlPath = Path.resolve(__dirname,
        '..', '..', 'assets', 'index.html');
      const jqueryPath = Path.resolve(__dirname,
        '..', '..', 'node_modules', 'jquery', 'dist', 'jquery.min.js');
      const bootstrapPath = Path.resolve(__dirname,
        '..', '..', 'node_modules', 'bootstrap', 'dist', 'js', 'bootstrap.min.js');

      this.windowPromise = new Promise<Window>((resolve, reject) => {
        jsdom.env({
          file: htmlPath,
          scripts: [ jqueryPath, bootstrapPath ],
          virtualConsole: null,
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
            }  else {
              reject(new Error('jQuery ($) not attached to window!'));
            }
          },
          (error) => reject(error)
        );
      });
    });
    // these two tests should be removed once more robust/actual tests are added
    it('should have a window', function () {
      return this.windowPromise.then((window: Window) => {
        expect(window).to.be.ok;
      });
    });
    it('should have a detail selector dictionary', function () {
      return this.testSelectorsPromise.then(($selectors) => {
        expect($selectors).to.be.ok;
        expect($selectors.current).to.exist;
      });
    });
  });
});
