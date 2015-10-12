// (c) 2013 Manuel Braun (mb@w69b.com)
goog.provide('w69b.imgtools');
goog.require('goog.asserts');
goog.require('goog.crypt.base64');
goog.require('goog.math.Size');

goog.scope(function() {
  var _ = w69b.imgtools;
  var Size = goog.math.Size;
  var base64 = goog.crypt.base64;

  /**
   * Get content of canvas as png stored in a blob.
   * @param {HTMLCanvasElement} canvas canvas element.
   * @param {function(Blob)} callback called with blob data.
   */
  _.getCanvasAsBlob = function(canvas, callback) {
    if (canvas['toBlob']) {
      // toBlob supported
      canvas['toBlob'](callback);
    } else if (canvas.toDataURL) {
      var url = canvas.toDataURL();
      var prefix = 'data:image/png;base64,';
      if (!goog.string.startsWith(url, prefix))
        throw Error();
      var data = url.substring(prefix.length);
      data = new Uint8Array(base64.decodeStringToByteArray(data));
      var blob = new Blob([data], {'type': 'image/png'});
      callback(blob);
    } else {
      throw Error();
    }
  };

  /**
   * Get Image data of given Image object. Same origin policy applies to
   * image src. Image has to be loaded. Image is scaled down to opt_maxSize
   * if its width or height is larger.
   * @param {Image|HTMLVideoElement} img image.
   * @param {(number|Size)=} opt_maxSize max size of any dimension in pixels or Size object
   * that img data should cover (cropping bottom-right corners).
   * @return {!ImageData} image data.
   */
  _.getImageData = function(img, opt_maxSize) {
    var size = new Size(
      /** @type {number} */ (img.width || img.videoWidth),
      /** @type {number} */ (img.height || img.videoHeight));

    goog.asserts.assert(size.width > 0 && size.height > 0);
    var canvas = document.createElement('canvas');
    if (opt_maxSize) {
      if (goog.isNumber(opt_maxSize)) {
        opt_maxSize = new Size(opt_maxSize, opt_maxSize);
        if (!size.fitsInside(opt_maxSize))
          size = size.scaleToFit(opt_maxSize);
      } else {
        if (!size.fitsInside(opt_maxSize))
          size = size.scaleToCover(opt_maxSize);
      }
      size.floor();
    }
    canvas.width = size.width;
    canvas.height = size.height;
    var context = canvas.getContext('2d');
    context.drawImage(img, 0, 0, size.width, size.height);
    return context.getImageData(0, 0, size.width, size.height);
  };

  /**
   * Scales size in-place to fit max if larger keeping the aspect ratio.
   * @param {Size} size original size.
   * @param {number} max size in pixels.
   */
  _.scaleIfLarger = function(size, max) {
    var s = Math.min(max / size.width, max / size.height);
    if (s <= 1) {
      size.scale(s).round();
    }
  };

  goog.exportSymbol('w69b.imgtools.getImageData', _.getImageData);
  goog.exportSymbol('w69b.imgtools.getCanvasAsBlob', _.getCanvasAsBlob);
});
