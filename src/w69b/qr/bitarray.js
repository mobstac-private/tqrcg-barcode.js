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

goog.provide('w69b.qr.BitArray');

goog.scope(function() {
/**
   * <p>A simple, fast array of bits, represented compactly by an array of ints
   * internally.</p>
   * @param {number=} opt_size size, defaults to 0.
   * @constructor
   * @author Sean Owen
   */
  w69b.qr.BitArray = function(opt_size) {
    /**
     * @private
     * @type {number}
     */
    this.size_ = opt_size || 0;
    /**
     * @type {Int32Array} bits.
     * @private
     */
    this.bits_ = w69b.qr.BitArray.makeArray(this.size_);
  };
  var _ = w69b.qr.BitArray;
  var pro = _.prototype;

  _.numberOfTrailingZeros = function(i) {
    // HD, Figure 5-14
    var y;
    if (i == 0) return 32;
    var n = 31;
    y = i << 16; if (y != 0) { n = n - 16; i = y; }
    y = i << 8; if (y != 0) { n = n - 8; i = y; }
    y = i << 4; if (y != 0) { n = n - 4; i = y; }
    y = i << 2; if (y != 0) { n = n - 2; i = y; }
    return n - ((i << 1) >>> 31);
  };

  pro.getSize = function() {
    return this.size_;
  };

  pro.getSizeInBytes = function() {
    return (this.size_ + 7) >> 3;
  };

  pro.ensureCapacity = function(size) {
    if (size > this.bits_.length << 5) {
      var newBits = _.makeArray(size);
      newBits.set(this.bits_, 0);
      this.bits_ = newBits;
    }
  };

  /**
   * @param {number} i bit to get.
   * @return {boolean} true iff bit i is set.
   */
  pro.get = function(i) {
    return (this.bits_[i >> 5] & (1 << (i & 0x1F))) != 0;
  };

  /**
   * Sets bit i.
   * @param {number} i bit to set.
   */
  pro.set = function(i) {
    this.bits_[i >> 5] |= 1 << (i & 0x1F);
  };

  /**
   * Flips bit i.
   *
   * @param {number} i bit to set.
   */
  pro.flip = function(i) {
    this.bits_[i >> 5] ^= 1 << (i & 0x1F);
  };

  /**
   * @param {number} from first bit to check.
   * @return {number} index of first bit that is set, starting from the given
   * index, or size if none are set at or beyond this given index.
   * @see #getNextUnset(int)
   */
  pro.getNextSet = function(from) {
    var size = this.size_;
    if (from >= size) {
      return size;
    }
    var bitsOffset = from >> 5;
    var currentBits = this.bits_[bitsOffset];
    // mask off lesser bits first
    currentBits &= ~((1 << (from & 0x1F)) - 1);
    while (currentBits == 0) {
      if (++bitsOffset == this.bits_.length) {
        return size;
      }
      currentBits = this.bits_[bitsOffset];
    }
    var result = (bitsOffset << 5) + _.numberOfTrailingZeros(currentBits);
    return result > size ? size : result;
  };

  /**
   * @see #getNextSet(int)
   */
  pro.getNextUnset = function(from) {
    var size = this.size_;
    if (from >= size) {
      return size;
    }
    var bitsOffset = from >> 5;
    var currentBits = ~this.bits_[bitsOffset];
    // mask off lesser bits first
    currentBits &= ~((1 << (from & 0x1F)) - 1);
    while (currentBits == 0) {
      if (++bitsOffset == this.bits_.length) {
        return size;
      }
      currentBits = ~this.bits_[bitsOffset];
    }
    var result = (bitsOffset << 5) + _.numberOfTrailingZeros(currentBits);
    return result > size ? size : result;
  };

  /**
   * Sets a block of 32 bits, starting at bit i.
   *
   * @param {number} i first bit to set.
   * @param {number} newBits the new value of the next 32 bits. Note again that
   * the least-significant bit corresponds to bit i, the next-least-significant
   * to i+1, and so on.
   */
  pro.setBulk = function(i, newBits) {
    this.bits_[i >> 5] = newBits;
  };

  /**
   * Sets a range of bits.
   *
   * @param {number} start start of range, inclusive.
   * @param {number} end end of range, exclusive.
   */
  pro.setRange = function(start, end) {
    if (end < start) {
      throw new Error();
    }
    if (end == start) {
      return;
    }
    // will be easier to treat this as the last actually set bit -- inclusive
    end--;
    var firstInt = start >> 5;
    var lastInt = end >> 5;
    for (var i = firstInt; i <= lastInt; i++) {
      var firstBit = i > firstInt ? 0 : start & 0x1F;
      var lastBit = i < lastInt ? 31 : end & 0x1F;
      var mask;
      if (firstBit == 0 && lastBit == 31) {
        mask = -1;
      } else {
        mask = 0;
        for (var j = firstBit; j <= lastBit; j++) {
          mask |= 1 << j;
        }
      }
      this.bits_[i] |= mask;
    }
  };

  /**
   * Clears all bits (sets to false).
   */
  pro.clear = function() {
    var max = this.bits_.length;
    for (var i = 0; i < max; i++) {
      this.bits_[i] = 0;
    }
  };

  /**
   * Efficient method to check if a range of bits is set, or not set.
   *
   * @param {number} start start of range, inclusive.
   * @param {number} end end of range, exclusive.
   * @param {boolean} value if true, checks that bits in range are set,
   * otherwise checks that they are not set.
   * @return {boolean} true iff all bits are set or not set in range, according
   * to value argument.
   */
  pro.isRange = function(start, end, value) {
    if (end < start) {
      throw new Error();
    }
    if (end == start) {
      return true; // empty range matches
    }
    // will be easier to treat this as the last actually set bit -- inclusive
    end--;
    var firstInt = start >> 5;
    var lastInt = end >> 5;
    for (var i = firstInt; i <= lastInt; i++) {
      var firstBit = i > firstInt ? 0 : start & 0x1F;
      var lastBit = i < lastInt ? 31 : end & 0x1F;
      var mask;
      if (firstBit == 0 && lastBit == 31) {
        mask = -1;
      } else {
        mask = 0;
        for (var j = firstBit; j <= lastBit; j++) {
          mask |= 1 << j;
        }
      }

      // Return false if we're looking for 1s and the masked bits[i] isn't all
      // 1s (that is, equals the mask, or we're looking for 0s and the masked
      // portion is not all 0s
      if ((this.bits_[i] & mask) != (value ? mask : 0)) {
        return false;
      }
    }
    return true;
  };

  pro.appendBit = function(bit) {
    this.ensureCapacity(this.size_ + 1);
    if (bit) {
      this.bits_[this.size_ >> 5] |= 1 << (this.size_ & 0x1F);
    }
    this.size_++;
  };

  /**
   * Appends the least-significant this.bits_, from value, in order from
   * most-significant to least-significant. For example, appending 6 this.bits_
   * from 0x000001E will append the this.bits_ 0, 1, 1, 1, 1, 0 in that order.
   */
  pro.appendBits = function(value, numBits) {
    if (numBits < 0 || numBits > 32) {
      throw new Error();
    }
    this.ensureCapacity(this.size_ + numBits);
    for (var numBitsLeft = numBits; numBitsLeft > 0; numBitsLeft--) {
      this.appendBit(((value >> (numBitsLeft - 1)) & 0x01) == 1);
    }
  };

  pro.appendBitArray = function(other) {
    var otherSize = other.size_;
    this.ensureCapacity(this.size_ + otherSize);
    for (var i = 0; i < otherSize; i++) {
      this.appendBit(other.get(i));
    }
  };

  /**
   * @param {w69b.qr.BitArray} other other.
   */
  pro.xor = function(other) {
    if (this.bits_.length != other.bits_.length) {
      throw new Error();
    }
    for (var i = 0; i < this.bits_.length; i++) {
      // The last byte could be incomplete (i.e. not have 8 this.bits_ in
      // it) but there is no problem since 0 XOR 0 == 0.
      this.bits_[i] ^= other.bits_[i];
    }
  };

  /**
   *
   * @param {number} bitOffset first bit to start writing.
   * @param {Array} array array to write varo. Bytes are written
   * most-significant byte first. This is the opposite of the varernal
   * representation, which is * exposed by {@link #getBitArray()}.
   * @param {number} offset position in array to start writing.
   * @param {number} numBytes how many bytes to write.
   */
  pro.toBytes = function(bitOffset, array, offset, numBytes) {
    for (var i = 0; i < numBytes; i++) {
      var theByte = 0;
      for (var j = 0; j < 8; j++) {
        if (this.get(bitOffset)) {
          theByte |= 1 << (7 - j);
        }
        bitOffset++;
      }
      array[offset + i] = theByte;
    }
  };

  /**
   * @return {Int32Array} array of vars. The first element holds the first 32
   * bits, and the least significant bit is bit 0.
   */
  pro.getBitArray = function() {
    return this.bits_;
  };

  /**
   * Reverses all bits in the array.
   */
  pro.reverse = function() {
    var newBits = new Int32Array(this.bits_.length);
    var size = this.size_;
    for (var i = 0; i < size; i++) {
      if (this.get(size - i - 1)) {
        newBits[i >> 5] |= 1 << (i & 0x1F);
      }
    }
    this.bits_ = newBits;
  };

  _.makeArray = function(size) {
    return new Int32Array((size + 31) >> 5);
  };

  pro.toString = function() {
    var result = [];
    for (var i = 0; i < this.size_; i++) {
      if ((i & 0x07) == 0) {
        result.push(' ');
      }
      result.push(this.get(i) ? 'X' : '.');
    }
    return result.join('');
  };

});

