// javascript (closure) port (c) 2013 Manuel Braun (mb@w69b.com)
goog.provide('w69b.qr.SvgDrawable');
goog.require('goog.asserts');
goog.require('w69b.qr.Drawable');

goog.scope(function() {
  /**
   * @constructor
   * @implements {w69b.qr.Drawable}
   */
  w69b.qr.SvgDrawable = function() {
    this.buffer_ = [];
    this.bgStyle_ = 'white';
    this.fgStyle_ = 'black';
  };
  var pro = w69b.qr.SvgDrawable.prototype;

  /**
   * Writes header to buffer.
   * @param {number} width width of svg.
   * @param {number} height height of svg.
   */
  pro.writeHeader = function(width, height) {
    this.buffer_.push('<?xml version="1.0" encoding="UTF-8"?>');
    this.buffer_.push('<svg version="1.1" baseProfile="tiny" ' +
      'xmlns="http://www.w3.org/2000/svg" ' +
      'width="' + width + '" height="' + height + '"' + '>');
  };

  /**
   * Draws rectangle to buffer.
   * @private
   */
  pro.writeRect_ = function(x, y, width, height, color) {
    this.buffer_.push(
      '<rect shape-rendering="optimizeSpeed" ' +
        ' x="' + x + '" y="' + y + '" width="' +
        width + '" height="' + height + '" fill="' + color + '" />');
  };

  pro.fillBackground = function(width, height) {
    goog.asserts.assert(this.buffer_.length == 0);
    this.writeHeader(width, height);
    this.writeRect_(0, 0, width, height, this.bgStyle_);
  };

  pro.fillBlack = function(x, y, width, height) {
    goog.asserts.assert(this.buffer_.length > 0);
    this.writeRect_(x, y, width, height, this.fgStyle_);
  };

  /**
   * Get svg source.
   * @return {string} svg as string.
   */
  pro.toString = function() {
    goog.asserts.assert(this.buffer_.length > 0);
    return this.buffer_.join('\n') + '</svg>';
  };

});
