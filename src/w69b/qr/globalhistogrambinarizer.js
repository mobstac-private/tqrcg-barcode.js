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

goog.provide('w69b.qr.GlobalHistogramBinarizer');
goog.require('w69b.qr.Binarizer');
goog.require('w69b.qr.BitArray');
goog.require('w69b.qr.BitMatrix');
goog.require('w69b.qr.NotFoundError');


goog.scope(function() {
  var BitMatrix = w69b.qr.BitMatrix;
  var BitArray = w69b.qr.BitArray;
   /**
   * This Binarizer implementation uses the old ZXing global histogram
   * approach. It is suitable for low-end mobile devices which don't have
   * enough CPU or memory to use a local thresholding algorithm. However,
   * because it picks a global black point, it cannot handle difficult shadows
   * and gradients.
   *
   * Faster mobile devices and all desktop applications should probably use
   * HybridBinarizer instead.
   *
   * @author dswitkin@google.com (Daniel Switkin)
   * @author Sean Owen
   * Ported to js by Manuel Braun
   *
    * @param {w69b.qr.QRImage} source gray values.
   * @constructor
   * @extends {w69b.qr.Binarizer}
   */
  w69b.qr.GlobalHistogramBinarizer = function(source) {
    goog.base(this, source);
    /**
     * @type {Uint8Array}
     * @private
     */
    this.luminances_ = new Uint8Array(0);
    /**
     * @type {Uint8Array}
     * @private
     */
    this.buckets_ = new Uint8Array(_.LUMINANCE_BUCKETS);
  };
  var _ = w69b.qr.GlobalHistogramBinarizer;
  goog.inherits(_, w69b.qr.Binarizer);
  var pro = _.prototype;


  _.LUMINANCE_BITS = 5;
  _.LUMINANCE_SHIFT = 8 - _.LUMINANCE_BITS;
  _.LUMINANCE_BUCKETS = 1 << _.LUMINANCE_BITS;


  /**
   * Applies simple sharpening to the row data to improve performance of the 1D
   * Readers.
   * @override
   */
    pro.getBlackRow = function(y, row) {
      var x;
      var source = this.getLuminanceSource();
      var width = source.getWidth();
      if (row == null || row.getSize() < width) {
        row = new BitArray(width);
      } else {
        row.clear();
      }

      this.initArrays(width);
      var localLuminances = source.getRow(y, this.luminances_);
      var localBuckets = this.buckets_;
      for (x = 0; x < width; x++) {
        var pixel = localLuminances[x] & 0xff;
        localBuckets[pixel >> _.LUMINANCE_SHIFT]++;
      }
      var blackPoint = _.estimateBlackPoint(localBuckets);

      var left = localLuminances[0] & 0xff;
      var center = localLuminances[1] & 0xff;
      for (x = 1; x < width - 1; x++) {
        var right = localLuminances[x + 1] & 0xff;
        // A simple -1 4 -1 box filter with a weight of 2.
        var luminance = ((center << 2) - left - right) >> 1;
        if (luminance < blackPoint) {
          row.set(x);
        }
        left = center;
        center = right;
      }
      return row;
    };

    /**
     * Does not sharpen the data, as this call is intended to only be used by
     * 2D Readers.
     * @override
     */
    pro.getBlackMatrix = function() {
      var source = this.getLuminanceSource();
      var width = source.getWidth();
      var height = source.getHeight();
      var matrix = new BitMatrix(width, height);

      // nasty js scopes.
      var localLuminances, pixel, x, y;
      // Quickly calculates the histogram by sampling four rows from the image.
      // This proved to be more robust on the blackbox tests than sampling a
      // diagonal as we used to do.
      this.initArrays(width);
      var localBuckets = this.buckets_;
      for (y = 1; y < 5; y++) {
        var row = height * y / 5;
        localLuminances = source.getRow(row, this.luminances_);
        var right = (width << 2) / 5;
        for (x = width / 5; x < right; x++) {
          pixel = localLuminances[x] & 0xff;
          localBuckets[pixel >> _.LUMINANCE_SHIFT]++;
        }
      }
      var blackPoint = _.estimateBlackPoint(localBuckets);

      // We delay reading the entire image luminance until the black point
      // estimation succeeds.  Although we end up reading four rows twice, it
      // is consistent with our motto of "fail quickly" which is necessary for
      // continuous scanning.
      localLuminances = source.getMatrix();
      for (y = 0; y < height; y++) {
        var offset = y * width;
        for (x = 0; x < width; x++) {
          pixel = localLuminances[offset + x] & 0xff;
          if (pixel < blackPoint) {
            matrix.set(x, y);
          }
        }
      }

      return matrix;
    };

  /**
   * @override
   */
    pro.createBinarizer = function(source) {
      return new _(source);
    };

    pro.initArrays = function(luminanceSize) {
      if (this.luminances_.length < luminanceSize) {
        this.luminances_ = new Uint8Array(luminanceSize);
      }
      for (var x = 0; x < _.LUMINANCE_BUCKETS; x++) {
        this.buckets_[x] = 0;
      }
    };

    _.estimateBlackPoint = function(buckets) {
      var x, score;
      // Find the tallest peak in the histogram.
      var numBuckets = buckets.length;
      var maxBucketCount = 0;
      var firstPeak = 0;
      var firstPeakSize = 0;
      for (x = 0; x < numBuckets; x++) {
        if (buckets[x] > firstPeakSize) {
          firstPeak = x;
          firstPeakSize = buckets[x];
        }
        if (buckets[x] > maxBucketCount) {
          maxBucketCount = buckets[x];
        }
      }

      // Find the second-tallest peak which is somewhat far from the tallest
      // peak.
      var secondPeak = 0;
      var secondPeakScore = 0;
      for (x = 0; x < numBuckets; x++) {
        var distanceToBiggest = x - firstPeak;
        // Encourage more distant second peaks by multiplying by square of
        // distance.
        score = buckets[x] * distanceToBiggest * distanceToBiggest;
        if (score > secondPeakScore) {
          secondPeak = x;
          secondPeakScore = score;
        }
      }

      // Make sure firstPeak corresponds to the black peak.
      if (firstPeak > secondPeak) {
        var temp = firstPeak;
        firstPeak = secondPeak;
        secondPeak = temp;
      }

      // If there is too little contrast in the image to pick a meaningful
      // black point, throw rather than waste time trying to decode the image,
      // and risk false positives.
      if (secondPeak - firstPeak <= numBuckets >> 4) {
        throw new w69b.qr.NotFoundError();
      }

      // Find a valley between them that is low and closer to the white peak.
      var bestValley = secondPeak - 1;
      var bestValleyScore = -1;
      for (x = secondPeak - 1; x > firstPeak; x--) {
        var fromFirst = x - firstPeak;
        score = fromFirst * fromFirst * (secondPeak - x) *
          (maxBucketCount - buckets[x]);
        if (score > bestValleyScore) {
          bestValley = x;
          bestValleyScore = score;
        }
      }

      return bestValley << _.LUMINANCE_SHIFT;
    };
});

