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

define(['chai'], function(chai) {
  goog.require('w69b.qr.Mode');
  goog.require('w69b.qr.ModeEnum');
  var expect = chai.expect;

  var Mode = w69b.qr.Mode;
  var ModeEnum = w69b.qr.ModeEnum;


  describe('Mode', function() {

    describe('forBits', function() {
      it('returns correct enum for bits', function() {
        expect(Mode.forBits(0x00)).to.equal(ModeEnum.TERMINATOR);
        expect(Mode.forBits(0x01)).to.equal(ModeEnum.NUMERIC);
        expect(Mode.forBits(0x02)).to.equal(ModeEnum.ALPHANUMERIC);
        expect(Mode.forBits(0x04)).to.equal(ModeEnum.BYTE);
        expect(Mode.forBits(0x08)).to.equal(ModeEnum.KANJI);
        expect(function() {
          Mode.forBits(0x10);
        }).to.Throw();
      });
    });

    describe('getVersionNumber', function() {
      it('returns correct enum for bits', function() {
        expect(ModeEnum.NUMERIC.getCharacterCountBits(
          Version.getVersionForNumber(5))).to.equal(10);
        expect(ModeEnum.NUMERIC.getCharacterCountBits(
          Version.getVersionForNumber(26))).to.equal(12);
        expect(ModeEnum.NUMERIC.getCharacterCountBits(
          Version.getVersionForNumber(40))).to.equal(14);
        expect(ModeEnum.ALPHANUMERIC.getCharacterCountBits(
          Version.getVersionForNumber(6))).to.equal(9);
        expect(ModeEnum.BYTE.getCharacterCountBits(
          Version.getVersionForNumber(7))).to.equal(8);
        expect(ModeEnum.KANJI.getCharacterCountBits(
          Version.getVersionForNumber(8))).to.equal(8);
      });

    });
  });
});
