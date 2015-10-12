// javascript (closure) port (c) 2013 Manuel Braun (mb@w69b.com)
/*
 * Ported to js by Manuel Braun
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

goog.provide('w69b.qr.BitSource');

goog.scope(function() {
  /** <p>This provides an easy abstraction to read bits at a time from a
   * sequence of bytes, where the number of bits read is not often a multiple
   * of 8.</p>
   *
   * <p>This class is thread-safe but not reentrant -- unless the caller
   * modifies the bytes array it passed in, in which case all bets are off.</p>
   *
   * @param {Array.<number>} bytes bytes bytes from which this will read bits.
   * Bits will be read from the first byte first.  Bits are read within a byte
   * from most-significant to least-significant bit.  @constructor
   * @constructor
   */
  w69b.qr.BitSource = function(bytes) {
    this.bytes_ = bytes;
    this.byteOffset_ = 0;
    this.bitOffset_ = 0;
  };
  var BitSource = w69b.qr.BitSource;
  var pro = BitSource.prototype;

  /**
   * @return {number} index of next bit in current byte which would be read by
   * the next call to readBits().
   */
  pro.getBitOffset = function() {
    return this.bitOffset_;
  };

  /**
  * @return {number} index of next byte in input byte array which would be read
  * by the next call to readBits().
   */
  pro.getByteOffset = function() {
    return this.byteOffset_;
  };

  /**
   * @param {number} numBits number of bits to read.  @return {number} int
   * representing the bits read. The bits will appear as the least-significant
   * bits of the int.
   */
  pro.readBits = function(numBits) {
    if (numBits < 1 || numBits > 32 || numBits > this.available()) {
      throw new Error();
    }

    var result = 0;

    // First, read remainder from current byte
    if (this.bitOffset_ > 0) {
      var bitsLeft = 8 - this.bitOffset_;
      var toRead = numBits < bitsLeft ? numBits : bitsLeft;
      var bitsToNotRead = bitsLeft - toRead;
      var mask = (0xFF >> (8 - toRead)) << bitsToNotRead;
      result = (this.bytes_[this.byteOffset_] & mask) >> bitsToNotRead;
      numBits -= toRead;
      this.bitOffset_ += toRead;
      if (this.bitOffset_ == 8) {
        this.bitOffset_ = 0;
        this.byteOffset_++;
      }
    }

    // Next read whole bytes
    if (numBits > 0) {
      while (numBits >= 8) {
        result = (result << 8) | (this.bytes_[this.byteOffset_] & 0xFF);
        this.byteOffset_++;
        numBits -= 8;
      }

      // Finally read a partial byte
      if (numBits > 0) {
        var bitsToNotRead = 8 - numBits;
        var mask = (0xFF >> bitsToNotRead) << bitsToNotRead;
        result = (result << numBits) |
          ((this.bytes_[this.byteOffset_] & mask) >> bitsToNotRead);
        this.bitOffset_ += numBits;
      }
    }
    return result;
  };

  /**
   * @return {number} number of bits that can be read successfully.
   */
  pro.available = function() {
    return 8 * (this.bytes_.length - this.byteOffset_) - this.bitOffset_;
  };

});
