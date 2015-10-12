// (c) 2013 Manuel Braun (mb@w69b.com)

goog.provide('w69b.img.RGBABitMatrix');
goog.require('w69b.img.BitMatrixLike');

goog.scope(function() {
  /**
   * Wraps rgba image data in an read-only BitMatix-like interface.
   * @param {number} width in pixels.
   * @param {number} height in pixels.
   * @param {(Uint8Array|Uint8ClampedArray)} data image data with
   * values 255 = white, 0 = black.
   * array.
   * @constructor
   * @implements {w69b.img.BitMatrixLike}
   */
  w69b.img.RGBABitMatrix = function(width, height, data) {
    this.data = data;
    this.width = width;
    this.height = height;
  };
  var pro = w69b.img.RGBABitMatrix.prototype;

  /**
   * @return {number} The width of the matrix.
   */
  pro.getWidth = function() {
    return this.width;
  };

  /**
   * @return {number} The height of the matrix.
   */
  pro.getHeight = function() {
    return this.height;
  };


  /**
   * @param {number} x x pos.
   * @param {number} y y pos.
   * @return {boolean} bit at given position.
   */
  pro.get = function(x, y) {
    var pos = 4 * (y * this.width + x);
    if (this.data[pos] > 0)
      return false;
    else
      return true;
  };


});
