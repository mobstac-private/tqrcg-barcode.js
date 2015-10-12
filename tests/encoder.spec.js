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


/**
 * @author satorux@google.com (Satoru Takabayashi) - creator
 * @author mysen@google.com (Chris Mysen) - ported from C++
 * @author mb@w69b.com (Manuel Braun) - ported to js.
 */
define(['chai'], function(chai) {
  var assert = chai.assert;
  var Encoder = w69b.qr.encoder.Encoder;
  var ModeEnum = w69b.qr.ModeEnum;
  var ErrorCorrectionLevel = w69b.qr.ErrorCorrectionLevel;
  var EncodeHintType = w69b.qr.EncodeHintType;
  var BitArray = w69b.qr.BitArray;
  var WriterError = w69b.qr.WriterError;
  var stringutils = w69b.qr.stringutils;
  describe('EncoderTestCase', function() {

    it('testGetAlphanumericCode', function() {
      // The first ten code points are numbers.
      var i;
      var zeroCode = '0'.charCodeAt(0);
      for (i = 0; i < 10; ++i) {
        assert.equal(i, Encoder.getAlphanumericCode(zeroCode + i));
      }

      // The next 26 code points are capital alphabet letters.
      for (i = 10; i < 36; ++i) {
        assert.equal(i, Encoder.getAlphanumericCode(
          'A'.charCodeAt(0) + i - 10));
      }

      // Others are symbol letters
      assert.equal(36, Encoder.getAlphanumericCode(' '.charCodeAt(0)));
      assert.equal(37, Encoder.getAlphanumericCode('$'.charCodeAt(0)));
      assert.equal(38, Encoder.getAlphanumericCode('%'.charCodeAt(0)));
      assert.equal(39, Encoder.getAlphanumericCode('*'.charCodeAt(0)));
      assert.equal(40, Encoder.getAlphanumericCode('+'.charCodeAt(0)));
      assert.equal(41, Encoder.getAlphanumericCode('-'.charCodeAt(0)));
      assert.equal(42, Encoder.getAlphanumericCode('.'.charCodeAt(0)));
      assert.equal(43, Encoder.getAlphanumericCode('/'.charCodeAt(0)));
      assert.equal(44, Encoder.getAlphanumericCode(':'.charCodeAt(0)));

      // Should return -1 for other letters;
      assert.equal(-1, Encoder.getAlphanumericCode('a'.charCodeAt(0)));
      assert.equal(-1, Encoder.getAlphanumericCode('#'.charCodeAt(0)));
      assert.equal(-1, Encoder.getAlphanumericCode(0));
    });

    it('testChooseMode', function() {
      // Numeric mode.
      assert.strictEqual(ModeEnum.NUMERIC, Encoder.chooseMode('0'));
      assert.strictEqual(ModeEnum.NUMERIC, Encoder.chooseMode('0123456789'));
      // Alphanumeric mode.
      assert.strictEqual(ModeEnum.ALPHANUMERIC, Encoder.chooseMode('A'));
      assert.strictEqual(ModeEnum.ALPHANUMERIC, Encoder.chooseMode(
        '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:'));
      // 8-bit byte mode.
      assert.strictEqual(ModeEnum.BYTE, Encoder.chooseMode('a'));
      assert.strictEqual(ModeEnum.BYTE, Encoder.chooseMode('#'));
      assert.strictEqual(ModeEnum.BYTE, Encoder.chooseMode(''));
      // Kanji mode.  We used to use MODE_KANJI for these, but we stopped
      // doing that as we cannot distinguish Shift_JIS from other encodings
      // from data bytes alone.  See also comments in qrcode_encoder.h.

      // AIUE in Hiragana in Shift_JIS
      assert.strictEqual(ModeEnum.BYTE,
                 Encoder.chooseMode(
                   shiftJISString([0x8, 0xa, 0x8, 0xa, 0x8, 0xa, 0x8, 0xa6])));

      // Nihon in Kanji in Shift_JIS.
      assert.strictEqual(ModeEnum.BYTE, Encoder.chooseMode(
        shiftJISString([0x9, 0xf, 0x9, 0x7b])));

      // // Sou-Utsu-Byou in Kanji in Shift_JIS.
      assert.strictEqual(ModeEnum.BYTE, Encoder.chooseMode(shiftJISString(
        [0xe, 0x4, 0x9, 0x5, 0x9, 0x61])));
    });

    it('testEncode', function() {
      var qrCode = Encoder.encode('ABCDEF', ErrorCorrectionLevel.H);
      var expected =
        '<<\n' +
          ' mode: ALPHANUMERIC\n' +
          ' ecLevel: H\n' +
          ' version: 1\n' +
          ' maskPattern: 0\n' +
          ' matrix:\n' +
          ' 1 1 1 1 1 1 1 0 1 1 1 1 0 0 1 1 1 1 1 1 1\n' +
          ' 1 0 0 0 0 0 1 0 0 1 1 1 0 0 1 0 0 0 0 0 1\n' +
          ' 1 0 1 1 1 0 1 0 0 1 0 1 1 0 1 0 1 1 1 0 1\n' +
          ' 1 0 1 1 1 0 1 0 1 1 1 0 1 0 1 0 1 1 1 0 1\n' +
          ' 1 0 1 1 1 0 1 0 0 1 1 1 0 0 1 0 1 1 1 0 1\n' +
          ' 1 0 0 0 0 0 1 0 0 1 0 0 0 0 1 0 0 0 0 0 1\n' +
          ' 1 1 1 1 1 1 1 0 1 0 1 0 1 0 1 1 1 1 1 1 1\n' +
          ' 0 0 0 0 0 0 0 0 0 0 1 0 1 0 0 0 0 0 0 0 0\n' +
          ' 0 0 1 0 1 1 1 0 1 1 0 0 1 1 0 0 0 1 0 0 1\n' +
          ' 1 0 1 1 1 0 0 1 0 0 0 1 0 1 0 0 0 0 0 0 0\n' +
          ' 0 0 1 1 0 0 1 0 1 0 0 0 1 0 1 0 1 0 1 1 0\n' +
          ' 1 1 0 1 0 1 0 1 1 1 0 1 0 1 0 0 0 0 0 1 0\n' +
          ' 0 0 1 1 0 1 1 1 1 0 0 0 1 0 1 0 1 1 1 1 0\n' +
          ' 0 0 0 0 0 0 0 0 1 0 0 1 1 1 0 1 0 1 0 0 0\n' +
          ' 1 1 1 1 1 1 1 0 0 0 1 0 1 0 1 1 0 0 0 0 1\n' +
          ' 1 0 0 0 0 0 1 0 1 1 1 1 0 1 0 1 1 1 1 0 1\n' +
          ' 1 0 1 1 1 0 1 0 1 0 1 1 0 1 0 1 0 0 0 0 1\n' +
          ' 1 0 1 1 1 0 1 0 0 1 1 0 1 1 1 1 0 1 0 1 0\n' +
          ' 1 0 1 1 1 0 1 0 1 0 0 0 1 0 1 0 1 1 1 0 1\n' +
          ' 1 0 0 0 0 0 1 0 0 1 1 0 1 1 0 1 0 0 0 1 1\n' +
          ' 1 1 1 1 1 1 1 0 0 0 0 0 0 0 0 0 1 0 1 0 1\n' +
          '>>\n';
      assert.equal(expected, qrCode.toString());
    });

    it('testSimpleUTF8ECI', function() {
      var hints = {};
      hints[EncodeHintType.CHARACTER_SET] = 'UTF-8';
      hints[EncodeHintType.FORCE_ADD_ECI] = true;
      var qrCode = Encoder.encode('hello', ErrorCorrectionLevel.H, hints);
      var expected =
        '<<\n' +
          ' mode: BYTE\n' +
          ' ecLevel: H\n' +
          ' version: 1\n' +
          ' maskPattern: 3\n' +
          ' matrix:\n' +
          ' 1 1 1 1 1 1 1 0 0 0 0 0 0 0 1 1 1 1 1 1 1\n' +
          ' 1 0 0 0 0 0 1 0 0 0 1 0 1 0 1 0 0 0 0 0 1\n' +
          ' 1 0 1 1 1 0 1 0 0 1 0 1 0 0 1 0 1 1 1 0 1\n' +
          ' 1 0 1 1 1 0 1 0 0 1 1 0 1 0 1 0 1 1 1 0 1\n' +
          ' 1 0 1 1 1 0 1 0 1 0 1 0 1 0 1 0 1 1 1 0 1\n' +
          ' 1 0 0 0 0 0 1 0 0 0 0 0 1 0 1 0 0 0 0 0 1\n' +
          ' 1 1 1 1 1 1 1 0 1 0 1 0 1 0 1 1 1 1 1 1 1\n' +
          ' 0 0 0 0 0 0 0 0 1 1 1 0 0 0 0 0 0 0 0 0 0\n' +
          ' 0 0 1 1 0 0 1 1 1 1 0 0 0 1 1 0 1 0 0 0 0\n' +
          ' 0 0 1 1 1 0 0 0 0 0 1 1 0 0 0 1 0 1 1 1 0\n' +
          ' 0 1 0 1 0 1 1 1 0 1 0 1 0 0 0 0 0 1 1 1 1\n' +
          ' 1 1 0 0 1 0 0 1 1 0 0 1 1 1 1 0 1 0 1 1 0\n' +
          ' 0 0 0 0 1 0 1 1 1 1 0 0 0 0 0 1 0 0 1 0 0\n' +
          ' 0 0 0 0 0 0 0 0 1 1 1 1 0 0 1 1 1 0 0 0 1\n' +
          ' 1 1 1 1 1 1 1 0 1 1 1 0 1 0 1 1 0 0 1 0 0\n' +
          ' 1 0 0 0 0 0 1 0 0 0 1 0 0 1 1 1 1 1 1 0 1\n' +
          ' 1 0 1 1 1 0 1 0 0 1 0 0 0 0 1 1 0 0 0 0 0\n' +
          ' 1 0 1 1 1 0 1 0 1 1 1 0 1 0 0 0 1 1 0 0 0\n' +
          ' 1 0 1 1 1 0 1 0 1 1 0 0 0 1 0 0 1 0 0 0 0\n' +
          ' 1 0 0 0 0 0 1 0 0 0 0 1 1 0 1 0 1 0 1 1 0\n' +
          ' 1 1 1 1 1 1 1 0 0 1 0 1 1 1 0 1 1 0 0 0 0\n' +
          '>>\n';
      assert.equal(expected, qrCode.toString());
    });

    it('testAppendModeInfo', function() {
      var bits = new BitArray();
      Encoder.appendModeInfo(ModeEnum.NUMERIC, bits);
      assert.equal(' ...X', bits.toString());
    });

    it('testAppendLengthInfo', function() {
      var bits = new BitArray();
      Encoder.appendLengthInfo(1,  // 1 letter (1/1).
        Version.getVersionForNumber(1),
        ModeEnum.NUMERIC,
        bits);
      assert.equal(' ........ .X', bits.toString());  // 10 bits.

      bits = new BitArray();
      Encoder.appendLengthInfo(2,  // 2 letters (2/1).
        Version.getVersionForNumber(10),
        ModeEnum.ALPHANUMERIC,
        bits);
      assert.equal(' ........ .X.', bits.toString());  // 11 bits.

      bits = new BitArray();
      Encoder.appendLengthInfo(255,  // 255 letter (255/1).
        Version.getVersionForNumber(27),
        ModeEnum.BYTE,
        bits);
      assert.equal(' ........ XXXXXXXX', bits.toString());  // 16 bits.

      bits = new BitArray();
      Encoder.appendLengthInfo(512,  // 512 letters (1024/2).
        Version.getVersionForNumber(40),
        ModeEnum.KANJI,
        bits);
      assert.equal(' ..X..... ....', bits.toString());  // 12 bits.
    });

    it('testAppendBytes', function() {
      // Should use appendNumericBytes.
      // 1 = 01 = 0001 in 4 bits.
      var bits = new BitArray();
      Encoder.appendBytes('1', ModeEnum.NUMERIC, bits,
        Encoder.DEFAULT_BYTE_MODE_ENCODING);
      assert.equal(' ...X', bits.toString());

      // Should use appendAlphanumericBytes.
      // A = 10 = 0xa = 001010 in 6 bits
      bits = new BitArray();
      Encoder.appendBytes('A', ModeEnum.ALPHANUMERIC, bits,
        Encoder.DEFAULT_BYTE_MODE_ENCODING);
      assert.equal(' ..X.X.', bits.toString());
      // Lower letters such as 'a' cannot be encoded in MODE_ALPHANUMERIC.
      assert.throw(function() {
        Encoder.appendBytes('a', ModeEnum.ALPHANUMERIC, bits,
          Encoder.DEFAULT_BYTE_MODE_ENCODING);
      }, WriterError);

      // Should use append8BitBytes.
      // 0x61, 0x62, 0x63
      bits = new BitArray();
      Encoder.appendBytes('abc', ModeEnum.BYTE, bits,
        Encoder.DEFAULT_BYTE_MODE_ENCODING);
      assert.equal(' .XX....X .XX...X. .XX...XX', bits.toString());
      // Anything can be encoded in QRCode.MODE_8BIT_BYTE.
      Encoder.appendBytes('\0', ModeEnum.BYTE, bits,
        Encoder.DEFAULT_BYTE_MODE_ENCODING);

      // not supported yet
      // Should use appendKanjiBytes.
      // 0x93, 0x5f
      bits = new BitArray();
      Encoder.appendBytes(shiftJISString([0x93, 0x5f]),
      ModeEnum.KANJI, bits, Encoder.DEFAULT_BYTE_MODE_ENCODING);
      assert.equal(' .XX.XX.. XXXXX', bits.toString());
    });

    it('testTerminateBits', function() {
      var v = new BitArray();
      Encoder.terminateBits(0, v);
      assert.equal('', v.toString());

      v = new BitArray();
      Encoder.terminateBits(1, v);
      assert.equal(' ........', v.toString());

      v = new BitArray();
      v.appendBits(0, 3);  // Append 000
      Encoder.terminateBits(1, v);
      assert.equal(' ........', v.toString());

      v = new BitArray();
      v.appendBits(0, 5);  // Append 00000
      Encoder.terminateBits(1, v);
      assert.equal(' ........', v.toString());

      v = new BitArray();
      v.appendBits(0, 8);  // Append 00000000
      Encoder.terminateBits(1, v);
      assert.equal(' ........', v.toString());

      v = new BitArray();
      Encoder.terminateBits(2, v);
      assert.equal(' ........ XXX.XX..', v.toString());

      v = new BitArray();
      v.appendBits(0, 1);  // Append 0
      Encoder.terminateBits(3, v);
      assert.equal(' ........ XXX.XX.. ...X...X', v.toString());
    });

    it('testGetNumDataBytesAndNumECBytesForBlockID', function() {
      var numDataBytes = [1];
      var numEcBytes = [1];
      // Version 1-H.
      Encoder.getNumDataBytesAndNumECBytesForBlockID(26, 9, 1, 0,
        numDataBytes, numEcBytes);
      assert.equal(9, numDataBytes[0]);
      assert.equal(17, numEcBytes[0]);

      // Version 3-H.  2 blocks.
      Encoder.getNumDataBytesAndNumECBytesForBlockID(70, 26, 2, 0,
        numDataBytes, numEcBytes);
      assert.equal(13, numDataBytes[0]);
      assert.equal(22, numEcBytes[0]);
      Encoder.getNumDataBytesAndNumECBytesForBlockID(70, 26, 2, 1,
        numDataBytes, numEcBytes);
      assert.equal(13, numDataBytes[0]);
      assert.equal(22, numEcBytes[0]);

      // Version 7-H. (4 + 1) blocks.
      Encoder.getNumDataBytesAndNumECBytesForBlockID(196, 66, 5, 0,
        numDataBytes, numEcBytes);
      assert.equal(13, numDataBytes[0]);
      assert.equal(26, numEcBytes[0]);
      Encoder.getNumDataBytesAndNumECBytesForBlockID(196, 66, 5, 4,
        numDataBytes, numEcBytes);
      assert.equal(14, numDataBytes[0]);
      assert.equal(26, numEcBytes[0]);

      // Version 40-H. (20 + 61) blocks.
      Encoder.getNumDataBytesAndNumECBytesForBlockID(3706, 1276, 81, 0,
        numDataBytes, numEcBytes);
      assert.equal(15, numDataBytes[0]);
      assert.equal(30, numEcBytes[0]);
      Encoder.getNumDataBytesAndNumECBytesForBlockID(3706, 1276, 81, 20,
        numDataBytes, numEcBytes);
      assert.equal(16, numDataBytes[0]);
      assert.equal(30, numEcBytes[0]);
      Encoder.getNumDataBytesAndNumECBytesForBlockID(3706, 1276, 81, 80,
        numDataBytes, numEcBytes);
      assert.equal(16, numDataBytes[0]);
      assert.equal(30, numEcBytes[0]);
    });

    it('testInterleaveWithECBytes', function() {
      var dataBytes = [32, 65, 205, 69, 41, 220, 46, 128, 236];
      var inArray = new BitArray();
      dataBytes.forEach(function(dataByte) {
        inArray.appendBits(dataByte, 8);
      });
      var out = Encoder.interleaveWithECBytes(inArray, 26, 9, 1);
      var expected = [
        // Data bytes.
        32, 65, 205, 69, 41, 220, 46, 128, 236,
        // Error correction bytes.
        42, 159, 74, 221, 244, 169, 239, 150, 138, 70,
        237, 85, 224, 96, 74, 219, 61
      ];
      assert.equal(expected.length, out.getSizeInBytes());
      var outArray = new Array(expected.length);
      out.toBytes(0, outArray, 0, expected.length);
      // Can't use Arrays.equals(), because outArray may be
      // longer than out.sizeInBytes()
      for (var x = 0; x < expected.length; x++) {
        assert.equal(expected[x], outArray[x]);
      }
      // Numbers are from http://www.swetake.com/qr/qr8.html
      dataBytes = [
        67, 70, 22, 38, 54, 70, 86, 102, 118, 134, 150, 166, 182,
        198, 214, 230, 247, 7, 23, 39, 55, 71, 87, 103, 119, 135,
        151, 166, 22, 38, 54, 70, 86, 102, 118, 134, 150, 166,
        182, 198, 214, 230, 247, 7, 23, 39, 55, 71, 87, 103, 119,
        135, 151, 160, 236, 17, 236, 17, 236, 17, 236,
        17
      ];
      inArray = new BitArray();
      dataBytes.forEach(function(dataByte) {
        inArray.appendBits(dataByte, 8);
      });

      out = Encoder.interleaveWithECBytes(inArray, 134, 62, 4);
      expected = [
        // Data bytes.
        67, 230, 54, 55, 70, 247, 70, 71, 22, 7, 86, 87, 38, 23, 102, 103, 54,
        39,
        118, 119, 70, 55, 134, 135, 86, 71, 150, 151, 102, 87, 166,
        160, 118, 103, 182, 236, 134, 119, 198, 17, 150,
        135, 214, 236, 166, 151, 230, 17, 182,
        166, 247, 236, 198, 22, 7, 17, 214, 38, 23, 236, 39,
        17,
        // Error correction bytes.
        175, 155, 245, 236, 80, 146, 56, 74, 155, 165,
        133, 142, 64, 183, 132, 13, 178, 54, 132, 108, 45,
        113, 53, 50, 214, 98, 193, 152, 233, 147, 50, 71, 65,
        190, 82, 51, 209, 199, 171, 54, 12, 112, 57, 113, 155, 117,
        211, 164, 117, 30, 158, 225, 31, 190, 242, 38,
        140, 61, 179, 154, 214, 138, 147, 87, 27, 96, 77, 47,
        187, 49, 156, 214
      ];
      assert.equal(expected.length, out.getSizeInBytes());
      outArray = new Array(expected.length);
      out.toBytes(0, outArray, 0, expected.length);
      for (x = 0; x < expected.length; x++) {
        assert.equal(expected[x], outArray[x]);
      }
    });

    it('testAppendNumericBytes', function() {
      // 1 = 01 = 0001 in 4 bits.
      var bits = new BitArray();
      Encoder.appendNumericBytes('1', bits);
      assert.equal(' ...X', bits.toString());

      // 12 = 0xc = 0001100 in 7 bits.
      bits = new BitArray();
      Encoder.appendNumericBytes('12', bits);
      assert.equal(' ...XX..', bits.toString());

      // 123 = 0x7b = 0001111011 in 10 bits.
      bits = new BitArray();
      Encoder.appendNumericBytes('123', bits);
      assert.equal(' ...XXXX. XX', bits.toString());

      // 1234 = "123" + "4" = 0001111011 + 0100
      bits = new BitArray();
      Encoder.appendNumericBytes('1234', bits);
      assert.equal(' ...XXXX. XX.X..', bits.toString());

      // Empty.
      bits = new BitArray();
      Encoder.appendNumericBytes('', bits);
      assert.equal('', bits.toString());
    });

    it('testAppendAlphanumericBytes', function() {
      // A = 10 = 0xa = 001010 in 6 bits
      var bits = new BitArray();
      Encoder.appendAlphanumericBytes('A', bits);
      assert.equal(' ..X.X.', bits.toString());

      // AB = 10 * 45 + 11 = 461 = 0x1cd = 00111001101 in 11 bits
      bits = new BitArray();
      Encoder.appendAlphanumericBytes('AB', bits);
      assert.equal(' ..XXX..X X.X', bits.toString());

      // ABC = "AB" + "C" = 00111001101 + 001100
      bits = new BitArray();
      Encoder.appendAlphanumericBytes('ABC', bits);
      assert.equal(' ..XXX..X X.X..XX. .', bits.toString());

      // Empty.
      bits = new BitArray();
      Encoder.appendAlphanumericBytes('', bits);
      assert.equal('', bits.toString());

      // Invalid data.
      bits = new BitArray();
      assert.throw(function() {
        Encoder.appendAlphanumericBytes('abc', bits);
      }, WriterError);
    });

    it('testAppend8BitBytes', function() {
      // 0x61, 0x62, 0x63
      var bits = new BitArray();
      Encoder.append8BitBytes('abc', bits, Encoder.DEFAULT_BYTE_MODE_ENCODING);
      assert.equal(' .XX....X .XX...X. .XX...XX', bits.toString());

      // Empty.
      bits = new BitArray();
      Encoder.append8BitBytes('', bits, Encoder.DEFAULT_BYTE_MODE_ENCODING);
      assert.equal('', bits.toString());
    });
    //
    // Numbers are from page 21 of JISX0510:2004
    it('testAppendKanjiBytes', function() {
      var bits = new BitArray();
      Encoder.appendKanjiBytes(shiftJISString([0x93, 0x5f]), bits);
      assert.equal(' .XX.XX.. XXXXX', bits.toString());
      Encoder.appendKanjiBytes(shiftJISString([0xe4, 0xaa]), bits);
      assert.equal(' .XX.XX.. XXXXXXX. X.X.X.X. X.', bits.toString());
    });

    // Numbers are from http://www.swetake.com/qr/qr3.html and
    // http://www.swetake.com/qr/qr9.html
    it('testGenerateECBytes', function() {
      var x;
      var dataBytes = [32, 65, 205, 69, 41, 220, 46, 128, 236];
      var ecBytes = Encoder.generateECBytes(dataBytes, 17);
      var expected = [
        42, 159, 74, 221, 244, 169, 239, 150, 138, 70, 237, 85, 224,
        96, 74, 219, 61
      ];
      assert.equal(expected.length, ecBytes.length);
      for (x = 0; x < expected.length; x++) {
        assert.equal(expected[x], ecBytes[x] & 0xFF);
      }

      dataBytes = [67, 70, 22, 38, 54, 70, 86, 102, 118,
        134, 150, 166, 182, 198, 214];
      ecBytes = Encoder.generateECBytes(dataBytes, 18);
      expected = [
        175, 80, 155, 64, 178, 45, 214, 233, 65, 209, 12, 155, 117, 31,
        140, 214, 27, 187
      ];
      assert.equal(expected.length, ecBytes.length);
      for (x = 0; x < expected.length; x++) {
        assert.equal(expected[x], ecBytes[x] & 0xFF);
      }

      // High-order zero coefficient case.
      dataBytes = [32, 49, 205, 69, 42, 20, 0, 236, 17];
      ecBytes = Encoder.generateECBytes(dataBytes, 17);
      expected = [
        0, 3, 130, 179, 194, 0, 55, 211, 110, 79, 98, 72, 170, 96, 211, 137,
        213
      ];
      assert.equal(expected.length, ecBytes.length);
      for (x = 0; x < expected.length; x++) {
        assert.equal(expected[x], ecBytes[x] & 0xFF);
      }
    });

    it('testBugInBitVectorNumBytes', function() {
      // There was a bug in BitVector.sizeInBytes() that caused it to return a
      // smaller-by-one value (ex. 1465 instead of 1466) if the number of bits
      // in the vector is not 8-bit aligned.  In QRCodeEncoder::InitQRCode(),
      // BitVector::sizeInBytes() is used for finding the smallest QR Code
      // version that can fit the given data.  Hence there were corner cases
      // where we chose a wrong QR Code version that cannot fit the given
      // data.  Note that the issue did not occur with MODE_8BIT_BYTE, as the
      // bits in the bit vector are always 8-bit aligned.
      //
      // Before the bug was fixed, the following test didn't pass, because:
      //
      // - MODE_NUMERIC is chosen as all bytes in the data are '0'
      // - The 3518-byte numeric data needs 1466 bytes
      //   - 3518 / 3 * 10 + 7 = 11727 bits = 1465.875 bytes
      //   - 3 numeric bytes are encoded in 10 bits, hence the first
      //     3516 bytes are encoded in 3516 / 3 * 10 = 11720 bits.
      //   - 2 numeric bytes can be encoded in 7 bits, hence the last
      //     2 bytes are encoded in 7 bits.
      // - The version 27 QR Code with the EC level L has 1468 bytes for data.
      //   - 1828 - 360 = 1468
      // - In InitQRCode(), 3 bytes are reserved for a header.
      // Hence 1465 bytes (1468 -3) are left for data.
      // - Because of the bug in BitVector::sizeInBytes(), InitQRCode()
      // determines
      //   the given data can fit in 1465 bytes, despite it needs 1466 bytes.
      // - Hence QRCodeEncoder.encode() failed and returned false.
      //   - To be precise, it needs 11727 + 4 (getMode info) + 14
      // (length info) =
      //     11745 bits = 1468.125 bytes are needed (i.e. cannot fit in 1468
      //     bytes).
      var builder = [];
      for (var x = 0; x < 3518; x++) {
        builder.push('0');
      }
      Encoder.encode(builder.join(''), ErrorCorrectionLevel.L);
    });
    //
    function shiftJISString(bytes) {
      return stringutils.bytesToString(bytes, 'SHIFT_JIS');
    }

  });
});
