module.exports = function(karma) {
  karma.set({
    // base path, that will be used to resolve files and exclude
    basePath: '.',

    frameworks: ['mocha', 'requirejs'],

    preprocessors: {
      '**/*.js': ['sourcemap']
    },

    // list of files / patterns to load in the browser
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


    // test results reporter to use
    // possible values: 'dots', 'progress', 'junit'
    reporters: ['progress'],


    // web server port
    port: 8080,


    // cli runner port
    runnerPort: 9100,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
    // logLevel: LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // Start these browsers, currently available:
    // - Chrome
    // - ChromeCanary
    // - Firefox
    // - Opera
    // - Safari (only Mac)
    // - PhantomJS
    // - IE (only Windows)
    browsers: ['Chrome', 'Firefox'],


    // If browser does not capture in given timeout [ms], kill it
    captureTimeout: 5000,


    // Continuous Integration mode
    // if true, it capture browsers, run tests and exit
    singleRun: false,
  });
};
