// (c) 2013 Manuel Braun (mb@w69b.com)

goog.provide('w69b.qr.nativepreprocessing');
goog.require('w69b.qr.HybridBinarizer');
goog.require('w69b.qr.QRImage');

goog.scope(function() {
  var _ = w69b.qr.nativepreprocessing;
  var QRImage = w69b.qr.QRImage;

  /**
   * @param {(!ImageData|!w69b.qr.QRImage)} imageData from canvas.
   * @return {!w69b.qr.BitMatrix} binary data.
   */
  _.binarizeImageData = function(imageData) {
    var gray = _.grayscale(imageData);
    var binarizer = new w69b.qr.HybridBinarizer(gray);
    return binarizer.getBlackMatrix();
  };

  /**
   * Returns grayscale version of image.
   * @param {(!ImageData|!w69b.qr.QRImage)} imageData from canvas.
   * @return {!w69b.qr.QRImage} binary data.
   */
  _.grayscale = function(imageData) {
    var grayImg = QRImage.newEmpty(imageData.width, imageData.height);
    var grayData = grayImg.data;
    var rgbaData = imageData.data;

    for (var i = 0; i < grayData.length; ++i) {
      var rgbaPos = i * 4;
      grayData[i] = (rgbaData[rgbaPos] * 33 +
        rgbaData[rgbaPos + 1] * 34 +
        rgbaData[rgbaPos + 2] * 33) / 100;
    }
    return grayImg;
  };

});

