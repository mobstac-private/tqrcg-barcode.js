'use strict';
goog.require('goog.Promise');
goog.require('w69b.img.WebGLBinarizer');
goog.require('w69b.qr.DecodeInWorkerHelper');
// Copyright 2015 Manuel Braun (mb@w69b.com). All Rights Reserved.
goog.require('w69b.qr.decoding');

define(function() {
  var _ = {};

  _.DATA_URL = '/base/test_data/';
  var webGlSupported = w69b.img.WebGLBinarizer.isSupported();
  _.ALL_DECODE_OPTIONS = [
    {worker: false, webgl: false},
    {worker: true, webgl: false}
  ];
  if (webGlSupported) {
    _.ALL_DECODE_OPTIONS.push(
      {worker: false, webgl: true},
      {worker: true, webgl: true});
  } else {
    console.info('WebGL not supported, skipping WebGL tests');
  }

  _.loadImage = function(src) {
    var image = new Image();
    var promise = new goog.Promise(function(resolve) {
      image.onload = function() {
        resolve(image);
      };
    });
    image.src = _.DATA_URL + src;
    return promise;
  };

  /**
   * @param {string} src url.
   * @param {Object=} opt options.
   * @return {Promise} result.
   */
  _.decodeUrl = function(src, opt) {
    _.setupWorkerUrls();
    return _.loadImage(src).then(function(image) {
      var decoder = new w69b.qr.decoding.Decoder(opt);
      return decoder.decode(image).thenAlways(function() {
        decoder.dispose();
      });
    });
  };

  _.setupWorkerUrls = function() {
    w69b.qr.DecodeInWorkerHelper.setWorkerUrl(
      '/base/dist/w69b.qrcode.decodeworker.js');
    w69b.qr.DecodeInWorkerHelper.setIconvUrl(
      '/base/node_modules/iconv.js/iconv.js');
  };

  return _;
});
