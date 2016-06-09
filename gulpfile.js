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
  src: 'src/**/*.js',
};

const babelOpts = {
  presets: [babelPresetRN],
  plugins: [
    babelPluginDEV,
    [babelPluginModules, {
      map: {
        'core-decorators': 'core-decorators',
        'debug': 'debug',
        'fbemitter': 'fbemitter',
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
        'react-pure-render': 'react-pure-render',
        'react-pure-render/component': 'react-pure-render/component',
        'react-pure-render/shallowEqual': 'react-pure-render/shallowEqual',
        'react-static-container': 'react-static-container',
        'uuid-js': 'uuid-js',
        'warning': 'warning',

        //provides module from rn -- gross
        'NavigationCardStackStyleInterpolator': 'NavigationCardStackStyleInterpolator',
        'NavigationCardStackPanResponder': 'NavigationCardStackPanResponder',
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

gulp.task('watch', function() {
  return gulp
    .src(paths.src)
    .pipe(watch(paths.src))
    .pipe(babel(babelOpts))
    .pipe(flatten())
    .pipe(gulp.dest(paths.lib));
});

gulp.task('default', function(cb) {
  runSequence('clean', ['modules'], cb);
});
