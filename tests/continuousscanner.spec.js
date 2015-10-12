// (c) 2013 Manuel Braun (mb@w69b.com)
define(['chai', 'sinon'], function(chai, sinon) {
  var expect = chai.expect;
  describe('ContinuousScanner', function() {
    var ContinuousScanner = w69b.qr.ui.ContinuousScanner;

    function expectSupport(ua, apiPresent, supported) {
      var uaMock = sinon.mock(goog.userAgent);
      uaMock.expects('getUserAgentString').once().returns(ua);
      var apiBackup = w69b.LocalVideoCapturer.getMedia;
      w69b.LocalVideoCapturer.getMedia = apiPresent;
      uaMock.expects('getUserAgentString').once().returns(ua);
      expect(ContinuousScanner.isSupported()).to.equal(supported);
      uaMock.restore();
      w69b.LocalVideoCapturer.getMedia = apiBackup;
    }

    it('detects supported browsers', function() {
      expectSupport('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.22 ' +
      '(KHTML, like Gecko) Chrome/25.0.1364.97 Safari/537.22', true, true);
      expectSupport('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.22 ' +
        '(KHTML, like Gecko) Chrome/20.0.1364.97 Safari/537.22', false, false);
      expectSupport('Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:19.0) ' +
        'Gecko/20100101 Firefox/19.0', true, false);
      expectSupport('Opera/9.80 (Android 4.2.2; Linux; Opera ' +
        'Tablet/ADR-1301080958) Presto/2.11.355 Version/12.10', true, true);
      expectSupport('Mozilla/5.0 (X11; Linux x86_64; rv:22.0) ' +
        'Gecko/20130222 Firefox/22.0', true, true);
    });

  });
});
