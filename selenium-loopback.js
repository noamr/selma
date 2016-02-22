define(['jquery'], function($) {
	var endpoint = window.seleniumConfig.endpoint;

	function ajax(method, path, data, type) {
		path = endpoint + '/' + path;
		return new Promise(function(resolve, reject) {
			$.ajax({
				url: path,
				data: data ? JSON.stringify(data) : null,
				method: method,
				dataType: 'json',
				success: resolve,
				error: function(xhr, status, error) {
					reject({ status: status, error: error});
				}
			});
		});
	}

	function get(path) { return ajax("GET", path, null).then(function(j) {
		return new Promise(function(resolve, reject) {
				resolve(j.value);
			});
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

	function getBool(path) {
		return ajax("GET", path)
		.then(function(v) {
			return new Promise(function(resolve, reject) {
				resolve(v === "true");
			});
		});
	}

	function selectElements(options, prefix) {
		prefix = prefix || '';
		if (!options.multiple) {
			return post(prefix).then(getElement);
		} else {
			post(prefix + 's').then(function(a) {
				return new Promise(function(resolve, reject) {
					resolve(a.map(transformElement));
				});
			})
		}
	}

	function transformElement(webElement) {
		var id = webElement.ELEMENT;
		var prefix = 'element/' + id + '/';

		return {
			id: id,
			select: function(options) { return selectElements(options, prefix); },
			click: function() { return post(prefix + 'click'); },
			submit: function() { return post(prefix + 'submit'); },
			text: function() { return get(prefix + 'text'); },
			keys: function(keys) { return post(prefix + 'value', keys); },
			tagName: function() { return get(prefix + 'name'); },
			clear: function() { return post(prefix + 'clear'); },
			selected: function() { return getBool(prefix + 'selected'); },
			enabled: function() { return getBool(prefix + 'enabled'); },
			attribute: function(a) { return get(prefix + 'attribute/' + a); },
			equals: function(otherElement) { return getBool(prefix + 'equals/' + otherElement.id); },
			displayed: function() { return getBool(prefix + 'displayed'); },
			location: function() { return get(prefix + 'location'); },
			size: function() { return get(prefix + 'size'); },
			css: function(p) { return get(prefix + 'css/' + p); },
			tap: function() { return post('touch/click', {element: id})},
			scroll: function(xOffset, yOffset) { return post('touch/scroll', {element: id, xoffset: xOffset, yoffset: yOffset}); },
			doubleTap: function() { return post('touch/doubleclick', {element: id}); },
			longTap: function() { return post('touch/longclick', {element: id}); },
			flick: function(xOffset, yOffset, speed) { return post('touch/flick', {element: id, xoffset: xOffset, yoffset: yOffset}); }
		};

	}

	function getElement(webElement) {
		return new Promise(function(resolve, reject) {
			resolve(transformElement(webElement));
		});
	}

	function get2dContext(image) {
		var canvas = document.createElement("canvas");
		canvas.setAttribute('width', image.width);
		canvas.setAttribute('height', image.height);
		var context = canvas.getContext('2d');
		context.drawImage(image, 0, 0);
		return new Promise(function(resolve, reject) {
			resolve(context);
		});
	}

	return {
		screenshot: function() { return getImage('screenshot'); },
		canvas: function() { return this.screenshot().then(get2dContext);},
		title: function() { return get('title'); },
		select: function(options) { return selectElements(options); },
		active: function() { return get('element/active').then(getElement); },
		keys: function(keys) { return post('keys', keys); },
		orientation: function() { return get('orientation'); },
		click: function(btn) { return post('click', { button: btn }); },
		buttonDown: function(btn) { return post('buttondown', { button: btn}); },
		buttonUp: function(btn) { return post('buttonup', { button: btn }); },
		doubleClick: function(btn) { return post('doubleclick', { button: btn }); },
		touchDown: function(x, y) { return post('touch/down', { x: x, y: y}); },
		touchUp: function(x, y) { return post('touch/up', { x: x, y: y}); },
		touchMove: function(x, y) { return post('touch/move', { x: x, y: y}); },
		scroll: function(xOfs, yOfs) { return post('touch/scroll', { xoffset: xOfs, yoffset: yOfs }); },
		flick: function(xSpeed, ySpeed) { return post('touch/flick', { xspeed: xSpeed, yspeed: ySpeed }); }
	};
});