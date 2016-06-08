/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * Note: This is a fork of the fb-specific transform.js
 */
'use strict';

const path = require('path');
const babel = require('babel-core');
// const constantElementsPlugin = require('babel-plugin-transform-react-constant-elements');
const reactTransformPlugin = require('babel-plugin-react-transform').default;
const externalHelpersPlugin = require('babel-plugin-external-helpers');
const inlineRequiresPlugin = require('fbjs-scripts/babel-6/inline-requires');

var hmrTransform = 'react-transform-hmr/lib/index.js';
var transformPath = require.resolve(hmrTransform);

const makeHMRConfig =  function(options, filename) {
  var transform = filename ?
      './' + path.relative(path.dirname(filename), transformPath) : // packager can't handle absolute paths
      hmrTransform;

  return {
    plugins: [
      [
        reactTransformPlugin,
        {
          transforms: [{
            transform,
            imports: ['react-native'],
            locals: ['module'],
          }],
        },
      ],
    ],
  };
};

const buildAliasPreset = (reactNativePath, reactPath) => ({
  plugins: [
    [require('babel-plugin-module-alias').default, [
      { src: require.resolve(`${reactNativePath || './node_modules/react-native'}`), expose: 'react-native' },
      { src: require.resolve(`${reactPath || './node_modules/react'}`), expose: 'react' },
    ]],
  ],
});

/**
 * Given a filename and options, build a Babel
 * config object with the appropriate plugins.
 */
function buildBabelConfig(filename, options) {
  const babelConfig = {
    presets: [require('babel-preset-react-native-stage-0/decorator-support'), buildAliasPreset(options.reactNativePath, options.reactPath)],
    plugins: [],
  };

  const extraConfig = {
    filename,
    sourceFileName: filename,
  };

  let config = Object.assign({}, babelConfig, extraConfig);

  // Add extra plugins
  const extraPlugins = [externalHelpersPlugin];

  var inlineRequires = options.inlineRequires;
  var blacklist = inlineRequires && inlineRequires.blacklist;
  if (inlineRequires && !(blacklist && filename in blacklist)) {
    extraPlugins.push(inlineRequiresPlugin);
  }

  if (!options.dev) {
    // extraPlugins.push(constantElementsPlugin);
  }

  config.plugins = extraPlugins.concat(config.plugins);

  let extraPresets = [];

  if (options.hot) {
    const hmrConfig = makeHMRConfig(options, filename);
    extraPresets.push(hmrConfig);
  }

  config.presets = [...config.presets, ...extraPresets];

  return Object.assign({}, babelConfig, config);
}

function transform(src, filename, options) {
  options = options || {};

  const babelConfig = buildBabelConfig(filename, options);
  const result = babel.transform(src, babelConfig);

  return {
    ast: result.ast,
    code: result.code,
    map: result.map,
    filename,
  };
}

module.exports = function(data, callback) {
  let result;
  try {
    result = transform(data.sourceCode, data.filename, data.options);
  } catch (e) {
    callback(e);
    return;
  }

  callback(null, result);
};

// export for use in jest
module.exports.transform = transform;
