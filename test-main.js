var tests = Object.keys(window.__karma__.files).filter(function (file) {
    return (/spec\.js$/).test(file);
});

requirejs.config({
    paths: {
        'selenium': '/base/lib/selma/selenium-loopback'
    },
    deps: tests,
    callback: window.__karma__.start
});
