const gulp = require('gulp');
const autoPrefixer = require('gulp-autoprefixer');
const minifyCss = require('gulp-minify-css');
const uglify = require('gulp-uglify');
const rename = require('gulp-rename');
const clean = require('gulp-clean');
const concat = require('gulp-concat');
const notify = require('gulp-notify');
const paths = {
    src: {
        css: 'public/css/*.css',
        js: 'public/js/**/*.js'
    },
    dist: {
        css: 'public/dist/css',
        js: 'public/dist/js'
    }
};

// Styles
gulp.task('styles', function() {
  return gulp.src(paths.src.css)
    .pipe(autoPrefixer('last 2 versions', '> 1%', 'Explorer 9', 'Firefox ESR', 'Opera 12.1'))
    .pipe(gulp.dest(paths.dist.css))
    .pipe(rename(function (dir, base, ext) {
      return base + ".min" + ext;
    }))
    .pipe(minifyCss())
    .pipe(gulp.dest(paths.dist.css))
    .pipe(notify({ message: 'Styles task complete!' }));
});

// Scripts
gulp.task('scripts', function() {
  return gulp.src(paths.src.js)
    .pipe(jshint('.jshintrc'))
    .pipe(jshint.reporter('default'))
    .pipe(concat('main.js'))
    .pipe(gulp.dest(paths.dist.js))
    .pipe(rename(function (dir, base, ext) {
      return base + ".min" + ext;
    }))
    .pipe(uglify())
    .pipe(gulp.dest(paths.dist.js))
    .pipe(notify({ message: 'Scripts task complete!' }));
});

// Clean
gulp.task('clean', function() {
  return gulp.src([path.dist.css, path.dist.js], { read: false })
    .pipe(clean());
});

// Watch
gulp.task('watch', function() {
    gulp.watch(paths.src.css, ['styles']);
    gulp.watch(paths.src.js, ['scripts']);
});

// Default task
gulp.task('default', ['clean', 'styles', 'scripts',]);