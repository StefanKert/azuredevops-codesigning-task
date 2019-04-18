const { task, series } = require('gulp');

var gulp = require('gulp');
var debug = require('gulp-debug');
var ts = require("gulp-typescript");
var path = require('path');
var shell = require('shelljs');
var semver = require('semver');
var fs = require('fs');
var del = require('del');
var merge = require('merge-stream');

var _buildRoot = path.join(__dirname, '_build');
var _packagesRoot = path.join(__dirname, '_packages');

function errorHandler(err) {
    console.error(err);
    process.exit(1);
}

function build() {
    var extension = gulp.src(['README.md', 'LICENSE', 'images/**/*.png', 'vss-extension.json'], { base: '.' })
        .pipe(debug({ title: 'extension:' }))
        .pipe(gulp.dest(_buildRoot));
    var task = gulp.src(['task/**/*', '!task/**/*.ts'], { base: '.' })
        .pipe(debug({ title: 'task:' }))
        .pipe(gulp.dest(_buildRoot));

    getExternalModules();

    return merge(extension, task);
}

function clean() {
    return del([_buildRoot]);
}

function compile() {
    var taskPath = path.join(__dirname, 'task', '*.ts');
    var tsConfigPath = path.join(__dirname, 'tsconfig.json');

    return gulp.src([taskPath], { base: './task' })
        .pipe(ts.createProject(tsConfigPath)())
        .on('error', errorHandler)
        .pipe(gulp.dest(path.join(_buildRoot, 'task')));
}

function package(done) {
    var version = getVersion();

    updateExtensionManifest(version);
    updateTaskManifest(version);

    shell.cd("node_modules/.bin");
    shell.exec('tfx extension create --root "' + _buildRoot + '" --output-path "' + _packagesRoot + '"');
    done();
}

function upload() {
    var version = getVersion();

    updateExtensionManifest(version, true);
    updateTaskManifest(version);

    shell.cd("node_modules/.bin");
    shell.exec('tfx build tasks upload --task-path "' + path.join(_buildRoot, 'task'))
}

getVersion = function () {
    var packages = require("./package.json");
    var semverVersion = semver.coerce(packages.version);
    var version = {
        major: semverVersion.major,
        minor: semverVersion.minor,
        patch: semverVersion.patch
    };
    if (/^(refs\/tags\/.*)/g.test(process.env.BUILD_SOURCEBRANCH)) {
        console.log("Version: ", version);
        return version;
    }
    else if (/^(refs\/heads\/master)/g.test(process.env.BUILD_SOURCEBRANCH)) {
        version.prerelease = "rc";
    }
    else if (/^(refs\/heads\/dev)/g.test(process.env.BUILD_SOURCEBRANCH)) {
        version.prerelease = "beta";
    }
    else {
        version.prerelease = "alpha";
    }
    var buildnumber = process.env.BUILD_BUILDNUMBER;
    if (!buildnumber) {
        var date = new Date();
        buildnumber = date.getFullYear().toString().slice(-2) + "" + date.getMonth().toString().padStart(2, "0") + "" + date.getDay().toString().padStart(2, "0");
    }
    console.log("Buildnumber: ", buildnumber);
    version.buildnumber = buildnumber;
    console.log("Version: ", version);
    return version;
}

getVersionAsText = function (version) {
    if (version.prerelease) {
        return version.major + '.' + version.minor + '.' + version.patch + '-' + version.prerelease + "." + version.buildnumber;
    }
    else {
        return version.major + '.' + version.minor + '.' + version.patch
    }
}

getExternalModules = function () {
    try {
        // copy package.json without dev dependencies
        var libPath = path.join(_buildRoot, 'task');

        var pkg = require('./package.json');
        delete pkg.devDependencies;

        fs.writeFileSync(path.join(libPath, 'package.json'), JSON.stringify(pkg, null, 4));

        shell.cd(libPath);
        if (shell.exec('npm install --loglevel=error').code !== 0) {
            shell.echo('Error: npm install failed');
            shell.exit(1);
        }
        else {
            console.log("Successfully installed npm packages");
        }
        shell.cd(__dirname);
        fs.unlinkSync(path.join(libPath, 'package.json'));
    } catch (e) {
        console.error(e);
        throw e;
    }
}

updateExtensionManifest = function (version) {
    var manifestPath = path.join(_buildRoot, 'vss-extension.json')
    var manifest = JSON.parse(fs.readFileSync(manifestPath));
    manifest.version = version.major + "." + version.minor + "." + version.patch;

    if (version.prerelease) {
        var versionAsText = getVersionAsText(version);
        manifest.version = version.major + "." + version.minor + "." + version.patch + "." + version.buildnumber;
        manifest.id = manifest.id + '-' + (versionAsText.includes("alpha") ? "alpha" : "beta");
        manifest.name = manifest.name + ' (' + versionAsText + ')';
        manifest.public = false;
        manifest.galleryFlags.push("Preview");
    }
    else {
        manifest.public = true;
    }

    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 4));
}

updateTaskManifest = function (version) {
    var manifestPath = path.join(_buildRoot, 'task', 'task.json')
    var manifest = JSON.parse(fs.readFileSync(manifestPath));
    var versionAsText = getVersionAsText(version);

    manifest.version.Major = version.major;
    manifest.version.Minor = version.minor;
    manifest.version.Patch = version.patch;
    manifest.helpMarkDown = 'v' + versionAsText + ' - ' + manifest.helpMarkDown;

    if (version.prerelease) {
        manifest.version.Prerelease = version.Patch;
        manifest.friendlyName = manifest.friendlyName + ' (' + versionAsText + ')';
        manifest.id = '4df4abb0-38d5-11e8-9466-7fef5455a13d';
    }
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 4));
}

exports.build = (done) => {
    series(clean, compile, build)(done);
};

exports.upload = (done) => {
    series(clean, compile, build, upload)(done);
};
exports.package = (done) => {
    series(clean, compile, build, package)(done);
};
