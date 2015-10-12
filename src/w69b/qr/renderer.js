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

goog.provide('w69b.qr.renderer');
goog.require('w69b.qr.Drawable');
goog.require('w69b.qr.encoder.QRCode');

/**
 * Renders a QR Code on a drawable.
 *
 * @author dswitkin@google.com (Daniel Switkin)
 * @author mb@w69b.com (Manuel Braun)
 */
goog.scope(function() {
  var _ = w69b.qr.renderer;
  _.QUIET_ZONE_SIZE = 4;

  /**
   * Renders QRCode on drawable. The QRCode is upscaled to the maximum
   * whole-number multiple of the input qrcode with that fits in the desired
   * size, including the quiet zones. What remains is filled with white
   * padding (ie the qr code is centered on  the desired image with).
   * @param {w69b.qr.encoder.QRCode} qrCode qr code to render.
   * @param {w69b.qr.Drawable} drawable to draw on.
   * @param {number} width desired with of output image.
   * @param {number} height desired height of output image.
   * @param {number} quietZone number of blocks (pixsels in input) to use
   * for quiet zones.
   */
  _.render = function(qrCode, drawable, width, height, quietZone) {
    var input = qrCode.getMatrix();
    var inputWidth = input.getWidth();
    var inputHeight = input.getHeight();
    var qrWidth = inputWidth + (quietZone << 1);
    var qrHeight = inputHeight + (quietZone << 1);
    var outputWidth = Math.max(width, qrWidth);
    var outputHeight = Math.max(height, qrHeight);

    var multiple = Math.floor(Math.min(outputWidth / qrWidth,
      outputHeight / qrHeight));
    // Padding includes both the quiet zone and the extra white pixels to
    // accommodate the requested dimensions. For example, if input is 25x25
    // the QR will be 33x33 including the quiet zone.
    // If the requested size is 200x160, the multiple will be 4, for a QR of
    // 132x132. These will handle all the padding from 100x100 (the actual QR)
    // up to 200x160.
    var leftPadding = (outputWidth - (inputWidth * multiple)) >> 1;
    var topPadding = (outputHeight - (inputHeight * multiple)) >> 1;

    drawable.fillBackground(outputWidth, outputHeight);

    for (var inputY = 0, outputY = topPadding; inputY < inputHeight;
         inputY++, outputY += multiple) {
      // Write the contents of this row of the barcode
      for (var inputX = 0, outputX = leftPadding; inputX < inputWidth;
           inputX++, outputX += multiple) {
        if (input.get(inputX, inputY) == 1) {
          drawable.fillBlack(outputX, outputY, multiple, multiple);
        }
      }
    }
  };

});
