import * as _ from 'lodash';
import * as Actions from '../game/actions';
import { Player, canCommunicate } from '../game/player';
import * as Map from '../game/map/map';
import { PassageRoom } from '../game/map/cell';
import * as Messaging from '../game/messaging';
import { Context, ClientMessage } from './context';
import { TEST_PARSE_RESULT } from '../game/map/parseGrid';
import { Message } from '../game/messaging';
import * as Character from '../game/character';
import { Animal } from '../game/animal';
import { Entity } from '../game/entity';
import { Seed, SeededRNG } from '../rng';
import { Chance } from 'chance';

export type GameConfig = {
  map?: Map.Map;
  numModifiers?: {
    minimum: number;
    maximum: number;
  };
  seed: Seed
};

export default class Game extends Context {

  hasEnded: boolean;
  turnNumber: number;
  map: Map.Map;
  rng: SeededRNG;
  beasts: Animal[];

  constructor(maxPlayers: number, players: Player[], gameConfig: GameConfig = { seed: Date.now() }) {
    super(maxPlayers, players);
    this.map = gameConfig.map ? gameConfig.map : TEST_PARSE_RESULT;

    this.rng = Chance(gameConfig.seed);

    let minNumModifiers: number;
    let maxNumModifiers: number;

    if (gameConfig.numModifiers) {
      minNumModifiers = gameConfig.numModifiers.minimum;
      maxNumModifiers = gameConfig.numModifiers.maximum;
    } else {
      minNumModifiers = 0;
      maxNumModifiers = 0;
    }

    // TODO: populate
    this.beasts = [];

    this.players.forEach((player) => {
      // set all the players' states to playing
      player.state = 'Playing';
      const numActiveModifiers = this.rng.integer({
        min: minNumModifiers,
        max: maxNumModifiers
      });

      const modifiers = Character.createEmptyModifiers();

      const activeModifers = this.rng.pickset(_.keys(modifiers), numActiveModifiers);

      activeModifers.forEach(modifier => {
        modifiers[ modifier ] = true;
      });

      // FIXME: this should probably be changed later...
      if (!player.character) {
        player.character = Character.createCharacter(this, player, this.map.startingPosition);
      }
    });

    this.turnNumber = 0;
    this.hasEnded = false;
  }

  handleMessage({ content, player, timestamp}: ClientMessage): Message[] {
    let responses: Message[] = [ Messaging.createEchoMessage(content, player) ];

    const component = Actions.getComponentByText(content);

    // if we received an action command message
    if (component) {
      const action = component.parse(content, player.character, timestamp);

      const { isValid, error } = component.validate(action, this);

      if (isValid) {
        player.character.nextAction = action;
        responses.push(Messaging.createGameMessage(`Next action: ${content}`, [ player ]));
      } else {
        responses.push(Messaging.createGameMessage(`Invalid action: ${error}`, [ player ]));
      }
    } else if (_.startsWith(content, '/')) {
      const messageNameSpan = Messaging.spanMessagePlayerNames(content, this.players);

      let toPlayers: Player[];

      if (_.startsWith(content, '/s ')) {
        toPlayers = [];
        this.getNearbyAnimals(player.character).forEach(animal => {
          if (Character.isPlayerCharacter(animal)) {
            if (animal.player !== player) {
              toPlayers.push(animal.player);
            }
          }
        });
      } else {
        toPlayers = messageNameSpan.names.map(name => this.getPlayerByName(name));
      }

      const [ yesComm, noComm ] = _.partition(toPlayers, otherPlayer => canCommunicate(player, otherPlayer));

      const noCommMessage = 'something [CANNOT COMMUNICATE]';

      const restContent = messageNameSpan.rest;

      if (_.startsWith(content, '/t ')) {
        responses.push(Messaging.createTalkMessage(player, restContent, yesComm));
        responses.push(Messaging.createTalkMessage(player, noCommMessage, noComm));
      } else if (_.startsWith(content, '/s ')) {
        responses.push(Messaging.createShoutMessage(player, restContent, yesComm));
        responses.push(Messaging.createShoutMessage(player, noCommMessage, noComm));
      } else if (_.startsWith(content, '/w ')) {
        if (toPlayers.length) {
          if (yesComm.length) {
            const whisperContent = _.drop(content.split(' '), 2).join(' ');

            responses.push(Messaging.createWhisperMessage(player, whisperContent, _.head(yesComm)));
          }

          if (noComm.length) {
            responses.push(Messaging.createWhisperMessage(player, noCommMessage, _.head(noComm)));
          }
        }
      } else {
        responses.push(Messaging.createGameMessage(`Unknown communication: "${content}`, [ player ]));
      }
    } else {
      responses.push(Messaging.createGameMessage(`Unknown command or communication: "${content}"`, [ player ]));
    }
    return responses;
  }

  isAcceptingPlayers() {
    // once the game has started (i.e. been created), no new players can join
    return false;
  }

  isRunning() {
    return !this.hasEnded;
  }

  isReadyForNextContext(): boolean {
    // XXX: might be more 'correct' to check that no players have their state
    // as `PLAYING` or whatever...
    return this.hasEnded;
  }

  isReadyForUpdate(): boolean {
    return _.every(this.players,
      player => Boolean(player.character.nextAction));
  }

  getSortedActions(): Actions.Action[] {
    if (this.isReadyForUpdate()) {

      function getAgility(action: Actions.Action): number {
        return action.actor.stats.agility;
      }

      function getTimestamp(action: Actions.Action): number {
        return action.timestamp;
      }

      const playerActions = this.players.map(player => player.character.nextAction);

      return _.orderBy(playerActions, [ getAgility, getTimestamp ], [ 'desc', 'asc' ]);
    } else {
      return [];
    }
  }

  update(): Actions.PerformResult {
    const sortedActions = this.getSortedActions();

    const { messages: completeMessages, log: completeLog }: Actions.PerformResult = _.reduce(sortedActions,
      ({ messages, log }: Actions.PerformResult, action) => {
        const component = Actions.getComponentByKey(action.key);

        const { messages: newMessages, log: newLog } = component.perform(action, this, log);

        return {
          log: log.concat(newLog),
          messages: messages.concat(newMessages)
        };
      }, { messages: [], log: [] });

    this.turnNumber++;

    // clear all the `nextActions`
    this.players.forEach(player => player.character.nextAction = null);

    return { messages: completeMessages, log: completeLog };
  }

  getAllAnimals(): Animal[] {
    return this.beasts.concat(this.players.map(player => player.character));
  }

  getNearbyAnimals({row, col}: Entity, radius = 1): Animal[] {
    return _.filter(this.getAllAnimals(), (animal) => {
      return (
        _.inRange(animal.row, row - radius, row + radius + 1) &&
        _.inRange(animal.col, col - radius, col + radius + 1)
      );
    });
  }

  get startingRoom(): PassageRoom {
    return Map.getCell(this.map, this.map.startingPosition) as PassageRoom;
  }
}
