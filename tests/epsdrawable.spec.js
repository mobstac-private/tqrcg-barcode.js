// (c) 2013 Manuel Braun (mb@w69b.com)

define(['chai', 'sinon'], function(chai, sinon) {
  var expect = chai.expect;
  describe('EPS drawable', function() {
    var drawable;
    beforeEach(function() {
      drawable = new w69b.qr.EpsDrawable();
    });

    it('should draw simple figure', function() {
      drawable.fillBackground(100, 100);
      drawable.fillBlack(10, 20, 50, 40);
      expect(drawable.toString()).equal('%!PS-Adobe-3.0 EPSF-3.0\n' +
        '%%BoundingBox: 0 0 100 100\n' +
        '1 1 1 setrgbcolor\n0 100 moveto\n' +
        '0 -100 rlineto 100 0 rlineto 0 100 rlineto closepath\n' +
        'fill\n' +
        '0 0 0 setrgbcolor\n' +
        '10 80 moveto\n' +
        '0 -40 rlineto 50 0 rlineto 0 40 rlineto closepath\n' +
        'fill');
    });
  });
});

