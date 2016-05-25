import Water from './water';

export default class AlphWater extends Water {
  constructor(kwargs = {}) {
    super(kwargs);

    this.givesImmortality = true;
  }
}
