import { parseArgs, startServer } from './main';
import { expect } from 'chai';
import * as _ from 'lodash';

describe('Main (Game Runner)', () => {
  describe('parseArgs', () => {
    context('without arguments', () => {
      it('should use the defaults', () => {
        expect(parseArgs([])).to.eql({
          maxPlayers: 8,
          debug: false,
          port: 3000,
          seed: 1234
        });
      });
      context('with the debug flag', () => {
        it('should have `debug` as `true`', () => {
          expect(parseArgs(['--debug']).debug).to.be.true;
        });
      });
    });
  });
  describe('startServer', () => {
    before(function() {
      this.log = console.log;
      console.log = _.noop;
    });
    after(function() {
      console.log = this.log;
    });

    context('when the given args are invalid', () => {
      before(function () {
        this.error = console.error;
        this.errorOutput = [];
        console.error = (output) => {
          this.errorOutput.push(output);
          return this.errorOutput;
        };
      });
      afterEach(function () {
        this.errorOutput = [];
      });
      after(function() {
        console.error = this.error;
      });

      it('should report an insufficient number of players');
      it('should report a bad port number');
      it('should report a bad seed argument type');
    });

    // the default args from `parseArgs` are valid
    context('when the given args are valid', () => {
      it('should create and start a server');
    });
  });
});
