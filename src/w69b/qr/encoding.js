// (c) 2013 Manuel Braun (mb@w69b.com)
goog.provide('w69b.qr.encoding');
goog.require('w69b.qr.CanvasDrawable');
goog.require('w69b.qr.EncodeHintType');
goog.require('w69b.qr.EpsDrawable');
goog.require('w69b.qr.ErrorCorrectionLevel');
goog.require('w69b.qr.SvgDrawable');
goog.require('w69b.qr.encoder.Encoder');
goog.require('w69b.qr.renderer');

/**
 * Simple high-level interface to create qr codes.
 */
goog.scope(function() {
  var Encoder = w69b.qr.encoder.Encoder;
  var ErrorCorrectionLevel = w69b.qr.ErrorCorrectionLevel;
  var renderer = w69b.qr.renderer;
  var EncodeHintType = w69b.qr.EncodeHintType;
  var SvgDrawable = w69b.qr.SvgDrawable;
  var EpsDrawable = w69b.qr.EpsDrawable;

  var _ = w69b.qr.encoding;

  /**
   * @type {Object} cache of (currently only the last) encode call and its
   * result.
   * @private
   */
  _.cache_ = {
    content: null,
    ecLevel: null,
    result: null
  };

  /**
   *
   * @param {string} content to encode.
   * @param {string=} opt_ecName optional error correciton name.
   * Defaults to L .
   * @private
   */
  _.encode = function(content, opt_ecName) {
    var ecLevel = null;
    if (opt_ecName)
      ecLevel = ErrorCorrectionLevel.getByName(opt_ecName);
    ecLevel = ecLevel || ErrorCorrectionLevel.L;

    // Check if result is cached.
    if (_.cache_.content == content &&
      _.cache_.ecLevel == ecLevel)
      return _.cache_.result;

    var qrcode = Encoder.encode(content, ecLevel);
    // Cache result. Currently just the last call is cached.
    _.cache_.content = content;
    _.cache_.ecLevel = ecLevel;
    _.cache_.result = qrcode;

    return qrcode;
  };

  /**
   * @param {string} content to encode.
   * @param {HTMLCanvasElement} canvas canvas to draw on.
   * @param {number=} opt_margin size of quit zone.
   * @param {string=} opt_ecName optional error correciton name.
   * Defaults to L .
   */
  _.drawOnCanvas = function(content, canvas, opt_margin, opt_ecName) {
    var qrCode = _.encode(content, opt_ecName);
    var quiet = goog.isDef(opt_margin) ? opt_margin : renderer.QUIET_ZONE_SIZE;
    var drawable = new w69b.qr.CanvasDrawable(canvas);
    renderer.render(qrCode, drawable, canvas.width, canvas.height,
      quiet);
  };

  /**
   * Get minimal size (wihtout margin) of content encoded as qr code.
   * This encodes the content as qr code and reads of its size.
   * So it is quite slow. However the encoded qr code is cached. So a
   * subsequent draw call with equal parameters is cheap.
   * @param {string} content to encode.
   * @param {string=} opt_ecName optional error correciton name.
   * Defaults to L .
   * @return {number} size of qr code.
   */
  _.getSize = function(content, opt_ecName) {
    var qrcode = _.encode(content, opt_ecName);
    return qrcode.getMatrix().getWidth();
  };


  /**
   * @param {string} content to encode.
   * @param {number} size to use as svg width/height.
   * @param {number=} opt_margin size of quit zone.
   * @param {string=} opt_ecName optional error correciton name.
   * Defaults to L .
   * @return {string} svg source.
   */
  _.drawAsSVG = function(content, size, opt_margin, opt_ecName) {
    var qrCode = _.encode(content, opt_ecName);
    var quiet = goog.isDef(opt_margin) ? opt_margin : renderer.QUIET_ZONE_SIZE;
    var drawable = new SvgDrawable();
    renderer.render(qrCode, drawable, size, size, quiet);
    return drawable.toString();
  };

  /**
   * @param {string} content to encode.
   * @param {number} size to use as eps width/height.
   * @param {number=} opt_margin size of quit zone.
   * @param {string=} opt_ecName optional error correciton name.
   * Defaults to L .
   * @return {string} eps source.
   */
  _.drawAsEPS = function(content, size, opt_margin, opt_ecName) {
    var qrCode = _.encode(content, opt_ecName);
    var quiet = goog.isDef(opt_margin) ? opt_margin : renderer.QUIET_ZONE_SIZE;
    var drawable = new EpsDrawable();
    renderer.render(qrCode, drawable, size, size, quiet);
    return drawable.toString();
  };

  goog.exportSymbol('w69b.qr.encoding.drawOnCanvas', _.drawOnCanvas);
  goog.exportSymbol('w69b.qr.encoding.drawAsSVG', _.drawAsSVG);
  goog.exportSymbol('w69b.qr.encoding.drawAsEPS', _.drawAsEPS);
  goog.exportSymbol('w69b.qr.encoding.getSize', _.getSize);
  goog.exportSymbol('w69b.qr.encoding.encode', _.encode);
});
