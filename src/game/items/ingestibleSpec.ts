import { expect } from 'chai';
import * as Ingestible from './ingestible';

describe('Ingestible', function () {
  describe('stringToIngestibleName', function () {
    it('should be return the name if the item is ingestible', function () {
      expect(Ingestible.stringToIngestibleName('Stew')).to.eql('Stew');
    });
    it('should not be sensitive to case', function () {
      expect(Ingestible.stringToIngestibleName('cooked MEAT')).to.eql('Cooked Meat');
    });
    it('should return `undefined` otherwise', function () {
      expect(Ingestible.stringToIngestibleName('quux')).to.be.undefined;
    });
  });
  describe('stringIsAnIngestibleName', function () {
    it('should be true when correct', function () {
      expect(Ingestible.stringIsAnIngestibleName('Raw Meat')).to.be.true;
    });
    it('should not be sensitive to case', function () {
      expect(Ingestible.stringIsAnIngestibleName('alcohol')).to.be.true;
    });
    it('should otherwise be false', function () {
      expect(Ingestible.stringIsAnIngestibleName('foobar')).to.be.false;
    });
  });
});
