import StackableItem from '../stackableItem';

// For all Food and Medical Items
export default class Ingestible extends StackableItem {
  constructor(kwargs = {}) {
    super(kwargs.stackAmount, kwargs.maxStackAmount, kwargs.row, kwargs.col);
    // the number of turns that the ingestible relieves addiction effects
    this.addictionRelief = kwargs.addictionRelief || 0;
    this.isPoisoned        = kwargs.isPoisoned || false;
    this.isAddictive       = kwargs.isAddictive || false;
    this.givesImmortality  = kwargs.givesImmortality || false;
    this.stats = {
      health: 0,
      strength: 0,
      intelligence: 0,
      agility: 0
    };
  }
  poison() {
    this.isPoisoned = true;
  }
}
