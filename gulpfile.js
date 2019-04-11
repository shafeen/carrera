const gulp = require('gulp');
const argv = require('yargs').argv;
const browserify = require('browserify');
const plugins = require('gulp-load-plugins')({lazy: true});

const BUILD_PATH = './client/public/build/';

gulp.task('test', () => {
    console.log('hello i am a test gulp task');
});

// testing a programmatic way to add a view to basicMEAN
// TODO: add to config.js
// TODO: find a way to add the js file to the layout file programmatically
gulp.task('add-view', () => {
    let viewName = argv.name ? argv.name.toLowerCase() : null;
    let protectedView = false;
    if (!viewName || viewName.length < 2) {
        console.log('Invalid view name provided, exiting gulp task.');
        return;
    }

    let destFolder = './client/ng-client/view-' + viewName + '/';
    plugins.file('View'+viewName[0].toUpperCase()+viewName.substr(1)+'Ctrl.js',
        "angular.module('basicMEAN')\n.controller('"+
        'View'+viewName[0].toUpperCase()+viewName.substr(1)+'Ctrl' +"', function () {\n});",
        {src: true})
        .pipe(gulp.dest(destFolder));

    return plugins.file('view-' + viewName + '.pug', '', {src: true})
        .pipe(gulp.dest(destFolder));
});

gulp.task('js-concat-minify', () => {
    // EXAMPLE: (TODO: switch to using the concat file in layout.pug)
    // concat all angular js files, while controlling the order of files
    let js = gulp.src(['./client/ng-client/**/*.js', './client/ng-client-secure/**/*.js'])
        .pipe(plugins.concat('ng-client.js'));

    let uglify = plugins.uglifyEs.default;
    return js
        .pipe(gulp.dest('./client/public/build/js/'))
        .pipe(uglify())
        .pipe(gulp.dest('./client/public/build/min-js/'));
});

const buildUtil = {
    buildWithoutMinifyJs: function (jsFilesGlob, concatFileName) {
        let jsFiles = gulp.src(jsFilesGlob);
        return jsFiles.pipe(plugins.concat(`${concatFileName}.js`));
    },
    buildAndMinifyJs : function (jsFilesGlob, concatFileName) {
        return buildUtil.buildWithoutMinifyJs(jsFilesGlob, concatFileName)
            .pipe(plugins.uglifyEs.default());
    },
    buildRequireBundle: function (requireFilesGlob, concatFileName) {
        return gulp.src(requireFilesGlob)
            .pipe(plugins.tap(function (file) {
                // replace file contents with browserify's bundle stream
                file.contents = browserify(file.path, {debug: true}).bundle();
            }))
            // transform streaming contents into buffer contents for gulp-sourcemaps & gulp-concat
            .pipe(plugins.buffer())
            .pipe(plugins.concat(`${concatFileName}.js`))
            // load and init sourcemaps
            .pipe(plugins.sourcemaps.init({loadMaps: true}))
            .pipe(plugins.uglifyEs.default({mangle: false}))
            // write sourcemaps to path relative to destination
            .pipe(plugins.sourcemaps.write('./'))
    }
};

gulp.task('build-require-bundle', () => {
    let requirefilesGlob = ['./client/public/js/requires/*.js'];
    return buildUtil.buildRequireBundle(requirefilesGlob, 'require-bundle')
        .pipe(gulp.dest(BUILD_PATH));
});

gulp.task('build-minify-ng-client', ['build-require-bundle'], () => {
    let angularfilesGlob = ['./client/ng-client/**/*.js', './client/ng-client-secure/**/*.js'];
    return buildUtil.buildAndMinifyJs(angularfilesGlob, 'ng-client')
        .pipe(gulp.dest(BUILD_PATH));
});

// use this to test the production minified js
gulp.task('watch-minify-angular', ['build-minify-ng-client'], () => {
    let angularfilesGlob = ['./client/ng-client/**/*.js', './client/ng-client-secure/**/*.js'];
    return plugins.watch(angularfilesGlob, () => {
        console.log('rebuilding: %s', new Date());
        return buildUtil.buildAndMinifyJs(angularfilesGlob, 'ng-client')
            .pipe(gulp.dest(BUILD_PATH));
    });
});

gulp.task('build-nominify-ng-client', ['build-require-bundle'], () => {
    let angularfilesGlob = ['./client/ng-client/**/*.js', './client/ng-client-secure/**/*.js'];
    return buildUtil.buildWithoutMinifyJs(angularfilesGlob, 'ng-client')
        .pipe(gulp.dest(BUILD_PATH));
});

// use this in development so you can debug the js easily in a browser
gulp.task('watch-angular', ['build-nominify-ng-client'], () => {
    let angularfilesGlob = ['./client/ng-client/**/*.js', './client/ng-client-secure/**/*.js'];
    return plugins.watch(angularfilesGlob, () => {
        console.log('rebuilding: %s', new Date());
        return buildUtil.buildWithoutMinifyJs(angularfilesGlob, 'ng-client')
            .pipe(gulp.dest(BUILD_PATH));
    });
});

gulp.task('inject-test', () => {
    let angularJsFiles = gulp.src(['./client/ng-client/**/*.js', './client/ng-client-secure/**/*.js'], {read: true})
        .pipe(plugins.concat('ng-client.js'))
        .pipe(plugins.uglifyEs.default())
        .pipe(plugins.rename('ng-client.min.js'))
        .pipe(gulp.dest(BUILD_PATH));
    let target = gulp.src('./server/views/layout.pug');
    return target
        .pipe(plugins.inject(angularJsFiles, {ignorePath:['client', 'public']}))
        .pipe(gulp.dest('./server/views/'));
});
