const gulp = require('gulp');
const babel = require('gulp-babel');
const flatten = require('gulp-flatten');
const watch = require('gulp-watch');
const del = require('del');
const babelPluginModules = require('fbjs-scripts/babel-6/rewrite-modules');
const babelPluginDEV = require('fbjs-scripts/babel-6/dev-expression');
const babelPresetRN = require('babel-preset-react-native-stage-0/decorator-support');
const runSequence = require('run-sequence');

const paths = {
  lib: 'lib',
  src: ['src/**/*.js', 'vendor/**/*.js'],
};

const babelOpts = {
  presets: [babelPresetRN],
  plugins: [
    babelPluginDEV,
    [babelPluginModules, {
      map: {
        'clamp': 'clamp',
        'core-decorators': 'core-decorators',
        'debug': 'debug',
        'fbemitter': 'fbemitter',
        'fbjs/lib/shallowEqual': 'fbjs/lib/shallowEqual',
        'fbjs/lib/emptyFunction': 'fbjs/lib/emptyFunction',
        'fbjs/lib/invariant': 'fbjs/lib/invariant',
        './assets/back-icon.png': './back-icon.png',
        'hoist-non-react-statics': 'hoist-non-react-statics',
        'invariant': 'invariant',
        'lodash': 'lodash',
        'mirror-creator': 'mirror-creator',
        'react-clone-referenced-element': 'react-clone-referenced-element',
        'react': 'react',
        'react-native': 'react-native',
        'redux': 'redux',
        'redux-batched-actions': 'redux-batched-actions',
        'react-redux': 'react-redux',
        'reselect': 'reselect',
        'react-static-container': 'react-static-container',
        'react-native-drawer-layout': 'react-native-drawer-layout',
        '@exponent/react-native-touchable-native-feedback-safe': '@exponent/react-native-touchable-native-feedback-safe',
        'uuid-js': 'uuid-js',
        'warning': 'warning',
      },
    }],
  ],
  compact: false,
  retainLines: false,
  comments: true,
};

gulp.task('clean', function(cb) {
  return del([paths.lib], cb);
});

gulp.task('modules', function() {
  return gulp
    .src(paths.src)
    .pipe(babel(babelOpts))
    .pipe(flatten())
    .pipe(gulp.dest(paths.lib));
});

gulp.task('assets', function() {
  return gulp
    .src('vendor/**/*.png')
    .pipe(flatten())
    .pipe(gulp.dest(paths.lib));
});

gulp.task('watch', function() {
  return gulp
    .src(paths.src)
    .pipe(watch(paths.src))
    .pipe(babel(babelOpts))
    .pipe(flatten())
    .pipe(gulp.dest(paths.lib));
});

gulp.task('default', function(cb) {
  runSequence('clean', ['modules', 'assets'], cb);
});
