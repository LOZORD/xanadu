import F2DA from 'fixed-2d-array';
export default class CharacterMap {
  constructor(gameMap, kwargs) {
    this.gameMap = kwargs.gameMap;
    this.owningCharacter = kwargs.owningCharacter;
    let d = this.gameMap.dimension;
    this.representation = new F2DA(d, d, 0);
    this.isPopulated = false;
    this.populate(this.representation, this.owningCharacter);
  }
  populate() {
    if (!this.isPopulated) {
      //TODO
      this.isPopulated = true;
    } else {
      return;
    }
  }
  update(updateInfo) {
    // TODO
    throw `TODO: update info ${ updateInfo }`;
  }
  // lieAmount: when giving info to another player, how much are you gonna lie?
  produceInformation(lieAmount = 0) {
    // TODO
    throw `TODO: lie amount: ${ lieAmount }`;
  }
  toString() {
    // TODO: use a number -> char stringifyer
  }
}
