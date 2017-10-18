// (c) 2013 Manuel Braun (mb@w69b.com)
goog.provide('w69b.LocalVideoCapturer');
goog.require('goog.Disposable');
goog.require('goog.asserts');
goog.require('goog.events');
goog.require('goog.math.Size');
goog.require('w69b.imgtools');

goog.scope(function() {
  var Size = goog.math.Size;
  var imgtools = w69b.imgtools;
  /**
   * TODO: add start/stop methods and ready/error events.
   * @constructor
   * @extends {goog.Disposable}
   */
  w69b.LocalVideoCapturer = function() {
    goog.base(this);
    this.backCanvas_ = /** @type {HTMLCanvasElement} */ (
      document.createElement('canvas'));
    this.mediaVideo_ = /** @type {HTMLVideoElement} */ (
      document.createElement('video'));
    this.mediaVideo_.setAttribute('autoplay', 'true');
    this.backContext_ = /** @type {CanvasRenderingContext2D} */ (
      this.backCanvas_.getContext('2d'));
  };
  var LocalVideoCapturer = w69b.LocalVideoCapturer;
  goog.inherits(LocalVideoCapturer, goog.Disposable);
  var pro = LocalVideoCapturer.prototype;

  /**
   * Alias to getUserMedia functions.
   * @type {Function}
   */
  LocalVideoCapturer.getMedia = null;
  if (navigator['mediaDevices']) {
    LocalVideoCapturer.getMedia = navigator['mediaDevices']['getUserMedia']
      .bind(navigator['mediaDevices'])
  }

  /**
   * Canvas uses to call getImageData on.
   * @type {HTMLCanvasElement}
   * @private
   */
  pro.backCanvas_ = null;
  /**
   * Rendering context of back canvas.
   * @type {CanvasRenderingContext2D}
   * @private
   */
  pro.backContext_ = null;
  /**
   * Video element used to render the getUserMedia stream.
   * @type {HTMLVideoElement}
   * @private
   */
  pro.mediaVideo_ = null;

  pro.stream_ = null;

  /**
   * @return {HTMLVideoElement} video element.
   */
  pro.getVideo = function() {
    return this.mediaVideo_;
  };

  /**
   * Start capturing video.
   */
  pro.start = function(ready) {
    goog.events.listenOnce(this.mediaVideo_, 'canplay', function() {
      this.waitForVideoSize_(ready);
    }, false, this);
    this.getUserMedia();
  };

  /**
   * Calls ready when videoSize gets greater than 0.
   * Sometimes the video size is 0 in FireFox even after canplay has been
   * triggered. This works arround this by polling the video with.
   * @private
   */
  pro.waitForVideoSize_ = function(ready) {
    if (this.mediaVideo_.videoWidth > 0 && this.mediaVideo_.videoHeight > 0) {
      ready();
    } else {
      window.setTimeout(this.waitForVideoSize_.bind(this, ready), 100);
    }
  };


  /**
   * Get Image data of current frame from local video stream.
   * Image is scaled down to opt_maxSize if its width or height is larger.
   * @param {Size} size desired size of image.
   * @return {ImageData} image data.
   */
  pro.getImageData = function(size) {
    this.drawAndGetCanvas(size);
    return this.backContext_.getImageData(0, 0, size.width, size.height);
  };

  /**
   * Get canvas with current frame from local video stream.
   * Image is scaled down to opt_maxSize if its width or height is larger.
   * @param {Size} size desired size of image.
   * @return {HTMLCanvasElement} canvas.
   */
  pro.drawAndGetCanvas = function(size) {
    var video = this.mediaVideo_;
    var canvas = this.backCanvas_;
    goog.asserts.assert(video.videoWidth > 0 && video.videoWidth > 0);

    // Rescale canvas if needed.
    if (canvas.width != size.width || canvas.height != size.height) {
      canvas.width = size.width;
      canvas.height = size.height;
    }
    var context = this.backContext_;
    this.drawOnCanvas(canvas, context);
    return canvas;
  };

  /**
   * Draws video on canvas, scaling to to fit into canvas.
   * @param {HTMLCanvasElement} canvas canvas to draw on.
   * @param {CanvasRenderingContext2D} context context of canvas.
   */
  pro.drawOnCanvas = function(canvas, context) {
    var video = this.getVideo();
    var width = canvas.width;
    var height = canvas.height;

    // Smallest scale that scales video to desired size.
    var scale = Math.max(height / video.videoHeight, width / video.videoWidth);
    // draw image cropping what does not fit on the right/bottom edges.
    context.drawImage(video, 0, 0,
      video.videoWidth * scale, video.videoHeight * scale);

  };

  /**
   * video stream.
   * @protected
   */
  pro.onGetMediaSuccess = function(stream) {
    // If disposed since, dont do anything.
    if (this.mediaVideo_ === null)
      return;
    this.mediaVideo_['srcObject'] = stream;
    this.mediaVideo_.play();
    this.stream_ = stream;
  };

  /**
   * code error code.
   */
  pro.onGetMediaError = function(code) {
    window.console.log('error code:');
    window.console.log(code);
  };

  /**
   * Starts get user media.
   * @protected
   */
  pro.getUserMedia = function() {
    var self = this;
    function getMedia(deviceId) {
      var constraint = {'optional': [{'facingMode': 'environment'}]};
      if (deviceId)
        constraint = {'optional': [{'sourceId': deviceId}]};
      LocalVideoCapturer.getMedia({'video': constraint}).then(
        self.onGetMediaSuccess.bind(self),
        self.onGetMediaError.bind(self));
    }
    function gotSources(sources) {
      for (var i = 0; i < sources.length; ++i) {
        var source = sources[i];
        if (source['kind'] === 'video' && source['facing'] == 'environment') {
          getMedia(source.id);
          break;
        }
      }
    }
    if (navigator['mediaDevices'] && navigator['mediaDevices']['enumerateDevices']) {
      // Hack while facingMode not supported, just use last device.
      navigator['mediaDevices']['enumerateDevices']().then(function(devs) {
        devs = devs.filter(function(dev) { return dev['kind'] === 'videoinput'; });
        if (devs.length)
          getMedia(devs.slice(-1)[0]['deviceId']);
        else
          getMedia([]);
      });
    } else if (window['MediaStreamTrack'] && window['MediaStreamTrack']['getSources']) {
      window['MediaStreamTrack']['getSources'](gotSources);
    } else {
      gotSources([]);
    }
  };

  /**
   * @override
   */
  pro.disposeInternal = function() {
    this.mediaVideo_.pause();
    this.mediaVideo_['srcObject'] = null;
    this.mediaVideo_ = null;
    if (this.stream_) {
      if (this.stream_.stop)
        this.stream_.stop();
      if (this.stream_['getTracks']) {
        this.stream_['getTracks']().forEach(function(track) {
          track.stop();
        });
      }
    }
  };
});
