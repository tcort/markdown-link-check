'use strict';

var fs = require('fs');
var path = require('path');
var expect = require('expect.js');
var http = require('http');
var express = require('express');
var markdownLinkCheck = require('../');

describe('markdown-link-check', function () {

    var baseUrl;
    
    before(function (done) {
        var app = express();

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

        app.get('/hello.jpg', function (req, res) {
            res.sendFile('hello.jpg', {
                root: __dirname,
                dotfiles: 'deny'
            });
        });
        
        var server = http.createServer(app);
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
        markdownLinkCheck(fs.readFileSync(path.join(__dirname, 'sample.md')).toString().replace(/%%BASE_URL%%/g, baseUrl), { baseUrl: baseUrl }, function (err, results) {
            expect(err).to.be(null);
            expect(results).to.be.an('array');

            var expected = [
                { statusCode: 200, status: 'alive' },
                { statusCode: 404, status:  'dead' },
                { statusCode:   0, status:  'dead' },
                { statusCode: 200, status: 'alive' },
                { statusCode: 200, status: 'alive' },
                { statusCode: 200, status: 'alive' },
                { statusCode: 200, status: 'alive' },
                { statusCode: 200, status: 'alive' },
                { statusCode: 400, status:  'dead' },
            ];
            expect(results.length).to.be(expected.length);

            for (var i = 0; i < results.length; i++) {
                expect(results[i].statusCode).to.be(expected[i].statusCode);
                expect(results[i].status).to.be(expected[i].status);
            }

            done();
        });
    });
});
