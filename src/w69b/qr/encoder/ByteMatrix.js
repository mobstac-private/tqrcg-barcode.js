// javascript (closure) port (c) 2013 Manuel Braun (mb@w69b.com)
/*
 * Copyright 2008 ZXing authors
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
 */

goog.provide('w69b.qr.encoder.ByteMatrix');

/**
 * A class which wraps a 2D array of bytes. The default usage is signed.
 * If you want to use it as a
 * unsigned container, it's up to you to do byteValue & 0xff at each location.
 *
 * JAVAPORT: The original code was a 2D array of ints, but since it only ever
 * gets assigned
 * -1, 0, and 1, I'm going to use less memory and go with bytes.
 *
 * @author dswitkin@google.com (Daniel Switkin)
 * @author mb@w69b.com (Manuel Braun) - ported to js.
 */
goog.scope(function() {

  /**
   * Row (y) first byte matrix.
   * @param {number} width with.
   * @param {number} height height.
   * @constructor
   */
  w69b.qr.encoder.ByteMatrix = function(width, height) {
    /**
     * @type {number}
     * @private
     */
    this.width_ = width;
    /**
     * @type {number}
     * @private
     */
    this.height_ = height;
    this.bytes_ = new Int8Array(width * height);
  };
  var pro = w69b.qr.encoder.ByteMatrix.prototype;

  pro.getBytes = function() {
    return this.bytes_;
  };

  pro.getHeight = function() {
    return this.height_;
  };

  pro.getWidth = function() {
    return this.width_;
  };

  pro.get = function(x, y) {
    return this.bytes_[this.width_ * y + x];
  };

  pro.set = function(x, y, value) {
    this.bytes_[this.width_ * y + x] = value;
  };

  pro.clear = function(value) {
    for (var i = 0; i < this.bytes_.length; ++i)
      this.bytes_[i] = value;
  };

  pro.toString = function() {
    var result = [];
    for (var y = 0; y < this.height_; ++y) {
      for (var x = 0; x < this.width_; ++x) {
        switch (this.get(x, y)) {
          case 0:
            result.push(' 0');
            break;
          case 1:
            result.push(' 1');
            break;
          default:
            result.push('  ');
            break;
        }
      }
      result.push('\n');
    }
    return result.join('');
  };

});
