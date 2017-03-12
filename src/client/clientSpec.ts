import { expect } from 'chai';
import * as Client from './client';
import * as jsdom from 'jsdom';
import { Promise } from 'es6-promise';
import * as Path from 'path';
import { PlayerDetailsJSON } from '../game/player';
import * as _ from 'lodash';
import { TEST_PARSE_RESULT } from '../game/map/parseGrid';
import { mapToRepresentations } from '../game/map/map';
import * as Logger from '../logger';
import { InventoryJSON } from '../game/inventory';
import * as Socket from '../socket';
import * as Sinon from 'sinon';

describe('Client', function () {
  // because of all the setup and file i/o, let 500 ms be considered "slow"
  this.slow(500);

  function normalize(rawText: string): string {
    return rawText.replace(/\s+/g, ' ').trim();
  }

  function getText($selectors: Client.JQueryDetailSelectors, idSelector: string): string {
    return normalize($selectors._JQUERY_(idSelector).text());
  }

  function getMessagesText(window: Window): string {
    const messagesElem = window.document.getElementById('messages');
    return (messagesElem && messagesElem.textContent) || '';
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

  function newNoopLogger(): Logger.Logger {
    return new Client.ClientLogger({ log: _.noop });
  }

  interface WindowAndJQuery {
    window: Window;
    $: JQueryStatic;
  }

  let clientPromise: Promise<WindowAndJQuery>;
  before(function () {
    const htmlPath = Path.resolve(__dirname,
      '..', '..', 'assets', 'client', 'index.html');
    const jqueryPath = Path.resolve(__dirname,
      '..', '..', 'node_modules', 'jquery', 'dist', 'jquery.min.js');
    const bootstrapPath = Path.resolve(__dirname,
      '..', '..', 'node_modules', 'bootstrap', 'dist', 'js', 'bootstrap.min.js');

    clientPromise = new Promise<WindowAndJQuery>((resolve) => {
      // XXX: should virtualConsole be set?
      jsdom.env({
        file: htmlPath,
        scripts: [jqueryPath, bootstrapPath],
        done: (error, window) => {
          if (error) {
            throw error;
          } else {
            if ((window as any).$) {
              (window as any).$(window.document).ready(function () {
                resolve({
                  window,
                  $: (window as any).$
                });
              });
            } else {
              throw new Error('jQuery not attached to window!');
            }
          }
        }
      });
    });

    return clientPromise;
  });
  after(function () {
    return clientPromise.then(({window}) => {
      window.close();
      return window;
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
        styleClasses: ['Game']
      });
    });
    it('should work for the `Echo` type', () => {
      expect(Client.processServerMessage({
        type: 'Echo',
        message: 'go north'
      })).to.eql({
        styleClasses: ['Echo'],
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
        styleClasses: ['Whisper'],
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
        styleClasses: ['Talk'],
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
        styleClasses: ['Shout'],
        content: 'Bob shouted: help!'
      });
    });
    it('should default to `Unknown`');
  });
  describe('updateDetails', function () {
    const TEST_DETAILS: PlayerDetailsJSON = {
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
    let testDetails: PlayerDetailsJSON;

    function createPostUpdatePromise(details: PlayerDetailsJSON): Promise<Client.JQueryDetailSelectors> {
      return new Promise(resolve => {
        clientPromise.then(payload => {
          const $selectors = Client.createSelectors(payload.$);

          resolve(Client.updateDetails($selectors, details));

          return payload;
        });
      });
    }

    function revertToOriginalTestDetails(doneFunc: MochaDone): void {
      createPostUpdatePromise(TEST_DETAILS).then(() => doneFunc());
    }

    let originalTestDetailsUpdatePromise: Promise<Client.JQueryDetailSelectors>;

    before(function () {
      testDetails = TEST_DETAILS;

      originalTestDetailsUpdatePromise = createPostUpdatePromise(TEST_DETAILS);

      return originalTestDetailsUpdatePromise;
    });

    describe('Stats', function () {
      let statsPromise: Promise<{ [key: string]: string }>;
      before(function () {
        statsPromise = new Promise(resolve => {
          originalTestDetailsUpdatePromise.then($selectors => {
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
        return statsPromise.then((results) => {
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
        let immortalUpdatePromise: Promise<Client.JQueryDetailSelectors>;
        before(function () {
          const newDetails: PlayerDetailsJSON = _.cloneDeep(TEST_DETAILS);

          newDetails.effects.immortality.isActive = true;

          immortalUpdatePromise = createPostUpdatePromise(newDetails);

          return immortalUpdatePromise;
        });
        after(function (done) {
          revertToOriginalTestDetails(done);
        });
        it('should show the immortality meter', function () {
          return immortalUpdatePromise.then(($selectors: Client.JQueryDetailSelectors) => {
            expect(elemIsVisible($selectors.effects.$immortalityBox)).to.be.true;
            expect(
              $selectors.effects.$immortalityBox.find('.progress-bar').width()
            ).to.eql(100);
            return $selectors;
          });
        });
        it('should max the intransient meters', function () {
          return immortalUpdatePromise.then(($selectors: Client.JQueryDetailSelectors) => {
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
        let newDetails: PlayerDetailsJSON;
        let addictedUpdatePromise: Promise<Client.JQueryDetailSelectors>;
        before(function () {
          newDetails = _.cloneDeep(TEST_DETAILS);

          newDetails.effects.addiction.isActive = true;

          addictedUpdatePromise = createPostUpdatePromise(newDetails);

          return addictedUpdatePromise;
        });
        after(function (done) {
          revertToOriginalTestDetails(done);
        });
        it('should show the addiction meter', function () {
          return addictedUpdatePromise.then($selectors => {
            expect(elemIsVisible($selectors.effects.$addictionBox.find('.progress-bar'))).to.be.true;
            return $selectors;
          });
        });
        it('should have the correct amount for the addiction meter', function () {
          return addictedUpdatePromise.then($selectors => {
            const expectedPercent =
              100.0 *
              newDetails.effects.addiction.current /
              newDetails.effects.addiction.maximum;

            expect($selectors.effects.$addictionBox.find('.progress-bar').width()).to.eql(expectedPercent);

            return $selectors;
          });
        });
      });
      context('when the character is poisoned', function () {
        let newDetails: PlayerDetailsJSON;
        let poisonedUpdatePromise: Promise<Client.JQueryDetailSelectors>;
        before(function () {
          newDetails = _.cloneDeep(TEST_DETAILS);

          newDetails.effects.poison.isActive = true;

          poisonedUpdatePromise = createPostUpdatePromise(newDetails);

          return poisonedUpdatePromise;
        });
        after(function (done) {
          revertToOriginalTestDetails(done);
        });
        it('should show the poison meter', function () {
          return poisonedUpdatePromise.then($selectors => {
            expect(elemIsVisible($selectors.effects.$poisonBox.find('.progress-bar'))).to.be.true;

            return $selectors;
          });
        });
        it('should be set to full width (100%)', function () {
          return poisonedUpdatePromise.then($selectors => {
            expect($selectors.effects.$poisonBox.find('.progress-bar').width()).to.eql(100.0);

            return $selectors;
          });
        });
      });
    });
    describe('Map', function () {
      context('when map data is present', function () {
        it('should render the map', function () {
          return originalTestDetailsUpdatePromise.then($selectors => {

            expect(elemIsVisible($selectors.$playerMap)).to.be.true;

            // this is not nec. what players will see since the map is completely revealed
            const normalizedText = normalize($selectors.$playerMap.text());

            const expectedMap = mapToRepresentations(TEST_PARSE_RESULT) as string[][];

            // add the "current position" marker to the map
            expectedMap[TEST_PARSE_RESULT.startingPosition.row][TEST_PARSE_RESULT.startingPosition.col] = '*';

            const expectedText = expectedMap.map(row => row.join('')).join('');

            expect(normalizedText).to.equal(expectedText);

            return $selectors;
          });
        });
      });
      context('when map data is NOT present', function () {
        let hiddenMapPromise: Promise<Client.JQueryDetailSelectors>;
        before(function () {
          const detailsWithoutMap = _.extend({}, TEST_DETAILS, { map: null });
          hiddenMapPromise = createPostUpdatePromise(detailsWithoutMap);
        });
        after(function (done) {
          revertToOriginalTestDetails(done);
        });
        it('should hide the map', function () {
          return hiddenMapPromise.then($selectors => {
            expect(elemIsHidden($selectors.$playerMap));
            expect(normalize($selectors.$playerMap.text())).to.equal('');
            return $selectors;
          });
        });
      });
    });
    describe('Gold', function () {
      it('should appear in the view', function () {
        return originalTestDetailsUpdatePromise.then($selectors => {
          expect(getText($selectors, '#gold-row')).to.equal('Gold: 7890');
          return $selectors;
        });
      });
    });
    describe('Items', function () {
      let items: InventoryJSON;
      let testDetailsWithItems: PlayerDetailsJSON;
      let itemsPromise: Promise<Client.JQueryDetailSelectors>;
      context('when there are items', () => {
        before(function () {
          // TODO: add items to this array!
          items = [];

          testDetailsWithItems = _.assign({}, TEST_DETAILS, { items });

          itemsPromise = createPostUpdatePromise(testDetailsWithItems);
        });
        after(function (done) {
          revertToOriginalTestDetails(done);
        });
        it('should be tested!');
      });
      context('when there are NO items', () => {
        it('should show the proper message', function () {
          return itemsPromise.then($selectors => {
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
        return clientPromise.then(client => {
          const $ = client.$;

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

          return client;
        });
      });
      it('should have the names listed alphabetically', function () {
        return clientPromise.then(payload => {
          const $ = payload.$;
          const namesInOrder = ['Alice', 'Bob', 'Carol'];

          const names = $('.roster-name').toArray().map(
            (elem => normalize($(elem).text())));

          expect(names).to.eql(namesInOrder);

          return payload;
        });
      });
    });
    describe('handleRosterNameClick', function () {
      before(function () {
        return clientPromise.then(payload => {
          const $ = payload.$;

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

          return payload;
        });
      });
      describe('when there is no message', function () {
        it('should create a new talk message with the clicked name', function () {
          return clientPromise.then(payload => {
            const $ = payload.$;

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

            return payload;
          });
        });
      });
      describe('when the input already has text', function () {
        it('should just append the clicked name', function () {
          return clientPromise.then(payload => {
            const $ = payload.$;

            const $input = $('#main-input');

            $input.val('/t Bob hello from');

            const $nameAnchor = $('.me .roster-name a');

            Client.handleRosterNameClick($nameAnchor, $input, createFakeEvent());

            const newContent = $input.val();

            expect(newContent).to.equal('/t Bob hello from Alice ');

            return payload;
          });
        });
      });
    });
  });
  describe('Context Change', function () {
    describe('handleContextChange', function () {
      context('to Game', function () {
        it('should show game information', function () {
          return clientPromise.then(payload => {
            const $ = payload.$;

            Client.handleContextChange('Game', $);

            expect(elemIsVisible($('#game-info-tab'))).to.be.true;

            return payload;
          });
        });
      });
      context('to Lobby', function () {
        it('should hide game information', function () {
          return clientPromise.then(payload => {
            const $ = payload.$;

            Client.handleContextChange('Lobby', $);

            expect(elemIsHidden($('#game-info-tab'))).to.be.true;

            return payload;
          });
        });
      });
    });
  });
  describe('ClientLogger', function () {
    interface FakeConsole extends Client.SimpleClientConsole {
      _logData: string[];
    }

    let fakeConsole: FakeConsole;

    let clientLogger: Client.ClientLogger;
    beforeEach(function () {
      fakeConsole = {
        _logData: [],
        log(...args) {
          this._logData.push(args);
        }
      };

      clientLogger = new Client.ClientLogger(fakeConsole);
    });
    it('should use `info` as a default level', function () {
      expect(clientLogger.level).to.eql('info');
    });
    it('should allow a level argument in the constructor', function () {
      const cl = new Client.ClientLogger({ log: _.noop }, 'error');

      expect(cl.level).to.eql('error');
    });
    it('should have the correct matching log levels', function () {
      const cl = clientLogger;

      expect(cl.levels).to.eql(Logger.logLevels);
    });
    it('should behave like Winston', function () {
      const cl = clientLogger;

      expect(cl.level).to.eql('info');

      cl.log('debug', 'Foo bar baz');

      // since debug < info, do not log
      expect(fakeConsole._logData).to.be.empty;

      cl.log('warn', 'quux');

      // since warn > info, log
      expect(fakeConsole._logData[0]).to.eql(['warn', 'quux']);

      cl.level = 'debug';

      cl.log('debug', 'yolo');

      // since debug = debug, log
      expect(fakeConsole._logData[1]).to.eql(['debug', 'yolo']);

      cl.level = 'info';
    });
  });
  describe('finalViewSetup', () => {
    before(() => {
      return clientPromise.then(wjq => {
        Client.finalViewSetup(wjq.$);
        return wjq;
      });
    });
    it('should hide player info box', () => {
      return clientPromise.then(wjq => {
        expect(elemIsHidden(wjq.$('#player-info'))).to.be.true;
      });
    });
    it('should hide the player name', () => {
      return clientPromise.then(wjq => {
        expect(elemIsHidden(wjq.$('#player-info-name'))).to.be.true;
      });
    });
    it('should hide the player class', () => {
      return clientPromise.then(wjq => {
        expect(elemIsHidden(wjq.$('#player-info-class'))).to.be.true;
      });
    });
    it('should hide the game info tab', () => {
      return clientPromise.then(wjq => {
        expect(elemIsHidden(wjq.$('#game-info-tab'))).to.be.true;
      });
    });
    it('should focus the text input', () => {
      return clientPromise.then(wjq => {
        expect(wjq.$('#main-input').is(':focus')).to.be.true;
      });
    });
    it('should add a welcome message', () => {
      return clientPromise.then(wjq => {
        const messages = wjq.window.document.querySelector('#messages') !;
        const content = messages.textContent!;
        expect(content.toLowerCase()).to.contain('welcome');
      });
    });
  });
  describe('addMessge', () => {
    before(() => {
      return clientPromise.then(client => {
        Client.addMessage({
          styleClasses: ['Game'],
          content: 'TEST_CONTENT'
        }, client.$);
      });
    });
    it('should add the content to the message box', () => {
      return clientPromise.then(client => {
        const messageBoxText = client.window.document.querySelector('#messages') !.textContent;
        expect(messageBoxText).to.contain('TEST_CONTENT');
      });
    });
  });
  describe('assignDOMListeners', () => {
    let socketServer = new Socket.MockServerSocketServer();
    let socket = new Socket.MockServerSocket('007', '/game', socketServer);
    let logger = newNoopLogger();
    before(() => {
      return clientPromise.then(client => {
        Client.assignDOMListensers(socket, client.$, logger);
      });
    });
    context('clicking the parent container', () => {
      before(() => {
        return clientPromise.then(client => {
          const pc = client.window.document.querySelector('#parent-container') ! as HTMLElement;
          pc.click();
        });
      });
      it('should focus on the message input', () => {
        return clientPromise.then(client => {
          expect(client.$('#main-input').is(':focus')).to.be.true;
        });
      });
    });
    context('clicking on a roster name', () => {
      let nameClickSpy = Sinon.spy(Client.handleRosterNameClick);
      before(() => {
        return clientPromise.then(client => {
          const rosterName = client.window.document.querySelector('.roster-name a') as HTMLElement;
          rosterName.click();
        });
      });
      it.skip('should call `handleRosterNameClick`', () => {
        expect(nameClickSpy.callCount).to.eql(1);
      });
    });
  });
  describe('assignClientSocketListeners', () => {
    let clientSocket: Socket.MockServerSocket;
    let socketServer: Socket.MockServerSocketServer;
    let logData: any[] = [];
    before(() => {
      socketServer = new Socket.MockServerSocketServer();
      clientSocket = new Socket.MockServerSocket('007', '/game', socketServer);
      return clientPromise.then(client => {
        Client.assignClientSocketListeners(clientSocket, client.$, new Client.ClientLogger({
          log(...data) {
            logData.push([data]);
          }
        }));
      });
    });
    // TODO: test that the handler functions are called as well!
    it('should respond to `message`', () => {
      expect(clientSocket.handlers).respondsTo('message');
    });
    it('should respond to `disconnect`', () => {
      expect(clientSocket.handlers).respondsTo('disconnect');
    });
    it('should respond to `rejected-from-room`', () => {
      expect(clientSocket.handlers).respondsTo('rejected-from-room');
    });
    it('should respond to `player-info`', () => {
      expect(clientSocket.handlers).respondsTo('player-info');
    });
    it('should respond to `context-change`', () => {
      expect(clientSocket.handlers).respondsTo('context-change');
    });
    it('should respond to `details`', () => {
      expect(clientSocket.handlers).respondsTo('details');
    });
    it('should respond to `roster`', () => {
      expect(clientSocket.handlers).respondsTo('roster');
    });
    it('should respond to `debug`', () => {
      expect(clientSocket.handlers).respondsTo('debug');
    });
  });
  describe('handleMessage', () => {
    let logData: any = [];
    let logger: Logger.Logger;
    before(() => {
      logger = new Client.ClientLogger({
        log() {
          logData.push(arguments);
        }
      });
      return clientPromise.then(client => {
        Client.handleMessage({
          type: 'Game',
          message: 'handleMessageTest'
        }, logger, client.$);
      });
    });
    it('should add the message', () => {
      return clientPromise.then(client => {
        const text = client.window.document.querySelector('#messages') !.textContent;
        expect(text).to.contain('handleMessageTest');
      });
    });
  });
  describe('handleRejectedFromRoom', () => {
    // let logger = new Client.ClientLogger({ log() { } });
    let socketServer = new Socket.MockServerSocketServer();
    let socket = new Socket.MockServerSocket('007', '/game', socketServer);
    let disconnectSpy = Sinon.spy(socket, 'disconnect');
    before(() => {
      return clientPromise.then(client => {
        Client.handleRejectedFromRoom(socket, client.$);
      });
    });
    it('should disconnect the socket', () => {
      expect(disconnectSpy.callCount).to.eql(1);
    });
    it('should add a message', () => {
      return clientPromise.then(client => {
        const text = client.window.document.querySelector('#messages') !.textContent!;
        expect(text).to.contain('at capacity');
      });
    });
  });
  describe('handleDisconnect', () => {
    let logger = newNoopLogger();
    before(() => {
      return clientPromise.then(client => {
        Client.handleDisconnect(null, logger, client.$);
      });
    });
    it('should display an error message', () => {
      return clientPromise.then(client => {
        const text = getMessagesText(client.window);
        expect(text).to.contain('fatal error');
      });
    });
  });
  describe('handleDebug', () => {
    context('when `isDebugActive` is true', () => {
      let logger = newNoopLogger();
      before(() => {
        Client.handleDebug(true, logger);
      });
      it('should set the level of the logger to `debug`', () => {
        expect(logger.level).to.equal('debug');
      });
    });
    context('when `isDebugActive` is false', () => {
      let logger = newNoopLogger();
      before(() => {
        Client.handleDebug(false, logger);
      });
      it('should set the level of the logger to `info`', () => {
        expect(logger.level).to.equal('info');
      });
    });
  });
});
