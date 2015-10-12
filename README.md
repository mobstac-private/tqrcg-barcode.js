# barcode.js QR Code library
Javscript QR Code library, based on zxing.

Features real-time qr code

## Use it

### Install
TODO: add to bower/npm repo

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
var decoder = w69b.qr.decoding.Decoder(options)
img.addEventListener('load', function() {
    decoder.decode(img).then(function(result) {
        // succesfully decoded QR Code.
        console.log(result.text);
    }, function() {
        console.log('no qr code found');
    });
});
img.src = 'some_qr_code.png';
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

## Image processing / Binarizer
As a pre-processing steps images are converted to binary black/white images (binarized) before
a QR code is searched. There are two binarizers that can be used for this purpose. A pure
javascript based image binarizer (hybridbinarizer.js) ported from zxing. There is also an
alternative WebGL-based implmentation that (mis-)uses shaders for the same purpose.

The WebGL binarizer does not compute the same binary images as the pure js binarizer. However
it yields binary images of comparable quality in practice. Depending on browser and hardware
performance can be significantly faster.



## Generate QR Code
Generate a QR code containing 'hello world' and draw it on a canvas.
```javascript
  var canvas = document.createElement('canvas');
  w69.qr.encoding.drawOnCanvas('hello world', canvas);
```

### Build it
```
npm install
bower install
```

