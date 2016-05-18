// Character factory
// import ... [character class classes]
import RNG from 'random-seed';
import _ from 'lodash';
import { MODIFIERS } from './character';

export const CLASS_CONSTRUCTOR_MAP = {
  BENEFACTOR:   null,
  GUNSLINGER:   null,
  EXCAVATOR:    null,
  DOCTOR:       null,
  CHEF:         null,
  SHAMAN:       null,
  CAVEMAN:      null,
  CARTOGRAPHER: null,
  PROF:         null,
  SMITH:        null
};

let shuffle = (list, seed) => {
  let rand = new RNG(seed);
  let copy = _.clone(list);
  let size = list.length;

  for (let i = size - 1; i > 0; i--) {
    let ind = rand.intBetween(0, i + 1);
    let temp = copy[i];
    copy[i] = copy[ind];
    copy[ind] = temp;
  }

  return copy;
};

export default (className, kwargs = {}) => {
  if (!classConstructor) {
    throw new Error(`Unknown className: ${ className }`);
  }

  let classConstructor = CLASS_CONSTRUCTOR_MAP[className];
  const seed = kwargs.seed;
  let rand = new RNG(seed);
  let numModifiers;

  if (_.has(kwargs, 'numModifiers')) {
    if (kwargs.numModifiers < 0) {
      kwargs.numModifiers = rand.intBetween(1, _.size(MODIFIERS));
    } else {
      numModifiers = kwargs.numModifiers;
    }
  } else {
    numModifiers = 0;
  }

  let setModifiers =
    _.take(
      shuffle(
        _.keys(MODIFIERS),
        seed)
    , numModifiers);

  let modifiers = kwargs.modifiers || {};

  _.forEach(setModifiers, (_v, modifierName) => {
    modifiers[modifierName] = true;
  });

  kwargs.modifiers = modifiers;

  return new (classConstructor).call(null, kwargs);
};
