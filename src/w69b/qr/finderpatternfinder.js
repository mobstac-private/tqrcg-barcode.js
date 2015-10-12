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

goog.provide('w69b.qr.FinderPatternFinder');
goog.require('goog.array');
goog.require('w69b.img.BitMatrixLike');
goog.require('w69b.qr.DecodeHintType');
goog.require('w69b.qr.FinderPattern');
goog.require('w69b.qr.FinderPatternInfo');
goog.require('w69b.qr.NotFoundError');
goog.require('w69b.qr.QRImage');


goog.scope(function() {
  var FinderPattern = w69b.qr.FinderPattern;
  var FinderPatternInfo = w69b.qr.FinderPatternInfo;

  /** @typedef {function((w69b.qr.AlignmentPattern|w69b.qr.FinderPattern))} */
  w69b.qr.ResultPointCallback;

  /**
   * <p>This class attempts to find finder patterns in a QR Code. Finder
   * patterns are the square
   * markers at three corners of a QR Code.</p>
   *
   * <p>This class is thread-safe but not reentrant. Each thread must allocate
   * its own object.
   *
   * @author Sean Owen
   * ported to js by Manuel Braun
   */

  /**
   * @param {!w69b.img.BitMatrixLike} image binary image.
   * @param {?w69b.qr.ResultPointCallback=} opt_callback callback.
   * @constructor
   */
  w69b.qr.FinderPatternFinder = function(image, opt_callback) {
    /**
     * @type {!w69b.img.BitMatrixLike}
     * @private
     */
    this.image_ = image;
    /**
     * @type {Array.<FinderPattern>}
     */
    this.possibleCenters_ = [];
    /**
     *
     * @type {Array}
     * @private
     */
    this.crossCheckStateCount_ = new Array(5);
    /**
     * @type {?w69b.qr.ResultPointCallback}
     * @private
     */
    this.resultPointCallback_ = opt_callback || null;
    /**
     * @type {boolean}
     * @private
     */
    this.hasSkipped_ = false;

  };
  var _ = w69b.qr.FinderPatternFinder;
  var pro = w69b.qr.FinderPatternFinder.prototype;

  // manu: changed from 2 to 3 for more robustness.
  _.CENTER_QUORUM = 2;
  _.MIN_SKIP = 3; // 1 pixel/module times 3 modules/center
  _.MAX_MODULES = 57; // support up to version 10 for mobile clients
  _.INTEGER_MATH_SHIFT = 8;

  // Maximum skew error to skip scanning soon.
  _.SKEW_THRESHOLD = 0.05;
  // Precomputed combinations for 3 out of 6.
  _.SKEW_COMBINATIONS = [
    [0, 1, 2],
    [0, 1, 3],
    [0, 1, 4],
    [0, 1, 5],
    [0, 2, 3],
    [0, 2, 4],
    [0, 2, 5],
    [0, 3, 4],
    [0, 3, 5],
    [0, 4, 5],
    [1, 2, 3],
    [1, 2, 4],
    [1, 2, 5],
    [1, 3, 4],
    [1, 3, 5],
    [1, 4, 5],
    [2, 3, 4],
    [2, 3, 5],
    [2, 4, 5],
    [3, 4, 5]
  ];


  /**
   * @param {Object=} opt_hints hints.
   * @return {FinderPatternInfo} info.
   */
  pro.find = function(opt_hints) {
    var tryHarder = opt_hints && !!opt_hints[w69b.qr.DecodeHintType.TRY_HARDER];
    var maxI = this.image_.height;
    var maxJ = this.image_.width;
    // We are looking for black/white/black/white/black modules in
    // 1:1:3:1:1 ratio; this tracks the number of such modules seen so far

    // Let's assume that the maximum version QR Code we support takes up 1/4
    // the height of the
    // this.image_, and then account for the center being 3 modules in size.
    // This gives the smallest
    // number of pixels the center could be, so skip this often. When trying
    // harder, look for all
    // QR versions regardless of how dense they are.
    var iSkip = Math.floor((3 * maxI) / (4 * _.MAX_MODULES));
    if (iSkip < _.MIN_SKIP || tryHarder) {
      iSkip = _.MIN_SKIP;
    }

    var done = false;
    var stateCount = new Array(5);
    var confirmed;
    for (var i = iSkip - 1; i < maxI && !done; i += iSkip) {
      // Get a row of black/white values
      stateCount[0] = 0;
      stateCount[1] = 0;
      stateCount[2] = 0;
      stateCount[3] = 0;
      stateCount[4] = 0;
      var currentState = 0;
      for (var j = 0; j < maxJ; j++) {
        if (this.image_.get(j, i)) {
          // Black pixel
          if ((currentState & 1) == 1) { // Counting white pixels
            currentState++;
          }
          stateCount[currentState]++;
        } else { // White pixel
          if ((currentState & 1) == 0) { // Counting black pixels
            if (currentState == 4) { // A winner?
              if (_.foundPatternCross(stateCount)) { // Yes
                confirmed = this.handlePossibleCenter(stateCount, i, j);
                if (confirmed) {
                  // Start examining every other line. Checking each line
                  // turned out to be too
                  // expensive and didn't improve performance.
                  iSkip = 2;
                  if (this.hasSkipped_) {
                    done = this.haveMultiplyConfirmedCenters();
                  } else {
                    var rowSkip = this.findRowSkip();
                    if (rowSkip > stateCount[2]) {
                      // Skip rows between row of lower confirmed center
                      // and top of presumed third confirmed center
                      // but back up a bit to get a full chance of detecting
                      // it, entire width of center of finder pattern

                      // Skip by rowSkip, but back off by stateCount[2]
                      // (size of last center
                      // of pattern we saw) to be conservative, and also
                      // back off by iSkip which
                      // is about to be re-added
                      i += rowSkip - stateCount[2] - iSkip;
                      j = maxJ - 1;
                    }
                  }
                } else {
                  stateCount[0] = stateCount[2];
                  stateCount[1] = stateCount[3];
                  stateCount[2] = stateCount[4];
                  stateCount[3] = 1;
                  stateCount[4] = 0;
                  currentState = 3;
                  continue;
                }
                // Clear state to start looking again
                currentState = 0;
                stateCount[0] = 0;
                stateCount[1] = 0;
                stateCount[2] = 0;
                stateCount[3] = 0;
                stateCount[4] = 0;
              } else { // No, shift counts back by two
                stateCount[0] = stateCount[2];
                stateCount[1] = stateCount[3];
                stateCount[2] = stateCount[4];
                stateCount[3] = 1;
                stateCount[4] = 0;
                currentState = 3;
              }
            } else {
              stateCount[++currentState]++;
            }
          } else { // Counting white pixels
            stateCount[currentState]++;
          }
        }
      }
      if (_.foundPatternCross(stateCount)) {
        confirmed = this.handlePossibleCenter(stateCount, i, maxJ);
        if (confirmed) {
          iSkip = stateCount[0];
          if (this.hasSkipped_) {
            // Found a third one
            done = this.haveMultiplyConfirmedCenters();
          }
        }
      }
    }

    var patternInfo = this.selectBestPatterns(true);
    w69b.qr.FinderPattern.orderBestPatterns(patternInfo);

    return new FinderPatternInfo(patternInfo);
  };

  /**
   * Given a count of black/white/black/white/black pixels just seen and an
   * end position,
   * figures the location of the center of this run.
   * @param {Array.<number>} stateCount state count.
   * @param {number} end end position.
   * @return {number} position.
   */
  pro.centerFromEnd = function(stateCount, end) {
    return (end - stateCount[4] - stateCount[3]) - stateCount[2] / 2.;
  };

  /**
   * @param {Array.<number>} stateCount count of
   * black/white/black/white/black pixels just read.
   * @return {boolean} true iff the proportions of the counts is close enough
   * to the 1/1/3/1/1 ratios used by finder patterns to be considered a match.
   */
  _.foundPatternCross = function(stateCount) {
    var totalModuleSize = 0;
    for (var i = 0; i < 5; i++) {
      var count = stateCount[i];
      if (count == 0) {
        return false;
      }
      totalModuleSize += count;
    }
    if (totalModuleSize < 7) {
      return false;
    }
    var moduleSize = Math.floor((totalModuleSize << _.INTEGER_MATH_SHIFT) / 7);
    var maxVariance = Math.floor(moduleSize / 2);
    // Allow less than 50% variance from 1-1-3-1-1 proportions
    return Math.abs(moduleSize - (stateCount[0] << _.INTEGER_MATH_SHIFT)) <
      maxVariance &&
      Math.abs(moduleSize - (stateCount[1] << _.INTEGER_MATH_SHIFT)) <
        maxVariance &&
      Math.abs(3 * moduleSize - (stateCount[2] << _.INTEGER_MATH_SHIFT)) <
        3 * maxVariance &&
      Math.abs(moduleSize - (stateCount[3] << _.INTEGER_MATH_SHIFT)) <
        maxVariance &&
      Math.abs(moduleSize - (stateCount[4] << _.INTEGER_MATH_SHIFT)) <
        maxVariance;
  };

  /**
   * @return {Array.<number>} count.
   */
  pro.getCrossCheckStateCount = function() {
    this.crossCheckStateCount_[0] = 0;
    this.crossCheckStateCount_[1] = 0;
    this.crossCheckStateCount_[2] = 0;
    this.crossCheckStateCount_[3] = 0;
    this.crossCheckStateCount_[4] = 0;
    return this.crossCheckStateCount_;
  };

  /**
   * <p>After a horizontal scan finds a potential finder pattern, this method
   * "cross-checks" by scanning down vertically through the center of the
   * possible finder pattern to see if the same proportion is detected.</p>
   *
   * @param {number} startI row where a finder pattern was detected.
   * @param {number} centerJ center of the section that appears to cross
   * a finder pattern.
   * @param {number} maxCount maximum reasonable number of modules that
   * should beobserved in any reading state, based on the results of the
   * horizontal scan.
   * @param {number} originalStateCountTotal nodoc.
   * @return {number} vertical center of finder pattern, or {@link NaN}
   * if not found.
   */
  pro.crossCheckVertical = function(startI, centerJ, maxCount,
                                    originalStateCountTotal) {
    var image = this.image_;

    var maxI = image.height;
    var stateCount = this.getCrossCheckStateCount();

    // Start counting up from center
    var i = startI;
    while (i >= 0 && image.get(centerJ, i)) {
      stateCount[2]++;
      i--;
    }
    if (i < 0) {
      return NaN;
    }
    while (i >= 0 && !image.get(centerJ, i) &&
      stateCount[1] <= maxCount) {
      stateCount[1]++;
      i--;
    }
    // If already too many modules in this state or ran off the edge:
    if (i < 0 || stateCount[1] > maxCount) {
      return NaN;
    }
    while (i >= 0 && image.get(centerJ, i) &&
      stateCount[0] <= maxCount) {
      stateCount[0]++;
      i--;
    }
    if (stateCount[0] > maxCount) {
      return NaN;
    }

    // Now also count down from center
    i = startI + 1;
    while (i < maxI && image.get(centerJ, i)) {
      stateCount[2]++;
      i++;
    }
    if (i == maxI) {
      return NaN;
    }
    while (i < maxI && !image.get(centerJ, i) &&
      stateCount[3] < maxCount) {
      stateCount[3]++;
      i++;
    }
    if (i == maxI || stateCount[3] >= maxCount) {
      return NaN;
    }
    while (i < maxI && image.get(centerJ, i) &&
      stateCount[4] < maxCount) {
      stateCount[4]++;
      i++;
    }
    if (stateCount[4] >= maxCount) {
      return NaN;
    }

    // If we found a finder-pattern-like section, but its size is more than
    // 40% different than the original, assume it's a false positive
    var stateCountTotal = stateCount[0] + stateCount[1] +
      stateCount[2] + stateCount[3] +
      stateCount[4];
    if (5 * Math.abs(stateCountTotal - originalStateCountTotal) >=
      2 * originalStateCountTotal) {
      return NaN;
    }

    return _.foundPatternCross(stateCount) ?
      this.centerFromEnd(stateCount, i) : NaN;
  };

  /**
   * <p>Like {@link #crossCheckVertical(int, int, int, int)}, and in fact
   * is basically identical, except it reads horizontally instead of
   * vertically. This is used to cross-cross check a vertical cross check
   * and locate the real center of the alignment pattern.</p>
   * @param {number} startJ col where a finder pattern was detected.
   * @param {number} centerI center of the section that appears to cross a
   * finder pattern.
   * @param {number} maxCount maximum reasonable number of modules that should
   * be observed in any reading state, based on the results of the horizontal
   * scan.
   * @param {number} originalStateCountTotal nodoc.
   * @return {number} horizontal center of finder pattern, or NaN if not found.
   */
  pro.crossCheckHorizontal = function(startJ, centerI, maxCount,
                                      originalStateCountTotal) {
    var image = this.image_;

    var maxJ = image.width;
    var stateCount = this.getCrossCheckStateCount();

    var j = startJ;
    while (j >= 0 && image.get(j, centerI)) {
      stateCount[2]++;
      j--;
    }
    if (j < 0) {
      return NaN;
    }
    while (j >= 0 && !image.get(j, centerI) &&
      stateCount[1] <= maxCount) {
      stateCount[1]++;
      j--;
    }
    if (j < 0 || stateCount[1] > maxCount) {
      return NaN;
    }
    while (j >= 0 && image.get(j, centerI) &&
      stateCount[0] <= maxCount) {
      stateCount[0]++;
      j--;
    }
    if (stateCount[0] > maxCount) {
      return NaN;
    }

    j = startJ + 1;
    while (j < maxJ && image.get(j, centerI)) {
      stateCount[2]++;
      j++;
    }
    if (j == maxJ) {
      return NaN;
    }
    while (j < maxJ && !image.get(j, centerI) &&
      stateCount[3] < maxCount) {
      stateCount[3]++;
      j++;
    }
    if (j == maxJ || stateCount[3] >= maxCount) {
      return NaN;
    }
    while (j < maxJ && image.get(j, centerI) &&
      stateCount[4] < maxCount) {
      stateCount[4]++;
      j++;
    }
    if (stateCount[4] >= maxCount) {
      return NaN;
    }

    // If we found a finder-pattern-like section, but its size is
    // significantly different than
    // the original, assume it's a false positive
    var stateCountTotal = stateCount[0] + stateCount[1] +
      stateCount[2] + stateCount[3] + stateCount[4];
    if (5 * Math.abs(stateCountTotal - originalStateCountTotal) >=
      originalStateCountTotal) {
      return NaN;
    }

    return _.foundPatternCross(stateCount) ?
      this.centerFromEnd(stateCount, j) : NaN;
  };

  /**
   * <p>This is called when a horizontal scan finds a possible alignment
   * pattern. It will cross check with a vertical scan, and if successful,
   * will, ah, cross-cross-check with another horizontal scan. This is needed
   * primarily to locate the real horizontal center of the pattern in cases of
   * extreme skew.</p>
   *
   * <p>If that succeeds the finder pattern location is added to a list that
   * tracks the number of times each location has been nearly-matched as a
   * finder pattern.  Each additional find is more evidence that the location
   * is in fact a finder pattern center
   *
   * @param {Array.<number>} stateCount reading state module counts from
   * horizontal scan.
   * @param {number} i row where finder pattern may be found.
   * @param {number} j end of possible finder pattern in row.
   * @return {boolean} true if a finder pattern candidate was found this time.
   */
  pro.handlePossibleCenter = function(stateCount, i, j) {
    var stateCountTotal = stateCount[0] + stateCount[1] +
      stateCount[2] + stateCount[3] + stateCount[4];
    var centerJ = this.centerFromEnd(stateCount, j);
    var centerI = this.crossCheckVertical(i, Math.floor(centerJ),
      stateCount[2], stateCountTotal);
    if (!isNaN(centerI)) {
      // Re-cross check
      centerJ = this.crossCheckHorizontal(Math.floor(centerJ),
        Math.floor(centerI), stateCount[2], stateCountTotal);
      if (!isNaN(centerJ)) {
        var estimatedModuleSize = stateCountTotal / 7.;
        var found = false;
        for (var index = 0; index < this.possibleCenters_.length; index++) {
          var center = this.possibleCenters_[index];
          // Look for about the same center and module size:
          if (center.aboutEquals(estimatedModuleSize, centerI, centerJ)) {
            this.possibleCenters_[index] =
              center.combineEstimate(centerI, centerJ, estimatedModuleSize);
            found = true;
            break;
          }
        }
        if (!found) {
          var point = new FinderPattern(centerJ, centerI, estimatedModuleSize);
          this.possibleCenters_.push(point);
          if (this.resultPointCallback_ != null) {
            this.resultPointCallback_(point);
          }
        }
        return true;
      }
    }
    return false;
  };

  /**
   * @return {number} number of rows we could safely skip during scanning,
   * based on the first two finder patterns that have been located. In some
   * cases their position will allow us to infer that the third pattern must
   * lie below a certain point farther down in the image.
   */
  pro.findRowSkip = function() {
    var max = this.possibleCenters_.length;
    if (max <= 1) {
      return 0;
    }
    var firstConfirmedCenter = null;
    for (var i = 0; i < this.possibleCenters_.length; ++i) {
      var center = this.possibleCenters_[i];
      if (center.getCount() >= _.CENTER_QUORUM) {
        if (firstConfirmedCenter == null) {
          firstConfirmedCenter = center;
        } else {
          // We have two confirmed centers
          // How far down can we skip before resuming looking for the next
          // pattern? In the worst case, only the difference between the
          // difference in the x / y coordinates of the two centers.
          // This is the case where you find top left last.
          this.hasSkipped_ = true;
          return Math.floor((
            Math.abs(firstConfirmedCenter.getX() - center.getX()) -
              Math.abs(firstConfirmedCenter.getY() - center.getY())) / 2);
        }
      }
    }
    return 0;
  };

  /**
   * @return {boolean} true iff we have found at least 3 finder patterns that
   * have been detected at least {@link #CENTER_QUORUM} times each, and
   * , the estimated module size of the candidates is "pretty similar".
   */
  pro.haveMultiplyConfirmedCenters = function() {
    var confirmedCount = 0;
    var totalModuleSize = 0.;
    var max = this.possibleCenters_.length;
    this.possibleCenters_.forEach(function(pattern) {
      if (pattern.getCount() >= _.CENTER_QUORUM) {
        confirmedCount++;
        totalModuleSize += pattern.getEstimatedModuleSize();
      }
    }, this);
    if (confirmedCount < 3) {
      return false;
    }
    // OK, we have at least 3 confirmed centers, but, it's possible that one
    // is a "false positive"
    // and that we need to keep looking. We detect this by asking if the
    // estimated module sizes
    // vary too much. We arbitrarily say that when the total deviation
    // from average exceeds
    // 5% of the total module size estimates, it's too much.
    // manu: Does it make sense to divide by max while counting
    // only those with >= CENTER_QUORUM.
    var average = totalModuleSize / max;
    var totalDeviation = 0.;
    this.possibleCenters_.forEach(function(pattern) {
      totalDeviation += Math.abs(pattern.getEstimatedModuleSize() - average);
    });
    if (totalDeviation > 0.05 * totalModuleSize)
      return false;

    // Check skew of best patterns.
    var centers = this.selectBestPatterns();
    var skew = _.computeSkew(centers);

    return skew < _.SKEW_THRESHOLD;
  };

  /**
   * @param {boolean=} opt_checkSkew check skew, defaults to false.
   * @return {Array.<FinderPattern>} the 3 best FinderPatterns from our list
   * of candidates. The "best" are those that have been detected at
   * least CENTER_QUORUM times, and whose module size differs from the
   * average among those patterns the least.
   */
  pro.selectBestPatterns = function(opt_checkSkew) {
    var startSize = this.possibleCenters_.length;
    if (startSize < 3) {
      // Couldn't find enough finder patterns
      throw new w69b.qr.NotFoundError();
    }
    var average;
    var centers = goog.array.clone(this.possibleCenters_);

    // Filter outlier possibilities whose module size is too different
    if (startSize > 3) {
      // But we can only afford to do so if we have at least 4 possibilities
      // to choose from
      var totalModuleSize = 0.;
      var square = 0.;
      centers.forEach(function(center) {
        var size = center.getEstimatedModuleSize();
        totalModuleSize += size;
        square += size * size;
      });
      average = totalModuleSize / startSize;
      var stdDev = Math.sqrt(square / startSize - average * average);

      centers.sort(_.FurthestFromAverageComparator(average));

      var limit = Math.max(0.2 * average, stdDev);

      for (var i = 0; i < centers.length &&
        centers.length > 3; i++) {
        var pattern = centers[i];
        if (Math.abs(pattern.getEstimatedModuleSize() - average) > limit) {
          goog.array.removeAt(centers, i);
          i--;
        }
      }
    }

    if (centers.length > 3) {
      // Throw away all but those first size candidate points we found.

      totalModuleSize = 0.;
      centers.forEach(function(possibleCenter) {
        totalModuleSize += possibleCenter.getEstimatedModuleSize();
      });

      average = totalModuleSize / centers.length;

      centers.sort(_.CenterComparator(average));

      if (opt_checkSkew) {
        // check skew error of first few sets.
        var withSkew = _.getCombinations(centers).map(function(combination) {
          return {centers: combination,
            skew: _.computeSkew(combination)};
        });
        withSkew.sort(function(a, b) {
          return goog.array.defaultCompare(a.skew, b.skew);
        });
        // pick canidates with lowest skew.
        centers = withSkew[0].centers;
      } else {
        centers = centers.slice(0, 3);
      }


    }

    return centers;
  };

  /**
   * Get c
   * @param {Array.<FinderPattern>} centers finder pattern candidates.
   * @return {Array.<Array.<FinderPattern>>} result.
   */
  _.getCombinations = function(centers) {
    var len = centers.length;
    var result = [];
    _.SKEW_COMBINATIONS.forEach(function(indices) {
      if (indices[0] < len && indices[1] && len && indices[2] < len) {
        result.push([centers[indices[0]], centers[indices[1]],
          centers[indices[2]]]);
      }
    });
    return result;
  };

  /**
   * <p>Orders by furthest from average</p>
   * @param {number} average average.
   * @return {function(FinderPattern, FinderPattern):number} compare function.
   */
  _.FurthestFromAverageComparator = function(average) {
    return function(center1, center2) {
      var dA = Math.abs(center2.getEstimatedModuleSize() - average);
      var dB = Math.abs(center1.getEstimatedModuleSize() - average);
      return dA < dB ? -1 : dA == dB ? 0 : 1;
    };
  };

  /**
   * <p>Orders by {@link FinderPattern#getCount()}, descending.</p>
   * @param {number} average average.
   * @return {function(FinderPattern, FinderPattern):number} compare function.
   */
  _.CenterComparator = function(average) {
    return function(center1, center2) {
      if (center2.getCount() == center1.getCount()) {
        var dA = Math.abs(center2.getEstimatedModuleSize() - average);
        var dB = Math.abs(center1.getEstimatedModuleSize() - average);
        return dA < dB ? 1 : dA == dB ? 0 : -1;
      } else {
        return center2.getCount() - center1.getCount();
      }
    };
  };

  /**
   * Computes a - b / |a-b|.
   * @param {w69b.qr.ResultPoint} pattern1 a.
   * @param {w69b.qr.ResultPoint} pattern2 b.
   * @return {Array.<number>} result as array [x, y].
   */
  _.diff = function(pattern1, pattern2) {
    var diffX = pattern1.getX() - pattern2.getX();
    var diffY = pattern1.getY() - pattern2.getY();
    var len = Math.sqrt(diffX * diffX + diffY * diffY);
    return [diffX / len, diffY / len];
  };

  /**
   * Scalar product
   * @param {Array.<number>} a vector a.
   * @param {Array.<number>} b vector a.
   * @return {number} scalar product.
   */
  _.scalarProduct = function(a, b) {
    return a[0] * b[0] + a[1] * b[1];
  };

  // Square root of 1/2
  _.SQRT_05 = Math.sqrt(0.5);
  /**
   * Computes a number that expresses how good alignement of the givevn
   * patterns can be explained by a simliarity transformation. This
   * assumes that they are oriented in triangular shape.
   * @param {Array.<w69b.qr.ResultPoint>} patterns array of size 3.
   * @return {number} skew error.
   */
  _.computeSkew = function(patterns) {
    var diff01 = _.diff(patterns[0], patterns[1]);
    var diff02 = _.diff(patterns[0], patterns[2]);
    var diff12 = _.diff(patterns[1], patterns[2]);
    var scalars = [Math.abs(_.scalarProduct(diff01, diff02)),
      Math.abs(_.scalarProduct(diff01, diff12)),
      Math.abs(_.scalarProduct(diff02, diff12))
    ];

    scalars.sort();
    var error = scalars[0] +
      Math.abs(scalars[1] - _.SQRT_05) +
      Math.abs(scalars[2] - _.SQRT_05);
    return error;
  };

});
