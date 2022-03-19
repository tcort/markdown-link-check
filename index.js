'use strict';

const _ = require('lodash');
const async = require('async');
const linkCheck = require('link-check');
const LinkCheckResult = require('link-check').LinkCheckResult;
const markdownLinkExtractor = require('markdown-link-extractor');
const ProgressBar = require('progress');

const envVarPatternMatcher = /(?<pattern>{{env\.(?<name>[a-zA-Z0-9\-_]+)}})/;

/*
 * Performs some special replacements for the following patterns:
 * - {{BASEURL}} - to be replaced with opts.projectBaseUrl
 * - {{env.<env_var_name>}} - to be replaced with the environment variable specified with <env_var_name>
 */
function performSpecialReplacements(str, opts) {
    // replace the `{{BASEURL}}` with the opts.projectBaseUrl. Helpful to build absolute urls "relative" to project roots
    str = str.replace('{{BASEURL}}', opts.projectBaseUrl);

    // replace {{env.<env_var_name>}} with the corresponding environment variable or an empty string if none is set.
    var envVarMatch;
    do {
        envVarMatch = envVarPatternMatcher.exec(str);

        if(!envVarMatch) {
            break;
        }

        var envVarPattern = envVarMatch.groups.pattern;
        var envVarName = envVarMatch.groups.name;

        var envVarPatternReplacement = '';

        if(envVarName in process.env) {
            envVarPatternReplacement = process.env[envVarName];
        }

        str = str.replace(envVarPattern, envVarPatternReplacement);
    } while (true);

    return str;
}

module.exports = function markdownLinkCheck(markdown, opts, callback) {
    if (arguments.length === 2 && typeof opts === 'function') {
        // optional 'opts' not supplied.
        callback = opts;
        opts = {};
    }

    if(!opts.ignoreDisable) {
        markdown = [
            /(<!--[ \t]+markdown-link-check-disable[ \t]+-->[\S\s]*?<!--[ \t]+markdown-link-check-enable[ \t]+-->)/mg,
            /(<!--[ \t]+markdown-link-check-disable[ \t]+-->[\S\s]*(?!<!--[ \t]+markdown-link-check-enable[ \t]+-->))/mg,
            /(<!--[ \t]+markdown-link-check-disable-next-line[ \t]+-->\r?\n[^\r\n]*)/mg,
            /([^\r\n]*<!--[ \t]+markdown-link-check-disable-line[ \t]+-->[^\r\n]*)/mg
        ].reduce(function(_markdown, disablePattern) {
            return _markdown.replace(new RegExp(disablePattern), '');
        }, markdown);
    }

    const { links, anchors } = markdownLinkExtractor(markdown);
    const linksCollection = _.uniq(links);
    const bar = (opts.showProgressBar) ?
        new ProgressBar('Checking... [:bar] :percent', {
            complete: '=',
            incomplete: ' ',
            width: 25,
            total: linksCollection.length
        }) : undefined;

    opts.anchors = anchors;

    async.mapLimit(linksCollection, 2, function (link, callback) {
        if (opts.ignorePatterns) {
            const shouldIgnore = opts.ignorePatterns.some(function(ignorePattern) {
                return ignorePattern.pattern instanceof RegExp ? ignorePattern.pattern.test(link) : (new RegExp(ignorePattern.pattern)).test(link) ? true : false;
            });

            if (shouldIgnore) {
                const result = new LinkCheckResult(opts, link, 0, undefined);
                result.status = 'ignored'; // custom status for ignored links
                callback(null, result);
                return;
            }
        }

        if (opts.replacementPatterns) {
            for (let replacementPattern of opts.replacementPatterns) {
                let pattern = replacementPattern.pattern instanceof RegExp ? replacementPattern.pattern : new RegExp(replacementPattern.pattern);
                link = link.replace(pattern, performSpecialReplacements(replacementPattern.replacement, opts));
            }
        }

        // Make sure it is not undefined and that the appropriate headers are always recalculated for a given link.
        opts.headers = {};

        if (opts.httpHeaders) {
            for (const httpHeader of opts.httpHeaders) {
                if (httpHeader.headers) {
                    for (const header of Object.keys(httpHeader.headers)) {
                        httpHeader.headers[header] = performSpecialReplacements(httpHeader.headers[header], opts);
                    }
                }

                for (const url of httpHeader.urls) {
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

            if (err) {
                result = new LinkCheckResult(opts, link, 500, err);
                result.status = 'error'; // custom status for errored links
            }

            callback(null, result);
        });
    }, callback);
};
