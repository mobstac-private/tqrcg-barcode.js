// javascript (closure) port (c) 2013 Manuel Braun (mb@w69b.com)
/*
 Ported to JavaScript by Lazar Laszlo 2011

 lazarsoft@gmail.com, www.lazarsoft.info

 */

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

goog.provide('w69b.qr.ReedSolomonDecoder');
goog.require('w69b.qr.GF256Poly');
goog.require('w69b.qr.ReaderError');

/**
 * <p>Implements Reed-Solomon decoding, as the name implies.</p>
 *
 * <p>The algorithm will not be explained here, but the following references
 * were helpful
 * in creating this implementation:</p>
 *
 * <ul>
 * <li>Bruce Maggs.
 * <a href="http://www.cs.cmu.edu/afs/cs.cmu.edu/project/pscico-guyb/realworld
 * /www/rs_decode.ps">
 * "Decoding Reed-Solomon Codes"</a> (see discussion of Forney's Formula)</li>
 * <li>J.I. Hall. <a href="www.mth.msu.edu/~jhall/classes/codenotes/GRS.pdf">
 * "Chapter 5. Generalized Reed-Solomon Codes"</a>
 * (see discussion of Euclidean algorithm)</li>
 * </ul>
 *
 * <p>Much credit is due to William Rucklidge since portions of this code are
 * an indirect port of his C++ Reed-Solomon implementation.</p>
 *
 * @author Sean Owen
 * @author William Rucklidge
 * @author sanfordsquires
 */


