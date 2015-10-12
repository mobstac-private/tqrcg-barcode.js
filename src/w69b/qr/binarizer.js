// javascript (closure) port (c) 2013 Manuel Braun (mb@w69b.com)
/*
 * Copyright 2009 ZXing authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

goog.provide('w69b.qr.Binarizer');

goog.scope(function() {

/**
 * This class hierarchy provides a set of methods to convert luminance data to
 * 1 bit data.  It allows the algorithm to vary polymorphically, for example
 * allowing a very expensive thresholding technique for servers and a fast one
 * for mobile. It also permits the implementation to vary, e.g. a JNI version
 * for Android and a Java fallback version for other platforms.
 *
 * @author dswitkin@google.com (Daniel Switkin)
 * Ported to js by Manuel Braun
 *
 *  @param {w69b.qr.QRImage} source gray values .
 *  @constructor
 */
w69b.qr.Binarizer = function(source) {
  /**
   * @protected
   * @type {w69b.qr.QRImage}
   */
  this.source = source;
};
  var Binarizer = w69b.qr.Binarizer;
  var pro = Binarizer.prototype;

  /**
   * @return {w69b.qr.QRImage} image.
   */
  pro.getLuminanceSource = function() {
    return this.source;
  };

  /**
   * Converts one row of luminance data to 1 bit data. May actually do the
   * conversion, or return cached data. Callers should assume this method is
   * expensive and call it as seldom as possible.  This method is intended for
   * decoding 1D barcodes and may choose to apply sharpening.  For callers
   * which only examine one row of pixels at a time, the same BitArray should
   * be reused and passed in with each call for performance. However it is
   * legal to keep more than one row at a time if needed.
   *
   * @param {number} y The row to fetch, 0 <= y < bitmap height.
   * @param {w69b.qr.BitArray} opt_row An optional preallocated array. If null
   * or too small, it will be ignored.  If used, the Binarizer will call
   * BitArray.clear(). Always use the returned object.
   * @return {!w69b.qr.BitArray} The array of bits for this row (true means
   * black).
   */
  pro.getBlackRow = function(y, opt_row) { throw Error(); };

  /**
   * Converts a 2D array of luminance data to 1 bit data. As above, assume this
   * method is expensive and do not call it repeatedly. This method is intended
   * for decoding 2D barcodes and may or may not apply sharpening. Therefore, a
   * row from this matrix may not be identical to one fetched using
   * getBlackRow(), so don't mix and match between them.
   *
   * @return {!w69b.qr.BitMatrix} The 2D array of bits for the image
   * (true means black).
   */
  pro.getBlackMatrix = function() { throw Error(); };

  /**
   * Creates a new object with the same type as this Binarizer implementation,
   * but with pristine state. This is needed because Binarizer implementations
   * may be stateful, e.g. keeping a cache of 1 bit data. See Effective Java
   * for why we can't use Java's clone() method.
   *
   * @param {w69b.qr.QRImage} source The LuminanceSource this Binarizer
   * will operate on.
   * @return {w69b.qr.Binarizer} A new concrete Binarizer implementation
   * object.
   */
  pro.createBinarizer = function(source) { throw Error(); };

  /**
   * @return {number} width.
   */
  pro.getWidth = function() {
    return this.source.width;
  };

  /**
   * @return {number} height.
   */
  pro.getHeight = function() {
    return this.source.height;
  };

});

