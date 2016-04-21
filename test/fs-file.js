"use strict";

var assert = require('core-assert'),
    json = require('nano-json'),
    timer = require('nano-timer'),
    Promise = require('nano-promise'),
    util = require('util'),
    fs = require('nano-fs');


/* ------------------------------------------------------------------------ */
function Logger(stage, job) {

	var context = job.sched.name + ':' + job.name + '#' + stage;

	this.stage = stage;
	this.job = job;
	this.acc = [];
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

function fsinit(log, data) {
	return fs.empty(opts.dist_folder)
		.catch(function () {
			return fs.mkpath(opts.dist_folder);
		})
		.then(function () { return fs.mkpath(opts.dist_folder+'/folder'); })
		.then(function () { return fs.readFile(opts.sources_folder+'/1.txt', 'utf8'); })
		.then(function (text) { return fs.writeFile(opts.dist_folder+'/1.txt', text, 'utf8'); })
		.then(function () {
			return [ log, data ];
		});
}

suite('load-text', function () {
	test('1 - load', function (done) {

		var log = new Logger('load-text', job),
		    data = {
					name: '1.txt',
					opts: opts
				};

		fsinit(log, data)
			.spread(plugin['load-text'])
			.then(function () {
				return fs.readFile(job.sched.opts.sources_folder+'/'+data.name, 'utf8').then(function (text) {
					assert.strictEqual(data.content, text);
					done();
				});
			}).catch(done);
	});

	test('1 - load-text', function (done) {

		var log = new Logger('load-text', job),
		    data = {
					name: '1.txt',
					opts: opts
				};

		fsinit(log, data)
			.spread(plugin['load-text'])
			.then(function () {
				return fs.readFile(job.sched.opts.sources_folder+'/'+data.name, 'utf8').then(function (text) {
					assert.strictEqual(data.content, text);
					done();
				});
			}).catch(done);
	});

	test('2 - load-text of absent file', function (done) {

		var log = new Logger('load-text', job),
		    data = {
					name: '2.txt',
					opts: opts
				};

		fsinit(log, data)
			.spread(plugin['load-text'])
			.then(function () {
				throw Error('not failed');
			}, function (err) {
				assert.strictEqual(err.code, 'ENOENT');
				done();
			}).catch(done);
	});

});

suite('load-bin', function () {
	test('1 - load', function (done) {

		var log = new Logger('load-bin', job),
		    data = {
					name: '1.txt',
					opts: opts
				};

		fsinit(log, data)
			.spread(plugin['load-bin'])
			.then(function () {
				return fs.readFile(job.sched.opts.sources_folder+'/'+data.name).then(function (bin) {
					assert.deepStrictEqual(data.content, bin);
					done();
				});
			}).catch(done);
	});

	test('2 - load-text of absent file', function (done) {

		var log = new Logger('load', job),
		    data = {
					name: '2.txt',
					opts: opts
				};

		fsinit(log, data)
			.spread(plugin['load-bin'])
			.then(function () {
				throw Error('not failed');
			}, function (err) {
				assert.strictEqual(err.code, 'ENOENT');
				done();
			}).catch(done);
	});

});

suite('load-json', function () {
	test('1 - load', function (done) {

		var log = new Logger('load-json', job),
		    data = {
					name: '1.json',
					test: '{ "a": "ogo" }',
					opts: opts
				};

		fsinit(log, data)
			.then(function () {
				return fs.writeFile(job.sched.opts.sources_folder+'/'+data.name, data.test, { encoding: 'utf8' })
					.then(function () {
						return [log, data];
					});
			})
			.spread(plugin['load-json'])
			.then(function () {
				assert.deepStrictEqual(data.content, eval('('+data.test+')'));
				done();
			}).catch(done);
	});

	test('1 - load bad file', function (done) {

		var log = new Logger('load-json', job),
		    data = {
					name: '1.json',
					test: '{ a: "ogo" }',
					opts: opts
				};

		fsinit(log, data)
			.then(function () {
				return fs.writeFile(job.sched.opts.sources_folder+'/'+data.name, data.test, { encoding: 'utf8' })
					.then(function () {
						return [log, data];
					});
			})
			.spread(plugin['load-json'])
			.then(function () {
				throw Error('not failed');
			}, function (e) {
				done();
			}).catch(done);
	});
});

suite('copy', function () {
	test('1 - copy', function (done) {

		var log = new Logger('copy', job),
		    data = {
					name: '1.txt',
					opts: opts
				};

		fsinit(log, data)
			.spread(plugin.copy)
			.then(function () {
				return Promise.all([
						fs.readFile(opts.sources_folder+'/'+data.name, 'utf8'),
						fs.readFile(opts.dist_folder+'/'+data.name, 'utf8')]);
			})
			.spread(function (src, dst) {
				assert.strictEqual(src, dst);
				done();
			}).catch(done);
	});

	test('2 - copy of absent file', function (done) {

		var log = new Logger('copy', job),
		    data = {
					name: '2.txt',
					opts: opts
				};

		fsinit(log, data)
			.spread(plugin.copy)
			.then(function () {
				throw Error('not failed');
			}, function (err) {
				assert.strictEqual(err.code, 'ENOENT');
				done();
			}).catch(done);
	});

});

suite('save', function () {
	test('1.1 - save', function (done) {
		var log = new Logger('save', job),
		    data = {
					name: 'saved.txt',
					opts: opts,
					encoding: 'utf8',
					content: 'ogogo!'
				};

		fsinit(log, data)
			.spread(plugin.save)
			.then(function () {
				return Promise.all([
						fs.readFile(opts.dist_folder+'/'+data.name, 'utf8')]);
			})
			.spread(function (dst) {
				assert.strictEqual(data.content, dst);
				done();
			}).catch(done);
	});

	test('1.2 - save to another name', function (done) {
		var log = new Logger('save', job),
		    data = {
					name: 'saved.txt',
					dest: 'another.txt',
					opts: opts,
					encoding: 'utf8',
					content: 'ogogo!'
				};

		fsinit(log, data)
			.spread(plugin.save)
			.then(function () {
				return Promise.all([
						fs.readFile(opts.dist_folder+'/'+data.dest, 'utf8')]);
			})
			.spread(function (dst) {
				assert.strictEqual(data.content, dst);
				done();
			}).catch(done);
	});

	test('1.3 - save binary data', function (done) {
		var log = new Logger('save', job),
		    data = {
					name: 'saved.txt',
					opts: opts,
					encoding: null,
					content: new Buffer('1234567890')
				};

		fsinit(log, data)
			.spread(plugin.save)
			.then(function () {
				return Promise.all([
						fs.readFile(opts.dist_folder+'/'+data.name, null)]);
			})
			.spread(function (dst) {
				assert.deepStrictEqual(data.content, dst);
				done();
			}).catch(done);
	});

	test('1.4 - save json data', function (done) {
		var log = new Logger('save', job),
		    data = {
					name: 'saved.json',
					opts: opts,
					encoding: 'json',
					content: { a: 1 }
				};

		fsinit(log, data)
			.spread(plugin.save)
			.then(function () {
				return Promise.all([
						fs.readFile(opts.dist_folder+'/'+data.name, null)]);
			})
			.spread(function (dst) {
				assert.deepStrictEqual(data.content, eval('('+dst+')'));
				done();
			}).catch(done);
	});

	test('2.1 - save to folder (not to file)', function (done) {
		var log = new Logger('save', job),
		    data = {
					name: 'folder',
					opts: opts,
					encoding: 'utf8',
					content: 'ogogo!'
				};

		fsinit(log, data)
			.spread(plugin.save)
			.then(function () {
				throw Error('not failed');
			}, function (err) {
				assert.strictEqual(err.code, 'EISDIR');
				done();
			}).catch(done);
	});

	test('2.2 - save binary to text file', function (done) {
		var log = new Logger('save', job),
		    data = {
					name: 'folder',
					opts: opts,
					encoding: 'utf8',
					content: new Buffer('ogogo!')
				};

		fsinit(log, data)
			.spread(plugin.save)
			.then(function () {
				throw Error('not failed');
			}, function (err) {
				done();
			}).catch(done);
	});

	test('2.3 - save to exist folder', function (done) {
		var log = new Logger('save', job),
		    data = {
					name: 'folder/1.e',
					opts: opts,
					encoding: 'utf8',
					content: 'ogogo!'
				};

		Promise.resolve(log, data)
			.then(plugin.save)
			.then(function () {
				return Promise.all([
						fs.readFile(opts.dist_folder+'/'+data.name, 'utf8')]);
			})
			.spread(function (dst) {
				assert.strictEqual(data.content, dst);
				done();
			}).catch(done);
	});

	test('2.4 - save with bad encoding', function (done) {
		var log = new Logger('save', job),
		    data = {
					name: 'folder',
					opts: opts,
					encoding: 'utf',
					content: 'ogogo!'
				};

		fsinit(log, data)
			.spread(plugin.save)
			.then(function () {
				throw Error('not failed');
			}, function (err) {
				done();
			}).catch(done);
	});
});

suite('dont-overwrite', function () {
	test('1 - save', function (done) {
		var log = new Logger('dont-overwrite', job),
		    data = {
					name: '444.txt',
					opts: opts,
					content: 'ogogo!'
				};

		fsinit(log, data)
			.spread(plugin['dont-overwrite'])
			.then(function () {
				done()
			}).catch(done);
	});

	test('2 - save to folder (not to file)', function (done) {
		var log = new Logger('dont-overwrite', job),
		    data = {
					name: 'folder',
					opts: opts,
					content: 'ogogo!'
				};

		fsinit(log, data)
			.spread(plugin['dont-overwrite'])
			.then(function () {
				throw Error('not failed');
			}, function (err) {
				//assert.strictEqual(err.code, 'EISDIR');
				assert.strictEqual(err, Promise.CANCEL_REASON);
				done();
			}).catch(done);
	});

	test('3 - save to exists file', function (done) {
		var log = new Logger('dont-overwrite', job),
		    data = {
					name: '1.txt',
					opts: opts,
					content: 'ogogo!'
				};

		fsinit(log, data)
			.spread(plugin['dont-overwrite'])
			.then(function () {
				throw Error('not cancelled');
			}, function (err) {
				assert.strictEqual(err, Promise.CANCEL_REASON);
				done();
			}).catch(done);
	});
});

/*suite('file.load-dist', function () {
	test('1 - load', function (done) {

		var log = new Logger('load-dist', job),
		    data = {
					name: '1.txt',
					opts: opts
				};

		fsinit(log, data)
			.spread(file['load-dist'])
			.then(function () {
				return fs.readFile(opts.sources_folder+'/'+data.name, 'utf8').then(function (text) {
					assert.strictEqual(data.content, text);
					done();
				});
			}).catch(done);
	});

	test('2 - load of apsent file', function (done) {

		var log = new Logger('load', job),
		    data = {
					name: '2.txt',
					opts: opts
				};

		fsinit(log, data)
			.spread(file.load)
			.then(function () {
				throw Error('not failed');
			}, function (err) {
				assert.strictEqual(err.code, 'ENOENT');
				done();
			}).catch(done);
	});

});*/

suite('rename', function () {
	test('1.1 - rename', function (done) {
		var log = new Logger('rename', job),
		    data = {
					name: 'saved.txt',
					opts: opts,
					content: 'ogogo!',
					dest: '\\1not-\\2\\3'
				};

		fsinit(log, data)
			.spread(plugin.rename)
			.then(function () {
				assert.strictEqual(data.dest, 'not-saved.txt');
				done();
			}).catch(done);
	});

	test('1.2 - rename', function (done) {
		var log = new Logger('rename', job),
		    data = {
					name: 'folder/saved.txt',
					opts: opts,
					content: 'ogogo!',
					dest: '\\1\\2.bak'
				};

		fsinit(log, data)
			.spread(plugin.rename)
			.then(function () {
				assert.strictEqual(data.dest, 'folder/saved.bak');
				done();
			}).catch(done);
	});

	test('1.3 - rename', function (done) {
		var log = new Logger('rename', job),
		    data = {
					name: 'folder/saved.txt',
					opts: opts,
					content: 'ogogo!',
					dest: 'oo/\\2.bak'
				};

		fsinit(log, data)
			.spread(plugin.rename)
			.then(function () {
				assert.strictEqual(data.dest, 'oo/saved.bak');
				done();
			}).catch(done);
	});

	test('1.4 - rename', function (done) {
		var log = new Logger('rename', job),
		    data = {
					name: 'folder/saved.txt',
					opts: opts,
					content: 'ogogo!',
					dest: 'file.txt'
				};

		fsinit(log, data)
			.spread(plugin.rename)
			.then(function () {
				assert.strictEqual(data.dest, 'file.txt');
				done();
			}).catch(done);
	});

	test('1.5 - rename', function (done) {
		var log = new Logger('rename', job),
		    data = {
					name: 'folder/saved.txt',
					opts: opts,
					content: 'ogogo!'
				};

		fsinit(log, data)
			.spread(plugin.rename)
			.then(function () {
				assert.strictEqual(data.dest, 'folder/saved.txt');
				done();
			}).catch(done);
	});
});

