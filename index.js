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
        if (opts.ignorePatterns) {
            let shouldIgnore = opts.ignorePatterns.some(function(ignorePattern) {
                return ignorePattern.pattern instanceof RegExp ? ignorePattern.pattern.test(link) : (new RegExp(ignorePattern.pattern)).test(link) ? true : false;
            });
        
            if (shouldIgnore) {
                let linkCheckResult = {};

                linkCheckResult.link = link;
                linkCheckResult.statusCode = 0;
                linkCheckResult.status = 'ignored';
                
                callback(null, linkCheckResult);
                return;
            }
        }

        if (opts.replacementPatterns) {
            for (let replacementPattern of opts.replacementPatterns) {
                let pattern = replacementPattern.pattern instanceof RegExp ? replacementPattern.pattern : new RegExp(replacementPattern.pattern);
                link = link.replace(pattern, replacementPattern.replacement);
            }
        }

        // Make sure it is not undefined and that the appropriate headers are always recalculated for a given link.
        opts.headers = {};
        
        if (opts.httpHeaders) {
            for (let httpHeader of opts.httpHeaders) {
                for (let url of httpHeader.urls) {
                    if (link.startsWith(url)) {
                        Object.assign(opts.headers, httpHeader.headers);

                        // The headers of this httpHeader has been applied, the other URLs of this httpHeader don't need to be evaluated any further.
                        break;
                    }
                }
            }
        }

        linkCheck(link, opts, function (err, result) {
            if (opts.showProgressBar) {
                bar.tick();
            }
            callback(err, result);
        });
    }, callback);
};
