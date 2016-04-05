/* jshint node:true */
'use strict';
// generated on 2015-01-10 using generator-gulp-webapp 0.2.0

var widgetName = 'moonplot';

var _ = require('lodash');
var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var fs = require('fs-extra');
var runSequence = require('run-sequence');
var less = require('gulp-less');
var rename = require('gulp-rename');

gulp.task('clean', function(cb) {
  fs.remove('dist', cb);
});

gulp.task('less', function () {
  return gulp.src('src/styles/**/*.less')
    .pipe(less({}))
    .pipe(gulp.dest('dist/browser/styles'))
    .pipe(gulp.dest('dist/package/inst/htmlwidgets/lib/style'));
});

gulp.task('compile-coffee', function () {
  var gulp_coffee = require("gulp-coffee");

  gulp.src('src/scripts/**/*.coffee')
    .pipe(gulp_coffee({ bare: true }))
    .pipe(gulp.dest('dist/browser/scripts'))
    .pipe(gulp.dest('dist/package/inst/htmlwidgets/'));
});

gulp.task('copy', function () {
  gulp.src([
    'src/**/*.html'
  ], {
    dot: true
  }).pipe(gulp.dest('dist/browser'));

  gulp.src([
    'src/scripts/labeler.js'
  ], {
    dot: true
  }).pipe(gulp.dest('dist/browser/scripts'))

  gulp.src([
    'bower_components/**/*'
  ], {
    dot: true
  }).pipe(gulp.dest('dist/browser/bower_components'));

  gulp.src([
    'src/R/**/*.R'
  ], {
    dot: true
  }).pipe(gulp.dest('dist/package/R'));

  gulp.src('htmlwidget.yaml')
    .pipe(rename(widgetName + '.yaml'))
    .pipe(gulp.dest('dist/package/inst/htmlwidgets/'));

  gulp.src(['DESCRIPTION', 'NAMESPACE'])
    .pipe(gulp.dest('dist/package/'));


  gulp.src([
    'man/**/*'
  ], {
    dot: true
  }).pipe(gulp.dest('dist/package/man'));

  var extLibs = [
    {
      src: 'bower_components/lodash/dist/lodash.min.js',
      dest: 'dist/package/inst/htmlwidgets/lib/lodash-2.4.2/'
    },
    {
      src: 'bower_components/jquery/dist/jquery.min.js',
      dest: 'dist/package/inst/htmlwidgets/lib/jquery-2.2.1/'
    },
    {
      src: 'bower_components/d3/d3.min.js',
      dest: 'dist/package/inst/htmlwidgets/lib/d3/'
    },
    {
      src: 'bower_components/victor/build/victor.min.js',
      dest: 'dist/package/inst/htmlwidgets/lib/victor/'
    }
  ]

  _.forEach(extLibs, function(extLib) {
    gulp.src([
      extLib.src
    ], {
      dot: true
    }).pipe(gulp.dest(extLib.dest));
  });

});

gulp.task('connect', ['build'], function () {
  var serveStatic = require('serve-static');
  var serveIndex = require('serve-index');
  var app = require('connect')()
    .use(require('connect-livereload')({port: 35729}))
    .use(serveStatic('dist/browser'))
    .use(serveIndex('dist/browser'));

  require('http').createServer(app)
    .listen(9000)
    .on('listening', function () {
      console.log('Started connect web server on http://localhost:9000');
    });
});

gulp.task('serve', ['connect', 'watch'], function () {
  require('opn')('http://localhost:9000');
});

// inject bower components
gulp.task('wiredep', function () {
  var wiredep = require('wiredep').stream;

  gulp.src('src/index.html')
    .pipe(wiredep({exclude: ['bootstrap-sass-official']}))
    .pipe(gulp.dest('src'));
});

gulp.task('watch', ['connect'], function () {
  $.livereload.listen();

  // watch for changes
  gulp.watch([
    'dist/browser/**/*',
  ]).on('change', $.livereload.changed);

  gulp.watch('src/**/*.html', ['copy']);
  gulp.watch('src/images/**/*', ['images']);
  gulp.watch('src/styles/**/*.less', ['less']);
  gulp.watch('src/scripts/**/*.coffee', ['compile-coffee']);

});

//clean doesn't finish before next task ..
//gulp.task('build', ['clean', 'wiredep', 'images', 'fonts', 'styles', 'copy'], function () {
gulp.task('build', ['compile-coffee', 'less', 'copy'], function () {
  return gulp.src('dist/**/*').pipe($.size({title: 'build', gzip: true}));
});

gulp.task('default', function () {
  gulp.start('build');
});
