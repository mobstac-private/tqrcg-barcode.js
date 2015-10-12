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

goog.provide('w69b.qr.DecodedBitStreamParser');
goog.require('goog.string.StringBuffer');
goog.require('w69b.qr.BitSource');
goog.require('w69b.qr.CharacterSetECI');
goog.require('w69b.qr.FormatError');
goog.require('w69b.qr.Mode');
goog.require('w69b.qr.ModeEnum');
goog.require('w69b.qr.stringutils');

goog.scope(function() {
  var _ = w69b.qr.DecodedBitStreamParser;
  var BitSource = w69b.qr.BitSource;
  var Mode = w69b.qr.Mode;
  var ModeEnum = w69b.qr.ModeEnum;
  var StringBuffer = goog.string.StringBuffer;
  var stringutils = w69b.qr.stringutils;
  var FormatError = w69b.qr.FormatError;
  var CharacterSetECI = w69b.qr.CharacterSetECI;

  /**
   * <p>QR Codes can encode text as bits in one of several modes, and can use
   * multiple modes in one QR Code. This class decodes the bits back into
   * text.</p>
   *
   * <p>See ISO 18004:2006, 6.4.3 - 6.4.7</p>
   *
   * @author Sean Owen
   */

  /**
   * See ISO 18004:2006, 6.4.4 Table 5
   */
  _.ALPHANUMERIC_CHARS = [
    '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B',
    'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N',
    'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
    ' ', '$', '%', '*', '+', '-', '.', '/', ':'
  ];
  _.GB2312_SUBSET = 1;


  /**
   * @param {Array.<number>} bytes byte blocks.
   * @param {w69b.qr.Version} version qr code version.
   * @param {w69b.qr.ErrorCorrectionLevel} ecLevel error correction level.
   * @return {string} decoded string.
   */
  _.decode = function(bytes, version, ecLevel) {
    var bits = new BitSource(bytes);
    var result = new StringBuffer();
    /**
     * @type {Array.<number>}
     */
    var byteSegments = [];
    var fc1InEffect = false;
    var mode;
    var currentCharacterSet = null;
    do {
      // While still another segment to read...
      if (bits.available() < 4) {
        // OK, assume we're done. Really, a TERMINATOR mode should have been
        // recorded here
        mode = ModeEnum.TERMINATOR;
      } else {
        mode = Mode.forBits(bits.readBits(4)); // mode is encoded by 4 bits
      }
      if (mode != ModeEnum.TERMINATOR) {
        if (mode == ModeEnum.FNC1_FIRST_POSITION ||
          mode == ModeEnum.FNC1_SECOND_POSITION) {
          // We do little with FNC1 except alter the parsed result a bit
          // according to the spec
          fc1InEffect = true;
        } else if (mode == ModeEnum.STRUCTURED_APPEND) {
          if (bits.available() < 16) {
            throw new FormatError();  // FormatException.getFormatInstance();
          }
          // not really supported; all we do is ignore it Read next 8 bits
          // (symbol sequence #) and 8 bits (parity data), then continue
          bits.readBits(16);
        } else if (mode == ModeEnum.ECI) {
          // Count doesn't apply to ECI
          var value = _.parseECIValue(bits);
          currentCharacterSet = CharacterSetECI.getName(value);
          if (currentCharacterSet == null)
            throw new FormatError();
        } else {
          // First handle Hanzi mode which does not start with character count
          if (mode == ModeEnum.HANZI) {
            //chinese mode contains a sub set indicator right after mode
            //indicator
            var subset = bits.readBits(4);
            var countHanzi = bits.readBits(
              mode.getCharacterCountBits(version));
            if (subset == _.GB2312_SUBSET) {
              _.decodeHanziSegment(bits, result, countHanzi);
            }
          } else {
            // "Normal" QR code modes:
            // How many characters will follow, encoded in this mode?
            var count = bits.readBits(mode.getCharacterCountBits(version));
            if (mode == ModeEnum.NUMERIC) {
              _.decodeNumericSegment(bits, result, count);
            } else if (mode == ModeEnum.ALPHANUMERIC) {
              _.decodeAlphanumericSegment(bits, result, count, fc1InEffect);
            } else if (mode == ModeEnum.BYTE) {
              _.decodeByteSegment(bits, result, count,
                currentCharacterSet, byteSegments);
            } else if (mode == ModeEnum.KANJI) {
              _.decodeKanjiSegment(bits, result, count);
            } else {
              throw new FormatError();  //FormatException.getFormatInstance();
            }
          }
        }
      }
    } while (mode != ModeEnum.TERMINATOR);

    return result.toString();
  };

  /**
   * See specification GBT 18284-2000
   * @param {BitSource} bits bits.
   * @param {StringBuffer} result string buffer.
   * @param {number} count bytes to decode.
   */
  _.decodeHanziSegment = function(bits, result, count) {
    // Don't crash trying to read more bits than we have available.
    if (count * 13 > bits.available()) {
      throw new FormatError();  // FormatException.getFormatInstance();
    }

    // Each character will require 2 bytes. Read the characters as 2-byte pairs
    // and decode as GB2312 afterwards
    var buffer = new Array(2 * count);
    var offset = 0;
    while (count > 0) {
      // Each 13 bits encodes a 2-byte character
      var twoBytes = bits.readBits(13);
      var assembledTwoBytes = ((twoBytes / 0x060) << 8) | (twoBytes % 0x060);
      if (assembledTwoBytes < 0x003BF) {
        // In the 0xA1A1 to 0xAAFE range
        assembledTwoBytes += 0x0A1A1;
      } else {
        // In the 0xB0A1 to 0xFAFE range
        assembledTwoBytes += 0x0A6A1;
      }
      buffer[offset] = ((assembledTwoBytes >> 8) & 0xFF);
      buffer[offset + 1] = (assembledTwoBytes & 0xFF);
      offset += 2;
      count--;
    }

    result.append(stringutils.bytesToString(buffer, 'GB2312'));
    // result.append(new String(buffer, StringUtils.GB2312));
  };

  /**
   * @param {BitSource} bits bits.
   * @param {StringBuffer} result string buffer.
   * @param {number} count bytes to decode.
   */
  _.decodeKanjiSegment = function(bits, result, count) {
    // Don't crash trying to read more bits than we have available.
    if (count * 13 > bits.available()) {
      throw new FormatError();
    }

    // Each character will require 2 bytes. Read the characters as 2-byte pairs
    // and decode as Shift_JIS afterwards
    var buffer = new Array(2 * count);
    var offset = 0;
    while (count > 0) {
      // Each 13 bits encodes a 2-byte character
      var twoBytes = bits.readBits(13);
      var assembledTwoBytes = ((twoBytes / 0x0C0) << 8) | (twoBytes % 0x0C0);
      if (assembledTwoBytes < 0x01F00) {
        // In the 0x8140 to 0x9FFC range
        assembledTwoBytes += 0x08140;
      } else {
        // In the 0xE040 to 0xEBBF range
        assembledTwoBytes += 0x0C140;
      }
      buffer[offset] = (assembledTwoBytes >> 8);
      buffer[offset + 1] = assembledTwoBytes;
      offset += 2;
      count--;
    }
    // Shift_JIS may not be supported in some environments:
    result.append(stringutils.bytesToString(buffer, 'SJIS'));
  };

  /**
   * @param {BitSource} bits bits.
   * @param {StringBuffer} result string buffer.
   * @param {number} count bytes to decode.
   * @param {?string} characterSetEciName character set eci name.
   * @param {Array.<number>} byteSegments raw bytes.
   */
  _.decodeByteSegment = function(bits, result, count,
                                 characterSetEciName, byteSegments) {
    // Don't crash trying to read more bits than we have available.
    if (count << 3 > bits.available()) {
      throw new FormatError();  //FormatException.getFormatInstance();
    }

    var readBytes = new Array(count);
    for (var i = 0; i < count; i++) {
      readBytes[i] = bits.readBits(8);
    }
    // var encoding = stringutils.guessEncoding(readBytes);
    // TODO: We cannot decode non-unicode strings yet.
    var encoding;
    if (!characterSetEciName) {
      // The spec isn't clear on this mode; see
      // section 6.4.5: t does not say which encoding to assuming
      // upon decoding. I have seen ISO-8859-1 used as well as
      // Shift_JIS -- without anything like an ECI designator to
      // give a hint.
      encoding = stringutils.guessEncoding(readBytes);
    } else {
      encoding = characterSetEciName;
    }
    result.append(stringutils.bytesToString(readBytes, encoding));
    byteSegments.push(readBytes);
  };

  /**
   * @param {number} value character.
   * @return {string} char.
   */
  _.toAlphaNumericChar = function(value) {
    if (value >= _.ALPHANUMERIC_CHARS.length) {
      throw new FormatError();  // FormatException.getFormatInstance();
    }
    return _.ALPHANUMERIC_CHARS[Math.floor(value)];
  };

  /**
   * @param {BitSource} bits bits.
   * @param {StringBuffer} result string buffer.
   * @param {number} count bytes to decode.
   * @param {boolean} fc1InEffect flag.
   */
  _.decodeAlphanumericSegment = function(bits, result, count, fc1InEffect) {
    // Read two characters at a time
    var start = result.getLength();
    while (count > 1) {
      if (bits.available() < 11) {
        throw new FormatError();  // throw FormatException.getFormatInstance();
      }
      var nextTwoCharsBits = bits.readBits(11);
      result.append(_.toAlphaNumericChar(nextTwoCharsBits / 45));
      result.append(_.toAlphaNumericChar(nextTwoCharsBits % 45));
      count -= 2;
    }
    if (count == 1) {
      // special case: one character left
      if (bits.available() < 6) {
        throw new FormatError();  // FormatException.getFormatInstance();
      }
      result.append(_.toAlphaNumericChar(bits.readBits(6)));
    }
    // See section 6.4.8.1, 6.4.8.2
    // if (fc1InEffect) {
    //   // We need to massage the result a bit if in an FNC1 mode:
    //   // TODO: subclass stringbuffer and add required methods.
    //   for (var i = start; i < result.getLength(); i++) {
    //     if (result.charAt(i) == '%') {
    //       if (i < result.length() - 1 && result.charAt(i + 1) == '%') {
    //         // %% is rendered as %
    //         result.deleteCharAt(i + 1);
    //       } else {
    //         // In alpha mode, % should be converted to FNC1 separator 0x1D
    //         result.setCharAt(i, 0x1D);
    //       }
    //     }
    //   }
    // }
  };

  /**
   * @param {BitSource} bits bits.
   * @param {StringBuffer} result string buffer.
   * @param {number} count bytes to decode.
   */
  _.decodeNumericSegment = function(bits, result, count) {
    // Read three digits at a time
    while (count >= 3) {
      // Each 10 bits encodes three digits
      if (bits.available() < 10) {
        throw new FormatError();  // FormatException.getFormatInstance();
      }
      var threeDigitsBits = bits.readBits(10);
      if (threeDigitsBits >= 1000) {
        throw new FormatError();  // FormatException.getFormatInstance();
      }
      result.append(_.toAlphaNumericChar(threeDigitsBits / 100));
      result.append(_.toAlphaNumericChar((threeDigitsBits / 10) % 10));
      result.append(_.toAlphaNumericChar(threeDigitsBits % 10));
      count -= 3;
    }
    if (count == 2) {
      // Two digits left over to read, encoded in 7 bits
      if (bits.available() < 7) {
        throw new FormatError();  // FormatException.getFormatInstance();
      }
      var twoDigitsBits = bits.readBits(7);
      if (twoDigitsBits >= 100) {
        throw new FormatError();  // FormatException.getFormatInstance();
      }
      result.append(_.toAlphaNumericChar(twoDigitsBits / 10));
      result.append(_.toAlphaNumericChar(twoDigitsBits % 10));
    } else if (count == 1) {
      // One digit left over to read
      if (bits.available() < 4) {
        throw new FormatError();  // FormatException.getFormatInstance();
      }
      var digitBits = bits.readBits(4);
      if (digitBits >= 10) {
        throw new FormatError();  // FormatException.getFormatInstance();
      }
      result.append(_.toAlphaNumericChar(digitBits));
    }
  };

  _.parseECIValue = function(bits) {
    var firstByte = bits.readBits(8);
    if ((firstByte & 0x80) == 0) {
      // just one byte
      return firstByte & 0x7F;
    }
    if ((firstByte & 0xC0) == 0x80) {
      // two bytes
      var secondByte = bits.readBits(8);
      return ((firstByte & 0x3F) << 8) | secondByte;
    }
    if ((firstByte & 0xE0) == 0xC0) {
      // three bytes
      var secondThirdBytes = bits.readBits(16);
      return ((firstByte & 0x1F) << 16) | secondThirdBytes;
    }
    throw new FormatError();  // FormatException.getFormatInstance();
  };

});

