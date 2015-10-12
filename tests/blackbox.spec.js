// (c) 2013 Manuel Braun (mb@w69b.com)
goog.require('w69b.qr.decoding');

define(['chai', 'tests/blackbox.data', 'tests/testhelper'], function(chai, testData, testhelper) {
  var expect = chai.expect;
  var baseUrl = '../';
  // Expected number of detections with native binarizer.
  var expectedDetections = {
    'qrcode-1': 19,
    'qrcode-2': 30,
    'qrcode-3': 38,
    'qrcode-4': 35,
    'qrcode-5': 19,
    'qrcode-6': 15
  };
  // Expected number of detections with WebGl binarizer, slightly worse in some cases, slightly
  // better in others.
  var expectedDetectionsGl = {
    'qrcode-1': 14,
    'qrcode-2': 27,
    'qrcode-3': 39,
    'qrcode-4': 37,
    'qrcode-5': 19,
    'qrcode-6': 15
  };
  // If != null, run only specified suites (for debugging).
  var onlySuites = null;
  // ['qrcode-1', 'qrcode-3', 'qrcode-4', 'qrcode-5', 'qrcode-6'];
  /**
   * @constructor
   */
  var SuiteInfo = function(suite, name, successes) {
    this.successCnt = 0;
    this.fatalCnt = 0;
    this.name = name;
    this.expectedSuccesses = successes;
    this.suite = suite;
    this.failures = [];
  };

  SuiteInfo.prototype.checkExpectations = function() {
    if (this.successCnt < this.expectedSuccesses) {
      // Print some debug help messages.
      window.console.log('');
      window.console.log('---');
      window.console.log('BLACKBOX RESULT: ' + this.successCnt +
        ' of ' + this.suite.length + ' tests succeded,' +
        ' fatal failures: ' + this.fatalCnt);
      window.console.log('Failures:');
      this.failures.forEach(function(lines) {
        lines.forEach(function(line) {
          window.console.log(line);
        });
      });
      window.console.log('---');
    }
    expect(this.successCnt).to.be.at.least(this.expectedSuccesses,
      'too many failures');
  };

  SuiteInfo.prototype.runAll = function(decoder) {
    var promise = goog.Promise.resolve();
    var self = this;
    this.suite.forEach(function(item) {
      promise = promise.then(function() {
        return self.run(item, decoder);
      });
    });
    return promise;
  };

  SuiteInfo.prototype.run = function(item, decoder) {
    var self = this;
    var url = baseUrl + item['image'];
    var expected = item['expected'];
    return testhelper.loadImage(url).then(function(img) {
      return decoder.decode(img);
    }).then(function(result) {
      if (result.text == expected) {
        self.successCnt++;
      } else {
        self.failures.push(
          ['Test with url: ' + url + ' failed:',
            'expected: ' + expected,
            'actual: ' + result.text]);
      }
    }, function(error) {
      self.fatalCnt++;
      self.failures.push(
        ['Test with url: ' + url + ' failed with: ' + error]);
    });
  };


  function generateTest(suiteInfo, opt) {
    return function(done) {
      testhelper.setupWorkerUrls();
      var decoder = new w69b.qr.decoding.Decoder(opt);
      suiteInfo.runAll(decoder).then(function() {
        suiteInfo.checkExpectations();
        decoder.dispose();
        done();
      });
    }
  }


  testhelper.ALL_DECODE_OPTIONS.forEach(function(opt) {
    var expectedSet = opt.webgl ? expectedDetectionsGl : expectedDetections;

    describe('Blackbox Detection ' + JSON.stringify(opt), function() {
      // Sequential testing, so use a larger timeout.
      this.timeout(10000);

      for (var suiteName in testData) {
        if (!testData.hasOwnProperty(suiteName) ||
          (onlySuites && onlySuites.indexOf(suiteName) == -1))
          continue;

        var suite = testData[suiteName];
        var suiteInfo = new SuiteInfo(suite, suiteName, expectedSet[suiteName]);
        // suite = [suite[23]];
        it('detects suite ' + suiteName, generateTest(suiteInfo, opt));
      }
    });
  });
});
