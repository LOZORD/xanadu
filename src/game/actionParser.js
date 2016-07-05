import _ from 'lodash';
import * as Actions from './actions';

// convert to a line-search, case-insensitive regex
export const keyToRegExp = (key) => RegExp('^' + key + '$', 'i');

export const parseActionUsingParser = (parserObj) => {
  return (actionString) => {
    const key = _.find(_.keys(parserObj),
        (key) => keyToRegExp(key).test(actionString));

    if (key) {
      return parserObj[key].call(null, actionString.match(RegExp(key)));
    } else {
      return null;
    }
  };
};

export default {
  parseAction: parseActionUsingParser(this),
  // don't worry about movement distance for now
  'go (north|south|east|west)': (matches) => {
    const direction = matches[1];

    return (player, timestamp, text) => {
      return new Actions.MoveAction(player, timestamp, text, direction);
    };
  }
};
