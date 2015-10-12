// (c) 2013 Manuel Braun (mb@w69b.com)
goog.provide('w69b.qr.Drawable');

goog.scope(function() {
  /**
   * Interface uses to draw qr codes.
   * @interface
   */
  w69b.qr.Drawable = function() {
  };
  var pro = w69b.qr.Drawable.prototype;

  /**
   * Set size of drawable and fill background.
   * @param {number} widht with of drawable in pixels.
   * @param {number} height height of drawable in pixels.
   */
  pro.fillBackground = function(widht, height) { };

  /**
   * Fill rectangle with black color.
   * @param {number} x x pos.
   * @param {number} y y pos.
   * @param {number} widht widht of rectangle.
   * @param {number} height height of rectangle.
   */
  pro.fillBlack = function(x, y, widht, height) { };
});

