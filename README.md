[![Build Status](https://travis-ci.org/Schibum/barcode.js.svg?branch=master)](https://travis-ci.org/Schibum/barcode.js)
# barcode.js QR Code library
Javascript QR Code library, based on [zxing](https://github.com/zxing/).

Features robust, high-performance, WebGL-accelerated QR Code scanning.

Footprint (compiled and gzipped):
- main js file: ~75kb
- worker: ~40kb

## Use it

### Install
With bower:
```
bower install barcode.js
```
Or with npm:
```
npm install barcode.js
```

Then add it to your document:
```html
<script src="/node_modules/barcode.js/w69b.qrcode.min.js"></script>
```

## Decode QR Code
```javascript
// Set path to decode worker. Required if worker is used for decoding.
w69b.qr.deocding.setWorkerUrl('/path/to/w69b.qrcode.decodeworker.min.js');
var options = {}
//  options with the following properties:
//    * - {boolean} worker: use web worker, if supported, defaults to true
//    * - {boolean} webgl: use webgl binarizer, if supported, defaults to true
//    * - {number} maxSize: scale down image if large than this value in any dimension.
//    *  Defaults to 700px.
var decoder = new w69b.qr.decoding.Decoder(options)
img.addEventListener('load', function() {
    decoder.decode(img).then(function(result) {
        // succesfully decoded QR Code.
        console.log(result.text);
    }, function() {
        console.log('no qr code found');
    });
});
img.src = 'some_qr_code.png';

// At some later point: Make sure to destroy the decoder when not needed
// anymore. This terminates the web worker, if it was used.
decoder.dispose();
```

## Scanner Widget
The library includes a scanner widget that:

- Requests a media stream with getUserMedia()
- Renders the video in a container of arbitrary dimensions, cropping right and bottom borders as
necessary.
- Continuousely scans for QR Codes in the video stream and calls a callback once detected.
- Visualizes located finder patterns

```javascript
    // Set paths to iconv/worker as described above.
    var scanner =  new w69b.qr.ui.ContinuousScanner();
    // Called when a qr code has been decoded.
    scanner.setDecodedCallback(function(result) {
      console.log('Decoded qr code:', result);
    });
    // Render component in element with id 'scanner'.
    scanner.render(document.getElementById('scanner'));
    // Pause scanning
    scanner.setStopped(true);
    // Resume scanning
    scanner.setStopped(false);
    // Call this when the container element has been resized (automatically called on window
    // resize and orientation change events).
    scanner.updateSizeFromClient();
    // Make sure to dispose when not needed anymore.
    scanner.dispose();
```

[Continuous Scanner Demo](https://schibum.github.io/barcode.js/playground/scanner.html)

## Charsets
This library uses TextDecoder to support a wide range of charsets. It also supports most common
charsets (UTF8, ISO-8859-*) on browsers don't nave native TextDecoder support yet.
Additionally it can dynamically load [iconv.js](https://github.com/Schibum/iconv.js), if a code
cannot be decoded using any of the other methods.
barcode.js
```javascript
// Optional, iconv is only needed in case you have to decode qr codes encoded in
// rare non-utf8 charsets that neither TextDecoder nor the bundled iconvlite library supports.
// It's lazily loaded in case you should encounter such a charset.
w69b.qr.deocding.setIconvUrl('/path/to/w69b.qrcode.decodeworker.min.js');
```

## Image processing
As a pre-processing steps images are converted to binary black/white images (binarized) before
a QR code is searched. There are two binarizers that can be used for this purpose. A pure
javascript based image binarizer (hybridbinarizer.js) ported from zxing, there is also an
alternative WebGL-based implmentation that (mis-)uses shaders for the same purpose.

The WebGL binarizer does not compute the same binary images as the pure js binarizer. However
it yields binary images of comparable quality in practice. Depending on browser and hardware,
performance can be significantly faster.

You can play around with it here:
[Binarizer Visualization]
(https://schibum.github.io/barcode.js/playground/binarize_video.html)

Or run a benchmark to see how this affects decoding:
[Decoding Benchmark](https://schibum.github.io/barcode.js/playground/benchmark.html)

The scanner widget always uses the WebGL binarizer, if supported.

## Generate QR Code
Generate a QR code containing 'hello world' and draw it on a canvas.
```javascript
  // Draw on canvas:
  var canvas = document.createElement('canvas');
  w69.qr.encoding.drawOnCanvas('hello world', canvas);

  // As SVG
  var size = 100;  // desired size
  // get SVG source
  var svg = w69b.qr.encoding.drawAsSVG('hello', size)
```
[Genarate Demo](http://localhost:8000/playground/playground_encode.html)

### Build it
```
npm install
npm install -g gulp
gulp
```

## License
[GPLv3](http://www.gnu.org/licenses/gpl-3.0.en.html)

This project includes some APACHE2 licensed files (see sources)

QR Code is trademarked by Denso Wave, inc.
