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

goog.provide('w69b.qr.DefaultGridSampler');
goog.require('w69b.qr.BitMatrix');
goog.require('w69b.qr.GridSampler');
goog.require('w69b.qr.GridSamplerInterface');
goog.require('w69b.qr.PerspectiveTransform');

goog.scope(function() {

  var PerspectiveTransform = w69b.qr.PerspectiveTransform;
  var GridSampler = w69b.qr.GridSampler;
  var BitMatrix = w69b.qr.BitMatrix;
  /**
   * @author Sean Owen
   * @author Manuel Braun (mb@w69b.com) - ported to js.
   * @constructor
   * @implements {w69b.qr.GridSamplerInterface}
   */
  w69b.qr.DefaultGridSampler = function() {
  };
  var pro = w69b.qr.DefaultGridSampler.prototype;

  pro.sampleGrid = function(image, dimensionX, dimensionY, p1ToX, p1ToY, p2ToX,
                            p2ToY, p3ToX, p3ToY, p4ToX, p4ToY, p1FromX,
                            p1FromY, p2FromX, p2FromY, p3FromX, p3FromY,
                            p4FromX, p4FromY) {

    var transform = PerspectiveTransform.quadrilateralToQuadrilateral(
      p1ToX, p1ToY, p2ToX, p2ToY, p3ToX, p3ToY, p4ToX, p4ToY,
      p1FromX, p1FromY, p2FromX, p2FromY, p3FromX, p3FromY, p4FromX, p4FromY);

    return this.sampleGridTransform(image, dimensionX, dimensionY, transform);
  };

  pro.sampleGridTransform = function(image, dimensionX, dimensionY,
                                     transform) {
    if (dimensionX <= 0 || dimensionY <= 0) {
      throw new w69b.qr.NotFoundError();
    }
    var bits = new BitMatrix(dimensionX, dimensionY);
    var points = new Array(dimensionX << 1);
    var x;
    for (var y = 0; y < dimensionY; y++) {
      var max = points.length;
      var iValue = y + 0.5;
      for (x = 0; x < max; x += 2) {
        points[x] = (x >> 1) + 0.5;
        points[x + 1] = iValue;
      }
      transform.transformPoints1(points);
      // Quick check to see if points transformed to something inside the
      // image; sufficient to check the endpoints
      GridSampler.checkAndNudgePoints(image, points);
      try {
        for (x = 0; x < max; x += 2) {
          if (image.get(points[x] >> 0, points[x + 1] >> 0)) {
            // Black(-ish) pixel
            bits.set(x >> 1, y);
          }
        }
      } catch (aioobe) {
        // This feels wrong, but, sometimes if the finder patterns are
        // misidentified, the resulting transform gets "twisted" such that it
        // maps a straight line of points to a set of points whose endpoints
        // are in bounds, but others are not. There is probably some
        // mathematical way to detect this about the transformation that I
        // don't know yet.  This results in an ugly runtime exception despite
        // our clever checks above -- can't have that. We could check each
        // point's coordinates but that feels duplicative. We settle for
        // catching and wrapping ArrayIndexOutOfBoundsException.
        throw new w69b.qr.NotFoundError();
      }
    }
    return bits;
  };

  // set default grid sampler.
  GridSampler.setGridSampler(new w69b.qr.DefaultGridSampler());

});
