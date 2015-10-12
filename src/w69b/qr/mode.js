// javascript (closure) port (c) 2013 Manuel Braun (mb@w69b.com)
/*
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

goog.provide('w69b.qr.Mode');
goog.provide('w69b.qr.ModeEnum');

goog.scope(function() {
  /**
   * <p>See ISO 18004:2006, 6.4.1, Tables 2 and 3. This enum encapsulates the
   * various modes in which data can be encoded to bits in the QR code
   * standard.</p>
   *
   * @author Sean Owen
   */
  /**
   *
   * @param {Array.<number>} characterCountBitsForVersions nodoc.
   * @param {number} bits nodoc.
   * @param {string=} opt_name name for testing.
   * @constructor
   */
  w69b.qr.Mode = function(characterCountBitsForVersions, bits, opt_name) {
    this.characterCountBitsForVersions = characterCountBitsForVersions;
    this.bits = bits;
    this.name_ = opt_name || 'NONAME';
  };
  var Mode = w69b.qr.Mode;
  var pro = Mode.prototype;


  /** @enum {Mode} */

  w69b.qr.ModeEnum = {
    // Not really a mode...
    TERMINATOR: new Mode([0, 0, 0], 0x00, 'TERMINATOR'),
    NUMERIC: new Mode([10, 12, 14], 0x01, 'NUMERIC'),
    ALPHANUMERIC: new Mode([9, 11, 13], 0x02, 'ALPHANUMERIC'),
    // Not supported
    STRUCTURED_APPEND: new Mode([0, 0, 0], 0x03, 'STRUCTURED_APPEND'),
    BYTE: new Mode([8, 16, 16], 0x04, 'BYTE'),
    ECI: new Mode([0, 0, 0], 0x07, 'ECI'), // character counts don't apply
    KANJI: new Mode([8, 10, 12], 0x08, 'KANJI'),
    FNC1_FIRST_POSITION: new Mode([0, 0, 0], 0x05, 'FNC1_FIRST_POSITION'),
    FNC1_SECOND_POSITION: new Mode([0, 0, 0], 0x09, 'FNC1_SECOND_POSITION'),
    /** See GBT 18284-2000; "Hanzi" is a transliteration of this mode name. */
    HANZI: new Mode([8, 10, 12], 0x0D, 'HANZI')
  };
  var ModeEnum = w69b.qr.ModeEnum;


  /**
   * @param {w69b.qr.Version} version version in question.
   * @return {number} number of bits used, in this QR Code symbol {@link Version} , to
   * encode the count of characters that will follow encoded in this Mode.
   */
  pro.getCharacterCountBits = function(version) {
    var number = version.versionNumber;
    var offset;
    if (number <= 9) {
      offset = 0;
    } else if (number <= 26) {
      offset = 1;
    } else {
      offset = 2;
    }
    return this.characterCountBitsForVersions[offset];
  };

  pro.getBits = function() {
    return this.bits;
  };

  /**
   * @return {string} debug string.
   */
  pro.toString = function() {
    return this.name_;
  };


  /**
   * @param {number} bits four bits encoding a QR Code data mode.
   * @return {Mode} Mode encoded by these bits.
   */
  Mode.forBits = function(bits) {
    switch (bits) {
      case 0x0:
        return ModeEnum.TERMINATOR;
      case 0x1:
        return ModeEnum.NUMERIC;
      case 0x2:
        return ModeEnum.ALPHANUMERIC;
      case 0x3:
        return ModeEnum.STRUCTURED_APPEND;
      case 0x4:
        return ModeEnum.BYTE;
      case 0x5:
        return ModeEnum.FNC1_FIRST_POSITION;
      case 0x7:
        return ModeEnum.ECI;
      case 0x8:
        return ModeEnum.KANJI;
      case 0x9:
        return ModeEnum.FNC1_SECOND_POSITION;
      case 0xD:
        // 0xD is defined in GBT 18284-2000, may not be supported in foreign
        // country
        return ModeEnum.HANZI;
      default:
        throw new Error();
    }
  };
});

