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

goog.provide('w69b.qr.AlignmentPattern');
goog.require('w69b.qr.ResultPoint');

goog.scope(function() {
  /**
   * Encapsulates an alignment pattern, which are the smaller square
   * patterns found in all but the simplest QR Codes.
   * @author Sean Owen
   * ported to js by Manuel Braun
   *
   * @param {number} posX x pos.
   * @param {number} posY y pos.
   * @param {number} estimatedModuleSize module size.
   * @constructor
   * @extends {w69b.qr.ResultPoint}
   */
  w69b.qr.AlignmentPattern = function(posX, posY, estimatedModuleSize) {
    goog.base(this, posX, posY);
    this.count = 1;
    this.estimatedModuleSize = estimatedModuleSize;
  };
  var AlignmentPattern = w69b.qr.AlignmentPattern;
  goog.inherits(AlignmentPattern, w69b.qr.ResultPoint);
  var pro = AlignmentPattern.prototype;

  pro.incrementCount = function() {
    this.count++;
  };

  /**
   * Determines if this alignment pattern "about equals" an alignment
   * pattern at the stated
   * position and size -- meaning, it is at nearly the same center with nearly
   * the same size.
   */
  pro.aboutEquals = function(moduleSize, i, j) {
    if (Math.abs(i - this.y) <= moduleSize &&
      Math.abs(j - this.x) <= moduleSize) {
      var moduleSizeDiff = Math.abs(moduleSize - this.estimatedModuleSize);
      return moduleSizeDiff <= 1.0 ||
        moduleSizeDiff / this.estimatedModuleSize <= 1.0;
    }
    return false;
  };

  /**
   * @return {number} module size.
   */
  pro.getEstimatedModuleSize = function() {
    return this.estimatedModuleSize;
  };

  /**
   * Combines this object's current estimate of a finder pattern position
   * and module size
   * with a new estimate.
   * @return {AlignmentPattern} a new containing an average of the two.
   */
  pro.combineEstimate = function(i, j, newModuleSize) {
    var combinedX = (this.x + j) / 2.0;
    var combinedY = (this.y + i) / 2.0;
    var combinedModuleSize = (this.estimatedModuleSize + newModuleSize) / 2.0;
    return new AlignmentPattern(combinedX, combinedY, combinedModuleSize);
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



});
