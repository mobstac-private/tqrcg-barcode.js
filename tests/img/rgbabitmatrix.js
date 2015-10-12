// (c) 2013 Manuel Braun (mb@w69b.com)

define(['chai'], function(chai) {
  var expect = chai.expect;
  describe('RGBABitMatrix', function() {
    var RGBABitMatrix = w69b.img.RGBABitMatrix;
    var RGBAImageData = w69b.img.RGBAImageData;

    it('should be supported if webgl is supported', function() {
      var img = new RGBAImageData(10, 10);
      img.setGray(0, 0, 255);
      img.setGray(1, 0, 0);
      img.setGray(4, 7, 255);
      img.setGray(4, 8, 0);
      var matrix = new RGBABitMatrix(img.width, img.height, img.data);
      expect(matrix.get(0, 0)).equals(false);
      expect(matrix.get(1, 0)).equals(true);
      expect(matrix.get(4, 7)).equals(false);
      expect(matrix.get(4, 8)).equals(false);
    });
  });
});
