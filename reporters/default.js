module.exports = async function defaultReporter(err, results, opts, filenameForOutput) {
    const chalk = (await import('chalk')).default

    const statusLabels = {
        alive: chalk.green('✓'),
        dead: chalk.red('✖'),
        ignored: chalk.gray('/'),
        error: chalk.yellow('⚠'),
    };

    if (err) {
        console.error(chalk.red("\n  ERROR: something went wrong!"));
        console.error(err.stack);
    }

    if (results.length === 0 && !opts.quiet) {
        console.log(chalk.yellow("  No hyperlinks found!"));
    }
    results.forEach(function (result) {
        // Skip messages for non-deadlinks in quiet mode.
        if (opts.quiet && result.status !== "dead") {
            return;
        }

        if (opts.verbose) {
            if (result.err) {
                console.log(
                    "  [%s] %s → Status: %s %s",
                    statusLabels[result.status],
                    result.link,
                    result.statusCode,
                    result.err
                );
            } else {
                console.log("  [%s] %s → Status: %s", statusLabels[result.status], result.link, result.statusCode);
            }
        } else if (!opts.quiet) {
            console.log("  [%s] %s", statusLabels[result.status], result.link);
        }
    });

    if (!opts.quiet) {
        console.log("\n  %s links checked.", results.length);
    }

    if (results.some((result) => result.status === "dead")) {
        let deadLinks = results.filter((result) => {
            return result.status === "dead";
        });
        if (!opts.quiet) {
            console.error(chalk.red("\n  ERROR: %s dead links found!"), deadLinks.length);
        } else {
            console.error(chalk.red("\n  ERROR: %s dead links found in %s !"), deadLinks.length, filenameForOutput);
        }
        deadLinks.forEach(function (result) {
            console.log("  [%s] %s → Status: %s", statusLabels[result.status], result.link, result.statusCode);
        });
    }
};
