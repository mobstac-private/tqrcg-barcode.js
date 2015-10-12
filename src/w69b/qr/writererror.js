// (c) 2013 Manuel Braun (mb@w69b.com)
goog.provide('w69b.qr.WriterError');
goog.require('goog.debug.Error');

goog.scope(function() {
  /**
   * @constructor
   * @param {string=} opt_msg message.
   * @extends {goog.debug.Error}
   */
  w69b.qr.WriterError = function(opt_msg) {
    goog.base(this, opt_msg);
  };
  goog.inherits(w69b.qr.WriterError, goog.debug.Error);

});
