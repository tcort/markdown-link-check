'use strict';

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');
const { create } = require('xmlbuilder2');

describe('JUnit test counts', function () {
    let dir;
    const cli = path.join(__dirname, '..', 'markdown-link-check');
    const errorLink = '[bad](applesauce://example.org)\n';
    const mixedLinks = '# alive\n[ok](#alive)\n[dead](#missing)\n' + errorLink;

    beforeEach(function () {
        dir = fs.mkdtempSync(path.join(os.tmpdir(), 'markdown-link-check-junit-'));
    });

    afterEach(function () {
        fs.rmSync(dir, {recursive: true, force: true});
    });

    function report(markdowns, preload) {
        const files = markdowns.map((markdown, index) => {
            const file = path.join(dir, `${index}.md`);
            fs.writeFileSync(file, markdown);
            return file;
        });
        const output = path.join(dir, 'report.xml');
        const args = preload ? ['--require', preload] : [];
        const result = spawnSync(process.execPath, [...args, cli,
            '--reporters', 'junit', '--junit-output', output, ...files], {
            encoding: 'utf8', timeout: 10000
        });
        assert.ifError(result.error);
        assert.ok(result.status === 0 || result.status === 1, result.stderr);
        const root = create(fs.readFileSync(output, 'utf8')).root().node;
        const suites = Array.from(root.getElementsByTagName('testsuite'));
        for (const suite of suites) {
            assert.strictEqual(Number(suite.getAttribute('tests')),
                suite.getElementsByTagName('testcase').length);
        }
        assert.strictEqual(Number(root.getAttribute('tests')),
            root.getElementsByTagName('testcase').length);
        assert.strictEqual(Number(root.getAttribute('tests')),
            suites.reduce((sum, suite) => sum + Number(suite.getAttribute('tests')), 0));
        return root;
    }

    it('counts an error link once', function () {
        const root = report([errorLink]);
        assert.strictEqual(root.getAttribute('tests'), '1');
        assert.strictEqual(root.getAttribute('errors'), '1');
        assert.strictEqual(root.getAttribute('failures'), '0');
    });

    it('distinguishes alive, dead and error links', function () {
        const root = report([mixedLinks]);
        assert.strictEqual(root.getAttribute('tests'), '3');
        assert.strictEqual(root.getAttribute('errors'), '1');
        assert.strictEqual(root.getAttribute('failures'), '1');
    });

    it('sums test counts across files', function () {
        const root = report([errorLink, mixedLinks]);
        assert.strictEqual(root.getAttribute('tests'), '4');
        assert.strictEqual(root.getAttribute('errors'), '2');
        assert.strictEqual(root.getAttribute('failures'), '1');
    });

    it('includes the synthetic testcase for a file processing error', function () {
        const preload = path.join(dir, 'processing-error.cjs');
        fs.writeFileSync(preload, `
            const Module = require('module');
            const load = Module._load;
            Module._load = function(request, parent, isMain) {
                if (request === '.' && parent.filename === ${JSON.stringify(cli)}) {
                    const check = load.call(this, request, parent, isMain);
                    return (markdown, options, callback) => markdown.includes('processing-error')
                        ? callback(new Error('Processing failed'))
                        : check(markdown, options, callback);
                }
                return load.call(this, request, parent, isMain);
            };
        `);
        const root = report(['processing-error'], preload);
        assert.strictEqual(root.getAttribute('tests'), '1');
        assert.strictEqual(root.getAttribute('errors'), '1');
        assert.strictEqual(root.getAttribute('failures'), '0');
        assert.strictEqual(root.getElementsByTagName('testcase')[0].getAttribute('name'),
            'markdown-link-check-error');
        const combined = report(['processing-error', mixedLinks], preload);
        assert.strictEqual(combined.getAttribute('tests'), '4');
        assert.strictEqual(combined.getAttribute('errors'), '2');
        assert.strictEqual(combined.getAttribute('failures'), '1');
    });
});
