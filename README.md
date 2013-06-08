
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
			return $each(this.getChildren(), function(child, i) {
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
