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

goog.provide('w69b.qr.encoder.MaskUtil');
goog.require('w69b.qr.encoder.ByteMatrix');

goog.scope(function() {
  var ByteMatrix = w69b.qr.encoder.ByteMatrix;

/**
 * @author Satoru Takabayashi
 * @author Daniel Switkin
 * @author Sean Owen
 * @author mb@69b.com (Manuel Braun) ported to js
 */
var _ = w69b.qr.encoder.MaskUtil;

  // Penalty weights from section 6.8.2.1
  _.N1 = 3;
  _.N2 = 3;
  _.N3 = 40;
  _.N4 = 10;

  /**
   * Apply mask penalty rule 1 and return the penalty.
   * Find repetitive cells with the same color and
   * give penalty to them. Example: 00000 or 11111.
   * @param {ByteMatrix} matrix working matrix.
   * @return {number} result.
   */
  _.applyMaskPenaltyRule1 = function(matrix) {
    return _.applyMaskPenaltyRule1Internal(matrix, true) +
      _.applyMaskPenaltyRule1Internal(matrix, false);
  };

  /**
   * Apply mask penalty rule 2 and return the penalty.
   * Find 2x2 blocks with the same color and give
   * penalty to them. This is actually equivalent to the spec's rule,
   * which is to find MxN blocks and give a
   * penalty proportional to (M-1)x(N-1), because this is the number of
   * 2x2 blocks inside such a block.
   * @param {ByteMatrix} matrix working matrix.
   * @return {number} result.
   */
  _.applyMaskPenaltyRule2 = function(matrix) {
    var penalty = 0;
    var width = matrix.getWidth();
    var height = matrix.getHeight();
    for (var y = 0; y < height - 1; y++) {
      for (var x = 0; x < width - 1; x++) {
        var value = matrix.get(x, y);
        if (value == matrix.get(x + 1, y) && value == matrix.get(x, y + 1) &&
          value == matrix.get(x + 1, y + 1)) {
          penalty++;
        }
      }
    }
    return _.N2 * penalty;
  };

  /**
   * Apply mask penalty rule 3 and return the penalty. Find consecutive
   * cells of 00001011101 or
   * 10111010000, and give penalty to them.
   * If we find patterns like 000010111010000, we give
   * penalties twice (i.e. 40 * 2).
   * @param {ByteMatrix} matrix working matrix.
   * @return {number} result.
   */
  _.applyMaskPenaltyRule3 = function(matrix) {
    var penalty = 0;
    var width = matrix.getWidth();
    var height = matrix.getHeight();
    var bytes = matrix.getBytes();
    for (var y = 0; y < height; y++) {
      var yOffset = width * y;
      for (var x = 0; x < width; x++) {
        // Tried to simplify following conditions but failed.
        if (x + 6 < width &&
            bytes[yOffset + x] == 1 &&
            bytes[yOffset + x + 1] == 0 &&
            bytes[yOffset + x + 2] == 1 &&
            bytes[yOffset + x + 3] == 1 &&
            bytes[yOffset + x + 4] == 1 &&
            bytes[yOffset + x + 5] == 0 &&
            bytes[yOffset + x + 6] == 1 &&
            ((x + 10 < width &&
                bytes[yOffset + x + 7] == 0 &&
                bytes[yOffset + x + 8] == 0 &&
                bytes[yOffset + x + 9] == 0 &&
                bytes[yOffset + x + 10] == 0) ||
             (x - 4 >= 0 &&
                bytes[yOffset + x - 1] == 0 &&
                bytes[yOffset + x - 2] == 0 &&
                bytes[yOffset + x - 3] == 0 &&
                bytes[yOffset + x - 4] == 0))) {
          penalty += _.N3;
        }
        if (y + 6 < height &&
            matrix.get(x, y) == 1 &&
            matrix.get(x, y + 1) == 0 &&
            matrix.get(x, y + 2) == 1 &&
            matrix.get(x, y + 3) == 1 &&
            matrix.get(x, y + 4) == 1 &&
            matrix.get(x, y + 5) == 0 &&
            matrix.get(x, y + 6) == 1 &&
            ((y + 10 < height &&
                matrix.get(x, y + 7) == 0 &&
                matrix.get(x, y + 8) == 0 &&
                matrix.get(x, y + 9) == 0 &&
                matrix.get(x, y + 10) == 0) ||
             (y - 4 >= 0 &&
                matrix.get(x, y - 1) == 0 &&
                matrix.get(x, y - 2) == 0 &&
                matrix.get(x, y - 3) == 0 &&
                matrix.get(x, y - 4) == 0))) {
          penalty += _.N3;
        }
      }
    }
    return penalty;
  };

  /** Apply mask penalty rule 4 and return the penalty. Calculate the ratio of
   * dark cells and give penalty if the ratio is far from 50%. It gives 10
   * penalty for 5% distance.
   * @param {ByteMatrix} matrix working matrix.
   * @return {number} result.
   */
  _.applyMaskPenaltyRule4 = function(matrix) {
    var numDarkCells = 0;
    var width = matrix.getWidth();
    var height = matrix.getHeight();
    for (var y = 0; y < height; y++) {
      for (var x = 0; x < width; x++) {
        if (matrix.get(x, y) == 1) {
          numDarkCells++;
        }
      }
    }
    var numTotalCells = matrix.getHeight() * matrix.getWidth();
    var darkRatio = numDarkCells / numTotalCells;
    // * 100.0 / 5.0
    var fivePercentVariances = Math.floor(Math.abs(darkRatio - 0.5) * 20.0);
    return fivePercentVariances * _.N4;
  };

  /**
   * Return the mask bit for "getMaskPattern" at "x" and "y". See 8.8 of
   * JISX0510:2004 for mask
   * pattern conditions.
   * @param {number} maskPattern pattern.
   * @param {number} x pos.
   * @param {number} y pos.
   */
  _.getDataMaskBit = function(maskPattern, x, y) {
    var intermediate;
    var temp;
    switch (maskPattern) {
      case 0:
        intermediate = (y + x) & 0x1;
        break;
      case 1:
        intermediate = y & 0x1;
        break;
      case 2:
        intermediate = x % 3;
        break;
      case 3:
        intermediate = (y + x) % 3;
        break;
      case 4:
        intermediate = ((y >>> 1) + (x / 3)) & 0x1;
        break;
      case 5:
        temp = y * x;
        intermediate = (temp & 0x1) + (temp % 3);
        break;
      case 6:
        temp = y * x;
        intermediate = ((temp & 0x1) + (temp % 3)) & 0x1;
        break;
      case 7:
        temp = y * x;
        intermediate = ((temp % 3) + ((y + x) & 0x1)) & 0x1;
        break;
      default:
        throw new Error('Invalid mask pattern: ' + maskPattern);
    }
    return intermediate == 0;
  };

  /**
   * Helper function for applyMaskPenaltyRule1. We need this for doing this
   * calculation in both vertical and horizontal orders respectively.
   * @param {ByteMatrix} matrix working matrix.
   * @param {boolean} isHorizontal horizontal switch.
   * @return {number} penalty.
   */
  _.applyMaskPenaltyRule1Internal = function(matrix, isHorizontal) {
    var penalty = 0;
    var iLimit = isHorizontal ? matrix.getHeight() : matrix.getWidth();
    var jLimit = isHorizontal ? matrix.getWidth() : matrix.getHeight();
    for (var i = 0; i < iLimit; i++) {
      var numSameBitCells = 0;
      var prevBit = -1;
      for (var j = 0; j < jLimit; j++) {
        var bit = isHorizontal ? matrix.get(j, i) : matrix.get(i, j);
        if (bit == prevBit) {
          numSameBitCells++;
        } else {
          if (numSameBitCells >= 5) {
            penalty += _.N1 + (numSameBitCells - 5);
          }
          numSameBitCells = 1;  // Include the cell itself.
          prevBit = bit;
        }
      }
      if (numSameBitCells > 5) {
        penalty += _.N1 + (numSameBitCells - 5);
      }
    }
    return penalty;
  };

});
