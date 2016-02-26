var tests = Object.keys(window.__karma__.files).filter(function (file) {
    return (/spec\.js$/).test(file);
});

window.onerror = function(e) {
  console.error([].slice.call(arguments));
}

requirejs.config({
    paths: {
        'selenium': '/base/lib/selma/selenium-loopback'
    },
    deps: tests,
    callback: window.__karma__.start
});
