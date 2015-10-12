// (c) 2013 Manuel Braun (mb@w69b.com)
define(['chai'], function(chai) {
  expect = chai.expect;
  describe('test 2d int array', function() {

    it('set and get', function() {
      var array = new w69b.qr.IntArray2D(2, 2);
      array.setAt(0, 0, 100);
      array.setAt(0, 1, 200);
      array.setAt(1, 0, 1000);
      array.setAt(1, 1, 2000);
      expect(array.getAt(0, 0)).to.equal(100);
      expect(array.getAt(0, 1)).to.equal(200);
      expect(array.getAt(1, 0)).to.equal(1000);
      expect(array.getAt(1, 1)).to.equal(2000);
    });
  });
});
