[![Releases](https://img.shields.io/github/v/tag/tcort/markdown-link-check.svg?sort=semver)](https://github.com/tcort/markdown-link-check/releases)
[![Stars](https://img.shields.io/github/stars/tcort/markdown-link-check)](https://github.com/tcort/markdown-link-check/stargazers)
[![Forks](https://img.shields.io/github/forks/tcort/markdown-link-check)](https://github.com/tcort/markdown-link-check/network/members)
[![Test library workflow status](https://github.com/tcort/markdown-link-check/actions/workflows/ci.yml/badge.svg)](https://github.com/tcort/markdown-link-check/actions/workflows/ci.yml)
[![License](https://img.shields.io/github/license/tcort/markdown-link-check)](https://github.com/tcort/markdown-link-check/blob/master/LICENSE.md)

# markdown-link-check

Extracts links from markdown texts and checks whether each link is
alive (`200 OK`) or dead. `mailto:` links are also validated.

## Installation

To add the module to your project, run:

```shell
npm install --save-dev markdown-link-check
```

To install the command line tool globally, run:

```shell
npm install -g markdown-link-check
```

---

## Run using Docker

Docker images are built with each release. Use the `stable` tag for the current stable release.

Add current directory with your `README.md` file as read only volume to `docker run`:

```shell
docker run -v .:/tmp:ro --rm -i ghcr.io/tcort/markdown-link-check:stable /tmp/README.md
```

Alternatively, if you wish to target a specific release, images are tagged with semantic versions (i.e. `3`, `3.8`, `3.8.3`)

## Run in a GitHub action

Please head on to [github-action-markdown-link-check](https://github.com/tcort/github-action-markdown-link-check).

## Run as a pre-commit hook

To run as a [pre-commit hook](https://pre-commit.com):

```
- repo: https://github.com/tcort/markdown-link-check
  rev: ...
  hooks:
    - id: markdown-link-check
      args: [-q]
```

## Run in a GitLab pipeline

```yaml
linkchecker:
  stage: test
  image:
    name: ghcr.io/tcort/markdown-link-check:3.11.2
    entrypoint: ["/bin/sh", "-c"]
  script:
    - markdown-link-check ./docs
  rules:
    - changes:
      - "**/*.md"
```

## Run in other tools

- [Mega-Linter](https://megalinter.io/latest/): Linters aggregator [including markdown-link-check](https://megalinter.io/latest/descriptors/markdown_markdown_link_check/)

## API

### markdownLinkCheck(markdown, [opts,] callback)

Given a string containing `markdown` formatted text and a `callback`,
extract all of the links and check if they're alive or dead. Call the
`callback` with `(err, results)`

Parameters:

* `markdown` string containing markdown formatted text.
* `opts` optional options object containing any of the following optional fields:
  * `showProgressBar` enable an ASCII progress bar.
  * `timeout` timeout in [ms](https://www.npmjs.com/package/ms) format. (e.g. `"2000ms"`, `20s`, `1m`). Default `10s`.
  * `httpHeaders` to apply URL specific headers, see example below.
  * `ignorePatterns` an array of objects holding regular expressions which a link is checked against and skipped for checking in case of a match. Example: `[{ pattern: /foo/ }]`
  * `replacementPatterns` an array of objects holding regular expressions which are replaced in a link with their corresponding replacement string. This behavior allows (for example) to adapt to certain platform conventions hosting the Markdown. The special replacement `{{BASEURL}}` can be used to dynamically link to the base folder (used from `projectBaseUrl`) (for example that `/` points to the root of your local repository). Example: `[{ pattern: /^.attachments/, replacement: "file://some/conventional/folder/.attachments" }, { pattern: ^/, replacement: "{{BASEURL}}/"}]`. You can add `"global": true` to use a global regular expression to replace all instances.
  * `projectBaseUrl` the URL to use for `{{BASEURL}}` replacement
  * `ignoreDisable` if this is `true` then disable comments are ignored.
  * `retryOn429` if this is `true` then retry request when response is an HTTP code 429 after the duration indicated by `retry-after` header.
  * `retryCount` the number of retries to be made on a 429 response. Default `2`.
  * `fallbackRetryDelay` the delay in [ms](https://www.npmjs.com/package/ms) format. (e.g. `"2000ms"`, `20s`, `1m`) for retries on a 429 response when no `retry-after` header is returned or when it has an invalid value. Default is `60s`.
  * `aliveStatusCodes` a list of HTTP codes to consider as alive.
    Example: `[200,206]`
  * `reporters` an array of reporter functions to use for outputting results. If not specified, default output will be generated (useful when using the API programmatically). Available built-in reporters can be imported from the command-line tool.
* `callback` function which accepts `(err, results)`.
  * `err` an Error object when the operation cannot be completed, otherwise `null`.
  * `results` an array of objects with the following properties:
    * `link` the `link` provided as input
    * `status` a string set to either `alive`, `ignored` or `dead`.
    * `statusCode` the HTTP status code. Set to `0` if no HTTP status code was returned (e.g. when the server is down).
    * `err` any connection error that occurred, otherwise `null`.

#### Disable comments

You can write html comments to disable markdown-link-check for parts of the text.

`<!-- markdown-link-check-disable -->` disables markdown link check.
`<!-- markdown-link-check-enable -->` reenables markdown link check.
`<!-- markdown-link-check-disable-next-line -->` disables markdown link check for the next line.
`<!-- markdown-link-check-disable-line -->` disables markdown link check for this line.

## Examples

### Module

**Basic usage:**

```js
'use strict';

var markdownLinkCheck = require('markdown-link-check');

markdownLinkCheck('[example](https://example.com/)', function (err, results) {
    if (err) {
        console.error('Error', err);
        return;
    }
    results.forEach(function (result) {
        console.log('%s is %s', result.link, result.status);
    });
});
```

**With options, for example using URL specific headers:**

```js
'use strict';

var markdownLinkCheck = require('markdown-link-check');

markdownLinkCheck('[example](https://example.com/)', { httpHeaders: [{ urls: ['https://example.com/'], headers: { 'Authorization': 'Basic Zm9vOmJhcg==' }}] }, function (err, results) {
    if (err) {
        console.error('Error', err);
        return;
    }
    results.forEach(function (result) {
        console.log('%s is %s', result.link, result.status);
    });
});
```

### Command Line Tool

The command line tool optionally takes 1 argument, the file name or http/https URL.
If not supplied, the tool reads from standard input.

#### Check links from a markdown file hosted on the web

```shell
markdown-link-check https://github.com/tcort/markdown-link-check/blob/master/README.md
```

#### Check links from a local markdown file

```shell
markdown-link-check ./README.md
```

#### Check links from a local markdown folder (recursive)

This checks all files in folder `./docs` with file extension `*.md`:

```shell
markdown-link-check ./docs
```

The files can also be searched for and filtered manually:

```shell
find . -name \*.md -print0 | xargs -0 -n1 markdown-link-check
```

#### Usage

```shell
Usage: markdown-link-check [options] [filenamesOrDirectorynamesOrUrls...]

Options:
  -V, --version           output the version number
  -p, --progress          show progress bar
  -c, --config [config]   apply a config file (JSON), holding e.g. url specific header configuration
  -q, --quiet             displays errors only
  -v, --verbose           displays detailed error information
  -i, --ignore <paths>    ignore input paths including an ignore path
  -a, --alive <code>      comma separated list of HTTP codes to be considered as alive
  -r, --retry             retry after the duration indicated in 'retry-after' header when HTTP code is 429
  --reporters <names>     specify reporters to use
  --projectBaseUrl <url>  the URL to use for {{BASEURL}} replacement
  --junit-output <file>   output file for JUnit XML report (only used with junit reporter)
  -h, --help              display help for command
```

When a replacement pattern uses `{{BASEURL}}`, pass `--projectBaseUrl` to
check against a different project root. Supply a full URL, such as
`file:///path/to/project` or `https://example.com/docs`; the URL is used
without adding another scheme. If the option is omitted, the current working
directory is used. Relative file links read from standard input also resolve
against the current working directory.

```shell
markdown-link-check --config config.json --projectBaseUrl file:///path/to/project README.md
```

##### Reporters

`markdown-link-check` supports multiple output reporters to format the results of link checking:

###### Default Reporter

The default reporter outputs results to the console with colored status indicators:

```shell
markdown-link-check README.md
```

Output format:

```text
  ✓ https://example.com/valid-link
  ✖ https://example.com/broken-link
  / https://example.com/ignored-link

  3 links checked.

  ERROR: 1 dead links found!
```

###### JUnit Reporter

The JUnit reporter generates XML output compatible with JUnit test result format, useful for CI/CD integration:

```shell
markdown-link-check --reporters junit README.md
```

To specify a custom output file:

```shell
markdown-link-check --reporters junit --junit-output results.xml README.md
```

If no output file is specified, the results are written to `junit-results.xml` by default.

###### Multiple Reporters

You can use multiple reporters simultaneously by specifying them in a comma-separated list:

```shell
markdown-link-check --reporters default,junit README.md
```

This will output to both the console (default reporter) and generate a JUnit XML file.

##### Config file format

`config.json`:

* `ignorePatterns`: An array of objects holding regular expressions which a link is checked against and skipped for checking in case of a match.
* `replacementPatterns`: An array of objects holding regular expressions which are replaced in a link with their corresponding replacement string. This behavior allows (for example) to adapt to certain platform conventions hosting the Markdown. The special replacement `{{BASEURL}}` can be used to dynamically link to the current working directory (for example that `/` points to the root of your current working directory). This parameter supports named regex groups the same way as `string.replace` [method](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replace#specifying_a_string_as_the_replacement) in node.
* `httpHeaders`: The headers are only applied to links where the link **starts with** one of the supplied URLs in the `urls` section.
* `timeout` timeout in [ms](https://www.npmjs.com/package/ms) format. (e.g. `"2000ms"`, `20s`, `1m`). Default `10s`.
* `retryOn429` if this is `true` then retry request when response is an HTTP code 429 after the duration indicated by `retry-after` header.
* `retryCount` the number of retries to be made on a 429 response. Default `2`.
* `fallbackRetryDelay` the delay in [ms](https://www.npmjs.com/package/ms) format. (e.g. `"2000ms"`, `20s`, `1m`) for retries on a 429 response when no `retry-after` header is returned or when it has an invalid value. Default is `60s`.
* `aliveStatusCodes` a list of HTTP codes to consider as alive.
* `projectBaseUrl` the URL to use for `{{BASEURL}}` replacement

**Example:**

```json
{
  "projectBaseUrl":"${workspaceFolder}",
  "ignorePatterns": [
    {
      "pattern": "^https://example\\.net/"
    }
  ],
  "replacementPatterns": [
    {
      "pattern": "^.attachments",
      "replacement": "file://some/conventional/folder/.attachments"
    },
    {
      "pattern": "^/",
      "replacement": "{{BASEURL}}/"
    },
    {
      "pattern": "%20",
      "replacement": "-",
      "global": true
    },
    {
      "pattern": "images/(?<filename>.*)",
      "replacement": "assets/$<filename>"
    }
  ],
  "httpHeaders": [
    {
      "urls": ["https://example.com/"],
      "headers": {
        "Authorization": "Basic Zm9vOmJhcg==",
        "Foo": "Bar"
      }
    }
  ],
  "timeout": "20s",
  "retryOn429": true,
  "retryCount": 5,
  "fallbackRetryDelay": "30s",
  "aliveStatusCodes": [200, 206]
}
```

## Testing

```shell
npm test
```

## Security Considerations

Here are some tips to keep you safe:

When specifying URL stems or patterns for matching URLs, such as in
`ignorePatterns`, `httpHeaders`, and others, you should be careful to specify
**exactly** what you intend. If you specify a `pattern` like
`"^https://www.example.net"` it will match
`https://www-example-net.another-site.test/index.html`. Be sure to escape
regular expression operators such as the dot (`.`) unless you really do intend
to match any character in that position. Additionally, unless you intend to
match just part of a domain name, be sure to include a path element such as
`/`.  If you're matching all routes on a particular host, specify a pattern
like this: `"^https://www\\.example\\.net/"`. Similarly, the URL stems in
`httpHeaders` should include a path element in most cases. For example:
`"https://www.example.com/"`.

This tool can be configured to access environment variables. This allows
access tokens to be used in authentication headers without needing to store
the tokens in plain text in a configuration file. You should not run this tool
with untrusted configuration and secrets in the environment. For example, it
would not be prudent to store the markdown-link-check configuration in a
public repository which accepts pull requests that automatically invoke
`markdown-link-check` in an environment where credentials are accessible
without human review as the secrets could be sent to an unintended host.

## License

See [LICENSE.md](https://github.com/tcort/markdown-link-check/blob/master/LICENSE.md)
