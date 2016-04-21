
[![Gitter][gitter-image]][gitter-url]
[![NPM version][npm-image]][npm-url]
[![Build status][travis-image]][travis-url]
[![Test coverage][coveralls-image]][coveralls-url]
[![Dependency Status][david-image]][david-url]
[![License][license-image]][license-url]
[![Downloads][downloads-image]][downloads-url]



# nano-sched-fs
Files/folders operations nano-sched plugin

## File operations

### data object

* opts `{Object}` options object
  * sources_folder `{String}`
  * dist_folder `{String}`
* name `{String}`
* dest `{String}` (Optional)
* encoding `{String}`
* content `{any}`


### load-text (log, data)

Load file from `{options.sources_folder}/{data.name}` to the `data.content` with `{data.encoding}='utf8'`.

### load-bin (log, data)

Load file from `{options.sources_folder}/{data.name}` to the `data.content` with `{data.encoding}=null`.

### load-json (log, data)

Load file from `{options.sources_folder}/{data.name}` and parse to the `data.content` with `{data.encoding}='json'`.

### dont-overwrite (log, data)

Will cancels job if destination file exists.

### rename (log, data)

Generate destination file name by `{data.dest}` template. The template can contains of shortcuts for
sources file name parts:
* \1 -- path to source name
* \2 -- name of file
* \3 -- extension of file

For example, for `data.name = 'blah/foo.bar'` and `data.dest = 'folder/\2\3'` will generated a new
`data.dest` value `'folder/foo.bar'`.


### save (log, data)

Save data.content to `{options.dist_folder}/{data.dest || data.name}` with encoding `{data.encoding}`('utf8','json',null).

### copy (log, data)

Copy file from `{options.sources_folder}/{data.name}` to `{options.dist_folder}/{data.dest || data.name}`.


## Folder operations

### data object

* opts `{Object}` options object
  * sources_folder `{String}`
  * dist_folder `{String}`


### clean-dist (log, data)

Creates or cleans `{options.dist_folder}`.


### make-dist (log, data)

Creates(if necessary) `{options.dist_folder}`.


### list-files (log, data)

Returns an array of all files pathes of `{options.source_folder}`in `data.file`.




[bithound-image]: https://www.bithound.io/github/Holixus/nano-sched-fs/badges/score.svg
[bithound-url]: https://www.bithound.io/github/Holixus/nano-sched-fs

[gitter-image]: https://badges.gitter.im/Holixus/nano-sched-fs.svg
[gitter-url]: https://gitter.im/Holixus/nano-sched-fs

[npm-image]: https://badge.fury.io/js/nano-sched-fs.svg
[npm-url]: https://badge.fury.io/js/nano-sched-fs

[github-tag]: http://img.shields.io/github/tag/Holixus/nano-sched-fs.svg
[github-url]: https://github.com/Holixus/nano-sched-fs/tags

[travis-image]: https://travis-ci.org/Holixus/nano-sched-fs.svg?branch=master
[travis-url]: https://travis-ci.org/Holixus/nano-sched-fs

[coveralls-image]: https://coveralls.io/repos/github/Holixus/nano-sched-fs/badge.svg?branch=master
[coveralls-url]: https://coveralls.io/github/Holixus/nano-sched-fs?branch=master

[david-image]: https://david-dm.org/Holixus/nano-sched-fs.svg
[david-url]: https://david-dm.org/Holixus/nano-sched-fs

[license-image]: https://img.shields.io/badge/license-MIT-blue.svg
[license-url]: LICENSE

[downloads-image]: http://img.shields.io/npm/dt/nano-sched-fs.svg
[downloads-url]: https://npmjs.org/package/nano-sched-fs
