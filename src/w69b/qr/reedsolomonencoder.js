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

goog.provide('w69b.qr.ReedSolomonEncoder');
goog.require('w69b.qr.GF256');
goog.require('w69b.qr.GF256Poly');

goog.scope(function() {
  var GF256 = w69b.qr.GF256;
  var GF256Poly = w69b.qr.GF256Poly;

  /**
   * <p>Implements Reed-Solomon enbcoding, as the name implies.</p>
   *
   * @author Sean Owen
   * @author William Rucklidge
   * @author mb@w69b.com (Mahuel Braun) ported to js.
   */

  /**
   *
   * @param {!GF256} field to use.
   * @constructor
   */
  w69b.qr.ReedSolomonEncoder = function(field) {
    /**
     * @private
     * @type {!GF256}
     */
    this.field_ = field;
    /**
     * @private
     * @type {Array.<!GF256Poly>}
     */
    this.cachedGenerators_ = [new GF256Poly(field, [1])];
  };
  var pro = w69b.qr.ReedSolomonEncoder.prototype;

  /**
   * @param {number} degree degree.
   * @return {!GF256Poly} generator.
   */
  pro.buildGenerator = function(degree) {
    var cachedGenerators = this.cachedGenerators_;
    if (degree >= cachedGenerators.length) {
      var lastGenerator = cachedGenerators[cachedGenerators.length - 1];
      for (var d = cachedGenerators.length; d <= degree; d++) {
        var nextGenerator = lastGenerator.multiply1(
          new GF256Poly(this.field_, [1, this.field_.exp(d - 1)]));
        cachedGenerators.push(nextGenerator);
        lastGenerator = nextGenerator;
      }
    }
    return cachedGenerators[degree];
  };

  /**
   * @param {Array.<number>} toEncode data to encode, including pre-allocated
   * space for ecc bytes.
   * @param {number} ecBytes number of ec bytes.
   */
  pro.encode = function(toEncode, ecBytes) {
    if (ecBytes == 0) {
      throw new Error('No error correction bytes');
    }
    var dataBytes = toEncode.length - ecBytes;
    if (dataBytes <= 0) {
      throw new Error('No data bytes provided');
    }
    var generator = this.buildGenerator(ecBytes);
    var infoCoefficients = toEncode.slice(0, dataBytes);
    var info = new GF256Poly(this.field_, infoCoefficients);
    info = info.multiplyByMonomial(ecBytes, 1);
    var remainder = info.divide(generator)[1];
    var coefficients = remainder.coefficients;
    var numZeroCoefficients = ecBytes - coefficients.length;
    var i;
    for (i = 0; i < numZeroCoefficients; i++) {
      toEncode[dataBytes + i] = 0;
    }
    for (i = 0; i < coefficients.length; ++i) {
      toEncode[dataBytes + numZeroCoefficients + i] = coefficients[i];
    }
    // System.arraycopy(coefficients, 0, toEncode,
    //   dataBytes + numZeroCoefficients, coefficients.length);
  };

});
