var tests = Object.keys(window.__karma__.files).filter(function (file) {
    return (/spec\.js$/).test(file);
});

window.onerror = function(e) {
  console.error([].slice.call(arguments));
}

requirejs.config({
    paths: {
        'selma': '/base/lib/selma/selma-client'
    },
    deps: tests,
    callback: window.__karma__.start
});
