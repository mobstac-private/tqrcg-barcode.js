// (c) 2013 Manuel Braun (mb@w69b.com)
goog.provide('w69b.qr.imagedecoding');
goog.require('w69b.img.RGBABitMatrix');
goog.require('w69b.img.WebGLBinarizer');
goog.require('w69b.imgtools');
goog.require('w69b.qr.DecodeResult');
goog.require('w69b.qr.Detector');
goog.require('w69b.qr.QRImage');
goog.require('w69b.qr.ReaderError');
goog.require('w69b.qr.decoder');
goog.require('w69b.qr.encoder.Encoder');
goog.require('w69b.qr.nativepreprocessing');

/**
 * Simple high-level interface to decode qr codes.
 * @author mb@w69b.com (Manuel Braun)
 */
goog.scope(function() {
  var Detector = w69b.qr.Detector;
  var RGBABitMatrix = w69b.img.RGBABitMatrix;
  var DecodeResult = w69b.qr.DecodeResult;
  var WebGLBinarizer = w69b.img.WebGLBinarizer;
  var imgtools = w69b.imgtools;
  var preprocessing = w69b.qr.nativepreprocessing;

  var _ = w69b.qr.imagedecoding;

  _.webGLBinarizer_ = null;

  _.getWebGLBinarizer_ = function() {
    if (!_.webGLBinarizer_) {
      _.webGLBinarizer_ = new WebGLBinarizer();
    }
    return _.webGLBinarizer_;
  };

  /**
   * Decode qr code in main thread.
   * @param {(Image|HTMLVideoElement)} img image or video.
   * @param {?w69b.qr.ResultPointCallback=} callback callback for patterns.
   * @param {boolean=} opt_webgl whether to use WebGl binarizer if supported.
   * @return {DecodeResult} result.
   */
  _.decode = function(img, callback, opt_webgl) {
    var imgData;
    if (opt_webgl && WebGLBinarizer.isSupported()) {
      var binarizer = _.getWebGLBinarizer_();
      binarizer.setup(img.width || img.videoHeight, img.height || img.videoHeight);
      binarizer.render(img);
      imgData = binarizer.getBitMatrix();
    } else {
      imgData = imgtools.getImageData(img, 700);
    }
    return _.decodeFromImageData(imgData, callback);
  };

  /**
   * Decode qr code from ImageData or preprocessed RGBABitMatrix.
   * @param {(!ImageData|!w69b.qr.QRImage|!RGBABitMatrix)} imgdata from canvas.
   * @param {?w69b.qr.ResultPointCallback=} opt_callback callback.
   * @return {DecodeResult} decoded qr code.
   */
  _.decodeFromImageData = function(imgdata, opt_callback) {
    var result;
    try {
      result = _.decodeFromImageDataThrowing(imgdata, opt_callback);
    } catch (err) {
      result = new DecodeResult(err);
      if (!(err instanceof w69b.qr.ReaderError))
        throw err;
    }
    return result;
  };

  /**
   * Throws ReaderError if detection fails.
   * @param {(!ImageData|!w69b.qr.QRImage|!RGBABitMatrix)} imgdata from canvas.
   * @param {?w69b.qr.ResultPointCallback=} opt_callback callback.
   * @return {DecodeResult} decoded qr code.
   */
  _.decodeFromImageDataThrowing = function(imgdata, opt_callback) {
    var bitmap;
    if (imgdata instanceof RGBABitMatrix) {
      bitmap = imgdata;
    } else {
      bitmap = preprocessing.binarizeImageData(imgdata);
    }
    var detector = new Detector(bitmap, opt_callback);

    var detectorResult = detector.detect();
    var text = w69b.qr.decoder.decode(detectorResult.bits);

    return new DecodeResult(text, detectorResult.points);
  };

});

goog.exportSymbol('w69b.qr.imagedecoding.decodeFromImageData',
  w69b.qr.imagedecoding.decodeFromImageData);
