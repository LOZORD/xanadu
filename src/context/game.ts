import * as _ from 'lodash';
import * as Actions from '../game/actions';
import * as Player from '../game/player';
import * as Map from '../game/map/map';
import { PassageRoom } from '../game/map/cell';
import * as Messaging from '../game/messaging';
import { Context, ClientMessage } from './context';
import { TEST_PARSE_RESULT } from '../game/map/parseGrid';
import { Message } from '../game/messaging';
import * as Character from '../game/character';
import * as Animal from '../game/animal';
import { Entity } from '../game/entity';
import { Seed, SeededRNG } from '../rng';
import { Chance } from 'chance';
import * as Inventory from '../game/inventory';
import { reveal } from '../game/map/characterMap';

export type GameConfig = {
  map?: Map.Map;
  numModifiers?: {
    minimum: number;
    maximum: number;
  };
  seed: Seed
};

export default class Game extends Context<Player.GamePlayer> {

  hasEnded: boolean;
  turnNumber: number;
  map: Map.Map;
  rng: SeededRNG;
  beasts: Animal.Animal[];
  minNumModifiers: number;
  maxNumModifiers: number;
  seed: number;

  constructor(maxPlayers: number, players: Player.Player[], gameConfig: GameConfig = { seed: Date.now() }) {
    super();

    this.maxPlayers = maxPlayers;

    this.map = gameConfig.map ? gameConfig.map : TEST_PARSE_RESULT;
    this.seed = gameConfig.seed;
    this.rng = Chance(this.seed);

    if (gameConfig.numModifiers) {
      this.minNumModifiers = gameConfig.numModifiers.minimum;
      this.maxNumModifiers = gameConfig.numModifiers.maximum;
    } else {
      this.minNumModifiers = 0;
      this.maxNumModifiers = Character.MAX_NUM_MODIFIERS;
    }

    this.players = players.map(player => this.convertPlayer(player));

    // TODO: populate
    this.beasts = [];

    this.players.forEach((player) => {

      // reveal the area around the starting room
      if (Inventory.hasItem(player.character.inventory, 'Map')) {
        reveal(player.character.map, Map.getCell(this.map, this.map.startingPosition));
      }
    });

    this.turnNumber = 0;
    this.hasEnded = false;
  }

  handleMessage({ content, player, timestamp}: ClientMessage<Player.GamePlayer>): Message[] {
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

      const toPlayers: Player.GamePlayer[] = [];

      if (_.startsWith(content, '/s ')) {
        this.getNearbyAnimals(player.character).forEach(animal => {
          // do we even need to send a message?
          if (Character.isPlayerCharacter(animal)) {
            // don't send a shout to the shouter!
            if (animal.playerId !== player.id) {
              const maybePlayer = this.getPlayer(animal.playerId);
              if (maybePlayer) {
                toPlayers.push(maybePlayer);
              } else {
                throw new Error(`Got a bad or missing id: ${animal.playerId}`);
              }
            }
          }
        });
      } else {
        messageNameSpan.names.forEach(name => {
          const maybePlayer = this.getPlayerByName(name);

          if (maybePlayer) {
            toPlayers.push(maybePlayer);
          } else {
            // do nothing
          }
        });
      }

      const [ yesComm, noComm ] = _.partition(toPlayers, otherPlayer => Player.canCommunicate(player, otherPlayer));

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
    return _.every(this.players,
      player => !Animal.isAlive(player.character)
        || player.character.hasEscaped);
  }

  isReadyForUpdate(): boolean {
    return _.every(this.players,
      player => Animal.isAlive(player.character)
        && !player.character.hasEscaped
        && Animal.hasNextAction(player.character));
  }

  getSortedActions(): Actions.Action[] {
    if (this.isReadyForUpdate()) {

      const getAgility = (action: Actions.Action) => {
        return action.actor.stats.agility;
      };

      const getTimestamp = (action: Actions.Action) => {
        return action.timestamp;
      };

      const playerActions = this.players.map(player => player.character.nextAction);

      // if we've gotten here, NO player action is null
      return _.orderBy(playerActions as Actions.Action[], [ getAgility, getTimestamp ], [ 'desc', 'asc' ]);
    } else {
      return [];
    }
  }

  update(): Actions.PerformResult {
    const sortedActions = this.getSortedActions();

    const { messages: completeMessages, log: performanceLog }: Actions.PerformResult = _.reduce(sortedActions,
      ({ messages, log }: Actions.PerformResult, action: Actions.Action) => {
        if (Animal.isAlive(action.actor)) {

          const component = Actions.getComponentByKey(action.key);

          const { messages: newMessages, log: newLog } = component.perform(action, this, log);

          return {
            log: log.concat(newLog),
            messages: messages.concat(newMessages)
          };
        } else {
          let newMessages: Message[];

          if (Character.isPlayerCharacter(action.actor)) {
            const actorPlayer = this.getPlayer(action.actor.playerId);

            if (actorPlayer) {
              newMessages = messages.concat(Messaging.createGameMessage(
                'You died before your turn could be performed!', [ actorPlayer ]
              ));
            } else {
              throw new Error('Expected player to exist!');
            }
          } else {
            newMessages = messages;
          }

          return {
            log: log.concat(`Animal died before their action could be performed.`),
            messages: newMessages
          };
          //return null;
        }
      }, { messages: [], log: [] });

    const updateLog = this.players.map(player => Character.updateCharacter(player.character));

    this.turnNumber++;

    // clear all the `nextActions`
    this.players.forEach(player => player.character.nextAction = null);

    return { messages: completeMessages, log: performanceLog.concat(updateLog) };
  }

  getAllAnimals(): Animal.Animal[] {
    return this.beasts.concat(this.players.map(player => player.character));
  }

  getNearbyAnimals({row, col}: Entity, radius = 1): Animal.Animal[] {
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

  convertPlayer(player: Player.Player): Player.GamePlayer {
    if (Player.isGamePlayer(player)) {
      return player;
    } else if (Player.isLobbyPlayer(player)) {
      const character = Character.createCharacter(
        this, player.id, this.map.startingPosition,
        player.primordialCharacter.className,
        player.primordialCharacter.allegiance,
        this.generateModifiers(player.primordialCharacter.numModifiers)
      );

      return {
        id: player.id,
        name: player.name,
        state: 'Playing',
        character
      };
    } else {
      const character = Character.createCharacter(
        this, player.id, this.map.startingPosition,
        'None', 'None', Character.createEmptyModifiers()
      );

      return {
        id: player.id,
        name: player.name,
        state: player.state,
        character
      };
    }
  }

  generateModifiers(chosenNumModifiers: number): Character.Modifiers {
    const numActiveModifiers = _.clamp(
      chosenNumModifiers, this.minNumModifiers, this.maxNumModifiers
    );

    const modifiers = Character.createEmptyModifiers();

    const activeModifers = this.rng.pickset(Character.MODIFIER_NAMES, numActiveModifiers);

    activeModifers.forEach(modifier => {
      modifiers[ modifier ] = true;
    });

    return modifiers;
  }
}

export function isContextGame(context: Context<any>): context is Game {
  return context instanceof Game;
}
