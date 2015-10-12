// (c) 2013 Manuel Braun (mb@w69b.com)
goog.provide('w69b.qr.QRImage');

goog.scope(function() {

  /** @typedef {(Uint8ClampedArray|Uint8Array)} */
  w69b.qr.ImageData;
  /**
   * Image data container with width/height.
   * @param {number} width image width in pixels.
   * @param {number} height image height in pixels.
   * @param {w69b.qr.ImageData} data data array.
   * @constructor
   */
  w69b.qr.QRImage = function(width, height, data) {
    this.width = width;
    this.height = height;
    this.data = data;
  };
  var QRImage = w69b.qr.QRImage;
  var pro = QRImage.prototype;

  /**
   * Get value at given position.
   * @param {number} x x pos (col).
   * @param {number} y y pos (row).
   * @return {number} value.
   */
  pro.get = function(x, y) {
    return this.data[y * this.width + x];
  };

  /**
   * @return {number} width.
   */
  pro.getWidth = function() {
    return this.width;
  };

  /**
   * @return {number} height.
   */
  pro.getHeight = function() {
    return this.height;
  };

  /**
   * @return {w69b.qr.ImageData} raw data.
   */
  pro.getMatrix = function() {
    return this.data;
  };

  /**
   * @param {number} y index.
   * @param {Uint8Array} opt_row pre-allocated.
   * @return {Uint8Array} row.
   */
  pro.getRow = function(y, opt_row) {
    var row;
    if (opt_row == null || opt_row.length < this.width)
      row = new Uint8Array(this.width);
    else
      row = opt_row;
    var offset = y * this.width;
    for (var x = 0; x < this.width; ++x)
      row[x] = this.data[offset + x];
    return row;
  };


  /**
   * Get index in data for given position.
   * @param {number} x x pos (col).
   * @param {number} y y pos (row).
   * @return {number} index in data.
   */
  pro.getIndex = function(x, y) {
    return this.width * y + x;
  };

  /**
   * Set value at given position.
   * @param {number} x x pos (col).
   * @param {number} y y pos (row).
   * @param {number} value value to set.
   */
  pro.setValue = function(x, y, value) {
    this.data[y * this.width + x] = value;
  };

  /**
   * Construct Image with new empty buffer.
   * @param {number} width image width.
   * @param {number} height image height.
   * @return {w69b.qr.QRImage} image with given size and a new, empty buffer.
   */
  QRImage.newEmpty = function(width, height) {
    return new QRImage(width, height,
      new Uint8Array(new ArrayBuffer(width * height)));
  };
});

