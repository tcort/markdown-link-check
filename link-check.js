const fs = require('fs');
const processModule = require('process');
const url = require('url');
const Isemail = require('isemail');
const { URL } = require('url');

class LinkCheckResult {
  constructor(opts, link, statusCode, err) {
    opts.aliveStatusCodes = opts.aliveStatusCodes || [200];

    this.link = link;
    this.statusCode = statusCode || 0;
    this.err = err || null;
    this.status = opts.aliveStatusCodes.some((statusCode) => (statusCode instanceof RegExp) ? statusCode.test(this.statusCode) : statusCode === this.statusCode) ? 'alive' : 'dead';
  }
}

function checkLink(link, opts, callback, attempts = 0) {
  let retryOn429 = opts.retryOn429 || false;

  //max retry count will default to 2 seconds if not provided in options
  let retryCount = opts.retryCount || 2;
  const url = encodeURI(decodeURIComponent(new URL(link, opts.baseUrl).toString()));

  fetch(url, { method: 'HEAD', headers: opts.headers }).then(res => {
    if (res.status === 200) {

      callback(null, new LinkCheckResult(opts, link, res ? res.status : 0, null)); // alive, returned 200 OK     
    } else {
      if (res.status === 429) {
        if (attempts >= retryCount || !retryOn429) {
          callback(null, new LinkCheckResult(opts, link, res ? res.status : 0, null));
          return;
        }

        setTimeout(() => {
          checkLink(link, opts, callback, attempts + 1);
        }, 1000)
      }
      else {
        // retrying with GET because HEAD failed
        fetch(url).then(res => {
          callback(null, new LinkCheckResult(opts, link, res ? res.status : 0, null)); // alive, returned 200 OK     
          res.text();
        })
      }
    }
  }).catch(err => {
    // console.log("ERROR", err);
    callback(err, null);
  });
}

function checkFile(link, opts, callback) {

  // force baseUrl to end with '/' for proper treatment by WHATWG URL API
  if (typeof opts.baseUrl === 'string' && !opts.baseUrl.endsWith('/')) {
    opts.baseUrl = opts.baseUrl + '/';
  } // without the ending '/', the final component is dropped

  const loc = new URL(link || '', opts.baseUrl || processModule.cwd());
  // eslint-disable-next-line no-prototype-builtins
  fs.access(url.fileURLToPath(loc) || '', fs.hasOwnProperty('R_OK') ? fs.R_OK : fs.constants.R_OK, function (err) {
    callback(null, new LinkCheckResult(opts, link, !err ? 200 : 400, err));
  });
}

function checkHash(link, opts, callback) {
  const anchors = opts.anchors || [];
  callback(null, new LinkCheckResult(opts, link, anchors.includes(link) ? 200 : 404, null));
}

function checkMailTo(link, opts, callback) {
  const address = link
    .substr(7)      // strip "mailto:"
    .split('?')[0]; // trim ?subject=blah hfields

  /* per RFC6068, the '?' is a reserved delimiter and email addresses containing '?' must be encoded,
   * so it's safe to split on '?' and pick [0].
   */

  callback(null, new LinkCheckResult(opts, link, Isemail.validate(address) ? 200 : 400, null));
}

const protocolChecker = {
  hash: checkHash,
  file: checkFile,
  http: checkLink,
  https: checkLink,
  mailto: checkMailTo,
};

module.exports = function linkCheck(link, opts, callback) {

  if (arguments.length === 2 && typeof opts === 'function') {
    // optional 'opts' not supplied.
    callback = opts;
    opts = {};
  }
  let url
  try {
    url = link.startsWith('#') ? link : new URL(link, opts.baseUrl);

  } catch (err) {
    console.log(link, opts.baseUrl, err);
    return;
  }
  const protocol = link.startsWith('#') ? 'hash' : url.protocol.replace(/:$/, '');
  // eslint-disable-next-line no-prototype-builtins
  if (!protocolChecker.hasOwnProperty(protocol)) {
    callback(new Error('Unsupported Protocol'), null);
    return;
  }
  protocolChecker[protocol](link, opts, callback);
};

module.exports.LinkCheckResult = LinkCheckResult