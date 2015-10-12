// (c) 2013 Manuel Braun (mb@w69b.com)

define(['chai'], function(chai) {
  var expect = chai.expect;
  describe('WebGLBinarizer', function() {
    var WebGLBinarizer = w69b.img.WebGLBinarizer;
    var WebGLFiler = w69b.img.WebGLFilter;
    var isWebGLSupported;

    // Check webgl support.
    try {
      new WebGLFiler();
      isWebGLSupported = true;
    } catch (ignored) {
      isWebGLSupported = false;
    }

    it('should be supported if webgl is supported', function() {
      expect(WebGLBinarizer.isSupported()).equals(isWebGLSupported);
    });
  });
});
