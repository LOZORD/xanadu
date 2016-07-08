import _ from 'lodash';
import * as Actions from './actions';

// convert to a line-search, case-insensitive regex
export const keyToRegExp = (key) => RegExp('^' + key + '$', 'i');

export const parseActionUsingParser = (parserObj) => {
  return (actionString) => {
    const key = parserObj.getParseKey(actionString);

    if (key) {
      const matches = actionString.match(keyToRegExp(key));

      return parserObj.parsers[key](matches);
    } else {
      return null;
    }
  };
};

export default {
  parseAction(action) {
    return parseActionUsingParser(this)(action);
  },
  getParseKey(actionString) {
    return _.find(_.keys(this.parsers),
      (key) => keyToRegExp(key).test(actionString));
  },
  hasParseKey(actionString) {
    return this.getParseKey(actionString) !== undefined;
  },
  isParsableAction(actionString) {
    return this.hasParseKey(actionString);
  },
  parsers: {
    // don't worry about movement distance for now
    'go (north|south|east|west)': (matches) => {
      const direction = matches[1];

      return (player, timestamp, text) => {
        return new Actions.MoveAction(player, timestamp, text, direction);
      };
    }
  }
};
