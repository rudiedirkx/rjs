
RJS
====

See the example code in index.html and check out
http://jsfiddle.net/rudiedirkx/xBKGe/show/ for an outdated
version.

Examples
----

DOMReady

	document.on('ready', domReadyHandler);
	$(domReadyHandler);

One element by id:

	// r === $
    el = r('id');
    el = $('id');
	el = document.getElement('#id');
	el = $('#id', true);

One element by selector:

	el = document.getElement('body > .foo');
	el = $('body > .foo', true);

All elements by selector:

	els = $$('div');
	els = document.getElements('div');

Find `<TH>`s in a `<TR>`:

	tr = ...
	ths = tr.getElements('th');

Extend element methods:

	Element.extend({
		zebra: function() {
			return this.getChildren().each(function(child, i) {
				var cn = i%2 == 0 ? 'odd' : 'even';
				child.addClass(cn);
			});
		}
	});
	$('some-tbody').zebra();

Handle click event:

	$$('#foo img').on('click', function(e) {
		e.preventDefault();
		e.stopPropagation();
		var img = this;
		alert('Clicked on ' + img.nodeName + ': ' + e.subjectXY.x + ', ' + e.subjectXY.y);
	});

Handle propagated click event:

	$('foo').on('click', 'img', function(e) {
		var img = this;
		alert('Clicked on ' + img.nodeName + ': ' + e.subjectXY.x + ', ' + e.subjectXY.y);
	});

Create DOM elements and use them immediately:

	document.el('pre', {lang: 'javascript'}).addClass('debug').inject(document.body);

Create tooltips from [title] attributes:

	$$('[title]').on('mouseenter', function(e) {
		var tt = $('tooltip') || document.el('div', {id: 'tooltip'}).css({
				position: 'absolute',
				background: 'red',
				color: 'white',
				padding: '10px'
			}).inject(document.body),
			text = this.data('title');
		tt.show().setText(text);
	}).on('mouseleave', function(e) {
		$('tooltip').hide();
	}).on('mousemove', function(e) {
		// e.pageXY is a Coords2D, toCSS() makes left & top from x & y
		$('tooltip').css(e.pageXY.add(new Coords2D(15, 15)).toCSS());
	}).data('title', function() {
		return this.attr('title');
	}).attr('title', null);

Add global Ajax handlers

	window.on('xhrStart', function(e) {
		var xhr = e.target;
		$('loading').show();
	});
	window.on('xhrDone', function(e) {
		var xhr = e.target;
		$('loading').hide();
	});

Ajax with 'done' callback (always, no matter the response code):

	$.get('/some/url').on('done', function(rsp) {
		alert(rsp);
	});

Ajax with specific callbacks:

	$.get('/some/url').on('success', function(rsp) {
		alert('Woohoo: ' + rsp);
	}).on('error', function(rsp) {
		alert('Error [' + this.status + ']: ' + rsp);
	});

Ajax some FormData to the server and query upload progress:

	fd = new FormData($('some-form'));
	$.post('/some/url', fd).on('progress', function(e) {
		console.log('some progress...', e);
	}).on('done', function(e) {
		console.log('done!', e);
	});

Ajax delete something:

	$.xhr('/movie/14/comments', {method: 'delete'}).on('success', function(e) {
		console.log('deleted something!', e);
	});

Extend HTML elements like this:

	// el.toggle already exists, but you get the point
	Element.extend({
		toggle: function() {
			return this.getStyle('display') == 'none' ? this.show() : this.hide();
		}
	});
	// This will now work for Element and Elements
	$('my-div').toggle();
	$$('.crazy-column').toggle();

Extend other classes like this:

	// r.extend === $.extend
	r.extend(AnyEvent, {
		stop: function() {
			this.preventDefault();
			this.stopPropagation();
		}
	});

Use attr2method for easy attr() access:

	Element.attr2method.click = function(value) {
		return this.on('click', value);
	};
	// Now you can:
	el.attr('click', function() { /* do stuff */ });

Use summary() if you're debugging events:

	document.on('keyup', function(e) {
		console.log(e.summary());
	});

Coordinates are now easy:

	$('my-img').on('click', function(e) {
		var C = e.subjectXY; // {x: Number, y: Number}
		// Place my red round 20*20px marker there
		$('red-round-marker').css( C.subtract({x: 10, y: 10}).toCSS() ).show();
	});

And even easier. If you need a reverse():

	r.extend(Coords2D, {
		multiply: function(factor) {
			return new Coords2D(this.x * factor, this.y * factor);
		},
		reverse: function() {
			return this.multiply(-1);
		}
	});

Use Event.Keys to remember (or not) key codes:

	// Don't do this =)
	document.on('keyup', function(e) {
		// I HATE it when spacebar makes me scroll down
		var input = e.target.is('input, select, textarea, a, [tabindex]'),
			space = e.key == Event.Keys.space;
		if ( space && !input ) {
			// I'm not sure this would actually stop it...
			e.preventDefault();
		}
	});

Custom events (or hooks if you want):

	Event.Custom.change = {
		// See Event.Custom.ready.before and Event.Custom.progress.before for example
		before: function(options) {
			// Someone's attaching an onchange listener to `this`.
			// We'll see about that:
			return Math.random() > 0.5; // false will stop adding the listener
		},
		// See Event.Custom.directchange.filter for example
		filter: function(e) {
			// Someone's triggered an onchange listener on `this`.
			// We'll see about that:
			return Math.random() > 0.5; // false will stop calling attached listeners
		}
	};

If you include Sortable, you have a very simple drag sortable:

	// More examples in rjs.sortable.js
	$('some-tbody').sortable(options).on('sortableEnd', onSortableEnd);
