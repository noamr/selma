var webdriverio = require('webdriverio'),
    merge = require('deepmerge');

var defaultOptions = {
    desiredCapabilities: {},
    host: '127.0.0.1',
    port: 4444
};

function getBrowserInfo(launcher) {
    return launcher.options.desiredCapabilities.browserName +
        (launcher.options.desiredCapabilities.version ? (' ' + launcher.options.desiredCapabilities.version) : '');
}

function getUrl(defaultUrl, launcher) {
    var url = defaultUrl;

    if (launcher.options.desiredCapabilities.browserName === 'internet explorer' &&
        launcher.options.ieDocumentMode) {
        url += '&x-ua-compatible=' + encodeURIComponent(launcher.options.ieDocumentMode);
    }

    return url;
}

var WebdriverIOLauncher = function (baseBrowserDecorator, args, logger, config) {
    var log = logger.create('webdriverio'),
        self = this;

    this.options = merge(defaultOptions, args.config);
    log.info(this.options);

    if (!this.options.desiredCapabilities.browserName) {
        log.error('No browser specified. Please provide browserName and (optionally) version in the configuration.');
    }

    baseBrowserDecorator(this);

    // Make sure that we retry multiple times (default is 2)
    this._retryLimit = 4;

    // This allows clearer output when running multiple tests at once
    this.name = getBrowserInfo(this) + ' through WebdriverIO';

    this._start = function (url) {
        var browserInfo = getBrowserInfo(self),
            finalUrl;

        self.browser = webdriverio
            .remote(self.options)
            .init()
            .then(function(session) {
                var finalUrl = getUrl(url, self);
                var seleniumEndpoint = 'http://' + self.options.host + ':' + self.options.port + '/wd/hub/session/' + session.sessionId;
                self.browser.url(finalUrl, function (err, response) {
                    if (err) {
                        log.error('An error occurred while loading the url with %s. Status code: %s. %s', browserInfo, err.status, err.message);
                        self.error = err.message ? err.message : err;
                        self.emit('done');
                    }
                }).then(function() {
                    return self.browser.setCookie({name: 'seleniumEndpoint', value: seleniumEndpoint });
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

WebdriverIOLauncher.$inject = ['baseBrowserDecorator', 'args', 'logger'];

module.exports = {
    'launcher:WebdriverIO': ['type', WebdriverIOLauncher]
};
