// (c) 2013 Manuel Braun (mb@w69b.com)
goog.provide('w69b.qr.ui.ContinuousScanner');
goog.require('goog.math.Size');
goog.require('goog.string');
goog.require('goog.style');
goog.require('goog.ui.Component');
goog.require('goog.userAgent');
goog.require('goog.userAgent.product');
goog.require('w69b.LocalVideoCapturer');
goog.require('w69b.imgtools');
goog.require('w69b.qr.DecodeInWorkerHelper');
goog.require('w69b.qr.WorkerMessageType');
goog.require('w69b.qr.imagedecoding');

goog.scope(function() {
  var imgtools = w69b.imgtools;
  var Size = goog.math.Size;
  var WorkerMessageType = w69b.qr.WorkerMessageType;

  /**
   *
   * @param {number} x x pos.
   * @param {number} y y pos.
   * @param {number} size pattern size.
   * @constructor
   */
  w69b.qr.ui.PatternPoint = function(x, y, size) {
    this.x = x;
    this.y = y;
    this.size = size || 4;
    this.birthTime = new Date().getTime();
  };
  var PatternPoint = w69b.qr.ui.PatternPoint;
  // PatternPoint.prototype.
  /**
   * Component that shows visualization of continuous scanning.
   *
   * @constructor
   * @extends {goog.ui.Component}
   * @export
   */
  w69b.qr.ui.ContinuousScanner = function() {
    goog.base(this);
    this.capturer_ = new w69b.LocalVideoCapturer();
    this.worker_ = new w69b.qr.DecodeInWorkerHelper();
    this.worker_.init();
    this.foundPatterns_ = [];
    this.lastFrameTime_ = null;
    /**
     * Size of visualization.
     * @type {Size}
     * @private
     */
    this.size_ = new Size(200, 200);
    /**
     * Size of decoding image.
     * @type {Size}
     * @private
     */
    this.decodeSize_ = new Size(200, 200);

    /**
     * We use a simple callback instead of events to be independend of
     * closure.
     * @private
     */
    this.decodedCallback_ = goog.nullFunction;
  };
  var ContinuousScanner = w69b.qr.ui.ContinuousScanner;
  goog.inherits(ContinuousScanner, goog.ui.Component);
  var pro = ContinuousScanner.prototype;

  /**
   * @return {boolean} if getUserMedia (and so contiuous scanning)
   * is supported.
   * @export
   */
  ContinuousScanner.isSupported = function() {
    // If api is not pressent it's clearly not supported.
    if (!w69b.LocalVideoCapturer.getMedia)
      return false;
    // But feature detection does not work as browsers lie about their
    // capabilities, so sniff versions and blacklist some.
    // It is supported for Chrome >= 21, Opera => 12, FF >= 20, FFOS 1.4
    // (FF mobile 30)
    var ua = goog.userAgent.getUserAgentString() || '';
    var match = /Chrome\/(\d+)/.exec(ua);
    if (match && match[1] < 21)
      return false;
    match = /Firefox\/(\d+)/.exec(ua);
    if (match && (match[1] < 20 ||
      (match[1] < 29 && (
        goog.string.contains(ua, 'Mobile') ||
        goog.string.contains(ua, 'Android') ||
        goog.string.contains(ua, 'iPhone') ||
        goog.string.contains(ua, 'iPad')
      )))) {
      return false;
    }
    return true;
  };

  /**
   * Canvas element used for visualization.
   * @type {HTMLCanvasElement}
   * @private
   */
  pro.visualizationCanvas_ = null;

  /**
   * Rendering context of visualization canvas.
   * @type {CanvasRenderingContext2D}
   * @private
   */
  pro.visualizationContext_ = null;

  /**
   * Tuples of found pattern positions.
   * @type {Array.<PatternPoint>}
   * @private
   */
  pro.foundPatterns_ = null;

  /**
   * Whether decoder is currently decoding.
   * @type {boolean}
   * @private
   */
  pro.isDecoding_ = false;

  /**
   * Max resolution (max dimension) used for visualization. Allows to reduce
   * resolution to hopefully get a higher performance. If set to 0, the full
   * element size is used.
   * @private
   * @type {number}
   */
  pro.maxVisualizationResolution_ = 0;

  /**
   * Maximal resolution used for decoding. If set to 0, visualization
   * resolution is used.
   * @type {number}
   * @private
   */
  pro.maxDecodeResolution_ = 500;

  /**
   * Maximal age (in ms) of pattern visualization dots.
   * resolution is used.
   * @type {number}
   * @private
   */
  pro.maxPatternAge_ = 500;

  /**
   * @type {number}
   * @private
   */
  pro.animFrameRequestId_ = 0;

  /**
   * @type {number}
   * @private
   */
  pro.timerRequestId_ = 0;

  /**
   *
   * @type {boolean}
   * @private
   */
  pro.stopped_ = false;

  /**
   * Set callback that is called when a text was decoded.
   * @param {function(string)} callback function that takes the decoded
   * string as argument.
   * @export
   */
  pro.setDecodedCallback = function(callback) {
    this.decodedCallback_ = callback;
  };

  /**
   * @param {number} width visualization width.
   * @param {number} height visualization height.
   */
  pro.setSize = function(width, height) {
    this.size_.width = width;
    this.size_.height = height;
    this.decodeSize_ = this.size_.clone();
    this.ensureMaxResolutions_();
  };

  /**
   * Set size from clientWidth/Height.
   * @export
   */
  pro.updateSizeFromClient = function() {
    var ratio = window['devicePixelRatio'] || 1;
    // dont do this for performance reasons for now.
    ratio = 1;
    var el = this.getElement();
    this.size_.width = el.clientWidth * ratio;
    this.size_.height = el.clientHeight * ratio;
    this.decodeSize_ = this.size_.clone();
    this.ensureMaxResolutions_();
  };

  /**
   * Max resolution (max dimension) used for visualization. Allows to reduce
   * resolution to hopefully get a higher performance. If set to 0, the full
   * element size is used.
   * @param {number} pixel resolution.
   * @export
   */
  pro.setMaxVisualizationResolution = function(pixel) {
    this.maxVisualizationResolution_ = pixel;
    this.ensureMaxResolutions_();
  };

  /**
   * Maximal resolution used for decoding. If set to 0, visualization
   * resolution is used.
   * @param {number} pixel resolution.
   * @export
   */
  pro.setMaxDecodingResolution = function(pixel) {
    this.maxDecodeResolution_ = pixel;
    this.ensureMaxResolutions_();
  };

  /**
   * When component is stopped no more screen updates are drawn and no more
   * decoding happens.
   * It does not stop the video stream (use dispose() for that). So you can use this for
   * pausing/resuming scanning.
   * @param {boolean} stopped state.
   * @export
   */
  pro.setStopped = function(stopped) {
    stopped = !!stopped;
    var wasStopped = this.stopped_;
    if (stopped == wasStopped)
      return;
    this.stopped_ = stopped;
    if (!stopped) {
      this.scheduleNextFrame();
    } else {
    }
  };

  /**
   * @override
   */
  pro.createDom = function() {
    var dom = this.getDomHelper();
    this.visualizationCanvas_ = /** @type {HTMLCanvasElement} */ (
      dom.createDom('canvas'));
    goog.style.setStyle(this.visualizationCanvas_, {'width': '100%', 'height': '100%'});
    this.visualizationContext_ = /** @type {CanvasRenderingContext2D} */ (
      this.visualizationCanvas_.getContext('2d'));
    // We currently just render the canvas.
    this.setElementInternal(this.visualizationCanvas_);
    this.capturer_.start(this.onAnimationFrame.bind(this));
  };

  pro.onAnimationFrame = function() {
    if (this.stopped_)
      return;
    this.drawVisualization_();
    this.lastFrameTime_ = new Date().getTime();
    // This draws the result of the last frame on the current frame which
    // is nasty but as we have sent the last image to the worker, we
    // cannot draw it anymore without copying (at least in FF).

    if (!this.isDecoding_) {
      this.worker_.decode(
        /** @type {!HTMLVideoElement} */ (this.capturer_.getVideo()),
        /** @type {!goog.math.Size} */ (this.decodeSize_),
        this.onDecodeMessage_.bind(this));
      this.isDecoding_ = true;
    }
    this.scheduleNextFrame();
  };

  /**
   * Scales size if larger than max resolution.
   * @private
   */
  pro.ensureMaxResolutions_ = function() {
    if (this.maxVisualizationResolution_)
      imgtools.scaleIfLarger(this.size_, this.maxVisualizationResolution_);
    if (this.maxDecodeResolution_)
      imgtools.scaleIfLarger(this.decodeSize_, this.maxDecodeResolution_);

  };
  /**
   * Draws visualization of scanning to canvas.
   * @private
   */
  pro.drawVisualization_ = function() {
    var size = this.size_;
    var canvas = this.visualizationCanvas_;
    // Rescale canvas if needed.
    if (canvas.width != size.width || canvas.height != size.height) {
      canvas.width = size.width;
      canvas.height = size.height;
    }

    var context = this.visualizationContext_;
    this.capturer_.drawOnCanvas(canvas, context);
    // context.fillStyle = 'rgb(200,0,0)';
    // context.fillText(this.lastResult_, 10, 10);
    var scale = this.size_.width / this.decodeSize_.width;
    var maxAge = this.maxPatternAge_;
    var now = new Date().getTime();
    for (var i = 0; i < this.foundPatterns_.length; ++i) {
      var pattern = this.foundPatterns_[i];
      var age = now - pattern.birthTime;
      if (age >= maxAge)
        continue;
      var alpha = (maxAge - age) / maxAge;
      var x = pattern.x * scale;
      var y = pattern.y * scale;
      var radius = pattern.size * scale * alpha;
      context.fillStyle = 'rgba(200,255,50,' + alpha + ')';
      context.beginPath();
      context.arc(x, y, radius, 0, 2 * Math.PI, false);
      context.fill();
    }
  };

  /**
   * Request animation frame.
   */
  pro.scheduleNextFrame = function() {
    var animFrame = (window.requestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame);
    if (animFrame) {
      this.animFrameRequestId_ = animFrame.call(
        window, this.onAnimationFrame.bind(this));
    } else {
      var timeSinceLastFrame = new Date().getTime() - this.lastFrameTime_;
      var waitTime = 0;
      // Draw at 25 fps max
      if (timeSinceLastFrame < 40) {
        waitTime = 40 - timeSinceLastFrame;
      }
      this.timerRequestId_ = window.setTimeout(
        this.onAnimationFrame.bind(this), waitTime);
    }
  };

  /**
   * Decoded message from worker.
   * @private
   * @param {string} type from worker.
   * @param {*=} value from worker.
   */
  pro.onDecodeMessage_ = function(type, value) {
    if (this.stopped_) {
      // don't dispatch pending decoding events when stopped.
      this.isDecoding_ = false;
      return;
    }
    switch (type) {
      case WorkerMessageType.DECODED:
        // this.lastResult_ = value['text'];
        // this.foundPatterns_ = [];
        value['patterns'].forEach(this.addPattern_, this);
        this.onDecoded(value['text']);
        this.isDecoding_ = false;
        break;
      case WorkerMessageType.NOTFOUND:
        this.isDecoding_ = false;
        break;
      case WorkerMessageType.PATTERN:
        this.addPattern_(value);
        break;
    }
  };

  /**
   * Found and decoded qr code.
   * @param {string} text decoded text.
   */
  pro.onDecoded = function(text) {
    this.decodedCallback_(text);
  };

  /**
   * @private
   */
  pro.addPattern_ = function(pattern) {
    this.foundPatterns_.unshift(new PatternPoint(pattern['x'], pattern['y'],
      pattern['size']));
    var max = 10;
    this.foundPatterns_.splice(max - 1, this.foundPatterns_.length - max);
  };

  /**
   * @override
   */
  pro.enterDocument = function() {
    goog.base(this, 'enterDocument');
    this.updateSizeFromClient();
    this.getHandler().listen(window, goog.events.EventType.RESIZE,
      this.updateSizeFromClient);
    this.getHandler().listen(window, 'orientationchange',
      this.updateSizeFromClient);
  };

  /**
   * @override
   */
  pro.disposeInternal = function() {
    goog.base(this, 'disposeInternal');
    this.stopped_ = true;
    this.capturer_.dispose();
    this.worker_.dispose();
    if (this.animFrameRequestId_) {
      var cancel = (window.cancelAnimationFrame ||
      window.mozCancelRequestAnimationFrame ||
      window.oCancelRequestAnimationFrame);
      if (cancel)
        cancel.call(window, this.animFrameRequestId_);
    }
    if (this.timerRequestId_) {
      window.clearTimeout(this.timerRequestId_);
    }
  };


  // exports
  goog.exportSymbol('w69b.qr.ui.ContinuousScanner.prototype.render', pro.render);
  goog.exportSymbol('w69b.qr.ui.ContinuousScanner.prototype.dispose', pro.dispose);
});


