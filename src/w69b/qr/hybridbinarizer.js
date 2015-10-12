// javascript (closure) port (c) 2013 Manuel Braun (mb@w69b.com)
/*
 * Copyright 2009 ZXing authors
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

goog.provide('w69b.qr.HybridBinarizer');
goog.require('w69b.qr.BitArray');
goog.require('w69b.qr.BitMatrix');
goog.require('w69b.qr.GlobalHistogramBinarizer');
goog.require('w69b.qr.IntArray2D');

goog.scope(function() {
  var BitMatrix = w69b.qr.BitMatrix;
  var IntArray2D = w69b.qr.IntArray2D;
  /**
   * This class implements a local thresholding algorithm, which while slower
   * than the GlobalHistogramBinarizer, is fairly efficient for what it does.
   * It is designed for high frequency images of barcodes with black data on
   * white backgrounds. For this application, it does a much better job than a
   * global blackpoint with severe shadows and gradients.  However it tends to
   * produce artifacts on lower frequency images and is therefore not a good
   * general purpose binarizer for uses outside ZXing.
   *
   * This class extends GlobalHistogramBinarizer, using the older histogram
   * approach for 1D readers, and the newer local approach for 2D readers. 1D
   * decoding using a per-row histogram is already inherently local, and only
   * fails for horizontal gradients. We can revisit that problem later, but for
   * now it was not a win to use local blocks for 1D.
   *
   * This Binarizer is the default for the unit tests and the recommended class
   * for library users.
   *
   * @author dswitkin@google.com (Daniel Switkin)
   * ported to js by Manuel Braun
   *
   * @param {w69b.qr.QRImage} source gray values.
   * @constructor
   * @extends {w69b.qr.GlobalHistogramBinarizer}
   */
  w69b.qr.HybridBinarizer = function(source) {
    goog.base(this, source);
  };
  goog.inherits(w69b.qr.HybridBinarizer, w69b.qr.GlobalHistogramBinarizer);
  var _ = w69b.qr.HybridBinarizer;
  var pro = _.prototype;

  /**
   * @private
   * @type {BitMatrix}
   */
  pro.matrix_;

  // This class uses 5x5 blocks to compute local luminance, where each block is
  // 8x8 pixels.  So this is the smallest dimension in each axis we can accept.
  _.BLOCK_SIZE_POWER = 3;
  _.BLOCK_SIZE = 1 << _.BLOCK_SIZE_POWER; // ...0100...00
  _.BLOCK_SIZE_MASK = _.BLOCK_SIZE - 1;   // ...0011...11
  _.MINIMUM_DIMENSION = _.BLOCK_SIZE * 5;
  _.MIN_DYNAMIC_RANGE = 24;


  /**
   * Calculates the final BitMatrix once for all requests. This could be called
   * once from the constructor instead, but there are some advantages to doing
   * it lazily, such as making profiling easier, and not doing heavy lifting
   * when callers don't expect it.
   * @override
   */
  pro.getBlackMatrix = function() {
    if (this.matrix_ != null) {
      return this.matrix_;
    }
    var source = this.getLuminanceSource();
    var width = source.getWidth();
    var height = source.getHeight();
    if (width >= _.MINIMUM_DIMENSION && height >= _.MINIMUM_DIMENSION) {
      var luminances = source.getMatrix();
      // dived by 8
      var subWidth = width >> _.BLOCK_SIZE_POWER;
      // only even numbers
      if ((width & _.BLOCK_SIZE_MASK) != 0) {
        subWidth++;
      }
      var subHeight = height >> _.BLOCK_SIZE_POWER;
      if ((height & _.BLOCK_SIZE_MASK) != 0) {
        subHeight++;
      }
      var blackPoints = _.calculateBlackPoints(luminances, subWidth,
        subHeight, width, height);

      var newMatrix = new BitMatrix(width, height);
      _.calculateThresholdForBlock(luminances, subWidth, subHeight,
        width, height, blackPoints, newMatrix);
      this.matrix_ = newMatrix;
    } else {
      // If the image is too small, fall back to the global histogram approach.
      this.matrix_ = goog.base(this, 'getBlackMatrix');
    }
    return this.matrix_;
  };

  /**
   * @override
   */
  pro.createBinarizer = function(source) {
    return new _(source);
  };

  /**
   * For each block in the image, calculate the average black point using a 5x5
   * grid of the blocks around it. Also handles the corner cases (fractional
   * blocks are computed based on the last pixels in the row/column which are
   * also used in the previous block).
   */
  _.calculateThresholdForBlock = function(luminances, subWidth, subHeight,
                                          width, height, blackPoints, matrix) {
    for (var y = 0; y < subHeight; y++) {
      var yoffset = y << _.BLOCK_SIZE_POWER;
      var maxYOffset = height - _.BLOCK_SIZE;
      if (yoffset > maxYOffset) {
        yoffset = maxYOffset;
      }
      for (var x = 0; x < subWidth; x++) {
        var xoffset = x << _.BLOCK_SIZE_POWER;
        var maxXOffset = width - _.BLOCK_SIZE;
        if (xoffset > maxXOffset) {
          xoffset = maxXOffset;
        }
        var left = _.cap(x, 2, subWidth - 3);
        var top = _.cap(y, 2, subHeight - 3);
        var sum = 0;
        for (var z = -2; z <= 2; z++) {
          var offset = (top + z) * blackPoints.size2;
          var raw = blackPoints.data;
          sum += raw[offset + left - 2] + raw[offset + left - 1] +
            raw[offset + left] + raw[offset + left + 1] +
            raw[offset + left + 2];
        }
        var average = sum / 25;
        _.thresholdBlock(luminances, xoffset, yoffset, average, width, matrix);
      }
    }
  };

  /**
   * @param {number} value value.
   * @param {number} min min.
   * @param {number} max max.
   * @return {number} capped value.
   */
  _.cap = function(value, min, max) {
    return value < min ? min : value > max ? max : value;
  };

  /**
   * Applies a single threshold to a block of pixels.
   */
  _.thresholdBlock = function(luminances, xoffset, yoffset, threshold, stride,
                              matrix) {
    for (var y = 0, offset = yoffset * stride + xoffset; y < _.BLOCK_SIZE;
         y++, offset += stride) {
      for (var x = 0; x < _.BLOCK_SIZE; x++) {
        // Comparison needs to be <= so that black == 0 pixels are
        // black even if the threshold is 0.
        if ((luminances[offset + x] & 0xFF) <= threshold) {
          matrix.set(xoffset + x, yoffset + y);
        }
      }
    }
  };

  /**
   * Calculates a single black point for each block of pixels and saves it away.
   * See the following thread for a discussion of this algorithm:
   *  http://groups.google.com/group/zxing/browse_thread/thread/d06efa2c35a7ddc0
   */
  _.calculateBlackPoints = function(luminances, subWidth, subHeight, width,
                                    height) {
    var xx;
    var blackPoints = new IntArray2D(subHeight, subWidth);
    for (var y = 0; y < subHeight; y++) {
      var yoffset = y << _.BLOCK_SIZE_POWER;
      var maxYOffset = height - _.BLOCK_SIZE;
      if (yoffset > maxYOffset) {
        yoffset = maxYOffset;
      }
      for (var x = 0; x < subWidth; x++) {
        var xoffset = x << _.BLOCK_SIZE_POWER;
        var maxXOffset = width - _.BLOCK_SIZE;
        if (xoffset > maxXOffset) {
          xoffset = maxXOffset;
        }
        var sum = 0;
        var min = 0xFF;
        var max = 0;
        for (var yy = 0, offset = yoffset * width + xoffset;
             yy < _.BLOCK_SIZE; yy++, offset += width) {
          for (xx = 0; xx < _.BLOCK_SIZE; xx++) {
            var pixel = luminances[offset + xx] & 0xFF;
            sum += pixel;
            // still looking for good contrast
            if (pixel < min) {
              min = pixel;
            }
            if (pixel > max) {
              max = pixel;
            }
          }
          // short-circuit min/max tests once dynamic range is met
          if (max - min > _.MIN_DYNAMIC_RANGE) {
            // finish the rest of the rows quickly
            for (yy++, offset += width;
                 yy < _.BLOCK_SIZE; yy++, offset += width) {
              for (xx = 0; xx < _.BLOCK_SIZE; xx++) {
                sum += luminances[offset + xx] & 0xFF;
              }
            }
          }
        }

        // The default estimate is the average of the values in the block.
        var average = sum >> (_.BLOCK_SIZE_POWER * 2);
        if (max - min <= _.MIN_DYNAMIC_RANGE) {
          // If variation within the block is low, assume this is a block with
          // only light or only dark pixels. In that case we do not want to use
          // the average, as it would divide this low contrast area into black
          // and white pixels, essentially creating data out of noise.
          //
          // The default assumption is that the block is light/background.
          // Since no estimate for the level of dark pixels exists locally, use
          // half the min for the block.
          average = min >> 1;

          if (y > 0 && x > 0) {
            // Correct the "white background" assumption for blocks that have
            // neighbors by comparing the pixels in this block to the
            // previously calculated black points. This is based on the fact
            // that dark barcode symbology is always surrounded by some amount
            // of light background for which reasonable black point estimates
            // were made. The bp estimated at the boundaries is used for the
            // interior.

            // The (min < bp) is arbitrary but works better than other
            // heuristics that were tried.
            var averageNeighborBlackPoint = (blackPoints.getAt(y - 1, x) +
              (2 * blackPoints.getAt(y, x - 1)) +
              blackPoints.getAt(y - 1, x - 1)) >> 2;
            if (min < averageNeighborBlackPoint) {
              average = averageNeighborBlackPoint;
            }
          }
        }
        blackPoints.setAt(y, x, average);
      }
    }
    return blackPoints;
  };
});

