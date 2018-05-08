'use strict';

var _ = require('lodash');
var async = require('async');
var linkCheck = require('link-check');
var markdownLinkExtractor = require('markdown-link-extractor');
var ProgressBar = require('progress');

module.exports = function markdownLinkCheck(markdown, opts, callback) {
    if (arguments.length === 2 && typeof opts === 'function') {
        // optional 'opts' not supplied.
        callback = opts;
        opts = {};
    }

    var bar;
    var linksCollection = _.uniq(markdownLinkExtractor(markdown));
    if (opts.showProgressBar) {
        bar = new ProgressBar('Checking... [:bar] :percent', {
            complete: '=',
            incomplete: ' ',
            width: 25,
            total: linksCollection.length
        });
    }

    async.mapLimit(linksCollection, 2, function (link, callback) {
        // Make sure it is not undefined and that the appropriate headers are always recalculated for a given link.
        opts.headers = {};
        
        if (opts.domainHeaders) {
            for (let domainHeader of opts.domainHeaders) {
                if (link.indexOf(domainHeader.domain) !== -1) {
                    Object.assign(opts.headers, domainHeader.headers);
                }
            }
        }

        // if (!_.isEmpty(opts.headers)) {
        //     console.log("\nChecking " + link + " with headers " + JSON.stringify(opts.headers) + "\n");
        // }

        linkCheck(link, opts, function (err, result) {
            if (opts.showProgressBar) {
                bar.tick();
            }
            callback(err, result);
        });
    }, callback);
};
