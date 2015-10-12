// javascript (closure) port (c) 2013 Manuel Braun (mb@w69b.com)
/*
 Ported to JavaScript by Lazar Laszlo 2011

 lazarsoft@gmail.com, www.lazarsoft.info

 */

/*
 *
 * Copyright 2007 ZXing authors
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

goog.provide('w69b.qr.DataMask');
goog.require('w69b.qr.URShift');

goog.scope(function() {
  var URShift = w69b.qr.URShift;

  var _ = w69b.qr.DataMask;

  /** @interface */
  _.DataMaskInterface = function() {};

  /**
   * @param {w69b.qr.BitMatrix} bits bits.
   * @param {number} dim dimensions.
   */
  _.DataMaskInterface.prototype.unmaskBitMatrix = function(bits, dim) {};

  /**
   * @param {number} i idx.
   * @param {number} j idx.
   * @return {boolean} if position is masked.
   */
  _.DataMaskInterface.prototype.isMasked = function(i, j) {};


  /**
   * @param {number} reference mask number.
   * @return {!_.DataMaskInterface} data mask.
   */
  _.forReference = function(reference) {
    if (reference < 0 || reference > 7) {
      throw Error();
    }
    return _.DATA_MASKS_[reference];
  };

  /**
   * @constructor
   */
  _.DataMask000 = function() {
  };
  _.DataMask000.prototype.unmaskBitMatrix = function(bits, dimension) {
    for (var i = 0; i < dimension; i++) {
      for (var j = 0; j < dimension; j++) {
        if (this.isMasked(i, j)) {
          bits.flip(j, i);
        }
      }
    }
  };
  _.DataMask000.prototype.isMasked = function(i, j) {
    return ((i + j) & 0x01) == 0;
  };

  /**
   * @constructor
   */
  _.DataMask001 = function() {
  };
  _.DataMask001.prototype.unmaskBitMatrix = function(bits, dimension) {
    for (var i = 0; i < dimension; i++) {
      for (var j = 0; j < dimension; j++) {
        if (this.isMasked(i, j)) {
          bits.flip(j, i);
        }
      }
    }
  };
  _.DataMask001.prototype.isMasked = function(i, j) {
    return (i & 0x01) == 0;
  };

  /**
   * @constructor
   */
  _.DataMask010 = function() {
  };
  _.DataMask010.prototype.unmaskBitMatrix = function(bits, dimension) {
    for (var i = 0; i < dimension; i++) {
      for (var j = 0; j < dimension; j++) {
        if (this.isMasked(i, j)) {
          bits.flip(j, i);
        }
      }
    }
  };
  _.DataMask010.prototype.isMasked = function(i, j) {
    return j % 3 == 0;
  };

  /**
   * @constructor
   */
  _.DataMask011 = function() {

  };
  _.DataMask011.prototype.unmaskBitMatrix = function(bits, dimension) {
    for (var i = 0; i < dimension; i++) {
      for (var j = 0; j < dimension; j++) {
        if (this.isMasked(i, j)) {
          bits.flip(j, i);
        }
      }
    }
  };
  _.DataMask011.prototype.isMasked = function(i, j) {
    return (i + j) % 3 == 0;
  };


  /**
   * @constructor
   */
  _.DataMask100 = function() {
  };
  _.DataMask100.prototype.unmaskBitMatrix = function(bits, dimension) {
    for (var i = 0; i < dimension; i++) {
      for (var j = 0; j < dimension; j++) {
        if (this.isMasked(i, j)) {
          bits.flip(j, i);
        }
      }
    }
  };
  _.DataMask100.prototype.isMasked = function(i, j) {
    return (((URShift(i, 1)) + (j / 3)) & 0x01) == 0;
  };

  /**
   * @constructor
   */
  _.DataMask101 = function() {
  };

  _.DataMask101.prototype.unmaskBitMatrix = function(bits, dimension) {
    for (var i = 0; i < dimension; i++) {
      for (var j = 0; j < dimension; j++) {
        if (this.isMasked(i, j)) {
          bits.flip(j, i);
        }
      }
    }
  };

  _.DataMask101.prototype.isMasked = function(i, j) {
    var temp = i * j;
    return (temp & 0x01) + (temp % 3) == 0;
  };

  /**
   * @constructor
   */
  _.DataMask110 = function() {
  };
  _.DataMask110.prototype.unmaskBitMatrix = function(bits, dimension) {
    for (var i = 0; i < dimension; i++) {
      for (var j = 0; j < dimension; j++) {
        if (this.isMasked(i, j)) {
          bits.flip(j, i);
        }
      }
    }
  };
  _.DataMask110.prototype.isMasked = function(i, j) {
    var temp = i * j;
    return (((temp & 0x01) + (temp % 3)) & 0x01) == 0;
  };

  /**
   * @constructor
   */
  _.DataMask111 = function() {
  };
  _.DataMask111.prototype.unmaskBitMatrix = function(bits, dimension) {
    for (var i = 0; i < dimension; i++) {
      for (var j = 0; j < dimension; j++) {
        if (this.isMasked(i, j)) {
          bits.flip(j, i);
        }
      }
    }
  };
  _.DataMask111.prototype.isMasked = function(i, j) {
    return ((((i + j) & 0x01) + ((i * j) % 3)) & 0x01) == 0;
  };

  /**
   * @type {Array.<!_.DataMaskInterface>}
   * @private
   */
  _.DATA_MASKS_ = new Array(new _.DataMask000(), new _.DataMask001(),
    new _.DataMask010(), new _.DataMask011(), new _.DataMask100(),
    new _.DataMask101(),
    new _.DataMask110(), new _.DataMask111());

});

