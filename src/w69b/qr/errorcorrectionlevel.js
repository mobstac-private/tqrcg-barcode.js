// javascript (closure) port (c) 2013 Manuel Braun (mb@w69b.com)
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

goog.provide('w69b.qr.ErrorCorrectionLevel');

goog.scope(function() {
  /**
   * See ISO 18004:2006, 6.5.1. This enum encapsulates the four error
   * correction levels defined by the QR code standard.
   *
   * @author Sean Owen
   * @author mb@w69b.com (Manuel Braun)
   *
   * @constructor
   */
  w69b.qr.ErrorCorrectionLevel = function(ordinal, bits, name) {
    this.ordinal = ordinal;
    this.bits = bits;
    this.name = name;
  };
  var ErrorCorrectionLevel = w69b.qr.ErrorCorrectionLevel;

  ErrorCorrectionLevel.L = new ErrorCorrectionLevel(0, 0x01, 'L');
  ErrorCorrectionLevel.M = new ErrorCorrectionLevel(1, 0x00, 'M');
  ErrorCorrectionLevel.Q = new ErrorCorrectionLevel(2, 0x03, 'Q');
  ErrorCorrectionLevel.H = new ErrorCorrectionLevel(3, 0x02, 'H');
  ErrorCorrectionLevel.FOR_BITS = [
    ErrorCorrectionLevel.M,
    ErrorCorrectionLevel.L,
    ErrorCorrectionLevel.H,
    ErrorCorrectionLevel.Q];

  /**
   * get by name.
   * @param {string} name one of 'L', 'M', 'Q', 'H';.
   * @return {ErrorCorrectionLevel} ec level or null if name is invalid.
   */
  ErrorCorrectionLevel.getByName = function(name) {
    var map = {'L': ErrorCorrectionLevel.L,
      'M': ErrorCorrectionLevel.M,
      'Q': ErrorCorrectionLevel.Q,
      'H': ErrorCorrectionLevel.H};
    if (map.hasOwnProperty(name)) {
      return map[name];
    } else {
      return null;
    }
  };

  var pro = ErrorCorrectionLevel.prototype;

  pro.getBits = function() {
    return this.bits;
  };

  /**
   * @return {string} debug string.
   */
  pro.toString = function() {
    return this.name;
  };

  /**
   * @param {number} bits int containing the two bits encoding a QR Code's
   * error correction level.
   * @return {!ErrorCorrectionLevel} representing the encoded error
   * correction level.
   */
  ErrorCorrectionLevel.forBits = function(bits) {
    if (bits < 0 || bits >= ErrorCorrectionLevel.FOR_BITS.length) {
      throw new Error();
    }
    return ErrorCorrectionLevel.FOR_BITS[bits];
  };


  goog.exportProperty(pro, 'toString', pro.toString);
});
