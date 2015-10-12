// (c) 2013 Manuel Braun (mb@w69b.com)

goog.require('goog.math.Size');
goog.provide('w69b.img.WebGLBinarizer');
goog.require('w69b.img.RGBABitMatrix');
goog.require('w69b.img.RGBAImageData');
goog.require('w69b.img.WebGLFilter');
goog.require('w69b.img.WebGLParams');
goog.require('w69b.img.WebGLPipeline');
goog.require('w69b.img.WebGLProgram');
goog.require('w69b.shaders.binarizeAvg1');
goog.require('w69b.shaders.binarizeGroup');
goog.require('w69b.shaders.debug');
goog.require('w69b.shaders.estimateBlack');
goog.require('w69b.shaders.extractChannel');
goog.require('w69b.shaders.fragCoordTest');
goog.require('w69b.shaders.gaussBlur');
goog.require('w69b.shaders.grayscale');
goog.require('w69b.shaders.rectVertex');
goog.require('w69b.shaders.scale');


goog.scope(function() {
  var WebGLFilter = w69b.img.WebGLFilter;
  var WebGLProgram = w69b.img.WebGLProgram;
  var WebGLParams = w69b.img.WebGLParams;
  var WebGLPipeline = w69b.img.WebGLPipeline;
  var RGBAImageData = w69b.img.RGBAImageData;
  var RGBABitMatrix = w69b.img.RGBABitMatrix;
  /**
   * WebGL shader based image binarizer.
   * The basic idea is to estimate an average black level for each pixel by looking at
   * neighbouring pixels, while choosing the neighbourhood large enough to cover a sufficently
   * large dynamic range.
   * Then simply apply thresholding based on that value.
   *
   * In detail:
   * - Successively apply shaders to compute a scale space and the dynamic range
   * (gaussBlur, binarizeAvg1, binarizeGroup).
   * - Run estimateBlack shader to pick a gray level estimation. It just chooses the
   * gray level from the smallest scale that still satisfies a dynamic range constraint.
   * - Run thresholding shader to apply thresholding on input image gray values with
   * black level estimations.
   *
   * @constructor
   * @param {HTMLCanvasElement=} opt_canvas canvas to use.
   */
  w69b.img.WebGLBinarizer = function(opt_canvas) {
    this.filter_ = new WebGLFilter(opt_canvas);
  };
  var pro = w69b.img.WebGLBinarizer.prototype;
  var _ = w69b.img.WebGLBinarizer;
  /**
   * @type {?boolean}
   */
  _.isSupported_ = null;

  pro.pipeline_ = null;
  pro.setupCalled_ = false;
  /**
   * If canvas is displayed directly, input data needs to be flipped around
   * y axis.
   * @type {boolean}
   * @private
   */
  pro.flipInput_ = false;


  /**
   * Size of native input image/video.
   * @type {?goog.math.Size}
   * @private
   */
  pro.inSize_ = null;

  /**
   * @param {string} source fragment source.
   * @return {w69b.img.WebGLProgram} compiled program.
   */
  pro.getProgram = function(source) {
    return new WebGLProgram(this.filter_.getContext(), source);
  };

  /**
   * @param {boolean} flip whether to flip input arround y axis.
   */
  pro.setFlipInput = function(flip) {
    this.flipInput_ = flip;
  };

  /**
   * Setup binarizer for given image dimensions.
   * Only call this once.
   * @param {number} width in pixels.
   * @param {number} height in pixels.
   * @param {number=} opt_inWidth in pixels.
   * @param {number=} opt_inHeight in pixels.
   */
  pro.setup = function(width, height, opt_inWidth, opt_inHeight) {
    if (!opt_inHeight)
      opt_inHeight = height;
    if (!opt_inWidth)
      opt_inWidth = width;
    if (!this.setupCalled_) {
      // compile shaders
      this.programDynRange1 = this.getProgram(w69b.shaders.binarizeAvg1);
      this.programDynRange2 = this.getProgram(w69b.shaders.binarizeGroup);
      this.programEstimateBlack = this.getProgram(w69b.shaders.estimateBlack);
      this.programThreshold = this.getProgram(w69b.shaders.threshold);
      this.programGauss = this.getProgram(w69b.shaders.gaussBlur);
    }

    if (!this.setupCalled_ ||
      this.filter_.getWidth() != width ||
      this.filter_.getHeight() != height ||
      this.inSize_.width != opt_inWidth ||
      this.inSize_.height != opt_inHeight) {
      this.filter_.setSize(width, height);
      this.inSize_ = new goog.math.Size(opt_inWidth, opt_inHeight);
      this.filter_.createTextures(3);
      if (this.flipInput_)
        this.filter_.setTextureFlipped(0);
      this.pipeline_ = this.createPipeline();
    }
    this.setupCalled_ = true;
  };

  pro.createPipeline = function() {
    var width = this.filter_.getWidth();
    var height = this.filter_.getHeight();
    var inSize = this.inSize_;

    var pipeline = new WebGLPipeline(this.filter_);
    // Some shaders that are useful for debugging.
    // var grayscale = new WebGLProgram(gl, w69b.shaders.grayscale);
    // var dummy = this.getProgram(w69b.shaders.dummy);
    // var extractChannel = this.getProgram(w69b.shaders.extractChannel);
    // var debug = new WebGLProgram(gl, w69b.shaders.debug);
    var baseParams = new WebGLParams(
      {
        'width': width,
        'height': height,
        'inwidth': width,
        'inheight': height,
        'texwidth': width,
        'texheight': height,
        'inOffset': [0, 0],
        'outOffset': [0, 0],
        'fragCoordOffset': this.filter_.getFragCoordOffset()
      });
    var downScalePower = 3;
    var scaledWith = Math.max(1, width >> downScalePower);
    var scaledHeight = Math.max(1, height >> downScalePower);
    var smallImgParams = baseParams.clone().set({
      'width': scaledWith,
      'height': scaledHeight,
      'inwidth': scaledWith,
      'inheight': scaledHeight
    });

    // Apply gauss and downsample to scaledWidth/Height
    pipeline.addPass(this.programGauss,
      baseParams.clone().set({
        'width': scaledWith,
        'sampleDirection': [0, 1],
        'texwidth': inSize.width,
        'texheight': inSize.height
      }));

    pipeline.addPass(this.programGauss,
      smallImgParams.clone().set({
        'inheight': height,
        'sampleDirection': [1, 0]
      }));

    // Compute more dynamic ranges and two more scales on gray
    // level image, in a layout next to each other. Kernel size increases
    // from left to right.
    pipeline.addPass(this.programDynRange1, smallImgParams.clone().set({
      'sampleDirection': [0, 1]
    }));
    pipeline.addPass(this.programDynRange2, smallImgParams.clone().set({
      'sampleDirection': [1, 0]
    }));

    pipeline.addPass(this.programDynRange2, smallImgParams.clone().set({
      'sampleDirection': [0, 2]
    }));
    pipeline.addPass(this.programDynRange2, smallImgParams.clone().set({
      'sampleDirection': [2, 0],
      'outOffset': [scaledWith, 0]
    }));

    pipeline.addPass(this.programDynRange2, smallImgParams.clone().set({
      'sampleDirection': [0, 2],
      'inOffset': [scaledWith, 0]
    }));
    pipeline.addPass(this.programDynRange2, smallImgParams.clone().set({
      'sampleDirection': [2, 0],
      'outOffset': [scaledWith * 2, 0]
    }));
    // Use scale space and dynamic range estimations to estimate black level.
    pipeline.addPass(this.programEstimateBlack, smallImgParams);
    // pipeline.addPass(extractChannel,
    //  smallImgParams.clone().setInt('channel', 2));

    pipeline.addPass(this.programThreshold, smallImgParams.clone()
      .setInt('origImage', 0)
      .set({
        'width': inSize.width, 'height': inSize.height,
        'inwidth': scaledWith, 'inheight': scaledHeight
      }));
    return pipeline;
  };


  /**
   * @return {w69b.img.RGBAImageData} image data.
   */
  pro.getImageData = function() {
    return this.filter_.getImageData();
  };

  /**
   * @return {w69b.img.RGBABitMatrix} image data wrapped in RGBABitmatrix.
   */
  pro.getBitMatrix = function() {
    var imgdata = this.filter_.getImageData();
    return new RGBABitMatrix(imgdata.width, imgdata.height, imgdata.data);
  };

  /**
   * @param {(Image|HTMLVideoElement|RGBAImageData|ImageData)} image image
   * to render.
   */
  pro.render = function(image) {
    if (!this.setupCalled_) {
      throw new Error();
    }
    var gl = this.filter_.getContext();
    // bind input image to texture 0.
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.filter_.getTexture(0));
    if (image instanceof RGBAImageData) {
      // custom image data
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, image.width, image.height, 0,
        gl.RGBA, gl.UNSIGNED_BYTE, image.data);

    } else {
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE,
        image);
    }

    this.pipeline_.render(0, 1, 2, true);
  };

  /**
   * @param {number} width in pixels.
   * @param {number} height in pixels.
   * @return {w69b.img.RGBAImageData} test image.
   */
  _.createSupportCheckImage = function(width, height) {
    var imgdata = new Uint8Array(4 * width * height);
    // build gradient
    for (var y = 0; y < height; ++y) {
      for (var x = 0; x < width; ++x) {
        var pos = 4 * (width * y + x);
        var gray = x;
        imgdata[pos] = gray;
        imgdata[pos + 1] = gray;
        imgdata[pos + 2] = gray;
        imgdata[pos + 3] = 255;
      }
    }
    return new RGBAImageData(width, height, imgdata);
  };

  /**
   *
   */
  _.isSupported = function() {
    // create test image
    if (_.isSupported_ === null) {
      var width = 100;
      var height = 20;
      var img = _.createSupportCheckImage(width, height);
      // set contrast on some pixels.
      img.setGray(30, 4, 18);
      img.setGray(90, 4, 50);
      try {
        var binarizer = new w69b.img.WebGLBinarizer();
      } catch (ignored) {
        // No webgl support.
        return false;
      }
      binarizer.setFlipInput(false);
      binarizer.setup(width, height);
      binarizer.render(img);
      var binary = binarizer.getImageData();
      // Check some black and white values.
      _.isSupported_ = (binary.get(30, 4)[0] == 0 &&
      binary.get(90, 4)[0] == 0 &&
      binary.get(31, 4)[0] == 255 &&
      binary.get(29, 4)[0] == 255);
    }
    return _.isSupported_;
  };

});
