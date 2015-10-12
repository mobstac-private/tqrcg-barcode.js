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

goog.provide('w69b.qr.PerspectiveTransform');

goog.scope(function() {
  /**
   * @constructor
   */
  w69b.qr.PerspectiveTransform = function(a11, a21, a31, a12, a22, a32, a13,
                                          a23, a33) {
    this.a11 = a11;
    this.a12 = a12;
    this.a13 = a13;
    this.a21 = a21;
    this.a22 = a22;
    this.a23 = a23;
    this.a31 = a31;
    this.a32 = a32;
    this.a33 = a33;
  };
  var PerspectiveTransform = w69b.qr.PerspectiveTransform;
  var pro = PerspectiveTransform.prototype;
  pro.transformPoints1 = function(points) {
    var max = points.length;
    var a11 = this.a11;
    var a12 = this.a12;
    var a13 = this.a13;
    var a21 = this.a21;
    var a22 = this.a22;
    var a23 = this.a23;
    var a31 = this.a31;
    var a32 = this.a32;
    var a33 = this.a33;
    for (var i = 0; i < max; i += 2) {
      var x = points[i];
      var y = points[i + 1];
      var denominator = a13 * x + a23 * y + a33;
      points[i] = (a11 * x + a21 * y + a31) / denominator;
      points[i + 1] = (a12 * x + a22 * y + a32) / denominator;
    }
  };

  pro.transformPoints2 = function(xValues, yValues) {
    var n = xValues.length;
    for (var i = 0; i < n; i++) {
      var x = xValues[i];
      var y = yValues[i];
      var denominator = this.a13 * x + this.a23 * y + this.a33;
      xValues[i] = (this.a11 * x + this.a21 * y + this.a31) / denominator;
      yValues[i] = (this.a12 * x + this.a22 * y + this.a32) / denominator;
    }
  };

  pro.buildAdjoint = function() {
    // Adjoint is the transpose of the cofactor matrix:
    return new PerspectiveTransform(this.a22 * this.a33 -
      this.a23 * this.a32,
      this.a23 * this.a31 - this.a21 * this.a33,
      this.a21 * this.a32 - this.a22 * this.a31,
      this.a13 * this.a32 - this.a12 * this.a33,
      this.a11 * this.a33 - this.a13 * this.a31,
      this.a12 * this.a31 - this.a11 * this.a32,
      this.a12 * this.a23 - this.a13 * this.a22,
      this.a13 * this.a21 - this.a11 * this.a23,
      this.a11 * this.a22 - this.a12 * this.a21);
  };

  pro.times = function(other) {
    return new PerspectiveTransform(this.a11 * other.a11 +
      this.a21 * other.a12 + this.a31 * other.a13,
      this.a11 * other.a21 + this.a21 * other.a22 + this.a31 * other.a23,
      this.a11 * other.a31 + this.a21 * other.a32 + this.a31 * other.a33,
      this.a12 * other.a11 + this.a22 * other.a12 + this.a32 * other.a13,
      this.a12 * other.a21 + this.a22 * other.a22 + this.a32 * other.a23,
      this.a12 * other.a31 + this.a22 * other.a32 + this.a32 * other.a33,
      this.a13 * other.a11 + this.a23 * other.a12 + this.a33 * other.a13,
      this.a13 * other.a21 + this.a23 * other.a22 + this.a33 * other.a23,
      this.a13 * other.a31 + this.a23 * other.a32 + this.a33 * other.a33);
  };

  PerspectiveTransform.quadrilateralToQuadrilateral = function(
    x0, y0, x1, y1, x2, y2, x3, y3, x0p, y0p, x1p, y1p, x2p, y2p, x3p, y3p) {

    var qToS = PerspectiveTransform.quadrilateralToSquare(
      x0, y0, x1, y1, x2, y2, x3, y3);
    var sToQ = PerspectiveTransform.squareToQuadrilateral(
      x0p, y0p, x1p, y1p, x2p, y2p, x3p,
      y3p);
    return sToQ.times(qToS);
  };

  PerspectiveTransform.squareToQuadrilateral = function(x0, y0, x1, y1,
                                                        x2, y2, x3, y3) {
    var dy2 = y3 - y2;
    var dy3 = y0 - y1 + y2 - y3;
    if (dy2 == 0.0 && dy3 == 0.0) {
      return new PerspectiveTransform(x1 - x0, x2 - x1, x0, y1 - y0, y2 - y1,
        y0,
        0.0, 0.0, 1.0);
    } else {
      var dx1 = x1 - x2;
      var dx2 = x3 - x2;
      var dx3 = x0 - x1 + x2 - x3;
      var dy1 = y1 - y2;
      var denominator = dx1 * dy2 - dx2 * dy1;
      var a13 = (dx3 * dy2 - dx2 * dy3) / denominator;
      var a23 = (dx1 * dy3 - dx3 * dy1) / denominator;
      return new PerspectiveTransform(x1 - x0 + a13 * x1, x3 - x0 + a23 * x3,
        x0,
        y1 - y0 + a13 * y1, y3 - y0 + a23 * y3, y0, a13, a23, 1.0);
    }
  };

  PerspectiveTransform.quadrilateralToSquare = function(x0, y0, x1, y1,
                                                        x2, y2, x3, y3) {
    // Here, the adjoint serves as the inverse:
    return PerspectiveTransform.squareToQuadrilateral(
      x0, y0, x1, y1, x2, y2, x3, y3).buildAdjoint();
  };

});
