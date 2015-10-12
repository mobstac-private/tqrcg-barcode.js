goog.require('goog.Promise');
// (c) 2013 Manuel Braun (mb@w69b.com)
goog.require('goog.math.Size');

define(['chai', 'tests/testhelper'], function(chai, testhelper) {
  var expect = chai.expect;
  describe('decodeInWorkerHelper', function() {
    var DecodeInWorkerHelper = w69b.qr.DecodeInWorkerHelper;

    it('should fail without worker url', function() {
      DecodeInWorkerHelper.setWorkerUrl(null);
      expect(function() {
        var helper = new DecodeInWorkerHelper();
        helper.init();
      }).throws();
    });

    function decodeText(url, worker) {
      return testhelper.loadImage(url).then(function(img) {
        return new goog.Promise(function(resolve, reject) {
          worker.decode(img, new goog.math.Size(img.width, img.height), function(type, value) {
            if (type == w69b.qr.WorkerMessageType.DECODED)
              resolve(value.text);
            else if (type == w69b.qr.WorkerMessageType.NOTFOUND)
              reject(value);
          });
        });
      });
    }

    testhelper.ALL_DECODE_OPTIONS.forEach(function(opt) {
      describe('with worker: ' + opt.worker + ', webgl: ' + opt.webgl, function() {
        var worker;
        beforeEach(function() {
          testhelper.setupWorkerUrls();
          worker = new DecodeInWorkerHelper();
          worker.init();
        });

        it('should decode image', function() {
          return expect(decodeText('qr_hello.png', worker)).to.eventually.equal('Hello World');
        });

        it('should fail', function() {
          return expect(decodeText('corrupted.png', worker)).to.be.rejected;
        });
      });
    });
  });
});
