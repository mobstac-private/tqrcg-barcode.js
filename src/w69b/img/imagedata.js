// (c) 2013 Manuel Braun (mb@w69b.com)

goog.provide('w69b.img.RGBAImageData');

goog.scope(function() {
  /**
   * @param {number} width in pixels.
   * @param {number} height in pixels.
   * @param {Uint8Array=} opt_data optional image data. Defaults to empty
   * array.
   * @constructor
   */
  w69b.img.RGBAImageData = function(width, height, opt_data) {
    this.data = opt_data || new Uint8Array(4 * width * height);
    this.width = width;
    this.height = height;
  };
  var pro = w69b.img.RGBAImageData.prototype;

  pro.set = function(x, y, red, green, blue, opt_alpha) {
    var pos = 4 * (y * this.width + x);
    this.data[pos] = red;
    this.data[pos + 1] = green;
    this.data[pos + 2] = blue;
    this.data[pos + 3] = opt_alpha || 255;
  };

  pro.setGray = function(x, y, gray) {
    this.set(x, y, gray, gray, gray, 255);
  };

  /**
   * @param {number} x pos.
   * @param {number} y pos.
   * @return {Array} [red, green, blue, alpha] values.
   */
  pro.get = function(x, y) {
    var pos = 4 * (y * this.width + x);
    return [this.data[pos], this.data[pos + 1],
      this.data[pos + 2], this.data[pos + 3]];
  };
});
