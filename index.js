var webdriverio = require('webdriverio'),
    merge = require('deepmerge'),
    http = require('http'),
    URL = require('url'),
    path = require('path');

var defaultOptions = {
    desiredCapabilities: {},
    host: '127.0.0.1',
    port: 4444
};

function getBrowserInfo(launcher) {
    return launcher.options.desiredCapabilities.browserName +
        (launcher.options.desiredCapabilities.version ? (' ' + launcher.options.desiredCapabilities.version) : '');
}

var SelmaProxy = function(args, config) {
  return function(request, response, next) {
    var path = /^\/selma\/(.*)/.exec(request.url);
    var cookie = /\bseleniumEndpoint=(.*)\b/.exec(request.headers.cookie);
    if (!path || path.length < 2 || !cookie || cookie.length < 2) {
      next();
      return;
    }

    path = path[1];
    endpoint = cookie[1];
    path = endpoint + "/" + path;
    var opt = URL.parse(path);
    opt.method = request.method;
    opt.headers = request.headers;
    var proxy_request = http.request(opt);

    proxy_request.addListener('response', function (proxy_response) {
      proxy_response.addListener('data', function(chunk) {
        response.write(chunk, 'binary');
      });
      proxy_response.addListener('end', response.end.bind(response));
      response.writeHead(proxy_response.statusCode, proxy_response.headers);
    });

    request.addListener('data', function(chunk) { proxy_request.write(chunk, 'binary'); });
    request.addListener('end', proxy_request.end.bind(proxy_request));
  }
}


var SelmaWDIOLauncher = function (baseBrowserDecorator, args, logger, config) {
    var log = logger.create('webdriverio'),
        self = this;

    this.options = merge(defaultOptions, args.config);

    if (!this.options.desiredCapabilities.browserName) {
        log.error('No browser specified. Please provide browserName and (optionally) version in the configuration.');
    }

    baseBrowserDecorator(this);

    // Make sure that we retry multiple times (default is 2)
    this._retryLimit = 4;

    // This allows clearer output when running multiple tests at once
    this.name = getBrowserInfo(this) + ' through WebdriverIO';

    this._start = function (url) {
        this.url = url;
        var browserInfo = getBrowserInfo(self);
        var seleniumEndpoint;

        self.browser = webdriverio
            .remote(self.options)
            .init()
            .then(function(session) {
                seleniumEndpoint = 'http://' + self.options.host + ':' + self.options.port + '/wd/hub/session/' + session.sessionId;
                self.browser.url(url, function (err, response) {
                    if (err) {
                        log.error('An error occurred while loading the url with %s. Status code: %s. %s', browserInfo, err.status, err.message);
                        self.error = err.message ? err.message : err;
                        self.emit('done');
                    }
                }).then(function() {
                  return self.browser.setCookie({ name: "seleniumEndpoint", value: seleniumEndpoint });
                });
            });

        // Fix for browser hanging, suggested in:
        // https://github.com/karma-runner/karma-webdriver-launcher/commit/461ad798a34357f2a56f7da1a3d49a6fa1437109
        self._process = {
            kill: function () {
                self.browser.end().then(function () {
                    log.info('Browser %s closed.', getBrowserInfo(self));
                    self._onProcessExit(self.error ? -1 : 0, self.error);
                });
            }
        };
    };
};

SelmaWDIOLauncher.$inject = ['baseBrowserDecorator', 'args', 'logger'];

function createPattern(path) {
  return {pattern: path, included: true, served: true, watched: false};
};

function selmaFramework(files) {
    files.unshift(createPattern(path.join(__dirname, 'selma.js')));
}

selmaFramework.$inject = ['config.files'];

module.exports = {
  'middleware:selma': ['factory', SelmaProxy],
  'launcher:selma': ['type', SelmaWDIOLauncher],
  'framework:selma': ['factory', selmaFramework]
};
