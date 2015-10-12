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

goog.provide('w69b.qr.encoder.QRCode');
goog.require('w69b.qr.ErrorCorrectionLevel');
goog.require('w69b.qr.Mode');
goog.require('w69b.qr.Version');
goog.require('w69b.qr.encoder.ByteMatrix');

goog.scope(function() {

  var ErrorCorrectionLevel = w69b.qr.ErrorCorrectionLevel;
  var Mode = w69b.qr.Mode;
  var Version = w69b.qr.Version;
  var ByteMatrix = w69b.qr.encoder.ByteMatrix;

  /**
   * @constructor
   * @author satorux@google.com (Satoru Takabayashi) - creator
   * @author dswitkin@google.com (Daniel Switkin) - ported from C++
   * @author mb@w69b.com (Manuel Braun) - ported to js.
   */
  w69b.qr.encoder.QRCode = function() {
  };
  var _ = w69b.qr.encoder.QRCode;
  var pro = _.prototype;
  /**
   * @type {Mode}
   * @private
   */
  pro.mode_ = null;
  /**
   *
   * @type {ErrorCorrectionLevel}
   * @private
   */
  pro.ecLevel_ = null;
  /**
   *
   * @type {Version}
   * @private
   */
  pro.version_ = null;
  /**
   *
   * @type {number}
   * @private
   */
  pro.maskPattern_ = -1;
  /**
   *
   * @type {ByteMatrix}
   * @private
   */
  pro.matrix_ = null;

  /**
   * @type {number}
   */
  _.NUM_MASK_PATTERNS = 8;


  /**
   * @return {Mode} mode.
   */
  pro.getMode = function() {
    return this.mode_;
  };

  /**
   * @return {ErrorCorrectionLevel} ec level.
   */
  pro.getECLevel = function() {
    return this.ecLevel_;
  };

  /**
   * @return {Version} version.
   */
  pro.getVersion = function() {
    return this.version_;
  };

  /**
   * @return {number} mask pattern.
   */
  pro.getMaskPattern = function() {
    return this.maskPattern_;
  };

  /**
   * @return {ByteMatrix} matrix.
   */
  pro.getMatrix = function() {
    return this.matrix_;
  };


  /**
   * @return {string} debug string.
   */
  pro.toString = function() {
    var result = [];
    result.push('<<\n');
    result.push(' mode: ');
    result.push(this.mode_.toString());
    result.push('\n ecLevel: ');
    result.push(this.ecLevel_.toString());
    result.push('\n version: ');
    result.push(this.version_.toString());
    result.push('\n maskPattern: ');
    result.push(this.maskPattern_);
    if (this.matrix_ == null) {
      result.push('\n matrix: null\n');
    } else {
      result.push('\n matrix:\n');
      result.push(this.matrix_.toString());
    }
    result.push('>>\n');
    return result.join('');
  };

  /**
   * @param {Mode} value mode.
   */
  pro.setMode = function(value) {
    this.mode_ = value;
  };

  /**
   * @param {ErrorCorrectionLevel} value ec level.
   */
  pro.setECLevel = function(value) {
    this.ecLevel_ = value;
  };

  /**
   * @param {Version} version version.
   */
  pro.setVersion = function(version) {
    this.version_ = version;
  };

  /**
   * @param {number} value pattern.
   */
  pro.setMaskPattern = function(value) {
    this.maskPattern_ = value;
  };

  /**
   * @param {ByteMatrix} value matrix.
   */
  pro.setMatrix = function(value) {
    this.matrix_ = value;
  };

  /**
   * @param {number} maskPattern pattern.
   * @return {boolean} weather it is valid.
   */
  _.isValidMaskPattern = function(maskPattern) {
    return maskPattern >= 0 && maskPattern < _.NUM_MASK_PATTERNS;
  };

});

