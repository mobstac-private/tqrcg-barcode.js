// javascript (closure) port (c) 2013 Manuel Braun (mb@w69b.com)
/*
 *
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
goog.provide('w69b.qr.FinderPattern');
goog.provide('w69b.qr.FinderPatternInfo');
goog.require('w69b.qr.ResultPoint');

goog.scope(function() {
  /**
   * @param {number} posX x pos.
   * @param {number} posY y pos.
   * @param {number} estimatedModuleSize estimated size.
   * @param {number=} opt_count count, defaults to 1.
   * @extends {w69b.qr.ResultPoint}
   * @constructor
   */
  w69b.qr.FinderPattern = function(posX, posY, estimatedModuleSize,
                                   opt_count) {
    goog.base(this, posX, posY);
    this.count = goog.isDef(opt_count) ? opt_count : 1;
    this.estimatedModuleSize = estimatedModuleSize;
  };
  var FinderPattern = w69b.qr.FinderPattern;
  goog.inherits(FinderPattern, w69b.qr.ResultPoint);
  var pro = FinderPattern.prototype;

  pro.incrementCount = function() {
    this.count++;
  };

  pro.getCount = function() {
    return this.count;
  };

  pro.aboutEquals = function(moduleSize, i, j) {
    if (Math.abs(i - this.y) <= moduleSize &&
      Math.abs(j - this.x) <= moduleSize) {
      var moduleSizeDiff = Math.abs(moduleSize - this.estimatedModuleSize);
      return moduleSizeDiff <= 1.0 ||
        moduleSizeDiff <= this.estimatedModuleSize;
    }
    return false;
  };

  /**
   * Combines this object's current estimate of a finder pattern position and
   * module size
   * with a new estimate. It returns a new {@code FinderPattern} containing
   * a weighted average based on count.
   * @param {number} i position.
   * @param {number} j position.
   * @param {number} newModuleSize size.
   * @return {FinderPattern} combined pattern.
   */
  pro.combineEstimate = function(i, j, newModuleSize) {
    var count = this.count;
    var combinedCount = count + 1;
    var combinedX = (count * this.x + j) / combinedCount;
    var combinedY = (count * this.y + i) / combinedCount;
    var combinedModuleSize = (count * this.estimatedModuleSize +
      newModuleSize) / combinedCount;
    return new FinderPattern(combinedX, combinedY,
      combinedModuleSize, combinedCount);
  };



  /**
   * @return {number} module size.
   */
  pro.getEstimatedModuleSize = function() {
    return this.estimatedModuleSize;
  };

  /**
   * @return {number} x pos.
   */
  pro.getX = function() {
    return this.x;
  };

  /**
   * @return {number} y pos.
   */
  pro.getY = function() {
    return this.y;
  };

  /**
   * Orders an array of three ResultPoints in an order [A,B,C] such that
   * AB < AC and
   * BC < AC and
   * the angle between BC and BA is less than 180 degrees.

   * @param {Array.<w69b.qr.FinderPattern>} patterns patterns to sort.
   */
  FinderPattern.orderBestPatterns = function(patterns) {
    function distance(pattern1, pattern2) {
      var xDiff = pattern1.x - pattern2.x;
      var yDiff = pattern1.y - pattern2.y;
      return (xDiff * xDiff + yDiff * yDiff);
    }

    // Returns the z component of the cross product between
    // vectors BC and BA.
    function crossProductZ(pointA, pointB, pointC) {
      var bX = pointB.x;
      var bY = pointB.y;
      return ((pointC.x - bX) * (pointA.y - bY)) -
        ((pointC.y - bY) * (pointA.x - bX));
    }


    // Find distances between pattern centers
    var zeroOneDistance = distance(patterns[0], patterns[1]);
    var oneTwoDistance = distance(patterns[1], patterns[2]);
    var zeroTwoDistance = distance(patterns[0], patterns[2]);

    var pointA, pointB, pointC;
    // Assume one closest to other two is B; A and C will just be guesses at
    // first.
    if (oneTwoDistance >= zeroOneDistance &&
      oneTwoDistance >= zeroTwoDistance) {
      pointB = patterns[0];
      pointA = patterns[1];
      pointC = patterns[2];
    } else if (zeroTwoDistance >= oneTwoDistance &&
      zeroTwoDistance >= zeroOneDistance) {
      pointB = patterns[1];
      pointA = patterns[0];
      pointC = patterns[2];
    } else {
      pointB = patterns[2];
      pointA = patterns[0];
      pointC = patterns[1];
    }

    // Use cross product to figure out whether A and C are correct or flipped.
    // This asks whether BC x BA has a positive z component, which is the
    // arrangement we want for A, B, C. If it's negative, then we've got it
    // flipped around and should swap A and C.
    if (crossProductZ(pointA, pointB, pointC) < 0.0) {
      var temp = pointA;
      pointA = pointC;
      pointC = temp;
    }

    patterns[0] = pointA;
    patterns[1] = pointB;
    patterns[2] = pointC;
  };


  /**
   * @return {Object} JSON object for pattern.
   */
  pro['toJSON'] = function() {
    return {
      'x': this.getX(),
      'y': this.getY(),
      'size': this.getEstimatedModuleSize()};
  };


  /**
   * @param {Array.<FinderPattern>} patternCenters size 3 array with
   * bottom left, top left and top right corner.
   * @constructor
   */
  w69b.qr.FinderPatternInfo = function(patternCenters) {
    // Bottom left and top right is flipped. Why?
    this.bottomLeft = patternCenters[0];
    this.topLeft = patternCenters[1];
    this.topRight = patternCenters[2];
  };
});
