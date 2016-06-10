// Copyright 2004-present Facebook. All Rights Reserved.

/**
 * React Native CLI configuration file
 */
'use strict';

const blacklist = require('react-native/packager/blacklist');

module.exports = {
  getBlacklistRE(platform) {
    return blacklist(platform, [
      /ex\-navigation\/(src|vendor|__internal__)\/(.*)/,
    ]);
  },
};
