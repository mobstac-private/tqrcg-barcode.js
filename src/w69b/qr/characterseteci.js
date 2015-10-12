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

goog.provide('w69b.qr.CharacterSetECI');
goog.require('goog.object');

goog.scope(function() {

  var _ = w69b.qr.CharacterSetECI;
  /**
   * @type {Object} mapping eci codes to arrays of encoding names.
   */
  _.valuesToNames = {
    0: ['CP437'],
    2: ['CP437'],
    1: ['ISO-8859-1'],
    3: ['ISO-8859-1'],
    4: ['ISO-8859-2'],
    5: ['ISO-8859-3'],
    6: ['ISO-8859-4'],
    7: ['ISO-8859-5'],
    8: ['ISO-8859-6'],
    9: ['ISO-8859-7'],
    10: ['ISO-8859-7'],
    11: ['ISO-8859-9'],
    12: ['ISO-8859-10'],
    13: ['ISO-8859-11'],
    14: ['ISO-8859-12'],
    15: ['ISO-8859-13'],
    16: ['ISO-8859-14'],
    17: ['ISO-8859-15'],
    18: ['ISO-8859-16'],
    20: ['SHIFT_JIS'],
    21: ['ISO-8859-16'],
    22: ['Cp1251', 'windows-1251'],
    23: ['Cp1252', 'windows-1252'],
    24: ['Cp1256', 'windows-1256'],
    25: ['UTF-16BE', 'UnicodeBig'],
    26: ['UTF-8'],
    27: ['ASCII', 'US-ASCII'],
    170: ['ASCII', 'US-ASCII'],
    28: ['Big5'],
    29: ['GB18030', 'GB2312', 'EUC_CN', 'GBK'],
    30: ['EUC-KR']
  };
  _.namesToValues = {};
  /**
   * @private
   */
  _.buildNamesToValues_ = function() {
    goog.object.forEach(_.valuesToNames, function(names, num) {
      names.forEach(function(name) {
        if (!_.namesToValues[name])
          _.namesToValues[name] = num;
      });
    });
  };
  _.buildNamesToValues_();

  /**
   * @param {string} name of encoding.
   * @return {?number} eci value.
   */
  _.getValue = function(name) {
    return Number(_.namesToValues[name]);
  };

  /**
   * @param {number} value eci value.
   * @return {?string} main encoding name.
   */
  _.getName = function(value) {
    var names = _.valuesToNames[value];
    if (names)
      return names[0];
    else
      return null;
  };

});
