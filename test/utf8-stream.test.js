'use strict';

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

// Force one-byte chunks so every multi-byte character crosses a boundary,
// independently of the platform's default stream buffer size.
describe('CLI UTF-8 streams', function () {
    let dir;
    let preload;
    const cli = path.join(__dirname, '..', 'markdown-link-check');

    beforeEach(function () {
        dir = fs.mkdtempSync(path.join(os.tmpdir(), 'markdown-link-check-utf8-'));
        preload = path.join(dir, 'chunks.cjs');
        fs.writeFileSync(preload, `
            const fs = require('fs');
            const { Readable } = require('stream');
            const createReadStream = fs.createReadStream;
            fs.createReadStream = (file, options) => createReadStream(file, {...options, highWaterMark: 1});
            if (process.env.UTF8_STDIN_FILE) {
                const bytes = fs.readFileSync(process.env.UTF8_STDIN_FILE);
                Object.defineProperty(process, 'stdin', {value: Readable.from(
                    Array.from(bytes, byte => Buffer.from([byte])),
                    {objectMode: false, highWaterMark: 1}
                )});
            }
        `);
    });

    afterEach(function () {
        fs.rmSync(dir, {recursive: true, force: true});
    });

    function run(args, env = {}) {
        const result = spawnSync(process.execPath, ['--require', preload, cli, ...args], {
            encoding: 'utf8', env: {...process.env, ...env}, timeout: 10000
        });
        assert.ifError(result.error);
        assert.strictEqual(result.status, 0, result.stdout + result.stderr);
        assert.match(result.stdout, /1 link checked/);
        return result.stdout;
    }

    for (const input of ['file', 'stdin']) {
        it(`preserves Chinese and emoji in ${input} input`, function () {
            const file = path.join(dir, 'input.md');
            fs.writeFileSync(file, '<a id="中文😀"></a>\n[link](#target)\n');
            const config = path.join(dir, 'config.json');
            fs.writeFileSync(config, JSON.stringify({replacementPatterns: [
                {pattern: '^#target$', replacement: '#中文😀'}
            ]}));
            // The config is read normally here to isolate Markdown decoding.
            fs.appendFileSync(preload, `\nfs.createReadStream = (file, options) => createReadStream(file, {...options, highWaterMark: file.endsWith('.json') ? 65536 : 1});\n`);
            run(input === 'file' ? ['-c', config, file] : ['-c', config],
                input === 'stdin' ? {UTF8_STDIN_FILE: file} : {});
        });
    }

    it('preserves a heading split at an explicit 64 KiB boundary', function () {
        this.timeout(15000);
        const file = path.join(dir, 'input.md');
        const prefix = '[link](#中文)\n\n';
        const padding = 65536 - Buffer.byteLength(prefix) - 5;
        fs.writeFileSync(file, prefix + 'x'.repeat(padding) + '\n## 中文\n');
        // The first byte of 中 is the final byte of the first chunk.
        assert.strictEqual(fs.readFileSync(file)[65535], Buffer.from('中')[0]);
        fs.appendFileSync(preload, `\nfs.createReadStream = (file, options) => createReadStream(file, {...options, highWaterMark: 65536});\n`);
        run([file]);
    });

    it('preserves Chinese and emoji in configuration strings', function () {
        const file = path.join(dir, 'input.md');
        fs.writeFileSync(file, '<a id="中文😀"></a>\n[link](#target)\n');
        const config = path.join(dir, 'config.json');
        fs.writeFileSync(config, JSON.stringify({replacementPatterns: [
            {pattern: '^#target$', replacement: '#中文😀'}
        ]}));
        fs.appendFileSync(preload, `\nfs.createReadStream = (file, options) => createReadStream(file, {...options, highWaterMark: file.endsWith('.json') ? 1 : 65536});\n`);
        run(['-c', config, file]);
    });
});
