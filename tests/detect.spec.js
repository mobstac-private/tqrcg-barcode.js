// (c) 2013 Manuel Braun (mb@w69b.com)

define(['chai', 'tests/testhelper'], function(chai, testhelper) {
  var expect = chai.expect;
  describe('Detect FFOS London Images', function() {

    beforeEach(function() {
      testhelper.setupWorkerUrls();
    });

    // Important note: webgl binarizer is singleton, so we can curently only
    // run one test with webgl.
    function decodeTest(url, content, opt) {
      return function() {
        // without webgl
        return expect(testhelper.decodeUrl(url, opt))
          .to.eventually.have.deep.property('text', content);
      };
    }

    testhelper.ALL_DECODE_OPTIONS.forEach(function(opt) {
      describe(JSON.stringify(opt), function() {
        it('detects simple hello world code',
          decodeTest('qr_hello.png', 'Hello World', opt));

        it('detects small qr code in big image',
          decodeTest('big.jpg', 'http://www.mozilla.org/en-US/firefoxos/', opt));

        it('detects firefox coffe cup qr code',
          decodeTest('firefox.jpg', 'http://bit.ly/FirefoxAndroidMWC?r=qr', opt));
      });
    });

  });
});

