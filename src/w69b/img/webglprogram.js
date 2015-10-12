// (c) 2013 Manuel Braun (mb@w69b.com)

goog.provide('w69b.img.WebGLProgram');
goog.require('w69b.shaders.rectVertex');

goog.scope(function() {
  /**
   * Filters images using webgl shaders.
   * @param {WebGLRenderingContext} gl rendering context.
   * @param {string} fragmentSource fragmentSource.
   * @param {string=} opt_vertexSource vertex shader.
   * @constructor
   */
  w69b.img.WebGLProgram = function(gl, fragmentSource, opt_vertexSource) {
    this.context_ = gl;
    var vertexShader = this.buildShader_(
      opt_vertexSource || w69b.shaders.rectVertex, true);
    var fragmentShader = this.buildShader_(fragmentSource, false);
    var shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
      throw Error('Could not link shader program: ' +
        gl.getProgramInfoLog(shaderProgram));
    }
    this.glProgram = shaderProgram;
  };
  var pro = w69b.img.WebGLProgram.prototype;

  /**
   * Linked shader program.
   */
  pro.glProgram = null;

  /**
   * @type {WebGLRenderingContext} gl rendering context.
   */
  pro.contex_ = null;



  /**
   * Initialize common shader attributes.
   */
  pro.initCommonAttributes = function() {
    var gl = this.context_;
    var program = this.glProgram;
    var positionLocation = gl.getAttribLocation(program, 'position');
    var buffer = gl.createBuffer();
    var vertices = [-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1];

    //set position attribute data
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
  };

  /**
   * Activates this program.
   */
  pro.use = function() {
    this.context_.useProgram(this.glProgram);
  };

  /**
   * Draws rectangele. InitCommonAttributes needs to have been called first.
   */
  pro.drawRect = function() {
    var gl = this.context_;
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  };

  /**
   * @param {string} name variable name.
   * @param {number} value float value.
   */
  pro.setUniform1f = function(name, value) {
    var location = this.context_.getUniformLocation(this.glProgram, name);
    this.context_.uniform1f(location, value);
  };

  /**
   * For vec2.
   * @param {string} name variable name.
   * @param {number} x float value.
   * @param {number} y float value.
   */
  pro.setUniform2f = function(name, x, y) {
    var location = this.context_.getUniformLocation(this.glProgram, name);
    this.context_.uniform2f(location, x, y);
  };

  /**
   * @param {string} name variable name.
   * @param {(Array.<number>|Float32Array)} value float value.
   */
  pro.setUniform1fv = function(name, value) {
    var location = this.context_.getUniformLocation(this.glProgram, name);
    this.context_.uniform1fv(location, value);
  };

  /**
   * @param {string} name variable name.
   * @param {number} value int value.
   */
  pro.setUniform1i = function(name, value) {
    var location = this.context_.getUniformLocation(this.glProgram, name);
    this.context_.uniform1i(location, value);
  };


  /**
   * @return {Object} mapping of type names to unbound setter functions.
   */
  pro.getNamedSetterFunctions = function() {
    return this.namedSetterFns_;
  };

  /**
   * @type {Object} mapping type names to setter functions.
   * @private
   */
  pro.namedSetterFns_ = {
    '1i': pro.setUniform1i,
    '1f': pro.setUniform1f,
    '2f': pro.setUniform2f
  };

  /**
   * @param {string} source shader source.
   * @param {boolean} isVertex true for vertex shader, false for fragment
   * shader.
   * @return {WebGLShader} shader.
   */
  pro.buildShader_ = function(source, isVertex) {
    var gl = this.context_;
    var shader = gl.createShader(
      isVertex ? gl.VERTEX_SHADER : gl.FRAGMENT_SHADER);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      throw Error('Could not compile shader: ' +
        gl.getShaderInfoLog(shader));
    }
    return shader;
  };

});

