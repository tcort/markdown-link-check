'use strict';

const fs = require('fs');
const path = require('path');
const expect = require('expect.js');
const http = require('http');
const express = require('express');
const markdownLinkCheck = require('../');

describe('markdown-link-check', function () {

    let baseUrl;

    before(function (done) {
        const app = express();

        app.head('/nohead', function (req, res) {
            res.sendStatus(405); // method not allowed
        });
        app.get('/nohead', function (req, res) {
            res.sendStatus(200);
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
                root: __dirname,
                dotfiles: 'deny'
            });
        });

        app.get('/foo\\(a=b.42\\).aspx', function (req, res) {
            res.json({a:'b'});
        });

        const server = http.createServer(app);
        server.listen(0 /* random open port */, 'localhost', function serverListen(err) {
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
            fs.readFileSync(path.join(__dirname, 'sample.md')).toString().replace(/%%BASE_URL%%/g, baseUrl),
            {
                baseUrl: baseUrl,
                ignorePatterns: [{ pattern: /not-working-and-ignored/ }],
                replacementPatterns: [{ pattern: /boo/, replacement: "foo" }],
                httpHeaders: [
                    {
                        urls: [baseUrl + '/basic-auth'],
                        headers: { 'Authorization': 'Basic Zm9vOmJhcg==', 'Foo': 'Bar' }
                    }
                ] 
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

                // hello image
                { statusCode: 200, status: 'alive' },

                // hello image
                { statusCode: 200, status: 'alive' },

                // valid e-mail
                { statusCode: 200, status:  'alive' },

                // invalid e-mail
                { statusCode: 400, status:  'dead' },

                // invalid protocol
                { statusCode: 500, status:  'error' },

                // invalid protocol
                { statusCode: 500, status:  'error' },
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
        markdownLinkCheck(fs.readFileSync(path.join(__dirname, 'file.md')).toString().replace(/%%BASE_URL%%/g, 'file://' + __dirname), { baseUrl: baseUrl }, function (err, results) {
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
        markdownLinkCheck('[test](' + baseUrl + '/foo\(a=b.42\).aspx)', function (err, results) {
            expect(err).to.be(null);
            expect(results).to.be.an('array');
            expect(results).to.have.length(1);
            expect(results[0].statusCode).to.be(200);
            expect(results[0].status).to.be('alive');
            done();
        });
    });
});
