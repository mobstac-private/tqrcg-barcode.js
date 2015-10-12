// (c) 2013 Manuel Braun (mb@w69b.com)
(function() {
  var baseUrl = '/base/';
  var testPattern = new RegExp('tests/(.*spec\.js)');
  var requireRemove = '.js';

  var tests = [];
  for (var file in window.__karma__.files) {
    var match = testPattern.exec(file);
    if (match) {
      tests.push(file);
    }
  }

  require({
      // !! Testacular serves files from '/base'
      baseUrl: baseUrl,
      paths: {
        chai: 'node_modules/chai/chai',
        'chai-as-promised': 'node_modules/chai-as-promised/lib/chai-as-promised',
        sinon: 'node_modules/sinon/pkg/sinon'
      },
      shim: {
        'sinon': {
          exports: 'sinon'
        }
      }
    },
    tests, function() {
      window.__karma__.start();
    });

  require(['chai', 'chai-as-promised'], function(chai, chaiAsPromised) {
    chai.use(chaiAsPromised);
  });
})();
