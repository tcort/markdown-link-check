'use strict';

const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const fs = require('node:fs');
const http = require('node:http');
const os = require('node:os');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

describe('CLI --projectBaseUrl', function () {
    this.timeout(10000);

    const cliPath = path.join(__dirname, '..', 'markdown-link-check');
    const markdown = '[Guide](/guide.md)\n';
    let tempDir;
    let projectDir;
    let workingDir;
    let document;
    let config;

    beforeEach(function () {
        tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'markdown-link-check-base-'));
        projectDir = path.join(tempDir, 'project');
        workingDir = path.join(tempDir, 'working');
        fs.mkdirSync(projectDir);
        fs.mkdirSync(workingDir);
        document = path.join(tempDir, 'README.md');
        config = path.join(tempDir, 'config.json');
        fs.writeFileSync(document, markdown);
        fs.writeFileSync(path.join(projectDir, 'guide.md'), '# Guide\n');
        fs.writeFileSync(config, JSON.stringify({
            replacementPatterns: [{ pattern: '^/', replacement: '{{BASEURL}}/' }]
        }));
    });

    afterEach(function () {
        fs.rmSync(tempDir, { recursive: true, force: true });
    });

    function runCli(args, input) {
        return new Promise((resolve, reject) => {
            const child = spawn(process.execPath, [cliPath, '--config', config, ...args], {
                cwd: workingDir,
                env: { ...process.env, NO_PROXY: '127.0.0.1', no_proxy: '127.0.0.1' },
                timeout: 7000
            });
            let stdout = '';
            let stderr = '';
            child.stdout.on('data', chunk => { stdout += chunk; });
            child.stderr.on('data', chunk => { stderr += chunk; });
            child.on('error', reject);
            child.on('close', (code, signal) => resolve({ code, signal, stdout, stderr }));
            child.stdin.end(input);
        });
    }

    function assertExit(result, expected) {
        assert.equal(result.signal, null, result.stderr);
        assert.equal(result.code, expected, result.stdout + result.stderr);
        assert.match(result.stdout, /1 link checked\./);
    }

    it('uses an explicit file URL instead of the working directory', async function () {
        const result = await runCli(['--projectBaseUrl', pathToFileURL(projectDir).href, document]);
        assertExit(result, 0);
    });

    it('accepts the --projectBaseUrl=URL option form', async function () {
        const result = await runCli([`--projectBaseUrl=${pathToFileURL(projectDir).href}`, document]);
        assertExit(result, 0);
    });

    it('preserves percent-encoded file URLs', async function () {
        const spacedDir = path.join(tempDir, 'project with spaces');
        fs.renameSync(projectDir, spacedDir);
        const result = await runCli(['--projectBaseUrl', pathToFileURL(spacedDir).href, document]);
        assertExit(result, 0);
    });

    it('uses the explicit base URL when reading Markdown from stdin', async function () {
        const result = await runCli(['--projectBaseUrl', pathToFileURL(projectDir).href], markdown);
        assertExit(result, 0);
    });

    it('rejects a missing project file even if the working directory contains a namesake', async function () {
        fs.unlinkSync(path.join(projectDir, 'guide.md'));
        fs.writeFileSync(path.join(workingDir, 'guide.md'), '# Unrelated guide\n');
        const result = await runCli(['--projectBaseUrl', pathToFileURL(projectDir).href, document]);
        assertExit(result, 1);
        assert.match(result.stderr, /1 dead link found/);
    });

    it('keeps the working-directory default when the option is omitted', async function () {
        fs.writeFileSync(path.join(workingDir, 'guide.md'), '# Default guide\n');
        const result = await runCli([document]);
        assertExit(result, 0);
    });

    it('resolves relative file links from stdin against the working directory', async function () {
        fs.writeFileSync(path.join(workingDir, 'guide.md'), '# Default guide\n');
        const result = await runCli([], '[Guide](guide.md)\n');
        assertExit(result, 0);
    });

    it('preserves an HTTP base URL without adding a file scheme', async function () {
        const requestedPaths = [];
        const server = http.createServer((req, res) => {
            requestedPaths.push(req.url);
            res.writeHead(req.url === '/docs/guide.md' ? 200 : 404);
            res.end();
        });
        await new Promise((resolve, reject) => {
            server.once('error', reject);
            server.listen(0, '127.0.0.1', resolve);
        });
        try {
            const baseUrl = `http://127.0.0.1:${server.address().port}/docs`;
            const result = await runCli(['--projectBaseUrl', baseUrl, document]);
            assertExit(result, 0);
            assert.ok(requestedPaths.includes('/docs/guide.md'));
        } finally {
            await new Promise((resolve, reject) => server.close(err => err ? reject(err) : resolve()));
        }
    });
});
