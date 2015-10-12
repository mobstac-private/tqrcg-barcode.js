// (c) 2013 Manuel Braun (mb@w69b.com)

define(['chai', 'sinon'], function(chai, sinon) {
  var expect = chai.expect;
  describe('encoding API', function() {
    var encoding = w69b.qr.encoding;
    it('should cache results', function() {
      var spy = sinon.spy(w69b.qr.encoder.Encoder, 'encode');
      encoding.drawAsSVG('hihi', 200);
      encoding.drawAsSVG('hihi', 200);
      expect(spy.callCount).equals(1);
      w69b.qr.encoding.drawAsSVG('other', 200);
      expect(spy.callCount).equals(2);
      encoding.drawAsSVG('other', 200, 0, 'H');
      expect(spy.callCount).equals(3);
      spy.restore();
    });

    it('should return minimal size', function() {
      expect(encoding.getSize('test')).equals(21);
      expect(encoding.getSize('test test test', 'H')).equals(25);
    });
  });
});

