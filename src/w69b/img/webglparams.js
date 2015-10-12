// (c) 2013 Manuel Braun (mb@w69b.com)
goog.provide('w69b.img.WebGLParams');
goog.require('goog.object');

goog.scope(function() {
  /**
   * Helps to apply parameters to a webgl programm.
   * @constructor
   * @param {Object=} opt_config initial config, see set().
   */
  w69b.img.WebGLParams = function(opt_config) {
    this.data_ = {};
    if (opt_config)
      this.set(opt_config);
  };
  var pro = w69b.img.WebGLParams.prototype;

  /**
   * @return {w69b.img.WebGLParams} params object.
   */
  pro.clone = function() {
    var params = new w69b.img.WebGLParams();
    params.data_ = goog.object.clone(this.data_);
    return params;
  };

  /**
   * Sets parameters. Example:
   * {'width': 12.4,
   * 'dimensions': [1024.0, 718.0]
   * 'imageId': ['i', 1]
   * }
   *
   * @param {Object} config mapping of names to either:
     *  one or multiple float values,
     * ['i', 21, 45, 6] one or multiple integers with a preceeding 'i'.
   * @return {w69b.img.WebGLParams} this for chaining.
   */
  pro.set = function(config) {
    goog.object.forEach(config, function(value, key) {
      if (value.length > 0 && value[0] == 'i')
        this.setInt(key, value.slice(1));
      else
        this.setFloat(key, value);
    }, this);
    return this;
  };

  /**
   * @param {string} name parameter name.
   * @param {string} type param type.
   * @param {(number|Array.<number>)} value to set.
   * @private
   */
  pro.setInternal_ = function(name, type, value) {
    this.data_[name] = [type, value];
  };

  /**
   * @param {string} name as passed to shader.
   * @param {(number|Array.<number>)} value integer.
   * @return {w69b.img.WebGLParams} this for chaining.
   */
  pro.setInt = function(name, value) {
    var len = value.length || 1;
    this.setInternal_(name, len + 'i', value);
    return this;
  };

  /**
   * @param {string} name as passed to shader.
   * @param {(number|Array.<number>)} value float.
   * @return {w69b.img.WebGLParams} this for chaining.
   */
  pro.setFloat = function(name, value) {
    var len = value.length || 1;
    this.setInternal_(name, len + 'f', value);
    return this;
  };


  /**
   * @param {string} name parameter name.
   * @return {?number} value or null.
   */
  pro.getValue = function(name) {
    var tuple = this.data_[name];
    if (tuple)
      return tuple[1];
    else
      return null;
  };

  /**
   * Apply parameters to program. You need to call program.use() and
   * program.initCommonAttributes() yourself.
   * @param {w69b.img.WebGLProgram} program webgl program.
   */
  pro.apply = function(program) {
    var setters = program.getNamedSetterFunctions();
    goog.object.forEach(this.data_, function(value, name) {
      var type = value[0];
      var valueArgs = value[1];
      setters[type].apply(program, [name].concat(valueArgs));
    }, this);
  };

  /**
   * Same as apply() but takes care of calling program.use() and
   * initCommonAttribtues()
   * @param {w69b.img.WebGLProgram} program webgl program.
   */
  pro.useAndApply = function(program) {
    program.use();
    program.initCommonAttributes();
    this.apply(program);
  };
});
