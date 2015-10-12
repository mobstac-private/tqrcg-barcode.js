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
goog.provide('w69b.qr.GridSampler');
goog.provide('w69b.qr.GridSamplerInterface');
goog.require('w69b.qr.NotFoundError');

goog.scope(function() {


  /** Implementations of this class can, given locations of finder patterns for
   * a QR code in an image, sample the right points in the image to reconstruct
   * the QR code, accounting for perspective distortion. It is abstracted since
   * it is relatively expensive and should be allowed to take advantage of
   * platform-specific optimized implementations, like Sun's Java Advanced
   * Imaging library, but which may not be available in other environments such
   * as J2ME, and vice versa.
   *
   * The implementation used can be controlled by calling {
   * setGridSampler(GridSampler)} with an instance of a class which implements
   * this interface.
   *
   * @author Sean Owen
   * @author Manuel Braun (mb@w69b.com) - ported to js
   */

  var _ = w69b.qr.GridSampler;

  _.gridSampler = null;

  /**
   * Sets the implementation of GridSampler used by the library. One global
   * instance is stored, which may sound problematic. But, the implementation
   * provided ought to be appropriate for the entire platform, and all uses of
   * this library in the whole lifetime of the JVM. For instance, an Android
   * activity can swap in an implementation that takes advantage of native
   * platform libraries.
   *
   * @param {w69b.qr.GridSamplerInterface} newGridSampler The
   * platform-specific object to install.
   */
  _.setGridSampler = function(newGridSampler) {
    _.gridSampler = newGridSampler;
  };

  /**
   * @return {w69b.qr.GridSamplerInterface} the current implementation of GridSampler.
   */
  _.getInstance = function() {
    return _.gridSampler;
  };

  /**
   * Grid sample interface.
   * @interface
   */
  w69b.qr.GridSamplerInterface = function() {
  };

  /**
   * Samples an image for a rectangular matrix of bits of the given dimension.
   * @param {w69b.qr.BitMatrix} image image to sample.
   * @param {number} dimensionX width of BitMatrix to sample from image.
   * @param {number} dimensionY height of BitMatrix to sample from
   * image.
   * @return {w69b.qr.BitMatrix} representing a grid of points sampled from
   * the image within a region defined by the "from" parameters by the given
   * points is invalid or results in sampling outside the image boundaries.
   */
  w69b.qr.GridSamplerInterface.prototype.sampleGrid = function(image, dimensionX, dimensionY,
                                             p1ToX, p1ToY, p2ToX, p2ToY, p3ToX,
                                             p3ToY, p4ToX, p4ToY, p1FromX,
                                             p1FromY, p2FromX, p2FromY,
                                             p3FromX, p3FromY, p4FromX,
                                             p4FromY) {

  };

  /**
   * Samples an image for a rectangular matrix of bits of the given dimension.
   * @param {w69b.qr.BitMatrix} image image to sample.
   * @param {number} dimensionX width of BitMatrix to sample from image.
   * @param {number} dimensionY height of BitMatrix to sample from
   * image.
   * @param {w69b.qr.PerspectiveTransform} transform transformation matrix.
   * @return {w69b.qr.BitMatrix} representing a grid of points sampled from
   * the image within a region defined by the "from" parameters by the given
   * points is invalid or results in sampling outside the image boundaries.
   */
  w69b.qr.GridSamplerInterface.prototype.sampleGridTransform = function(image, dimensionX,
                                                      dimensionY, transform) {
  };

  /**
   * <p>Checks a set of points that have been transformed to sample points on
   * an image against the image's dimensions to see if the point are even
   * within the image.</p>
   *
   * <p>This method will actually "nudge" the endpoints back onto the image if
   * they are found to be barely (less than 1 pixel) off the image. This
   * accounts for imperfect detection of finder patterns in an image where the
   * QR Code runs all the way to the image border.</p>
   *
   * <p>For efficiency, the method will check points from either end of the
   * line until one is found to be within the image. Because the set of points
   * are assumed to be linear, this is valid.</p>
   *
   * @param {w69b.qr.BitMatrix} image image into which the points should map.
   * @param {Array.<number>} points actual points in x1,y1,...,xn,yn form.
   */
  _.checkAndNudgePoints = function(image, points) {
    var width = image.getWidth();
    var height = image.getHeight();
    // Check and nudge points from start until we see some that are OK:
    var nudged = true;
    var x, y, offset;
    for (offset = 0; offset < points.length && nudged; offset += 2) {
      x = points[offset] >> 0;
      y = points[offset + 1] >> 0;
      if (x < -1 || x > width || y < -1 || y > height) {
        throw new w69b.qr.NotFoundError();
      }
      nudged = false;
      if (x == -1) {
        points[offset] = 0.;
        nudged = true;
      } else if (x == width) {
        points[offset] = width - 1;
        nudged = true;
      }
      if (y == -1) {
        points[offset + 1] = 0.;
        nudged = true;
      } else if (y == height) {
        points[offset + 1] = height - 1;
        nudged = true;
      }
    }
    // Check and nudge points from end:
    nudged = true;
    for (offset = points.length - 2; offset >= 0 && nudged; offset -= 2) {
      x = points[offset] >> 0;
      y = points[offset + 1] >> 0;
      if (x < -1 || x > width || y < -1 || y > height) {
        throw new w69b.qr.NotFoundError();
      }
      nudged = false;
      if (x == -1) {
        points[offset] = 0.;
        nudged = true;
      } else if (x == width) {
        points[offset] = width - 1;
        nudged = true;
      }
      if (y == -1) {
        points[offset + 1] = 0.;
        nudged = true;
      } else if (y == height) {
        points[offset + 1] = height - 1;
        nudged = true;
      }
    }
  };


});
