'use strict';

const fs = require('fs');
const path = require('path');
const expect = require('expect.js');
const http = require('http');
const express = require('express');
const markdownLinkCheck = require('../');
const dirname = process.platform === 'win32' ? __dirname.replace(/\\/g, '/') : __dirname;

describe('markdown-link-check', function () {
    const MAX_RETRY_COUNT = 5;
    // add a longer timeout on tests so we can really test real cases.
    // Mocha default is 2s, make it 5s here.
    this.timeout(5000);

    let baseUrl;

    before(function (done) {
        const app = express();

        var laterRetryCount = 0;

        app.head('/nohead', function (req, res) {
            res.sendStatus(405); // method not allowed
        });
        app.get('/nohead', function (req, res) {
            res.sendStatus(200);
        });

        app.get('/partial', function (req, res) {
            res.sendStatus(206);
        });

        app.get('/later', function (req, res) {
            if(laterRetryCount<MAX_RETRY_COUNT){
              laterRetryCount++;
              if(laterRetryCount !== 2) {
                  res.append('retry-after', '2s');
              }
              res.sendStatus(429);
            }else{
              laterRetryCount = 0;
              res.sendStatus(200);
            }
        });

        app.get('/foo/redirect', function (req, res) {
            res.redirect('/foo/bar');
        });
        app.get('/foo/bar', function (req, res) {
            res.json({foo:'bar'});
        });

        app.get('/basic-auth', function (req, res) {
            if (req.headers["authorization"] === "Basic Zm9vOmJhcg==") {
                res.sendStatus(200);
            }
            else {
                res.sendStatus(401);
            }
        });

        app.get('/loop', function (req, res) {
            res.redirect('/loop');
        });

        app.get('/hello.jpg', function (req, res) {
            res.sendFile('hello.jpg', {
                root: dirname,
                dotfiles: 'deny'
            });
        });

        app.get('/foo\\(a=b.42\\).aspx', function (req, res) {
            res.json({a:'b'});
        });

        const server = http.createServer(app);
        server.listen(0 /* random open port */, '127.0.0.1', function serverListen(err) {
            if (err) {
                done(err);
                return;
            }
            baseUrl = 'http://' + server.address().address + ':' + server.address().port;
            done();
        });
    });

    it('should check the links in sample.md', function (done) {
        markdownLinkCheck(
            fs.readFileSync(path.join(dirname, 'sample.md')).toString().replace(/%%BASE_URL%%/g, baseUrl),
            {
                baseUrl: baseUrl,
                ignorePatterns: [{ pattern: /not-working-and-ignored/ }],
                replacementPatterns: [{ pattern: /boo/, replacement: "foo" }],
                httpHeaders: [
                    {
                        urls: [baseUrl + '/basic-auth'],
                        headers: { 'Authorization': 'Basic Zm9vOmJhcg==', 'Foo': 'Bar' }
                    }
                ],
                "aliveStatusCodes":[200, 206],
                "retryOn429":true,
                "retryCount": MAX_RETRY_COUNT,
                "fallbackRetryDelay": "500ms"
            }, function (err, results) {
            expect(err).to.be(null);
            expect(results).to.be.an('array');

            const expected = [
                // redirect-loop
                { statusCode:   0, status:  'dead' },

                // valid
                { statusCode: 200, status: 'alive' },

                // invalid
                { statusCode: 404, status:  'dead' },

                // dns-resolution-fail
                { statusCode:   0, status:  'dead' },

                // nohead-get-ok
                { statusCode: 200, status: 'alive' },

                // redirect
                { statusCode: 200, status: 'alive' },

                // basic-auth
                { statusCode: 200, status: 'alive' },

                // ignored
                { statusCode: 0, status: 'ignored' },

                // replaced
                { statusCode: 200, status: 'alive' },

                // request rate limit return 429, retry later and get 200
                { statusCode: 200, status: 'alive' },

                // partial
                { statusCode: 206, status: 'alive' },

                // valid e-mail
                { statusCode: 200, status:  'alive' },

                // invalid e-mail
                { statusCode: 400, status:  'dead' },

                // invalid protocol
                { statusCode: 500, status:  'error' },

                // invalid protocol
                { statusCode: 500, status:  'error' },

                // hello image
                { statusCode: 200, status: 'alive' },

                // hello image
                { statusCode: 200, status: 'alive' },

            ];
            expect(results.length).to.be(expected.length);

            for (let i = 0; i < results.length; i++) {
                expect(results[i].statusCode).to.be(expected[i].statusCode);
                expect(results[i].status).to.be(expected[i].status);
            }

            done();
        });
    });

    it('should check the links in file.md', function (done) {
        markdownLinkCheck(fs.readFileSync(path.join(dirname, 'file.md')).toString().replace(/%%BASE_URL%%/g, 'file://' + dirname), { baseUrl: baseUrl }, function (err, results) {
            expect(err).to.be(null);
            expect(results).to.be.an('array');

            const expected = [
                { statusCode: 200, status: 'alive' },
                { statusCode: 200, status: 'alive' },
                { statusCode: 404, status:  'dead' },
            ];

            expect(results.length).to.be(expected.length);

            for (let i = 0; i < results.length; i++) {
                expect(results[i].statusCode).to.be(expected[i].statusCode);
                expect(results[i].status).to.be(expected[i].status);
            }

            done();
        });
    });

    it('should check the links in local-file.md', function (done) {
        markdownLinkCheck(fs.readFileSync(path.join(dirname, 'local-file.md')).toString().replace(/%%BASE_URL%%/g, 'file://' + dirname), {baseUrl: 'file://' + dirname, projectBaseUrl: 'file://' + dirname + "/..",replacementPatterns: [{ pattern: '^/', replacement: "{{BASEURL}}/"}]}, function (err, results) {
            expect(err).to.be(null);
            expect(results).to.be.an('array');

            const expected = [
                { statusCode: 200, status: 'alive' },
                { statusCode: 200, status: 'alive' },
                { statusCode: 200, status: 'alive' },
                { statusCode: 200, status: 'alive' },
                { statusCode: 400, status:  'dead' },
                { statusCode: 400, status:  'dead' },
            ];

            expect(results.length).to.be(expected.length);

            for (let i = 0; i < results.length; i++) {
                expect(results[i].statusCode).to.be(expected[i].statusCode);
                expect(results[i].status).to.be(expected[i].status);
            }

            done();
        });
    });

    it('should handle thousands of links (this test takes up to a minute)', function (done) {
        this.timeout(60000);

        let md = '';
        const nlinks = 10000;
        for (let i = 0; i < nlinks; i++) {
            md += '[test](' + baseUrl + '/foo/bar?i=' + i + ')\n';
        }
        markdownLinkCheck(md, function (err, results) {
            expect(err).to.be(null);
            expect(results).to.be.an('array');
            expect(results).to.have.length(nlinks);

            for (let i = 0; i < results.length; i++) {
                expect(results[i].statusCode).to.be(200);
                expect(results[i].status).to.be('alive');
            }

            done();
        });
    });

    it('should handle links with parens', function (done) {
        markdownLinkCheck('[test](' + baseUrl + '/foo(a=b.42).aspx)', function (err, results) {
            expect(err).to.be(null);
            expect(results).to.be.an('array');
            expect(results).to.have.length(1);
            expect(results[0].statusCode).to.be(200);
            expect(results[0].status).to.be('alive');
            done();
        });
    });

    it('should check section links to headers in section-links.md', function (done) {
        markdownLinkCheck(fs.readFileSync(path.join(dirname, 'section-links.md')).toString(), { baseUrl: 'https://BASEURL' }, function (err, results) {
            expect(err).to.be(null);
            expect(results).to.be.an('array');

            const expected = [
                { statusCode: 200, status: 'alive' },
                { statusCode: 404, status:  'dead' },
                { statusCode: 200, status: 'alive' },
                { statusCode: 200, status: 'alive' },
                { statusCode: 200, status: 'alive' },
                { statusCode: 404, status:  'dead' },
                { statusCode: 404, status:  'dead' },
                { statusCode: 200, status: 'alive' },
                { statusCode: 200, status: 'alive' },
                { statusCode: 200, status: 'alive' }
            ];

            expect(results.length).to.be(expected.length);

            for (let i = 0; i < results.length; i++) {
                expect(results[i].statusCode).to.be(expected[i].statusCode);
                expect(results[i].status).to.be(expected[i].status);
            }

            done();
        });
    });

    it('should enrich http headers with environment variables', function (done) {
        process.env.BASIC_AUTH_TOKEN = 'Zm9vOmJhcg==';
        markdownLinkCheck(
            fs.readFileSync(path.join(dirname, 'sample.md')).toString().replace(/%%BASE_URL%%/g, baseUrl),
            {
                baseUrl: baseUrl,
                httpHeaders: [
                    {
                        urls: [baseUrl + '/basic-auth'],
                        headers: { 'Authorization': 'Basic {{env.BASIC_AUTH_TOKEN}}', 'Foo': 'Bar' }
                    }
                ],
                "aliveStatusCodes":[200, 206],
                "retryOn429":true,
                "retryCount": MAX_RETRY_COUNT,
                "fallbackRetryDelay": "500ms"
            }, function (err) {
            expect(err).to.be(null);
            done();
        });
    });

    it('should enrich pattern replacement strings with environment variables', function (done) {
        process.env.WORKSPACE = 'file://' + dirname + '/..';
        markdownLinkCheck(fs.readFileSync(path.join(dirname, 'local-file.md')).toString().replace(/%%BASE_URL%%/g, 'file://' + dirname), {baseUrl: 'file://' + dirname, projectBaseUrl: 'file://' + dirname + "/..",replacementPatterns: [{ pattern: '^/', replacement: "{{env.WORKSPACE}}/"}]}, function (err, results) {
            expect(err).to.be(null);
            expect(results).to.be.an('array');

            const expected = [
                { statusCode: 200, status: 'alive' },
                { statusCode: 200, status: 'alive' },
                { statusCode: 200, status: 'alive' },
                { statusCode: 200, status: 'alive' },
                { statusCode: 400, status:  'dead' },
                { statusCode: 400, status:  'dead' },
            ];

            expect(results.length).to.be(expected.length);

            for (let i = 0; i < results.length; i++) {
                expect(results[i].statusCode).to.be(expected[i].statusCode);
                expect(results[i].status).to.be(expected[i].status);
            }

            done();
        });
    });


    it('should correctly resolve special replacement patterns', function (done) {
        process.env.MixedCase = 'hello.jpg';
        process.env.UPPERCASE = 'hello.jpg';
        process.env.lowercase = 'hello.jpg';
        process.env['WITH-Special_Characters-123'] = 'hello.jpg';

        markdownLinkCheck(fs.readFileSync(path.join(dirname, 'special-replacements.md')).toString().replace(/%%BASE_URL%%/g, 'file://' + dirname), {baseUrl: 'file://' + dirname, projectBaseUrl: 'file://' + dirname + "/..",replacementPatterns: [
            {pattern: '^/', replacement: "{{BASEURL}}/"},
            {pattern: '%%ENVVAR_MIXEDCASE_TEST%%', replacement: "{{env.MixedCase}}"},
            {pattern: '%%ENVVAR_UPPERCASE_TEST%%', replacement: "{{env.UPPERCASE}}"},
            {pattern: '%%ENVVAR_LOWERCASE_TEST%%', replacement: "{{env.lowercase}}"},
            {pattern: '%%ENVVAR_WITHSPECIALCHARACTERS_TEST%%', replacement: "{{env.WITH-Special_Characters-123}}"},
            {pattern: '%%ENVVAR_NONEXISTENT_TEST%%', replacement: "{{env.ThisIsSomethingThatHopefullyDoesntExist}}"}
        ]}, function (err, results) {
            expect(err).to.be(null);
            expect(results).to.be.an('array');

            const expected = [
                { statusCode: 200, status: 'alive' },
                { statusCode: 200, status: 'alive' },
                { statusCode: 200, status: 'alive' },
                { statusCode: 200, status: 'alive' },
                { statusCode: 200, status: 'alive' },
                { statusCode: 200, status: 'alive' },
                { statusCode: 200, status: 'alive' },
                { statusCode: 200, status: 'alive' },
                { statusCode: 200, status: 'alive' },
                { statusCode: 200, status: 'alive' }
            ];

            expect(results.length).to.be(expected.length);

            for (let i = 0; i < results.length; i++) {
                expect(results[i].statusCode).to.be(expected[i].statusCode);
                expect(results[i].status).to.be(expected[i].status);
            }

            done();
        });
    });

    it('should correctly resolve regex named groups in replacement patterns', function (done) {
        markdownLinkCheck(fs.readFileSync(path.join(dirname, 'regex-groups-replacement.md')).toString().replace(/%%BASE_URL%%/g, 'file://' + dirname), {baseUrl: 'file://' + dirname, projectBaseUrl: 'file://' + dirname + "/..",replacementPatterns: [
            {pattern: '^/', replacement: "{{BASEURL}}/"},
            {pattern: 'folder-to-be-ignored/(?<filename>.*)', replacement: '$<filename>'}
        ]}, function (err, results) {
            expect(err).to.be(null);
            expect(results).to.be.an('array');

            const expected = [
                { statusCode: 200, status: 'alive' },
                { statusCode: 200, status: 'alive' },
                { statusCode: 200, status: 'alive' },
                { statusCode: 200, status: 'alive' }
            ];

            expect(results.length).to.be(expected.length);

            for (let i = 0; i < results.length; i++) {
                expect(results[i].statusCode).to.be(expected[i].statusCode);
                expect(results[i].status).to.be(expected[i].status);
            }

            done();
        });
    });

    it('check hash links', function (done) {
        markdownLinkCheck(fs.readFileSync(path.join(dirname, 'hash-links.md')).toString(), {}, function (err, result) {
            expect(err).to.be(null);
            expect(result).to.eql([
                { link: '#foo', statusCode: 200, err: null, status: 'alive' },
                { link: '#bar', statusCode: 200, err: null, status: 'alive' },
                { link: '#does-not-exist', statusCode: 404, err: null, status: 'dead' },
                { link: '#potato', statusCode: 404, err: null, status: 'dead' },
                { link: '#tomato_id', statusCode: 200, err: null, status: 'alive' },
                { link: '#tomato_name', statusCode: 200, err: null, status: 'alive' },
                { link: '#tomato_id_single_quote', statusCode: 200, err: null, status: 'alive' },
                { link: '#tomato_name_single_quote', statusCode: 200, err: null, status: 'alive' },
                { link: '#tomato_code', statusCode: 404, err: null, status: 'dead' },
                { link: '#tomato_escaped_backticks', statusCode: 200, err: null, status: 'alive' },
                { link: '#tomato_comment', statusCode: 404, err: null, status: 'dead' },
                { link: '#onion', statusCode: 200, err: null, status: 'alive' },
                { link: '#onion_outer', statusCode: 200, err: null, status: 'alive' },
                { link: '#onion_inner', statusCode: 200, err: null, status: 'alive' },
                { link: '#header-with-special-char-at-end-', statusCode: 200, err: null, status: 'alive' },
                { link: '#header-with-multiple-special-chars-at-end-', statusCode: 200, err: null, status: 'alive' },
                { link: '#header-with-special--char', statusCode: 200, err: null, status: 'alive' },
                { link: '#header-with-multiple-special--chars', statusCode: 200, err: null, status: 'alive' },
                { link: '#header-with-german-umlaut-%C3%B6', statusCode: 200, err: null, status: 'alive' },
                { link: '#header-with-german-umlaut-%C3%B6-manual-encoded-link', statusCode: 200, err: null, status: 'alive' },
                { link: 'https://github.com/tcort/markdown-link-check', statusCode: 200, err: null, status: 'alive' },
                { link: '#heading-with-a-link', statusCode: 200, err: null, status: 'alive' },
                { link: '#heading-with-an-anchor-link', statusCode: 200, err: null, status: 'alive' },
                { link: '#--docker', statusCode: 200, err: null, status: 'alive' },
                { link: '#step-7---lint--test', statusCode: 200, err: null, status: 'alive' },
                { link: '#product-owner--design-approval', statusCode: 200, err: null, status: 'alive' },
                { link: '#migrating-from--v1180', statusCode: 200, err: null, status: 'alive' },
                { link: '#clientserver-examples-using--networkpeer', statusCode: 200, err: null, status: 'alive' },
                { link: '#somewhere', statusCode: 200, err: null, status: 'alive' },
                { link: '#this-header-is-linked', statusCode: 200, err: null, status: 'alive' },
                { link: '#l-is-the-package-in-the-linux-distro-base-image', statusCode: 200, err: null, status: 'alive' },
            ]);
            done();
        });
    });
});
