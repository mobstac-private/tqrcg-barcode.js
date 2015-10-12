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
goog.provide('w69b.qr.DecodeResult');
goog.require('goog.asserts');
goog.require('w69b.qr.ReaderError');

goog.scope(function() {
  /**
   * Encapsulates decoded result reader error.
   * @param {(string|w69b.qr.ReaderError)} text decoded text or error.
   * @param {Array.<w69b.qr.ResultPoint>=} opt_patterns sed for decoding.
   * @constructor
   */
  w69b.qr.DecodeResult = function(text, opt_patterns) {
    /**
     * @type {(string|w69b.qr.ReaderError)}
     * @private
     */
    this.result_ = text;
    this.patterns_ = opt_patterns || [];
  };
  var pro = w69b.qr.DecodeResult.prototype;

  /**
   * Only available if result is not an error.
   * @return {?string} decoded string.
   */
  pro.getText = function() {
    if (this.isError())
      return null;
    else
      return /** @type {string} */ (this.result_);
  };

  /**
   * @return {boolean} if result was an error.
   */
  pro.isError = function() {
    return (this.result_ instanceof w69b.qr.ReaderError);
  };

  /**
   * @return {?w69b.qr.ReaderError} error.
   */
  pro.getError = function() {
    if (this.isError())
      return /** @type {w69b.qr.ReaderError} */ (this.result_);
    else
      return null;
  };

  /**
   * @return {Array.<w69b.qr.ResultPoint>} decoded string.
   */
  pro.getPatterns = function() {
    return this.patterns_;
  };

  /**
   * @return {Object} JSON object.
   */
  pro['toJSON'] = function() {
    return {
      'text': this.getText(),
      'patterns': this.getPatterns()};
  };
});
