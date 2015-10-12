// (c) 2013 Manuel Braun (mb@w69b.com)
goog.provide('w69b.qr.FormatError');
goog.provide('w69b.qr.InvalidCharsetError');
goog.provide('w69b.qr.NotFoundError');
goog.provide('w69b.qr.ReaderError');
goog.require('goog.debug.Error');

goog.scope(function() {
  /**
   * @constructor
   * @param {string=} opt_msg message.
   * @extends {goog.debug.Error}
   */
  w69b.qr.ReaderError = function(opt_msg) {
    goog.base(this, opt_msg);
  };
  goog.inherits(w69b.qr.ReaderError, goog.debug.Error);

  /**
   * Thrown if decoding fails.
   * @constructor
   * @param {string=} opt_msg message.
   * @extends {w69b.qr.ReaderError}
   */
  w69b.qr.FormatError = function(opt_msg) {
    goog.base(this, opt_msg);
  };
  goog.inherits(w69b.qr.FormatError, w69b.qr.ReaderError);

  /**
   * Thrown if detection fails.
   * @constructor
   * @param {string=} opt_msg message.
   * @extends {w69b.qr.ReaderError}
   */
  w69b.qr.NotFoundError = function(opt_msg) {
    goog.base(this, opt_msg);
  };
  goog.inherits(w69b.qr.NotFoundError, w69b.qr.ReaderError);


  /**
   * @constructor
   * @param {string=} opt_msg message.
   * @extends {goog.debug.Error}
   */
  w69b.qr.InvalidCharsetError = function(opt_msg) {
    goog.base(this, opt_msg || 'InvalidCharset');
  };
  goog.inherits(w69b.qr.InvalidCharsetError, goog.debug.Error);
});
