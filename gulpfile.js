// Imports

import gulp from 'gulp';
import plumber from 'gulp-plumber';
import sass from 'gulp-dart-sass';
import postcss from 'gulp-postcss';
import csso from 'postcss-csso';
import htmlmin from 'gulp-htmlmin';
import terser from 'gulp-terser';
import rename from 'gulp-rename';
import squoosh from 'gulp-libsquoosh';
import svgo from 'gulp-svgo';
import { deleteAsync } from 'del';
import svgstore from 'gulp-svgstore';
import autoprefixer from 'autoprefixer';
import browser from 'browser-sync';


// styles
export const styles = () => {
  return gulp.src('source/sass/style.scss', { sourcemaps: true })
    .pipe(plumber())
    .pipe(sass().on('error', sass.logError))
    .pipe(postcss([
      autoprefixer(),
      csso()
    ]))
    .pipe(rename('style.min.css'))
    .pipe(gulp.dest('build/styles', { sourcemaps: '.' }))
    .pipe(browser.stream());
}


// html
const html = () => {
  return gulp.src('source/*.html')
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(gulp.dest('build'))
}


// scripts
const scripts = () => {
  return gulp.src('source/scripts/*.js')
    .pipe(terser())
    .pipe(gulp.dest('build/scripts'))
}


// images
const optimizeImages = () => {
  return gulp.src('source/images/**/*.{jpg,png}')
    .pipe(squoosh())
    .pipe(gulp.dest('build/images'))
}

const copyImages = () => {
  return gulp.src('source/images/**/*.{jpg,png}')
    .pipe(gulp.dest('build/images'))
}


// webp
const createWebp = () => {
  return gulp.src('source/images/**/*.{jpg,png}')
    .pipe(squoosh({ webp: true }))
    .pipe(gulp.dest('build/images'))
}


// svg
const svg = () => {
  return gulp.src(['source/images/**/*.svg', '!source/images/sprite/**/*.svg'])
    .pipe(svgo())
    .pipe(gulp.dest('build/images'))
}


// sprite
const sprite = () => {
  return gulp.src('source/images/sprite/**/*.svg')
    .pipe(svgo())
    .pipe(svgstore({ inlineSvg: true }))
    .pipe(rename('sprite.svg'))
    .pipe(gulp.dest('build/images/sprite'))
}


// copy
const copy = (done) => {
  gulp.src([
  'source/fonts/*.{woff2,woff}',
  'source/*.ico',
  'source/*.webmanifest',
  ], {
  base: 'source'
  })
  .pipe(gulp.dest('build'))
  done();
}


// clean
export const clean = () => {
  return deleteAsync('build');
};


// Server
const server = (done) => {
  browser.init({
    server: {
      baseDir: 'build'
    },
    cors: true,
    notify: false,
    ui: false,
  });
  done();
}


// Reload
const reload = (done) => {
  browser.reload();
  done();
}


// Watcher
const watcher = () => {
  gulp.watch('source/sass/**/*.scss', gulp.series(styles));
  gulp.watch('source/scripts/*.js', gulp.series(scripts));
  gulp.watch('source/*.html', gulp.series(html, reload));
}


// build
export const build = gulp.series(
clean,
copy,
optimizeImages,
  gulp.parallel(
  styles,
  html,
  scripts,
  svg,
  sprite,
  createWebp),
);


// Default
export default gulp.series(
clean,
copy,
copyImages,
  gulp.parallel(
    styles,
    html,
    scripts,
    svg,
    sprite,
    createWebp),
gulp.series(
server,
watcher
));
