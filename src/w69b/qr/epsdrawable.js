// (c) 2013 Manuel Braun (mb@w69b.com)
goog.provide('w69b.qr.EpsDrawable');
goog.require('goog.asserts');
goog.require('w69b.qr.Drawable');

goog.scope(function() {
  /**
   * @constructor
   * @implements {w69b.qr.Drawable}
   */
  w69b.qr.EpsDrawable = function() {
    this.buffer_ = [];
    this.bgColor_ = '1 1 1';
    this.fgColor_ = '0 0 0';
    this.prevColor_ = null;
    this.height_ = 0;
    this.width_ = 0;
  };
  var pro = w69b.qr.EpsDrawable.prototype;

  /**
   * Writes header to buffer.
   * @param {number} width width of svg.
   * @param {number} height height of svg.
   */
  pro.writeHeader = function(width, height) {
    this.buffer_.push('%!PS-Adobe-3.0 EPSF-3.0');
    this.buffer_.push('%%BoundingBox: 0 0 ' + width + ' ' + height);
    this.width_ = width;
    this.height_ = height;
  };

  /**
   * Draws rectangle to buffer.
   * @private
   */
  pro.writeRect_ = function(x, y, width, height, color) {
    if (this.prevColor_ != color) {
      this.buffer_.push(color + ' setrgbcolor');
      this.prevColor_ = color;
    }
    // Project to eps coordinate system. (0, 0) is the bottom left corner.
    y = this.height_ - y;
    this.buffer_.push(x + ' ' + y + ' moveto');
    this.buffer_.push('0 ' + (-height) + ' rlineto ' + width +
      ' 0 rlineto 0 ' + height + ' rlineto closepath');
    this.buffer_.push('fill');
  };

  pro.fillBackground = function(width, height) {
    goog.asserts.assert(this.buffer_.length == 0);
    this.writeHeader(width, height);
    this.writeRect_(0, 0, width, height, this.bgColor_);
  };

  pro.fillBlack = function(x, y, width, height) {
    goog.asserts.assert(this.buffer_.length > 0);
    this.writeRect_(x, y, width, height, this.fgColor_);
  };

  /**
   * Get svg source.
   * @return {string} svg as string.
   */
  pro.toString = function() {
    goog.asserts.assert(this.buffer_.length > 0);
    return this.buffer_.join('\n');
  };

});
