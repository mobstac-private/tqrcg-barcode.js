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
  var MaskUtil = w69b.qr.encoder.MaskUtil;

  describe('MaskUtil', function() {

    it('testApplyMaskPenaltyRule1', function() {
      var matrix;
      matrix = new ByteMatrix(4, 1);
      matrix.set(0, 0, 0);
      matrix.set(1, 0, 0);
      matrix.set(2, 0, 0);
      matrix.set(3, 0, 0);
      assert.equal(0, MaskUtil.applyMaskPenaltyRule1(matrix));
      // Horizontal.
      matrix = new ByteMatrix(6, 1);
      matrix.set(0, 0, 0);
      matrix.set(1, 0, 0);
      matrix.set(2, 0, 0);
      matrix.set(3, 0, 0);
      matrix.set(4, 0, 0);
      matrix.set(5, 0, 1);
      assert.equal(3, MaskUtil.applyMaskPenaltyRule1(matrix));
      matrix.set(5, 0, 0);
      assert.equal(4, MaskUtil.applyMaskPenaltyRule1(matrix));
      // Vertical.
      matrix = new ByteMatrix(1, 6);
      matrix.set(0, 0, 0);
      matrix.set(0, 1, 0);
      matrix.set(0, 2, 0);
      matrix.set(0, 3, 0);
      matrix.set(0, 4, 0);
      matrix.set(0, 5, 1);
      assert.equal(3, MaskUtil.applyMaskPenaltyRule1(matrix));
      matrix.set(0, 5, 0);
      assert.equal(4, MaskUtil.applyMaskPenaltyRule1(matrix));
    });

    it('testApplyMaskPenaltyRule2', function() {
      var matrix;
      matrix = new ByteMatrix(1, 1);
      matrix.set(0, 0, 0);
      assert.equal(0, MaskUtil.applyMaskPenaltyRule2(matrix));

      matrix = new ByteMatrix(2, 2);
      matrix.set(0, 0, 0);
      matrix.set(1, 0, 0);
      matrix.set(0, 1, 0);
      matrix.set(1, 1, 1);
      assert.equal(0, MaskUtil.applyMaskPenaltyRule2(matrix));

      matrix = new ByteMatrix(2, 2);
      matrix.set(0, 0, 0);
      matrix.set(1, 0, 0);
      matrix.set(0, 1, 0);
      matrix.set(1, 1, 0);
      assert.equal(3, MaskUtil.applyMaskPenaltyRule2(matrix));

      matrix = new ByteMatrix(3, 3);
      matrix.set(0, 0, 0);
      matrix.set(1, 0, 0);
      matrix.set(2, 0, 0);
      matrix.set(0, 1, 0);
      matrix.set(1, 1, 0);
      matrix.set(2, 1, 0);
      matrix.set(0, 2, 0);
      matrix.set(1, 2, 0);
      matrix.set(2, 2, 0);
      // Four instances of 2x2 blocks.
      assert.equal(3 * 4, MaskUtil.applyMaskPenaltyRule2(matrix));
    });

    it('testApplyMaskPenaltyRule3', function() {
      // Horizontal 00001011101.
      var matrix;
      matrix = new ByteMatrix(11, 1);
      matrix.set(0, 0, 0);
      matrix.set(1, 0, 0);
      matrix.set(2, 0, 0);
      matrix.set(3, 0, 0);
      matrix.set(4, 0, 1);
      matrix.set(5, 0, 0);
      matrix.set(6, 0, 1);
      matrix.set(7, 0, 1);
      matrix.set(8, 0, 1);
      matrix.set(9, 0, 0);
      matrix.set(10, 0, 1);
      assert.equal(40, MaskUtil.applyMaskPenaltyRule3(matrix));

      // Horizontal 10111010000.
      matrix = new ByteMatrix(11, 1);
      matrix.set(0, 0, 1);
      matrix.set(1, 0, 0);
      matrix.set(2, 0, 1);
      matrix.set(3, 0, 1);
      matrix.set(4, 0, 1);
      matrix.set(5, 0, 0);
      matrix.set(6, 0, 1);
      matrix.set(7, 0, 0);
      matrix.set(8, 0, 0);
      matrix.set(9, 0, 0);
      matrix.set(10, 0, 0);
      assert.equal(40, MaskUtil.applyMaskPenaltyRule3(matrix));

      // Vertical 00001011101.
      matrix = new ByteMatrix(1, 11);
      matrix.set(0, 0, 0);
      matrix.set(0, 1, 0);
      matrix.set(0, 2, 0);
      matrix.set(0, 3, 0);
      matrix.set(0, 4, 1);
      matrix.set(0, 5, 0);
      matrix.set(0, 6, 1);
      matrix.set(0, 7, 1);
      matrix.set(0, 8, 1);
      matrix.set(0, 9, 0);
      matrix.set(0, 10, 1);
      assert.equal(40, MaskUtil.applyMaskPenaltyRule3(matrix));

      // Vertical 10111010000.
      matrix = new ByteMatrix(1, 11);
      matrix.set(0, 0, 1);
      matrix.set(0, 1, 0);
      matrix.set(0, 2, 1);
      matrix.set(0, 3, 1);
      matrix.set(0, 4, 1);
      matrix.set(0, 5, 0);
      matrix.set(0, 6, 1);
      matrix.set(0, 7, 0);
      matrix.set(0, 8, 0);
      matrix.set(0, 9, 0);
      matrix.set(0, 10, 0);
      assert.equal(40, MaskUtil.applyMaskPenaltyRule3(matrix));
    });

    it('testApplyMaskPenaltyRule4', function() {
        // Dark cell ratio = 0%
      var matrix;
        matrix = new ByteMatrix(1, 1);
        matrix.set(0, 0, 0);
        assert.equal(100, MaskUtil.applyMaskPenaltyRule4(matrix));
        // Dark cell ratio = 5%
        matrix = new ByteMatrix(2, 1);
        matrix.set(0, 0, 0);
        matrix.set(0, 0, 1);
        assert.equal(0, MaskUtil.applyMaskPenaltyRule4(matrix));

        // Dark cell ratio = 66.67%
        matrix = new ByteMatrix(6, 1);
        matrix.set(0, 0, 0);
        matrix.set(1, 0, 1);
        matrix.set(2, 0, 1);
        matrix.set(3, 0, 1);
        matrix.set(4, 0, 1);
        matrix.set(5, 0, 0);
        assert.equal(30, MaskUtil.applyMaskPenaltyRule4(matrix));
    });

    function testGetDataMaskBitInternal(maskPattern, expected) {
      for (var x = 0; x < 6; ++x) {
        for (var y = 0; y < 6; ++y) {
          if ((expected[y][x] == 1) !=
              MaskUtil.getDataMaskBit(maskPattern, x, y)) {
            return false;
          }
        }
      }
      return true;
    }

    // See mask patterns on the page 43 of JISX0510:2004.
    it('testGetDataMaskBit', function() {
      var mask0 = [
        [1, 0, 1, 0, 1, 0],
        [0, 1, 0, 1, 0, 1],
        [1, 0, 1, 0, 1, 0],
        [0, 1, 0, 1, 0, 1],
        [1, 0, 1, 0, 1, 0],
        [0, 1, 0, 1, 0, 1]
      ];
      assert.isTrue(testGetDataMaskBitInternal(0, mask0));
      var mask1 = [
        [1, 1, 1, 1, 1, 1],
        [0, 0, 0, 0, 0, 0],
        [1, 1, 1, 1, 1, 1],
        [0, 0, 0, 0, 0, 0],
        [1, 1, 1, 1, 1, 1],
        [0, 0, 0, 0, 0, 0]
      ];
      assert.isTrue(testGetDataMaskBitInternal(1, mask1));
      var mask2 = [
        [1, 0, 0, 1, 0, 0],
        [1, 0, 0, 1, 0, 0],
        [1, 0, 0, 1, 0, 0],
        [1, 0, 0, 1, 0, 0],
        [1, 0, 0, 1, 0, 0],
        [1, 0, 0, 1, 0, 0]
      ];
      assert.isTrue(testGetDataMaskBitInternal(2, mask2));
      var mask3 = [
        [1, 0, 0, 1, 0, 0],
        [0, 0, 1, 0, 0, 1],
        [0, 1, 0, 0, 1, 0],
        [1, 0, 0, 1, 0, 0],
        [0, 0, 1, 0, 0, 1],
        [0, 1, 0, 0, 1, 0]
      ];
      assert.isTrue(testGetDataMaskBitInternal(3, mask3));
      var mask4 = [
        [1, 1, 1, 0, 0, 0],
        [1, 1, 1, 0, 0, 0],
        [0, 0, 0, 1, 1, 1],
        [0, 0, 0, 1, 1, 1],
        [1, 1, 1, 0, 0, 0],
        [1, 1, 1, 0, 0, 0]
      ];
      assert.isTrue(testGetDataMaskBitInternal(4, mask4));
      var mask5 = [
        [1, 1, 1, 1, 1, 1],
        [1, 0, 0, 0, 0, 0],
        [1, 0, 0, 1, 0, 0],
        [1, 0, 1, 0, 1, 0],
        [1, 0, 0, 1, 0, 0],
        [1, 0, 0, 0, 0, 0]
      ];
      assert.isTrue(testGetDataMaskBitInternal(5, mask5));
      var mask6 = [
        [1, 1, 1, 1, 1, 1],
        [1, 1, 1, 0, 0, 0],
        [1, 1, 0, 1, 1, 0],
        [1, 0, 1, 0, 1, 0],
        [1, 0, 1, 1, 0, 1],
        [1, 0, 0, 0, 1, 1]
      ];
      assert.isTrue(testGetDataMaskBitInternal(6, mask6));
      var mask7 = [
        [1, 0, 1, 0, 1, 0],
        [0, 0, 0, 1, 1, 1],
        [1, 0, 0, 0, 1, 1],
        [0, 1, 0, 1, 0, 1],
        [1, 1, 1, 0, 0, 0],
        [0, 1, 1, 1, 0, 0]
      ];
      assert.isTrue(testGetDataMaskBitInternal(7, mask7));
    });
  });
});
