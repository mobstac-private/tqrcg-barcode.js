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
  var MatrixUtil = w69b.qr.encoder.MatrixUtil;
  var ByteMatrix = w69b.qr.encoder.ByteMatrix;
  var ErrorCorrectionLevel = w69b.qr.ErrorCorrectionLevel;
  var BitArray = w69b.qr.BitArray;

  describe('MatrixUtilTestCase', function() {

    it('testToString', function() {
      var array = new ByteMatrix(3, 3);
      array.set(0, 0, 0);
      array.set(1, 0, 1);
      array.set(2, 0, 0);
      array.set(0, 1, 1);
      array.set(1, 1, 0);
      array.set(2, 1, 1);
      array.set(0, 2, -1);
      array.set(1, 2, -1);
      array.set(2, 2, -1);
      var expected = ' 0 1 0\n' + ' 1 0 1\n' + '      \n';
      assert.equal(expected, array.toString());
    });

    it('testClearMatrix', function() {
      var matrix = new ByteMatrix(2, 2);
      MatrixUtil.clearMatrix(matrix);
      assert.equal(-1, matrix.get(0, 0));
      assert.equal(-1, matrix.get(1, 0));
      assert.equal(-1, matrix.get(0, 1));
      assert.equal(-1, matrix.get(1, 1));
    });

    it('testEmbedBasicPatterns1', function() {
      // Version 1.
      var matrix = new ByteMatrix(21, 21);
      MatrixUtil.clearMatrix(matrix);
      MatrixUtil.embedBasicPatterns(Version.getVersionForNumber(1), matrix);
      var expected =
        ' 1 1 1 1 1 1 1 0           0 1 1 1 1 1 1 1\n' +
          ' 1 0 0 0 0 0 1 0           0 1 0 0 0 0 0 1\n' +
          ' 1 0 1 1 1 0 1 0           0 1 0 1 1 1 0 1\n' +
          ' 1 0 1 1 1 0 1 0           0 1 0 1 1 1 0 1\n' +
          ' 1 0 1 1 1 0 1 0           0 1 0 1 1 1 0 1\n' +
          ' 1 0 0 0 0 0 1 0           0 1 0 0 0 0 0 1\n' +
          ' 1 1 1 1 1 1 1 0 1 0 1 0 1 0 1 1 1 1 1 1 1\n' +
          ' 0 0 0 0 0 0 0 0           0 0 0 0 0 0 0 0\n' +
          '             1                            \n' +
          '             0                            \n' +
          '             1                            \n' +
          '             0                            \n' +
          '             1                            \n' +
          ' 0 0 0 0 0 0 0 0 1                        \n' +
          ' 1 1 1 1 1 1 1 0                          \n' +
          ' 1 0 0 0 0 0 1 0                          \n' +
          ' 1 0 1 1 1 0 1 0                          \n' +
          ' 1 0 1 1 1 0 1 0                          \n' +
          ' 1 0 1 1 1 0 1 0                          \n' +
          ' 1 0 0 0 0 0 1 0                          \n' +
          ' 1 1 1 1 1 1 1 0                          \n';
      assert.equal(expected, matrix.toString());
    });

    it('testEmbedBasicPatterns2', function() {
      // Version 2.  Position adjustment pattern should apppear at right
      // bottom corner.
      var matrix = new ByteMatrix(25, 25);
      MatrixUtil.clearMatrix(matrix);
      MatrixUtil.embedBasicPatterns(Version.getVersionForNumber(2), matrix);
      var expected =
        ' 1 1 1 1 1 1 1 0                   0 1 1 1 1 1 1 1\n' +
          ' 1 0 0 0 0 0 1 0                   0 1 0 0 0 0 0 1\n' +
          ' 1 0 1 1 1 0 1 0                   0 1 0 1 1 1 0 1\n' +
          ' 1 0 1 1 1 0 1 0                   0 1 0 1 1 1 0 1\n' +
          ' 1 0 1 1 1 0 1 0                   0 1 0 1 1 1 0 1\n' +
          ' 1 0 0 0 0 0 1 0                   0 1 0 0 0 0 0 1\n' +
          ' 1 1 1 1 1 1 1 0 1 0 1 0 1 0 1 0 1 0 1 1 1 1 1 1 1\n' +
          ' 0 0 0 0 0 0 0 0                   0 0 0 0 0 0 0 0\n' +
          '             1                                    \n' +
          '             0                                    \n' +
          '             1                                    \n' +
          '             0                                    \n' +
          '             1                                    \n' +
          '             0                                    \n' +
          '             1                                    \n' +
          '             0                                    \n' +
          '             1                   1 1 1 1 1        \n' +
          ' 0 0 0 0 0 0 0 0 1               1 0 0 0 1        \n' +
          ' 1 1 1 1 1 1 1 0                 1 0 1 0 1        \n' +
          ' 1 0 0 0 0 0 1 0                 1 0 0 0 1        \n' +
          ' 1 0 1 1 1 0 1 0                 1 1 1 1 1        \n' +
          ' 1 0 1 1 1 0 1 0                                  \n' +
          ' 1 0 1 1 1 0 1 0                                  \n' +
          ' 1 0 0 0 0 0 1 0                                  \n' +
          ' 1 1 1 1 1 1 1 0                                  \n';
      assert.equal(expected, matrix.toString());
    });

    it('testEmbedTypeInfo', function() {
      // Type info bits = 100000011001110.
      var matrix = new ByteMatrix(21, 21);
      MatrixUtil.clearMatrix(matrix);
      MatrixUtil.embedTypeInfo(ErrorCorrectionLevel.M, 5, matrix);
      var expected =
        '                 0                        \n' +
          '                 1                        \n' +
          '                 1                        \n' +
          '                 1                        \n' +
          '                 0                        \n' +
          '                 0                        \n' +
          '                                          \n' +
          '                 1                        \n' +
          ' 1 0 0 0 0 0   0 1         1 1 0 0 1 1 1 0\n' +
          '                                          \n' +
          '                                          \n' +
          '                                          \n' +
          '                                          \n' +
          '                                          \n' +
          '                 0                        \n' +
          '                 0                        \n' +
          '                 0                        \n' +
          '                 0                        \n' +
          '                 0                        \n' +
          '                 0                        \n' +
          '                 1                        \n';
      assert.equal(expected, matrix.toString());
    });

    it('testEmbedVersionInfo', function() {
      // Version info bits = 000111 110010 010100
      // Actually, version 7 QR Code has 45x45 matrix but we use 21x21 here
      // since 45x45 matrix is too big to depict.
      var matrix = new ByteMatrix(21, 21);
      MatrixUtil.clearMatrix(matrix);
      MatrixUtil.maybeEmbedVersionInfo(Version.getVersionForNumber(7), matrix);
      var expected =
        '                     0 0 1                \n' +
          '                     0 1 0                \n' +
          '                     0 1 0                \n' +
          '                     0 1 1                \n' +
          '                     1 1 1                \n' +
          '                     0 0 0                \n' +
          '                                          \n' +
          '                                          \n' +
          '                                          \n' +
          '                                          \n' +
          ' 0 0 0 0 1 0                              \n' +
          ' 0 1 1 1 1 0                              \n' +
          ' 1 0 0 1 1 0                              \n' +
          '                                          \n' +
          '                                          \n' +
          '                                          \n' +
          '                                          \n' +
          '                                          \n' +
          '                                          \n' +
          '                                          \n' +
          '                                          \n';
      assert.equal(expected, matrix.toString());
    });

    it('testEmbedDataBits', function() {
      // Cells other than basic patterns should be filled with zero.
      var bits = new BitArray();
      var matrix = new ByteMatrix(21, 21);
      MatrixUtil.clearMatrix(matrix);
      MatrixUtil.embedBasicPatterns(Version.getVersionForNumber(1), matrix);
      MatrixUtil.embedDataBits(bits, -1, matrix);
      var expected =
        ' 1 1 1 1 1 1 1 0 0 0 0 0 0 0 1 1 1 1 1 1 1\n' +
          ' 1 0 0 0 0 0 1 0 0 0 0 0 0 0 1 0 0 0 0 0 1\n' +
          ' 1 0 1 1 1 0 1 0 0 0 0 0 0 0 1 0 1 1 1 0 1\n' +
          ' 1 0 1 1 1 0 1 0 0 0 0 0 0 0 1 0 1 1 1 0 1\n' +
          ' 1 0 1 1 1 0 1 0 0 0 0 0 0 0 1 0 1 1 1 0 1\n' +
          ' 1 0 0 0 0 0 1 0 0 0 0 0 0 0 1 0 0 0 0 0 1\n' +
          ' 1 1 1 1 1 1 1 0 1 0 1 0 1 0 1 1 1 1 1 1 1\n' +
          ' 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0\n' +
          ' 0 0 0 0 0 0 1 0 0 0 0 0 0 0 0 0 0 0 0 0 0\n' +
          ' 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0\n' +
          ' 0 0 0 0 0 0 1 0 0 0 0 0 0 0 0 0 0 0 0 0 0\n' +
          ' 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0\n' +
          ' 0 0 0 0 0 0 1 0 0 0 0 0 0 0 0 0 0 0 0 0 0\n' +
          ' 0 0 0 0 0 0 0 0 1 0 0 0 0 0 0 0 0 0 0 0 0\n' +
          ' 1 1 1 1 1 1 1 0 0 0 0 0 0 0 0 0 0 0 0 0 0\n' +
          ' 1 0 0 0 0 0 1 0 0 0 0 0 0 0 0 0 0 0 0 0 0\n' +
          ' 1 0 1 1 1 0 1 0 0 0 0 0 0 0 0 0 0 0 0 0 0\n' +
          ' 1 0 1 1 1 0 1 0 0 0 0 0 0 0 0 0 0 0 0 0 0\n' +
          ' 1 0 1 1 1 0 1 0 0 0 0 0 0 0 0 0 0 0 0 0 0\n' +
          ' 1 0 0 0 0 0 1 0 0 0 0 0 0 0 0 0 0 0 0 0 0\n' +
          ' 1 1 1 1 1 1 1 0 0 0 0 0 0 0 0 0 0 0 0 0 0\n';
      assert.equal(expected, matrix.toString());
    });

    it('testBuildMatrix', function() {
      // From http://www.swetake.com/qr/qr7.html
      var bytes = [32, 65, 205, 69, 41, 220, 46, 128, 236,
        42, 159, 74, 221, 244, 169, 239, 150, 138,
        70, 237, 85, 224, 96, 74, 219 , 61];
      var bits = new BitArray();
      bytes.forEach(function(c) {
        bits.appendBits(c, 8);
      });
      var matrix = new ByteMatrix(21, 21);
      MatrixUtil.buildMatrix(bits,
        ErrorCorrectionLevel.H,
        Version.getVersionForNumber(1),  // Version 1
        3,  // Mask pattern 3
        matrix);
      var expected =
        ' 1 1 1 1 1 1 1 0 0 1 1 0 0 0 1 1 1 1 1 1 1\n' +
          ' 1 0 0 0 0 0 1 0 0 0 0 0 0 0 1 0 0 0 0 0 1\n' +
          ' 1 0 1 1 1 0 1 0 0 0 0 1 0 0 1 0 1 1 1 0 1\n' +
          ' 1 0 1 1 1 0 1 0 0 1 1 0 0 0 1 0 1 1 1 0 1\n' +
          ' 1 0 1 1 1 0 1 0 1 1 0 0 1 0 1 0 1 1 1 0 1\n' +
          ' 1 0 0 0 0 0 1 0 0 0 1 1 1 0 1 0 0 0 0 0 1\n' +
          ' 1 1 1 1 1 1 1 0 1 0 1 0 1 0 1 1 1 1 1 1 1\n' +
          ' 0 0 0 0 0 0 0 0 1 1 0 1 1 0 0 0 0 0 0 0 0\n' +
          ' 0 0 1 1 0 0 1 1 1 0 0 1 1 1 1 0 1 0 0 0 0\n' +
          ' 1 0 1 0 1 0 0 0 0 0 1 1 1 0 0 1 0 1 1 1 0\n' +
          ' 1 1 1 1 0 1 1 0 1 0 1 1 1 0 0 1 1 1 0 1 0\n' +
          ' 1 0 1 0 1 1 0 1 1 1 0 0 1 1 1 0 0 1 0 1 0\n' +
          ' 0 0 1 0 0 1 1 1 0 0 0 0 0 0 1 0 1 1 1 1 1\n' +
          ' 0 0 0 0 0 0 0 0 1 1 0 1 0 0 0 0 0 1 0 1 1\n' +
          ' 1 1 1 1 1 1 1 0 1 1 1 1 0 0 0 0 1 0 1 1 0\n' +
          ' 1 0 0 0 0 0 1 0 0 0 0 1 0 1 1 1 0 0 0 0 0\n' +
          ' 1 0 1 1 1 0 1 0 0 1 0 0 1 1 0 0 1 0 0 1 1\n' +
          ' 1 0 1 1 1 0 1 0 1 1 0 1 0 0 0 0 0 1 1 1 0\n' +
          ' 1 0 1 1 1 0 1 0 1 1 1 1 0 0 0 0 1 1 1 0 0\n' +
          ' 1 0 0 0 0 0 1 0 0 0 0 0 0 0 0 0 1 0 1 0 0\n' +
          ' 1 1 1 1 1 1 1 0 0 0 1 1 1 1 1 0 1 0 0 1 0\n';
      assert.equal(expected, matrix.toString());
    });

    it('testFindMSBSet', function() {
      assert.equal(0, MatrixUtil.findMSBSet(0));
      assert.equal(1, MatrixUtil.findMSBSet(1));
      assert.equal(8, MatrixUtil.findMSBSet(0x80));
      assert.equal(32, MatrixUtil.findMSBSet(0x80000000));
    });

    it('testCalculateBCHCode', function() {
      // Encoding of type information.
      // From Appendix C in JISX0510:2004 (p 65)
      assert.equal(0xdc, MatrixUtil.calculateBCHCode(5, 0x537));
      // From http://www.swetake.com/qr/qr6.html
      assert.equal(0x1c2, MatrixUtil.calculateBCHCode(0x13, 0x537));
      // From http://www.swetake.com/qr/qr11.html
      assert.equal(0x214, MatrixUtil.calculateBCHCode(0x1b, 0x537));

      // Encofing of version information.
      // From Appendix D in JISX0510:2004 (p 68)
      assert.equal(0xc94, MatrixUtil.calculateBCHCode(7, 0x1f25));
      assert.equal(0x5bc, MatrixUtil.calculateBCHCode(8, 0x1f25));
      assert.equal(0xa99, MatrixUtil.calculateBCHCode(9, 0x1f25));
      assert.equal(0x4d3, MatrixUtil.calculateBCHCode(10, 0x1f25));
      assert.equal(0x9a6, MatrixUtil.calculateBCHCode(20, 0x1f25));
      assert.equal(0xd75, MatrixUtil.calculateBCHCode(30, 0x1f25));
      assert.equal(0xc69, MatrixUtil.calculateBCHCode(40, 0x1f25));
    });

    // We don't test a lot of cases in this function since we've already
    // tested them in TEST(calculateBCHCode).
    it('testMakeVersionInfoBits', function() {
      // From Appendix D in JISX0510:2004 (p 68)
      var bits = new BitArray();
      MatrixUtil.makeVersionInfoBits(Version.getVersionForNumber(7), bits);
      assert.equal(' ...XXXXX ..X..X.X ..', bits.toString());
    });

    // We don't test a lot of cases in this function since we've already
    // tested them in TEST(calculateBCHCode).
    it('testMakeTypeInfoInfoBits', function() {
      // From Appendix C in JISX0510:2004 (p 65)
      var bits = new BitArray();
      MatrixUtil.makeTypeInfoBits(ErrorCorrectionLevel.M, 5, bits);
      assert.equal(' X......X X..XXX.', bits.toString());
    });
  });
});
