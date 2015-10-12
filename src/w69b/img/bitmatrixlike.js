// (c) 2013 Manuel Braun (mb@w69b.com)

goog.provide('w69b.img.BitMatrixLike');

goog.scope(function() {
  /**
   * Interface for readable bitmatrix.
   * @interface
   */
  w69b.img.BitMatrixLike = function() {
  };

  /**
   * @return {number} The width of the matrix.
   */
  w69b.img.BitMatrixLike.prototype.getWidth = function() {
  };

  /**
   * @return {number} The height of the matrix.
   */
  w69b.img.BitMatrixLike.prototype.getHeight = function() {
  };

  /**
   * @param {number} x x pos.
   * @param {number} y y pos.
   * @return {boolean} bit at given position.
   */
  w69b.img.BitMatrixLike.prototype.get = function(x, y) {
  };
});
