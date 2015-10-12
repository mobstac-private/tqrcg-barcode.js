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

goog.require('goog.array');
goog.require('w69b.qr.GF256');
goog.require('w69b.qr.ReedSolomonDecoder');
goog.require('w69b.qr.ReedSolomonError');


define(['chai', 'corrupt'], function(chai, corrupt) {
  var assert = chai.assert;
  describe('ReedSolomonDecoder tests', function() {
    var ReedSolomonDecoder = w69b.qr.ReedSolomonDecoder;

    /** See ISO 18004, Appendix I, from which this example is taken. */
    var QR_CODE_TEST = [0x10, 0x20, 0x0C, 0x56, 0x61, 0x80, 0xEC, 0x11, 0xEC,
      0x11, 0xEC, 0x11, 0xEC, 0x11, 0xEC, 0x11];
    var QR_CODE_TEST_WITH_EC = [0x10, 0x20, 0x0C, 0x56, 0x61, 0x80, 0xEC,
      0x11, 0xEC, 0x11, 0xEC, 0x11, 0xEC, 0x11, 0xEC, 0x11, 0xA5, 0x24,
      0xD4, 0xC1, 0xED, 0x36, 0xC7, 0x87, 0x2C, 0x55];
    var QR_CODE_ECC_BYTES = QR_CODE_TEST_WITH_EC.length - QR_CODE_TEST.length;
    var QR_CODE_CORRECTABLE = QR_CODE_ECC_BYTES / 2;

    var qrRSDecoder = new ReedSolomonDecoder(w69b.qr.GF256.QR_CODE_FIELD);


    function checkQRRSDecode(received) {
      qrRSDecoder.decode(received, QR_CODE_ECC_BYTES);
      // expect(received).to.equal(QR_CODE_TEST);
      for (var i = 0; i < QR_CODE_TEST.length; i++) {
        expect(received[i]).to.equal(QR_CODE_TEST[i]);
      }
    }



    it('decodes code with no errors', function() {
      var received = goog.array.clone(QR_CODE_TEST_WITH_EC);
      // no errors
      checkQRRSDecode(received);
    });

    it('decodes code with one errors', function() {
      for (var i = 0; i < QR_CODE_TEST_WITH_EC.length; i++) {
        var received = goog.array.clone(QR_CODE_TEST_WITH_EC);
        received[i] = 0x00; // Math.round(Math.random() * 256);
        checkQRRSDecode(received);
      }
    });

    it('decodes code with max errors', function() {
      for (var i = 0; i < 10; ++i) { // # iterations is kind of arbitrary
        var received = goog.array.clone(QR_CODE_TEST_WITH_EC);
        corrupt(received, QR_CODE_CORRECTABLE);
        checkQRRSDecode(received);
      }
    });

    it('throws excpetion on failure', function() {
      var received = goog.array.clone(QR_CODE_TEST_WITH_EC);
      corrupt(received, QR_CODE_CORRECTABLE + 1);
      expect(function() {
        checkQRRSDecode(received);
      }).to.throw(w69b.qr.ReedSolomonError);
    });
  });
});

