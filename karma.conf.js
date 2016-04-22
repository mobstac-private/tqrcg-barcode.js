module.exports = function(karma) {
  var sauceLaunchers = {
    sl_chrome: {
      base: 'SauceLabs',
      browserName: 'chrome',
      platform: 'Linux',
    },
    sl_firefox: {
      base: 'SauceLabs',
      browserName: 'firefox',
      platform: 'Linux',
    },
    // Chrome on travis is too old
    // travis_chrome: {
    //   base: 'Chrome',
    //   flags: ['--no-sandbox']
    // }
  };

  var cfg = {
    basePath: '.',

    frameworks: ['mocha', 'requirejs'],

    preprocessors: {
      '**/*.js': ['sourcemap']
    },

    files: [
      'node_modules/iconv.js/iconv.js',
      {pattern: 'node_modules/chai/chai.js', included: false},
      {pattern: 'node_modules/chai-as-promised/lib/*.js', included: false},
      {pattern: 'node_modules/sinon/pkg/sinon.js', included: false},

      {pattern: 'src/**/*.js', included: false},
      {pattern: 'test_data/**/*.*', included: false, served: true, watched: true},
      // {pattern: 'tests/**/*.js', included: false, served: true, watched: true},
      {pattern: 'tests/blackbox.data.js', included: false},
      {pattern: 'tests/**/*.js', included: false},
      'dist/w69b.qrcode.js',
      {pattern: 'dist/w69b.qrcode.decodeworker.*', included: false},
      'tests/main-test.js'
    ],

    // list of files to exclude
    exclude: [],
    reporters: ['progress'],
    port: 8080,
    runnerPort: 9100,
    colors: true,
    autoWatch: true,
    sauceLabs: {
      testName: 'barcode.js Tests',
      startConnect: false,
      tunnelIdentifier: process.env.TRAVIS_JOB_NUMBER
    },


    customLaunchers: sauceLaunchers,

    browsers: ['Chrome', 'Firefox'],
    singleRun: false,
    browserNoActivityTimeout: 300000
  };

  if (process.env.TRAVIS) {
    cfg.reporters = ['dots'];
    // sauce has WebGl, travis not
    if (process.env.TRAVIS_PULL_REQUEST == 'false')
      cfg.browsers = Object.keys(sauceLaunchers);
    else
      cfg.browsers = ['Firefox'];
  }

  karma.set(cfg);
};
