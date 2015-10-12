// (c) 2013 Manuel Braun (mb@w69b.com)
define(['chai'], function(chai) {
  var expect = chai.expect;
  var FinderPatternFinder = w69b.qr.FinderPatternFinder;
  var ResultPoint = w69b.qr.ResultPoint;
  var EPSILON = 0.001;
  describe('compute skew', function() {

    var triangle;

    beforeEach(function() {
      triangle = [
        new ResultPoint(0, 0),
        new ResultPoint(0, 10),
        new ResultPoint(10, 0)
      ];
    });

    it('should be zero', function() {
      expect(FinderPatternFinder.computeSkew(triangle)).below(EPSILON);
      var reordered = [triangle[1], triangle[2], triangle[0]];
      expect(FinderPatternFinder.computeSkew(reordered)).below(EPSILON);
      reordered = [triangle[2], triangle[0], triangle[1]];
      expect(FinderPatternFinder.computeSkew(reordered)).below(EPSILON);

    });

    it('should be small', function() {
      triangle[1] = new ResultPoint(0, 12);
      expect(FinderPatternFinder.computeSkew(triangle)).below(0.2);
      triangle[2] = new ResultPoint(12, 1);
      expect(FinderPatternFinder.computeSkew(triangle)).below(0.2);
    });

    it('should be large', function() {
      triangle[1] = new ResultPoint(2, 8);
      expect(FinderPatternFinder.computeSkew(triangle)).above(0.3);
    });
  });

});
