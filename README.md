# markdown-link-check

[![Build Status](https://travis-ci.org/tcort/markdown-link-check.svg?branch=master)](https://travis-ci.org/tcort/markdown-link-check)
[![npm version](https://img.shields.io/npm/v/markdown-link-check.svg)](https://www.npmjs.com/package/markdown-link-check)
[![npm downloads](https://img.shields.io/npm/dt/markdown-link-check.svg)](https://www.npmjs.com/package/markdown-link-check)
[![License](https://img.shields.io/badge/license-ISC-blue.svg)](https://raw.githubusercontent.com/tcort/markdown-link-check/master/LICENSE.md)

Extracts links from markdown texts and checks whether each link is
alive (`200 OK`) or dead. `mailto:` links are validated with
[isemail](https://www.npmjs.com/package/isemail).

## Installation

To add the module to your project, run:

    npm install --save markdown-link-check

To install the command line tool globally, run:

    npm install -g markdown-link-check

## API

### markdownLinkCheck(markdown, [opts,] callback)

Given a string containing `markdown` formatted text and a `callback`,
extract all of the links and check if they're alive or dead. Call the
`callback` with `(err, results)`

Parameters:

* `markdown` string containing markdown formatted text.
* `opts` optional options object containing any of the following optional fields:
 * `baseUrl` the base URL for relative links.
* `callback` function which accepts `(err, results)`.
 * `err` an Error object when the operation cannot be completed, otherwise `null`.
 * `results` an array of objects with the following properties:
  * `link` the `link` provided as input
  * `status` a string set to either `alive` or `dead`.
  * `statusCode` the HTTP status code. Set to `0` if no HTTP status code was returned (e.g. when the server is down).
  * `err` any connection error that occurred, otherwise `null`.

## Examples

### Module

    'use strict';

    var markdownLinkCheck = require('markdown-link-check');
    
    markdownLinkCheck('[example](http://example.com)', function (err, results) {
        if (err) {
            console.error('Error', err);
            return;
        }
        results.forEach(function (result) {
            console.log('%s is %s', result.link, result.status);
        });
    });

### Command Line Tool

The command line tool optionally takes 1 argument, the file name or http/https URL.
If not supplied, the tool reads from standard input.

#### Check links from a local markdown file

    markdown-link-check ./README.md

#### Check links from a markdown file hosted on the web

    markdown-link-check https://github.com/tcort/markdown-link-check/blob/master/README.md

#### Check links from standard input

    cat *.md | markdown-link-check

## Testing

    npm test

## License

See [LICENSE.md](https://github.com/tcort/markdown-link-check/blob/master/LICENSE.md)
