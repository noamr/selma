// Karma configuration
// Generated on Tue Feb 23 2016 11:46:18 GMT+0200 (IST)


module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',

    plugins: [
        require('./lib/selma/karma-selma-plugin'), 'karma-jasmine', 'karma-requirejs', 'karma-jquery', 'karma-chrome-launcher'
    ],

    middleware: [
      'selmaProxy'
    ],

    client: {
      useIframe: false
    },


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine', 'requirejs', 'jquery-1.8.3'],


    // list of files / patterns to load in the browser
    files: [
      'test-main.js',
      {pattern:'test/**/*.spec.js', included: false},
      {pattern: 'lib/**/*.js', included: false},
    ],

    // define browsers
    customLaunchers: {
      'swd_chrome': {
        base: 'WebdriverIO',
        config: {
          desiredCapabilities: {
            browserName: 'chrome'
          }
        }
      },
      'swd_firefox': {
        base: 'WebdriverIO',
        config: {
          desiredCapabilities: {
            browserName: 'firefox'
          }
        }
      },
      'swd_chrome_nexus_emu': {
        base: 'WebdriverIO',
        config: {
          desiredCapabilities: {
            browserName: 'chrome',
            rotatable: true,
            chromeOptions: {
              mobileEmulation: {
                deviceMetrics: { "width": 360, "height": 640, "pixelRatio": 3.0 },
                "userAgent": "Mozilla/5.0 (Linux; Android 4.2.1; en-us; Nexus 5 Build/JOP40D) AppleWebKit/535.19 (KHTML, like Gecko) Chrome/18.0.1025.166 Mobile Safari/535.19"
              }
            }
          }
        }
      }
    },

    // list of files to exclude
    exclude: [
    ],

    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
    },


    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress'],


    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: false,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['swd_chrome'],

    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: true
  })
}
