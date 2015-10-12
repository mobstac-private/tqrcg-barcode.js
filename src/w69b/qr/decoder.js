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

goog.provide('w69b.qr.decoder');
goog.require('w69b.qr.BitMatrixParser');
goog.require('w69b.qr.DataBlock');
goog.require('w69b.qr.DecodedBitStreamParser');
goog.require('w69b.qr.GF256');
goog.require('w69b.qr.ReedSolomonDecoder');

goog.scope(function() {
  var GF256 = w69b.qr.GF256;
  var DataBlock = w69b.qr.DataBlock;

  var _ = w69b.qr.decoder;
  _.rsDecoder = new w69b.qr.ReedSolomonDecoder(GF256.QR_CODE_FIELD);

  _.correctErrors = function(codewordBytes, numDataCodewords) {
    var numCodewords = codewordBytes.length;
    // First read into an array of ints
    var codewordsInts = new Array(numCodewords);
    for (var i = 0; i < numCodewords; i++) {
      codewordsInts[i] = codewordBytes[i] & 0xFF;
    }
    var numECCodewords = codewordBytes.length - numDataCodewords;
    _.rsDecoder.decode(codewordsInts, numECCodewords);
      //var corrector = new ReedSolomon(codewordsInts, numECCodewords);
      //corrector.correct();
    // Copy back into array of bytes -- only need to worry about the bytes that
    // were data We don't care about errors in the error-correction codewords
    for (var i = 0; i < numDataCodewords; i++) {
      codewordBytes[i] = codewordsInts[i];
    }
  };

  /**
   * @param {w69b.qr.BitMatrix} bits matrix.
   * @return {string} reader instnance.
   */
  _.decode = function(bits) {
    var parser = new w69b.qr.BitMatrixParser(bits);
    var version = parser.readVersion();
    var ecLevel = parser.readFormatInformation().errorCorrectionLevel;

    // Read codewords
    var codewords = parser.readCodewords();

    // Separate into data blocks
    var dataBlocks = DataBlock.getDataBlocks(codewords, version, ecLevel);

    // Count total number of data bytes
    var totalBytes = 0;
    for (var i = 0; i < dataBlocks.length; i++) {
      totalBytes += dataBlocks[i].numDataCodewords;
    }
    var resultBytes = new Array(totalBytes);
    var resultOffset = 0;

    // Error-correct and copy data blocks together into a stream of bytes
    for (var j = 0; j < dataBlocks.length; j++) {
      var dataBlock = dataBlocks[j];
      var codewordBytes = dataBlock.codewords;
      var numDataCodewords = dataBlock.numDataCodewords;
      _.correctErrors(codewordBytes, numDataCodewords);
      for (var i = 0; i < numDataCodewords; i++) {
        resultBytes[resultOffset++] = codewordBytes[i];
      }
    }

    // Decode the contents of that stream of bytes
    return w69b.qr.DecodedBitStreamParser.decode(resultBytes,
      version, ecLevel.bits);
    //return DecodedBitStreamParserOld.decode(resultBytes, version, ecLevel);
  };

});
