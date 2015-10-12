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
goog.provide('w69b.qr.BitMatrixParser');
goog.require('w69b.qr.DataMask');
goog.require('w69b.qr.FormatError');
goog.require('w69b.qr.FormatInformation');
goog.require('w69b.qr.Version');

goog.scope(function() {
  var FormatInformation = w69b.qr.FormatInformation;
  var Version = w69b.qr.Version;
  var DataMask = w69b.qr.DataMask;
  var FormatError = w69b.qr.FormatError;

  /**
   * @param {w69b.qr.BitMatrix} bitMatrix matrix.
   * @constructor
   */
  w69b.qr.BitMatrixParser = function(bitMatrix) {
    var dimension = bitMatrix.getHeight();
    if (dimension < 21 || (dimension & 0x03) != 1) {
      throw new FormatError();
    }
    this.bitMatrix = bitMatrix;
    /**
     * @type {w69b.qr.Version}
     */
    this.parsedVersion = null;
    /**
     * @type {w69b.qr.FormatInformation}
     */
    this.parsedFormatInfo = null;
  };
  var BitMatrixParser = w69b.qr.BitMatrixParser;
  var pro = BitMatrixParser.prototype;

  pro.copyBit = function(i, j, versionBits) {
    return this.bitMatrix.get(i,
      j) ? (versionBits << 1) | 0x1 : versionBits << 1;
  };

  /**
   * @return {!w69b.qr.FormatInformation} format information.
   */
  pro.readFormatInformation = function() {
    if (this.parsedFormatInfo != null) {
      return this.parsedFormatInfo;
    }

    // Read top-left format info bits
    var formatInfoBits = 0;
    for (var i = 0; i < 6; i++) {
      formatInfoBits = this.copyBit(i, 8, formatInfoBits);
    }
    // .. and skip a bit in the timing pattern ...
    formatInfoBits = this.copyBit(7, 8, formatInfoBits);
    formatInfoBits = this.copyBit(8, 8, formatInfoBits);
    formatInfoBits = this.copyBit(8, 7, formatInfoBits);
    // .. and skip a bit in the timing pattern ...
    for (var j = 5; j >= 0; j--) {
      formatInfoBits = this.copyBit(8, j, formatInfoBits);
    }

    this.parsedFormatInfo =
      FormatInformation.decodeFormatInformation(formatInfoBits);
    if (this.parsedFormatInfo != null) {
      return this.parsedFormatInfo;
    }

    // Hmm, failed. Try the top-right/bottom-left pattern
    var dimension = this.bitMatrix.getHeight();
    formatInfoBits = 0;
    var iMin = dimension - 8;
    for (var i = dimension - 1; i >= iMin; i--) {
      formatInfoBits = this.copyBit(i, 8, formatInfoBits);
    }
    for (var j = dimension - 7; j < dimension; j++) {
      formatInfoBits = this.copyBit(8, j, formatInfoBits);
    }

    this.parsedFormatInfo =
      FormatInformation.decodeFormatInformation(formatInfoBits);
    if (this.parsedFormatInfo != null) {
      return this.parsedFormatInfo;
    }
    throw new FormatError();
  };

  /**
   * @return {w69b.qr.Version} version.
   */
  pro.readVersion = function() {
    if (this.parsedVersion != null) {
      return this.parsedVersion;
    }

    var dimension = this.bitMatrix.getHeight();

    var provisionalVersion = (dimension - 17) >> 2;
    if (provisionalVersion <= 6) {
      return Version.getVersionForNumber(provisionalVersion);
    }

    // Read top-right version info: 3 wide by 6 tall
    var versionBits = 0;
    var ijMin = dimension - 11;
    for (var j = 5; j >= 0; j--) {
      for (var i = dimension - 9; i >= ijMin; i--) {
        versionBits = this.copyBit(i, j, versionBits);
      }
    }

    this.parsedVersion = Version.decodeVersionInformation(versionBits);
    if (this.parsedVersion != null &&
      this.parsedVersion.getDimensionForVersion() == dimension) {
      return this.parsedVersion;
    }

    // Hmm, failed. Try bottom left: 6 wide by 3 tall
    versionBits = 0;
    for (var i = 5; i >= 0; i--) {
      for (var j = dimension - 9; j >= ijMin; j--) {
        versionBits = this.copyBit(i, j, versionBits);
      }
    }

    this.parsedVersion = Version.decodeVersionInformation(versionBits);
    if (this.parsedVersion != null &&
      this.parsedVersion.getDimensionForVersion() == dimension) {
      return this.parsedVersion;
    }
    throw new FormatError();
  };

  pro.readCodewords = function() {

    var formatInfo = this.readFormatInformation();
    var version = this.readVersion();

    // Get the data mask for the format used in this QR Code. This will exclude
    // some bits from reading as we wind through the bit matrix.
    var dataMask = DataMask.forReference(formatInfo.dataMask);
    var dimension = this.bitMatrix.getHeight();
    dataMask.unmaskBitMatrix(this.bitMatrix, dimension);

    var functionPattern = version.buildFunctionPattern();

    var readingUp = true;
    var result = new Array(version.totalCodewords);
    var resultOffset = 0;
    var currentByte = 0;
    var bitsRead = 0;
    // Read columns in pairs, from right to left
    for (var j = dimension - 1; j > 0; j -= 2) {
      if (j == 6) {
        // Skip whole column with vertical alignment pattern;
        // saves time and makes the other code proceed more cleanly
        j--;
      }
      // Read alternatingly from bottom to top then top to bottom
      for (var count = 0; count < dimension; count++) {
        var i = readingUp ? dimension - 1 - count : count;
        for (var col = 0; col < 2; col++) {
          // Ignore bits covered by the function pattern
          if (!functionPattern.get(j - col, i)) {
            // Read a bit
            bitsRead++;
            currentByte <<= 1;
            if (this.bitMatrix.get(j - col, i)) {
              currentByte |= 1;
            }
            // If we've made a whole byte, save it off
            if (bitsRead == 8) {
              result[resultOffset++] = currentByte;
              bitsRead = 0;
              currentByte = 0;
            }
          }
        }
      }
      readingUp ^= true; // readingUp = !readingUp; // switch directions
    }
    if (resultOffset != version.totalCodewords) {
      throw new FormatError();
    }
    return result;
  };
});

