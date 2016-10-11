'use strict';

var _ = require('lodash');
var async = require('async');
var linkCheck = require('link-check');
var markdownLinkExtractor = require('markdown-link-extractor');

module.exports = function markdownLinkCheck(markdown, opts, callback) {
    if (arguments.length === 2 && typeof opts === 'function') {
        // optional 'opts' not supplied.
        callback = opts;
        opts = {};
    }

    async.mapLimit(_.uniq(markdownLinkExtractor(markdown)), 2, function (link, callback) {
        linkCheck(link, opts, callback);
    }, callback);
};
