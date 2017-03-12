import { expect } from 'chai';
import * as jsdom from 'jsdom';
import { Promise } from 'es6-promise';
import * as Path from 'path';
import * as DebugClient from './debug';
import { MockServerSocket } from '../socket';

describe('Debug Client', () => {
  let clientPromise: Promise<Window>;
  before(() => {
    const htmlPath = Path.resolve(__dirname, '..', '..', 'assets', 'client', 'debug.html');
    const jQueryPath = Path.resolve(__dirname, '..', '..', 'node_modules', 'jquery', 'dist', 'jquery.min.js');
    const bootstrapPath = Path.resolve(__dirname,
      '..', '..', 'node_modules', 'bootstrap', 'dist', 'js', 'bootstrap.min.js');
    return clientPromise = new Promise<Window>((resolve, reject) => {
      jsdom.env({
        file: htmlPath,
        scripts: [ jQueryPath, bootstrapPath ],
        done: (error, window) => {
          if (error) {
            reject(error);
          } else {
            const w = window as any;
            // Can we use jQuery?
            if (w.$) {
              w.$(window.document).ready(() => {
                resolve(window);
              });
            } else {
              reject(new Error('Window does not have global jQuery ($)'));
            }
          }
        }
      });
    });
  });
  after(() => {
    return clientPromise.then(window => {
      window.close();
      return window;
    }, error => {
      throw error;
    });
  });
  describe('render', () => {
    let $target: JQuery;
    before(() => {
      return clientPromise.then(window => {
        $target = (window as any).$('#debug') as JQuery;
        DebugClient.render($target, 'render-test');
      });
    });
    it('should write the content to the target', () => {
      return clientPromise.then(_window => {
        // expect(window.document.textContent).to.contain('render-test');
        expect($target.text()).to.contain('render-test');
      });
    });
  });
  describe('beginPolling', () => {
    let socket: MockServerSocket;
    before(() => {
      socket = new MockServerSocket('007', '/debug', null);
      DebugClient.beginPolling(socket, 0);
    });
    it('should poll the server using `get` events', () => {
      expect(socket.allEvents()).to.contain('get');
    });
  });
  describe('onDocumentReady', () => {
    let socket: MockServerSocket;
    before(() => {
      socket = new MockServerSocket('abc', '/debug', null);
      return clientPromise.then(client => {
        const $ = (client.window as any).$ as JQueryStatic;
        expect($).to.be.ok;
        DebugClient.onDocumentReady(socket, $, 0)();
      });
    });
    it('should set up the `debug-update` listener on the socket', () => {
      expect(socket.respondsTo('debug-update')).to.be.true;
    });
  });
});
