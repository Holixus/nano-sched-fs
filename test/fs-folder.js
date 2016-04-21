"use strict";

var assert = require('core-assert'),
    json = require('nano-json'),
    timer = require('nano-timer'),
    Promise = require('nano-promise'),
    util = require('util'),
    Path = require('path'),
    fs = require('nano-fs');


/* ------------------------------------------------------------------------ */
function Logger(stage, job) {

	var context = job.sched.name + ':' + job.name + '#' + stage;

	this.stage = stage;
	this.job = job;
	var acc = this.acc = [];
	this.dumps = [];

	this.log = function (code, format, a, b, etc) {
		acc.push(util.format('  %s: %s', context, util.format.apply(util.format, Array.prototype.slice.call(arguments, 1))));
	};

	this.trace = function () {
		this.log.apply(this, Array.prototype.concat.apply(['trace'], arguments));
	};

	this.warn = function (code, format, a, b, etc) {
		acc.push(util.format('W.%s: warning: %s', context, util.format.apply(util.format, Array.prototype.slice.call(arguments, 1))));
	};

	this.error = function (format, a, b, etc) {
		acc.push(util.format('E.%s: error: %s', context, util.format.apply(util.format, Array.prototype.slice.call(arguments, 1))));
	};

	this.fail = function (format, a, b, etc) {
		acc.push(util.format('F.%s: FAIL: %s', context, util.format.apply(util.format, arguments)));
	};

	this.writeListing = function (name, data) {
		this.dumps.push({
			name: name, 
			data: data
		});

		return Promise.resolve();
	};
}

Logger.prototype = {
};



var plugin = require('../index.js'),
	opts = {
			dist_folder: __dirname+'/dist',
			sources_folder: __dirname+'/src'
		},
    job = {
		name: 'test',
		sched: {
			name: 'test',
			opts: opts
		}
	};

function createFolders(root, list) {
	return Promise.all(list.map(function (path) {
		return fs.mkpath(Path.join(root, path));
	}));
}

function createFiles(root, list) {
	return Promise.all(list.map(function (path) {
		return fs.writeFile(Path.join(root, path), path, 'utf8');
	}));
}

var dist_files = [
		'folder/1.txt', 'folder/2.txt', 'one/two/foo.bar', 'one/two/bar.foo', 'one/two-1/oops'
	];

function fsinit(log, data) {
	return fs.empty(opts.dist_folder)
		.catch(function () {
			return fs.mkpath(opts.dist_folder);
		})
		.then(function () {
			return createFolders(opts.dist_folder, [
				'folder', 'ololo', 'one/two', 'one/two-1'
			]);
		})
		.then(function () {
			return createFiles(opts.dist_folder, dist_files);
		})
		.then(function () {
			return [ log, data ];
		})
		.catch(function (e) {
			log.error('%j', e);
		});
}

suite('clean-dist', function () {
	test('create dist-folder', function (done) {

		var log = new Logger('clean-dist', job),
		    data = {
					opts: opts
				};

		fs.remove(opts.dist_folder)
			.catch(function () {})
			.then(function () { return [log, data]; })
			.spread(plugin['clean-dist'])
			.then(function () {
				return fs.readdir(opts.dist_folder).then(function (list) {
					assert.strictEqual(list.length, 0);
					done();
				});
			}).catch(done);
	});

	test('empty dist-folder', function (done) {

		var log = new Logger('clean-dist', job),
		    data = {
					opts: opts
				};

		fsinit(log, data)
			.then(function () {
				return fs.readdir(opts.dist_folder).then(function (list) {
					assert.strictEqual(list.length, 3);
					return [ log, data ];
				});
			})
			.spread(plugin['clean-dist'])
			.then(function () {
				return fs.readdir(opts.dist_folder).then(function (list) {
					assert.strictEqual(list.length, 0);
					done();
				});
			}).catch(function (e) {
				if (log.acc.length)
					console.log(log.acc);
				done(e);
			});
	});
});


suite('make-dist', function () {
	test('create dist-folder', function (done) {

		var log = new Logger('make-dist', job),
		    data = {
					opts: opts
				};

		fs.remove(opts.dist_folder)
			.catch(function () {})
			.then(function () { return [log, data]; })
			.spread(plugin['make-dist'])
			.then(function () {
				return fs.readdir(opts.dist_folder).then(function (list) {
					assert.strictEqual(list.length, 0);
					done();
				});
			}).catch(done);
	});
});


suite('list-files', function () {
	test('list-files', function (done) {

		var log = new Logger('list-files', job),
		    data = {
					opts: {
						dist_folder: opts.dist_folder,
						sources_folder: opts.dist_folder
					}
				};

		fsinit(log, data)
			.spread(plugin['list-files'])
			.then(function () {
				assert.deepStrictEqual(data.files.sort(), dist_files.sort());
				done();
			}).catch(function (e) {
				if (log.acc.length)
					console.log(log.acc);
				done(e);
			});
	});

});
