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

goog.require('w69b.qr.DecodedBitStreamParser');
goog.require('w69b.qr.Version');

var DecodedBitStreamParser = w69b.qr.DecodedBitStreamParser;
var Version = w69b.qr.Version;


define(['chai'], function(chai) {
  var assert = chai.assert;
  describe('DecodedBitStreamParser tests', function() {

    it('simple byte mode', function() {
      var builder = new BitSourceBuilder();
      builder.write(0x04, 4); // Byte mode
      builder.write(0x03, 8); // 3 bytes
      builder.write(0xF1, 8);
      builder.write(0xF2, 8);
      builder.write(0xF3, 8);
      var result = DecodedBitStreamParser.decode(builder.toByteArray(),
        Version.getVersionForNumber(1), null);
      assert.equal(result, '\u00f1\u00f2\u00f3');
    });

    it('sjis mode', function() {
      var builder = new BitSourceBuilder();
      builder.write(0x04, 4); // Byte mode
      builder.write(0x04, 8); // 4 bytes
      builder.write(0xA1, 8);
      builder.write(0xA2, 8);
      builder.write(0xA3, 8);
      builder.write(0xD0, 8);
      var result = DecodedBitStreamParser.decode(builder.toByteArray(),
        Version.getVersionForNumber(1), null);
      assert.equal(result, '\uff61\uff62\uff63\uff90');
    });

    it('testSimpleSJIS', function() {
      var builder = new BitSourceBuilder();
      builder.write(0x04, 4); // Byte mode
      builder.write(0x04, 8); // 4 bytes
      builder.write(0xA1, 8);
      builder.write(0xA2, 8);
      builder.write(0xA3, 8);
      builder.write(0xD0, 8);
      var result = DecodedBitStreamParser.decode(builder.toByteArray(),
        Version.getVersionForNumber(1), null, null);
      assert.equal('\uff61\uff62\uff63\uff90', result);
    });

    it('testECI', function() {
      var builder = new BitSourceBuilder();
      builder.write(0x07, 4); // ECI mode
      builder.write(0x02, 8); // ECI 2 = CP437 encoding
      builder.write(0x04, 4); // Byte mode
      builder.write(0x03, 8); // 3 bytes
      builder.write(0xA1, 8);
      builder.write(0xA2, 8);
      builder.write(0xA3, 8);
      var result = DecodedBitStreamParser.decode(builder.toByteArray(),
        Version.getVersionForNumber(1), null, null);
      assert.equal('\u00ed\u00f3\u00fa', result);
    });

    it('testHanzi', function() {
      var builder = new BitSourceBuilder();
      builder.write(0x0D, 4); // Hanzi mode
      builder.write(0x01, 4); // Subset 1 = GB2312 encoding
      builder.write(0x01, 8); // 1 characters
      builder.write(0x03C1, 13);
      var result = DecodedBitStreamParser.decode(builder.toByteArray(),
        Version.getVersionForNumber(1), null, null);
      assert.equal('\u963f', result);
    });

  });

  // TODO definitely need more tests here


  var BitSourceBuilder = function() {
    this.output = [];
    this.nextByte = 0;
    this.bitsLeftInNextByte = 8;
  };

  BitSourceBuilder.prototype.write = function(value, numBits) {
    if (numBits <= this.bitsLeftInNextByte) {
      this.nextByte <<= numBits;
      this.nextByte |= value;
      this.bitsLeftInNextByte -= numBits;
      if (this.bitsLeftInNextByte == 0) {
        this.output.push(this.nextByte);
        this.nextByte = 0;
        this.bitsLeftInNextByte = 8;
      }
    } else {
      var bitsToWriteNow = this.bitsLeftInNextByte;
      var numRestOfBits = numBits - bitsToWriteNow;
      var mask = 0xFF >> (8 - bitsToWriteNow);
      var valueToWriteNow = (value >>> numRestOfBits) & mask;
      this.write(valueToWriteNow, bitsToWriteNow);
      this.write(value, numRestOfBits);
    }
  };

  BitSourceBuilder.prototype.toByteArray = function() {
    if (this.bitsLeftInNextByte < 8) {
      this.write(0, this.bitsLeftInNextByte);
    }
    return this.output;
  };
});

