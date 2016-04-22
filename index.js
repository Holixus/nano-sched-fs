"use strict";

var fs = require('nano-fs'),
    newUniFS = require('nano-unifs'),
    Promise = require('nano-promise'),
    Path = require('path');

function get_source(data) {
	var opts = data.opts,
	    folder = data.sources_folder || opts.sources_folder;
	return newUniFS(folder);
}

function get_dist(data) {
	var opts = data.opts,
	    folder = data.dist_folder || opts.dist_folder;
	return newUniFS(folder);
}


function set_utf8(data, content) {
	data.content = content;
	data.encoding = 'utf8';
	data.type = data.name.replace(/^.*\.(js|css|html|svg|jpg|png|gif|ico|ui|txt|md)$/, '$1');
}

function set_bin(data, content) {
	data.content = content;
	data.encoding = null;
}

function set_json(data, content) {
	data.content = JSON.parse(content);
	data.encoding = 'json';
	data.type = 'json';
}

module.exports = {

'load-text': function (log, data) {
	var fs = get_source(data);
	return fs.readFile(data.name, 'utf8')
		.then(function (text) {
			set_utf8(data, text);
		});
},


'load-bin': function (log, data) {
	var fs = get_source(data);
	return fs.readFile(data.name, null)
		.then(function (text) {
			set_bin(data, text);
	});
},

'load-json': function (log, data) {
	var fs = get_source(data);
	return fs.readFile(data.name, 'utf8')
		.then(function (text) {
			set_json(data, text);
		});
},

'dont-overwrite': function (log, data) {
	var fs = get_dist(data),
	    name = data.dest || data.name;

	return fs.stat(name).then(function (stat) {
		throw Promise.CANCEL_REASON;
	}, function (err) {
		/* istanbul ignore if */
		if (err.code !== 'ENOENT')
			throw err;
	});
},

rename: function sync(log, data) {
	var dest = data.dest || data.name;

	if (dest.indexOf('\\') >= 0)
		dest = data.name.replace(/^(.*\/)?([^/]+)(\.[a-z0-9_]+)$/, dest.replace(/\\/g, '$'));

	data.dest = dest;
},

save: function (log, data) {
	var fs = get_dist(data),
	    name = data.dest || data.name;

	if (data.encoding === 'utf8' && typeof data.content !== 'string')
		throw Error('data content is not a string');

	return fs.mkpath(Path.dirname(name))
		.then(function () {
			switch (data.encoding) {
			case 'utf8':
			case null:
				return fs.writeFile(name, data.content, { encoding: data.encoding });
			case 'json':
				var text = require('nano-json').render(data.content, { });
				return fs.writeFile(name, text, { encoding: 'utf8' });
			default:
				throw Error('unknown data encoding: '+require('nano-json').js2str(data.encoding)+'');
			}
		});
},

copy: function (job, data, done) {
	var sfs = get_source(data),
	    dfs = get_dist(data);

	return sfs.readFile(data.name).then(function (body) {
		return dfs.writeFile(data.dest || data.name, body);
	});
},

'make-dist': function (log, data) {
	var fs = get_dist(data);
	return fs.mkpath('');
},

'clean-dist': function (log, data) {
	var fs = get_dist(data);
	return fs.empty('')
		.catch(function (e) {
			/* istanbul ignore if */
			if (!(e instanceof Error) || e.code !== 'ENOENT')
				throw e;
			return fs.mkpath('');
		});
},

'list-files': function (log, data) {
	var fs = get_source(data);
	return fs.listFiles('')
		.then(function (list) {
			data.files = list;
		});
}

};
