'use strict';
// Copyright 2015 Manuel Braun (mb@w69b.com). All Rights Reserved.
var through = require('through2');
var gutil = require('gulp-util');
var path = require('path');
var fs = require('fs');

/**
 * Returns javascript code that exports the given string using goog.provide.
 */
function txt2js(txt, name) {
  var js = 'goog.provide(\'' + name + '\');\n' +
    name + ' = \'' +
    txt.replace(/'/g, '\\\'').replace(/\r?\n/g, '\\n\' +\n  \'') +
    '\';';
  return js;
}

/**
 * Process c-style include directives.
 */
function preprocess(shaderCode, dirname) {
  // Simple shader preprocessing hack.
  var reInclude = /^#include <([-\.\w]+)>/;
  var reComment = /(.*)\/\//;
  var result = [];
  // add line without comments.
  function addLine(line) {
    var match = reComment.exec(line);
    if (match)
      line = match[1];
    line = line.trim();
    if (line.length > 0)
      result.push(line);
  }
  function processShader(shader) {
    shader.split('\n').forEach(function(line) {
      var match = reInclude.exec(line);
      if (match) {
        var fname = match[1];
        var file = path.join(dirname, fname);
        if (fs.statSync(file).isFile())
          processShader(fs.readFileSync(file, 'utf-8'));
        else
          throw new Error('File included from shader not found: ' + file);
        return;
      }
      addLine(line);
    });
  }
  processShader(shaderCode);
  return result.join('\n');
}

/**
 * Path to module name.
 * @param {String} filePath relative path to file
 * @returns {string} closure module name
 */
function pathToName(filePath) {
  var name = path.join(path.dirname(filePath), path.basename(filePath, path.extname(filePath)));
  return name.replace(/\//g, '.');
}

/**
 * Convert shader scripts google closure modules.
 */
module.exports = function() {
  return through.obj(function(file, enc, cb) {
    if (file.isNull()) {
      cb(null, file);
      return;
    }

    if (file.isStream()) {
      cb(new gutil.PluginError('shader2js', 'Streaming not supported'));
      return;
    }

    var basename = path.basename(file.path, path.extname(file.path));
    // ignore files starting with _
    if (basename.indexOf('_') === 0) {
      cb();
      return;
    }

    if (file.isBuffer()) {
      var name = pathToName(file.relative);
      var shader = file.contents.toString();
      shader = preprocess(shader, path.dirname(file.path));
      var jsCode = txt2js(shader, name);
      file.contents = new Buffer(jsCode);
      file.path = path.join(path.dirname(file.path), basename + '.js');
    }

    this.push(file);
    cb();
  });
};
