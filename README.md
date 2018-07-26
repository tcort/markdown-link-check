# markdown-link-check

Extracts links from markdown texts and checks whether each link is
alive (`200 OK`) or dead. `mailto:` links are validated with
[isemail](https://www.npmjs.com/package/isemail).

## Installation

To add the module to your project, run:

    npm install --save markdown-link-check

To install the command line tool globally, run:

    npm install -g markdown-link-check

---

## Run using Docker

Build a Docker image:

    docker build --tag markdown-link-check .

Pipe your `README.md` file to `docker run`:

    docker run --rm -i markdown-link-check < README.md

## API

### markdownLinkCheck(markdown, [opts,] callback)

Given a string containing `markdown` formatted text and a `callback`,
extract all of the links and check if they're alive or dead. Call the
`callback` with `(err, results)`

Parameters:

* `markdown` string containing markdown formatted text.
* `opts` optional options object containing any of the following optional fields:
  * `baseUrl` the base URL for relative links.
  * `showProgressBar` enable an ASCII progress bar.
  * `httpHeaders` to apply URL specific headers, see example below.
  * `ignorePatterns` an array of objects holding regular expressions which a link is checked against and skipped for checking in case of a match. Example: `[{ pattern: /foo/ }]`
  * `replacementPatterns` an array of objects holding regular expressions which are replaced in a link with their corresponding replacement string. This behavior allows (for example) to adapt to certain platform conventions hosting the Markdown. Example: `[{ pattern: /^.attachments/, replacement: "file://some/conventional/folder/.attachments" }]`
* `callback` function which accepts `(err, results)`.
  * `err` an Error object when the operation cannot be completed, otherwise `null`.
  * `results` an array of objects with the following properties:
    * `link` the `link` provided as input
    * `status` a string set to either `alive`, `ignored` or `dead`.
    * `statusCode` the HTTP status code. Set to `0` if no HTTP status code was returned (e.g. when the server is down).
    * `err` any connection error that occurred, otherwise `null`.

## Examples

### Module

**Basic usage:**

```js
'use strict';

var markdownLinkCheck = require('markdown-link-check');

markdownLinkCheck('[example](http://example.com)', function (err, results) {
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

markdownLinkCheck('[example](http://example.com)', { httpHeaders: [{ urls: ['http://example.com'], headers: { 'Authorization': 'Basic Zm9vOmJhcg==' }}] }, function (err, results) {
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

    markdown-link-check https://github.com/tcort/markdown-link-check/blob/master/README.md

#### Check links from a local markdown file

    markdown-link-check ./README.md

#### Check links from a local markdown folder (recursive)

    find . -name \*.md -exec markdown-link-check {} \;

#### Check links from standard input

    cat *.md | markdown-link-check

#### Usage

```

  Usage: markdown-link-check [options] [filenameOrUrl]

  Options:

    -p, --progress         show progress bar
    -c, --config [config]  apply a configuration file (JSON)
    -q, --quiet            display errors only
    -v, --verbose          displays detailed error information 
    -h, --help             output usage information

```

##### Config file format

`config.json`:

* `ignorePatterns`: An array of objects holding regular expressions which a link is checked against and skipped for checking in case of a match.
* `replacementPatterns`: An array of objects holding regular expressions which are replaced in a link with their corresponding replacement string. This behavior allows (for example) to adapt to certain platform conventions hosting the Markdown.
* `httpHeaders`: The headers are only applied to links where the link **starts with** one of the supplied URLs in the `urls` section.

**Example:**

    {
        "ignorePatterns": [
            {
                "pattern": "^http://example.net"
            }
        ],
        "replacementPatterns": [
            {
                "pattern": "^.attachments",
                "replacement": "file://some/conventional/folder/.attachments"
            }
        ],
        "httpHeaders": [
            {
                "urls": [
                    "https://example.com"
                ],
                "headers": {
                    "Authorization": "Basic Zm9vOmJhcg==",
                    "Foo": "Bar"
                }
            }
        ]
    }



## Testing

    npm test

## License

See [LICENSE.md](https://github.com/tcort/markdown-link-check/blob/master/LICENSE.md)