goog.scope(function() {
  var GF256Poly = w69b.qr.GF256Poly;

  /**
   * @constructor
   * @param {string=} opt_msg message.
   * @extends {w69b.qr.ReaderError}
   */
  w69b.qr.ReedSolomonError = function(opt_msg) {
    goog.base(this, opt_msg);
  };
  goog.inherits(w69b.qr.ReedSolomonError, w69b.qr.ReaderError);
  var ReedSolomonError = w69b.qr.ReedSolomonError;
  /**
   * @constructor
   * @param {!w69b.qr.GF256} field field.
   */
  w69b.qr.ReedSolomonDecoder = function(field) {
    this.field = field;
  };
  var ReedSolomonDecoder = w69b.qr.ReedSolomonDecoder;
  var pro = ReedSolomonDecoder.prototype;

  /**
   * <p>Decodes given set of received codewords, which include both data and
   * error-correction codewords.
   * Really, this means it uses Reed-Solomon to detect and correct  errors,
   * in-place, in the input.</p>
   *
   * @param {Array.<number>} received data and error-correction codewords.
   * @param {number} twoS number of error-correction codewords available.
   */
  pro.decode = function(received, twoS) {
    var poly = new GF256Poly(this.field, received);
    var syndromeCoefficients = new Array(twoS);
    for (var i = 0; i <
      syndromeCoefficients.length; i++)syndromeCoefficients[i] = 0;
    var dataMatrix = false;//this.field.Equals(GF256.DATA_MATRIX_FIELD);
    var noError = true;
    for (var i = 0; i < twoS; i++) {
      // Thanks to sanfordsquires for this fix:
      var val = poly.evaluateAt(this.field.exp(dataMatrix ? i + 1 : i));
      syndromeCoefficients[syndromeCoefficients.length - 1 - i] = val;
      if (val != 0) {
        noError = false;
      }
    }
    if (noError) {
      return;
    }
    var syndrome = new GF256Poly(this.field, syndromeCoefficients);
    var sigmaOmega = this.runEuclideanAlgorithm(this.field.buildMonomial(twoS,
      1), syndrome, twoS);
    var sigma = sigmaOmega[0];
    var omega = sigmaOmega[1];
    var errorLocations = this.findErrorLocations(sigma);
    var errorMagnitudes = this.findErrorMagnitudes(omega, errorLocations,
      dataMatrix);
    for (var i = 0; i < errorLocations.length; i++) {
      var position = received.length - 1 - this.field.log(errorLocations[i]);
      if (position < 0) {
        throw new ReedSolomonError('bad error location');
      }
      received[position] = GF256Poly.addOrSubtractScalar(received[position],
        errorMagnitudes[i]);
    }
  };

  pro.runEuclideanAlgorithm = function(a, b, R) {
    // Assume a's degree is >= b's
    if (a.getDegree() < b.getDegree()) {
      var temp = a;
      a = b;
      b = temp;
    }

    var rLast = a;
    var r = b;
    var sLast = this.field.one;
    var s = this.field.zero;
    var tLast = this.field.zero;
    var t = this.field.one;

    // Run Euclidean algorithm until r's degree is less than R/2
    while (r.getDegree() >= Math.floor(R / 2)) {
      var rLastLast = rLast;
      var sLastLast = sLast;
      var tLastLast = tLast;
      rLast = r;
      sLast = s;
      tLast = t;

      // Divide rLastLast by rLast, with quotient in q and remainder in r
      if (rLast.isZero()) {
        // Oops, Euclidean algorithm already terminated?
        throw new ReedSolomonError('r_{i-1} was zero');
      }
      r = rLastLast;
      var q = this.field.zero;
      var denominatorLeadingTerm = rLast.getCoefficient(rLast.getDegree());
      var dltInverse = this.field.inverse(denominatorLeadingTerm);
      while (r.getDegree() >= rLast.getDegree() && !r.isZero()) {
        var degreeDiff = r.getDegree() - rLast.getDegree();
        var scale = this.field.multiply(r.getCoefficient(r.getDegree()),
          dltInverse);
        q = q.addOrSubtract(this.field.buildMonomial(degreeDiff, scale));
        r = r.addOrSubtract(rLast.multiplyByMonomial(degreeDiff, scale));
        //r.EXE();
      }

      s = q.multiply1(sLast).addOrSubtract(sLastLast);
      t = q.multiply1(tLast).addOrSubtract(tLastLast);
    }

    var sigmaTildeAtZero = t.getCoefficient(0);
    if (sigmaTildeAtZero == 0) {
      throw new ReedSolomonError('sigmaTilde(0) was zero');
    }

    var inverse = this.field.inverse(sigmaTildeAtZero);
    var sigma = t.multiply2(inverse);
    var omega = r.multiply2(inverse);
    return new Array(sigma, omega);
  };
  pro.findErrorLocations = function(errorLocator) {
    // This is a direct application of Chien's search
    var numErrors = errorLocator.getDegree();
    if (numErrors == 1) {
      // shortcut
      return [errorLocator.getCoefficient(1)];
    }
    var result = new Array(numErrors);
    var e = 0;
    for (var i = 1; i < 256 && e < numErrors; i++) {
      if (errorLocator.evaluateAt(i) == 0) {
        result[e] = this.field.inverse(i);
        e++;
      }
    }
    if (e != numErrors) {
      throw new ReedSolomonError('locator degree does not match ' +
        'number of roots');
    }
    return result;
  };
  pro.findErrorMagnitudes =
    function(errorEvaluator, errorLocations, dataMatrix) {
      // This is directly applying Forney's Formula
      var s = errorLocations.length;
      var result = new Array(s);
      for (var i = 0; i < s; i++) {
        var xiInverse = this.field.inverse(errorLocations[i]);
        var denominator = 1;
        for (var j = 0; j < s; j++) {
          if (i != j) {
            denominator =
              this.field.multiply(denominator, GF256Poly.addOrSubtractScalar(1,
                this.field.multiply(errorLocations[j], xiInverse)));
          }
        }
        result[i] = this.field.multiply(errorEvaluator.evaluateAt(xiInverse),
          this.field.inverse(denominator));
        // Thanks to sanfordsquires for this fix:
        if (dataMatrix) {
          result[i] = this.field.multiply(result[i], xiInverse);
        }
      }
      return result;
    };
});

