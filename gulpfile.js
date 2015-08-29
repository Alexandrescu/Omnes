// Including gulp
var gulp = require('gulp');

// Including plugins
var watch = require('gulp-watch');
var typescript = require('gulp-typescript');
var merge = require('merge2');
var del = require('del');
var inject = require('gulp-inject');
var fs = require('graceful-fs');
var bowerFiles = require('main-bower-files');

var debug = require('gulp-debug');

// Constants 
var COMPONENTS = './source/components.json';
var INDEX = './source/index.html';
var BOWER = './build/bower/';

// Creating typescript project.
// This can have multiple props. Check out gulp-typescript.
var tsProject = typescript.createProject({
  target: 'ES6'
});

// Typescript
// TODO Compile only selected components.
var TSStream = function() {
  var tsResults = gulp.src('source/**/*.ts')
    .pipe(typescript(tsProject));

  return merge([
    tsResults.dts.pipe(gulp.dest('build/definitions')),
    tsResults.js.pipe(gulp.dest('build/js'))
  ]);
}

gulp.task('typescript', ['clean-typescript'], TSStream);

//Watch tasks
gulp.task('watch-typescript', ['typescript'], function() {
  watch('source/**/*.ts', function() {
    gulp.start('typescript');
  });
});

gulp.task('watch-components', function() {
  gulp.watch([COMPONENTS, INDEX], ['inject']);
});

gulp.task('watch', ['watch-typescript', 'watch-components']);

// Cleaning tasks
gulp.task('clean-typescript', function() { 
  del.sync(['build/js/**/*.js']);
});

gulp.task('clean', ['clean-typescript']);

// Moving bower to production
gulp.task('bower', function() {
  return gulp.src(bowerFiles())
    .pipe(gulp.dest(BOWER));
});

gulp.task('index', function() {
  return gulp.src('./source/index.html')
    .pipe(gulp.dest('./build/'))
});

// Injecting into html
gulp.task('inject', ['index', 'bower', 'typescript'], function() {
  var target = gulp.src('./build/index.html');

  return target
    .pipe(inject(gulp.src('./build/bower/**'), {name: 'bower', relative: true}))
    .pipe(inject(gulp.src('./build/js/**', {read: false}), {relative: true}))
    .pipe(gulp.dest('./build/'));
});

// Default task
gulp.task('default', ['inject', 'clean', 'watch']);

