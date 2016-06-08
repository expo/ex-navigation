// Copyright 2004-present Facebook. All Rights Reserved.

/**
 * React Native CLI configuration file
 */
'use strict';

const blacklist = require('react-native/packager/blacklist');

module.exports = {
  // getProjectRoots() {
  //   return this._getRoots();
  // },
  //
  // getAssetRoots() {
  //   return this._getRoots();
  // },

  getBlacklistRE(platform) {
    return blacklist(platform, [
      /ex\-navigation\/src\/(.*)/,
    ]);
  },

  // _getRoots() {
  //   return [
  //     path.join(__dirname, '..', '..'),
  //   ];
  // },

  // getTransformOptionsModulePath: require.resolve(`./transformOptions.js`),
};
