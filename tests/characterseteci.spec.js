// (c) 2013 Manuel Braun (mb@w69b.com)
define(['chai'], function(chai) {
  var expect = chai.expect;
  var CharacterSetECI = w69b.qr.CharacterSetECI;

  describe('CharacterSetECI', function() {

    it('should return value by name', function() {
      expect(CharacterSetECI.getValue('UTF-8')).to.equal(26);
      expect(CharacterSetECI.getValue('UTF-8')).to.equal(26);
      expect(CharacterSetECI.getValue('SHIFT_JIS')).to.equal(20);
    });

    it('should return name by value', function() {
      expect(CharacterSetECI.getName(26)).to.equal('UTF-8');
      expect(CharacterSetECI.getName(20)).to.equal('SHIFT_JIS');
      expect(CharacterSetECI.getName(0)).to.equal('CP437');
      expect(CharacterSetECI.getName(2)).to.equal('CP437');
    });
  });
});
