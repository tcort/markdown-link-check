'use strict';

var _ = require('lodash');
var async = require('async');
var linkCheck = require('link-check');
var markdownLinkExtractor = require('markdown-link-extractor');
var isRelativeUrl = require('is-relative-url');
var fs = require('fs');
var url = require('url');

module.exports = function markdownLinkCheck(markdown, opts, callback) {
    if (arguments.length === 2 && typeof opts === 'function') {
        // optional 'opts' not supplied.
        callback = opts;
        opts = {};
    }

    var isSourceRelative = isRelativeUrl(opts.baseUrl);

    async.mapLimit(_.uniq(markdownLinkExtractor(markdown)), 2, function (link, callback) {
        if (isSourceRelative && isRelativeUrl(link)) {
            var resolvedLink = url.resolve(opts.baseUrl, link);

            fs.access(resolvedLink, fs.constants.F_OK, function (err) {
              var result = {};
              result.link = resolvedLink;
              result.statusCode = (err === null) ? 200 : 404;
              result.err = err;
              result.status = (err === null) ? 'alive' : 'dead';

              callback(err, result);
            });
        } else {
            linkCheck(link, opts, callback);
        }
    }, callback);
};
