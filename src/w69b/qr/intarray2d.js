// javascript (closure) port (c) 2013 Manuel Braun (mb@w69b.com)
goog.provide('w69b.qr.IntArray2D');
goog.scope(function() {
  /**
   * Provides a pre-allocated row-first 2d integer array.
   * @param {number} size1 size of first dimension.
   * @param {number} size2 size ofsecond dimension.
   * @constructor
   */
  w69b.qr.IntArray2D = function(size1, size2) {
    this.size1 = size1;
    this.size2 = size2;
    this.data = new Int32Array(size1 * size2);
  };
  var pro = w69b.qr.IntArray2D.prototype;

  /**
   * Get value.
   * @param {number} dim1 first dimension.
   * @param {number} dim2 second dimension.
   * @return {number} value at given position.
   */
  pro.getAt = function(dim1, dim2) {
    return this.data[this.size2 * dim1 + dim2];
  };
  /**
   * Set value.
   * @param {number} dim1 first dimension.
   * @param {number} dim2 second dimension.
   * @param {number} value at given position.
   */
  pro.setAt = function(dim1, dim2, value) {
    this.data[this.size2 * dim1 + dim2] = value;
  };
});
