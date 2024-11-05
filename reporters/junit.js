const { writeFileSync } = require('node:fs');
const { create } = require('xmlbuilder2');

const doc = create({ version: '1.0', encoding: 'UTF-8' })
    .ele('testsuites');

module.exports = async function junitReporter(err, results, opts, filenameForOutput) {
    const suite = doc.ele('testsuite', { name: filenameForOutput });

    if (err) suite.ele('error', { message: err })
    else {
        for (const result of results) {
            const test = suite.ele('testcase', { classname: result.link });
            if (result.status !== 'dead') continue;
            else {
                if (result.err != null) {
                    test.ele('error', {
                        message: result.err,
                        type: 'error'
                    });
                } else {
                    test.ele('failure', {
                        message: result.err
                            ?? `${result.link} is ${result.status} (${result.statusCode})`,
                        type: result.status
                    });
                }
            }
        }
    }
    process.on('exit', () => {
        writeFileSync('junit.xml', doc.end({ prettyPrint: true }) + '\n');
        console.error('\nWrote junit.xml');
    });
};

