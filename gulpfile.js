// (c) 2013 Manuel Braun (mb@w69b.com)
'use strict';
require('harmonize')();
var gulp = require('gulp');
var runSequence = require('run-sequence');
var del = require('del');
var debug = require('gulp-debug');
var gjslint = require('gulp-gjslint');
var karma = require('karma');
var concat = require('gulp-concat');
var size = require('gulp-size');
var through = require('through2');
var shader2js = require('./tasks/shader2js');
var webserver = require('gulp-webserver');
var closureDeps = require('gulp-closure-deps');
var closureList = require('gulp-closure-builder-list');
var wrap = require('gulp-wrap');
var gutil = require('gulp-util');
var sourcemaps = require('gulp-sourcemaps');
var plovr = require('gulp-plovr');


var PATHS = {
  src: {
    js: ['src/**/*.js'],
    lintable: [
      'src/**/*.js',
      'tests/**/*.js',
      '!tests/**/*.data.js',
      '!src/w69b/iconvlite.js',
      '!src/w69b/shaders/**'
    ],
    shaders: ['src/w69b/shaders/*.{vs,fs}'],
    closureBase: 'node_modules/google-closure-library/closure/goog/base.js',
    closure: [
      'node_modules/google-closure-library/closure/goog/**/*.js',
      'node_modules/google-closure-library/third_party/**/*.js',
      'src/**/*.js'
    ],
    plovr: ['plovr-decodeworker-productive.json', 'plovr-productive.json'],
  },
  dst: {
    shaders: 'src/w69b/shaders/'
  }
};

gulp.task('clean', function(done) {
  del(['dist'], done);
});

gulp.task('gjslint', function() {
  return gulp.src(PATHS.src.lintable)
    .pipe(gjslint({flags: ['--nojsdoc', '--max_line_length 100']}))
    .pipe(gjslint.reporter('console'));
});

gulp.task('test', ['buildDebug'], function(done) {
  new karma.Server({
    configFile: __dirname + '/karma.conf.js',
    singleRun: true
  }, done).start();
});


gulp.task('shader2js', function() {
  return gulp.src(PATHS.src.shaders, {base: 'src'})
    .pipe(shader2js())
    .pipe(concat('compiled.js'))
    .pipe(gulp.dest(PATHS.dst.shaders))
});


gulp.task('watch', ['buildDebug'], function() {

  gulp.watch(PATHS.src.shaders.concat(PATHS.src.closure), ['buildDebug']);
  gulp.src('.')
    .pipe(webserver({
      host: '0.0.0.0',
      livereload: false,
      directoryListing: true
    }));
});


function buildDebug(module) {
  var bundleStream = through.obj();
  var fileList;

  var getFiles = through.obj(function(file, enc, cb) {
    if (file.isStream()) {
      cb(new gutil.PluginError('shader2js', 'Streaming not supported'));
      return;
    }
    fileList = file.contents.toString().split('\n');
    cb();
  });

  var es = require('event-stream');

  var str = gulp.src(PATHS.src.closure)
    .pipe(closureDeps({
      prefix: '',
      baseDir: '.'
    }))
    .pipe(closureList({
      entryPoint: module,
    }))
    .pipe(getFiles)
    .on('end', function() {
      gulp.src([PATHS.src.closureBase].concat(fileList))
        .pipe(bundleStream);
    });
  return es.duplex(str, es.merge(bundleStream, str));
}

var closureDebugWrapper = 'self.CLOSURE_NO_DEPS = true;\n<%= contents %>';
/**
 * Build library simply by concatenating all files.
 */
gulp.task('buildDebug:main', ['shader2js'], function() {
  return buildDebug('main')
    .pipe(sourcemaps.init())
    .pipe(concat('w69b.qrcode.js'))
    .pipe(wrap(closureDebugWrapper))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('dist'));
});

gulp.task('buildDebug:worker', function() {
  return buildDebug('w69b.qr.DecodeWorker')
    .pipe(sourcemaps.init())
    .pipe(concat('w69b.qrcode.decodeworker.js'))
    .pipe(wrap(closureDebugWrapper))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('dist'));
});

gulp.task('buildDebug', ['buildDebug:main', 'buildDebug:worker']);


gulp.task('compile', function() {
  // It might look odd to use plovr instead of using closure compiler directly here.
  // However there is no easy way to disable some advanced compilation options that degrate
  // performance significantly with closure compiler directy.
  return gulp.src(PATHS.src.plovr)
    .pipe(plovr({
      plovr_path: 'node_modules/plovr/bin/plovr.jar',
      debug: true
    }));
});

gulp.task('all', ['compile', 'gjslint', 'test']);

gulp.task('default', function(cb) {
  runSequence('clean', 'all', cb);
});
