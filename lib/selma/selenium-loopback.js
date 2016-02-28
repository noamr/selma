define([], function() {
	var endpoint = null;
	var windowHandle = null;
	var initialized = false;

	var LEFT = 0, MIDDLE = 1, RIGHT = 2, SINGLE = false, MULTIPLE = true;


	function realAjax(method, path, data) {
		return new Promise(function(resolve, reject) {
			$.ajax({
				url: endpoint + '/' + path,
				data: data ? JSON.stringify(data) : null,
				type: method,
				contentType: 'application/json; charset=UTF-8',
				success: resolve,
				error: reject,
				dataType: 'json'
			});
		});
	}

	var initialized = false;
	function init() {
		if (initialized) {
			return Promise.resolve();
		}

		initialized = true;
		var endpointVar = /\bseleniumEndpoint=(.*)[^&]*/gi.exec(document.cookie);
		if (!endpointVar) {
			throw new 'No selenium server given';
		}

		endpoint = endpointVar[1];

		return realAjax("GET", 'window_handles').then(function(handles) {
			windowHandle = handles.value[handles.value.length - 1];
			return realAjax("POST", 'window', {handle: windowHandle});
		});
	}

	function ajax(method, path, data) {
			return init().then(function() { return realAjax(method, path, data); });
	}

	function get(path) {
		return ajax("GET", path, null).then(function (j) {
			return Promise.resolve(j.value);
		});
	}

	function post(path, data) { return ajax("POST", path, data); }

	function getImage(path) {
		return get(path).then(function(string) {
			return new Promise(function(resolve, reject) {
				var image = new Image;
				image.src = 'data:image/png;base64,' + string;
				resolve(image);
			});
		});
	}

	function elementSelector(multi, prefix, promise) {
		promise = promise || Promise.resolve();
		function onSingle(value) {
			return getElement(value.value);
		}

		function onMultiple(value) {
			return Promise.resolve(value.value.map(transformElement));
		}

		function selectElements(opt) {
			return promise
				.then(function() { return post(prefix, opt); })
				.then(multi ? onMultiple : onSingle, function(e) {
						return Promise.resolve(multi ? [] : null);
				});
		}

		function selector(using) {
			return function(value) {
				return Selenium(selectElements({ using: using, value: value}));
			}
		};

		return {
			byId: selector('id'),
			byClass: selector('class name'),
			byCss: selector('css selector'),
			byName: selector('name'),
			byLinkText: selector('link text'),
			byPartialLinkText: selector('partial link text'),
			byTagName: selector('tag name')
		};
	}

	function transformElement(webElement) {
		var id = webElement.ELEMENT;
		var prefix = 'element/' + id + '/';

		return {
			id: id,

			text: function() { return get(prefix + 'text'); },
			tag: function() { return get(prefix + 'name'); },
			attribute: function(a) { return get(prefix + 'attribute/' + a); },
			selected: function() { return get(prefix + 'selected'); },
			click: function() { return post(prefix + 'click'); },
			element: function() { return elementSelector(SINGLE, prefix + 'element'); },
			elements: function() { return elementSelector(MULTIPLE, prefix + 'elements'); },
			keys: function(keys) { return post(prefix + 'value', { value: keys}); },
			equals: function(otherElement) { return get(prefix + 'equals/' + otherElement.id); },
			enabled: function() { return get(prefix + 'enabled'); },
			
			displayed: function() { return get(prefix + 'displayed'); },
			location: function() { return get(prefix + 'location'); },
			size: function() { return get(prefix + 'size'); },
			css: function(p) { return get(prefix + 'css/' + p); },

			submit: function() { return post(prefix + 'submit'); },
			clear: function() { return post(prefix + 'clear'); },

			tap: function() { return post('touch/click', {element: id}); },
			scroll: function(xOffset, yOffset) { return post('touch/scroll', {element: id, xoffset: xOffset, yoffset: yOffset}); },
			doubleTap: function() { return post('touch/doubleclick', {element: id}); },
			longTap: function() { return post('touch/longclick', {element: id}); },
			flick: function(xOffset, yOffset, speed) { return post('touch/flick', {element: id, xoffset: xOffset, yoffset: yOffset}); }
		};
	}

	function getElement(webElement) {
		return Promise.resolve(transformElement(webElement));
	}

	function imageDataToArray(a) { return [].slice.call(a.data); }

	var testCanvas = null;
	function testColor(color) {
		if (!testCanvas) {
			testCanvas = document.createElement("CANVAS");
			testCanvas.setAttribute('width', 1);
			testCanvas.setAttribute('height', 1);
		}

		var ctx = testCanvas.getContext('2d');
		ctx.fillStyle = color;
		ctx.fillRect(0, 0, 1, 1);
		return imageDataToArray(ctx.getImageData(0, 0, 1, 1));
	}

	function get2dContext(image, w, h, ratio) {
		w = w ? w * devicePixelRatio : image.width;
		h = h ? h * devicePixelRatio : image.height;
		var canvas = document.createElement("canvas");
		canvas.setAttribute('width', w);
		canvas.setAttribute('height', h);
		var context = canvas.getContext('2d');
		context.drawImage(image, 0, 0, image.width * ratio, image.height * ratio);
		context.pixelAt = function(x, y) { return imageDataToArray(context.getImageData(x, y, 1, 1)); }
		context.color = testColor;
		return Promise.resolve(context);
	}

	function Selenium(promise) {
		function wrap(f) { return Selenium(promise.then(f)); }

		function postPromise() {
			var a = [].slice.call(arguments);
			return wrap(function() {
				return post.apply(null, a);
			});
		}

		function flush() {
			return new Promise(function(resolve, reject) {
				requestAnimationFrame(resolve);
			});
		}

		function screenshot() {
			return promise.then(flush).then(function() { return getImage('screenshot'); });
		}

		function canvas(w, h, ratio) {
			return screenshot().then(function(image) {
				return get2dContext(image, w, h, ratio);
			});
		}

		function then(success, fail) { return Selenium(promise.then(success, fail)); }

		var s = {
			screenshot: screenshot,
			canvas: function(w, h) { return canvas(w, h, 1 / devicePixelRatio); },
			title: function() { return get('title'); },
			element: function() { return elementSelector(SINGLE, 'element', promise); },
			elements: function() { return elementSelector(MULTIPLE, 'elements', promise); },
			active: function() { return wrap(function() { return post('element/active').then(function(e) { return getElement(e.value); }); }); },
			click: function(btn) { return post((typeof(btn) == "object" ? 'element/' + btn.id + '/' : '') + 'click', { button: btn }); },
			moveToElement: function(element, xOfs, yOfs) { return postPromise('moveto', { element: element.id, xoffset: xOfs, yoffset: yOfs }); },
			moveBy: function(xOfs, yOfs) { return postPromise('moveto', { xoffset: xOfs, yoffset: yOfs }); },
			buttonDown: function(btn) { return postPromise('buttondown', { button: btn || LEFT }); },
			buttonUp: function(btn) { return postPromise('buttonup', { button: btn || LEFT }); },
			keys: function(keys) { return postPromise('keys', { value: keys}); },
			orientation: function() { return get('orientation'); },
			doubleClick: function(btn) { return postPromise('doubleclick', { button: btn }); },
			touchDown: function(x, y) { return postPromise('touch/down', { x: x, y: y}); },
			touchUp: function(x, y) { return postPromise('touch/up', { x: x, y: y}); },
			touchMove: function(x, y) { return postPromise('touch/move', { x: x, y: y}); },
			scroll: function(xOfs, yOfs) { return postPromise('touch/scroll', { xoffset: xOfs, yoffset: yOfs }); },
			flick: function(xSpeed, ySpeed) { return postPromise('touch/flick', { xspeed: xSpeed, yspeed: ySpeed }); },
			wait: function(millis) { return wrap(function() { return new Promise(function(resolve, reject) { setTimeout(resolve, millis); }); }); },
			then: then,
			flush: flush
		};

		return s;
	}

	return Selenium(Promise.resolve());
});
