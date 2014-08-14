
(function(W, D) {

	"use strict";

	// try {

	var html = D.documentElement,
		head = html.getElementsByTagName('head')[0];

	var r = function r( id, sel ) {
		return r.$(id, sel);
	};

	/* <json_alias */
	JSON.encode = JSON.stringify;
	JSON.decode = JSON.parse;
	/* json_alias> */

	/* <domready */
	var domReadyAttached = false;
	/* domready> */

	/* <element_show */
	var cssDisplays = {};
	/* element_show> */

	/* <ifsetor */
	r.ifsetor = function(pri, sec) {
		return pri !== undefined ? pri : sec;
	};
	/* ifsetor> */

	r.arrayish = function(obj) {
		return obj instanceof Array || ( typeof obj.length == 'number' && typeof obj != 'string' && ( obj[0] !== undefined || obj.length === 0 ) );
	};

	/* <array */
	r.array = function(list) {
		var arr = [];
		r.each(list, function(el, i) {
			arr.push(el);
		});
		return arr;
	};
	/* array> */

	/* <class */
	r.class = function(obj) {
		var code = String(obj.constructor);
		return code.match(/ (.+?)[\(\]]/)[1];
	};
	/* class> */

	/* <is_a */
	r.is_a = function(obj, type) {
		return W[type] && obj instanceof W[type];
	};
	/* is_a> */

	/* <serialize */
	r.serialize = function(o, prefix) {
		var q = [];
		r.each(o, function(v, k) {
			var name = prefix ? prefix + '[' + k + ']' : k,
			v = o[k];
			if ( typeof v == 'object' ) {
				q.push(r.serialize(v, name));
			}
			else {
				q.push(name + '=' + encodeURIComponent(v));
			}
		});
		return q.join('&');
	};
	/* serialize> */

	/* <copy */
	r.copy = function(obj) {
		return JSON.parse(JSON.stringify(obj));
	};
	/* copy> */

	/* <merge */
	r.merge = function(base) {
		var merger = function(value, name) {
			base[name] = value;
		};
		for ( var i=1, L=arguments.length; i<L; i++ ) {
			r.each(arguments[i], merger);
		}
		return base;
	};
	/* merge> */


	r.each = function(source, callback, context) {
		if ( r.arrayish(source) ) {
			for ( var i=0, L=source.length; i<L; i++ ) {
				callback.call(context, source[i], i, source);
			}
		}
		else {
			for ( var k in source ) {
				if ( source.hasOwnProperty(k) ) {
					callback.call(context, source[k], k, source);
				}
			}
		}

		return source;
	};

	r.extend = function(Hosts, proto, Super) {
		if ( !(Hosts instanceof Array) ) {
			Hosts = [Hosts];
		}

		r.each(Hosts, function(Host) {
			if ( Super ) {
				Host.prototype = Super;
				Host.prototype.constructor = Host;
			}

			var methodOwner = Host.prototype ? Host.prototype : Host;
			r.each(proto, function(fn, name) {
				methodOwner[name] = fn;

				/* <elements_invoke */
				if ( Host == Element && !Elements.prototype[name] ) {
					Elements.prototype[name] = function() {
						return this.invoke(name, arguments);
					};
				}
				/* elements_invoke> */
			});
		});
	};

	/* <getter */
	r.getter = function(Host, prop, getter) {
		Object.defineProperty(Host.prototype, prop, {get: getter});
	};
	/* getter> */

	r.extend(Array, {
		/* <array_invoke */
		invoke: function(method, args) {
			var results = [];
			this.forEach(function(el) {
				results.push( el[method].apply(el, args) );
			});
			return results;
		},
		/* array_invoke> */

		/* <array_contains */
		contains: function(obj) {
			return this.indexOf(obj) != -1;
		},
		/* array_contains> */

		/* <array_unique */
		unique: function() {
			var els = [];
			this.forEach(function(el) {
				if ( !els.contains(el) ) {
					els.push(el);
				}
			});
			return els;
		},
		/* array_unique> */

		/* <array_each */
		each: Array.prototype.forEach,
		/* array_each> */

		/* <array_firstlast */
		first: function() {
			return this[0];
		},
		last: function() {
			return this[this.length-1];
		},
		/* array_firstlast> */

		/* <array_intersect */
		intersect: function(arr2) {
			return this.filter(function(el) {
				return arr2.contains(el);
			});
		},
		/* array_intersect> */

		/* <array_diff */
		diff: function(arr2) {
			return this.filter(function(el) {
				return !arr2.contains(el);
			});
		}
		/* array_diff> */
	});
	/* <array_defaultfilter */
	Array.defaultFilterCallback = function(item) {
		return !!item;
	};
	/* array_defaultfilter> */

	r.extend(String, {
		/* <string_camel */
		camel: function() {
			// foo-bar => fooBar, -ms-foo => MsFoo
			return this.replace(/\-([^\-])/g, function(a, m) {
				return m.toUpperCase();
			});
		},
		uncamel: function() {
			return this.replace(/([A-Z])/g, function(a, m) {
				return '-' + m.toLowerCase();
			});
		},
		/* string_camel> */

		/* <string_repeat */
		repeat: function(num) {
			return new Array(num+1).join(this);
		}
		/* string_repeat> */
	});

	var indexOf = [].indexOf;

	/* <_classlist */
	if (!('classList' in html)) {
		var push = [].push;
		W.DOMTokenList = function DOMTokenList(el) {
			this._el = el;
			el.$classList = this;
			this._reinit();
		};
		r.extend(W.DOMTokenList, {
			_reinit: function() {
				// Empty
				this.length = 0;

				// Fill
				var classes = this._el.className.trim();
				classes = classes ? classes.split(/\s+/g) : [];
				for ( var i=0, L=classes.length; i<L; i++ ) {
					push.call(this, classes[i]);
				}

				return this;
			},
			set: function() {
				this._el.className = [].join.call(this, ' ');
			},
			add: function(token) {
				if ( !this.contains(token) ) {
					push.call(this, token);
					this.set();
				}
			},
			contains: function(token) {
				return indexOf.call(this, token) !== -1;
			},
			item: function(index) {
				return this[index] || null;
			},
			remove: function(token) {
				var i = indexOf.call(this, token);
				if ( i != -1 ) {
					[].splice.call(this, i, 1);
					this.set();
				}
			},
			toggle: function(token, add) {
				if ( add == null ) {
					add = !this.contains(token);
				}

				if ( add ) {
					return !this.add(token);
				}

				return !!this.remove(token);
			}
		});

		r.getter(Element, 'classList', function() {
			return this.$classList ? this.$classList._reinit() : new W.DOMTokenList(this);
		});
	}
	/* _classlist> */

	/* <asset_js */
	r.js = function(src) {
		if ( r.arrayish(src) ) {
			var evt = new Eventable(src),
				need = src.length,
				have = 0,
				onLoad = function(e) {
					if ( ++have == need ) {
						evt.fire('load', e);
					}
				},
				onError = function(e) {
					evt.fire('error', e);
				};
			src.forEach(function(url) {
				r.js(url).on('load', onLoad).on('error', onError);
			});
			return evt;
		}

		return D.el('script', {src: src, type: 'text/javascript'}).inject(head);
	};
	/* asset_js> */

	/* <elements */
	function Elements(source, selector) {
		this.length = 0;
		if ( source ) {
			r.each(source, function(el, i) {
				if ( el.nodeType === 1 && ( !selector || el.is(selector) ) ) {
					this.push(el);
				}
			}, this);
		}
	}
	r.extend(Elements, {
		/* <elements_invoke */
		invoke: function(method, args) {
			var returnSelf = false,
				res = [],
				isElements = false;
			r.each(this, function(el, i) {
				var retEl = el[method].apply(el, args);
				res.push( retEl );
				if ( retEl == el ) returnSelf = true;
				if ( retEl instanceof Element ) isElements = true;
			});
			return returnSelf ? this : ( isElements || !res.length ? new Elements(res) : res );
		},
		/* elements_invoke> */

		filter: function(filter) {
			if ( typeof filter == 'function' ) {
				return new Elements([].filter.call(this, filter));
			}
			return new Elements(this, filter);
		}
	}, new Array);
	/* elements> */

	/* <coords2d */
	function Coords2D(x, y) {
		this.x = x;
		this.y = y;
	}
	r.extend(Coords2D, {
		/* <coords2d_add */
		add: function(coords) {
			return new Coords2D(this.x + coords.x, this.y + coords.y);
		},
		/* coords2d_add> */

		/* <coords2d_subtract */
		subtract: function(coords) {
			return new Coords2D(this.x - coords.x, this.y - coords.y);
		},
		/* coords2d_subtract> */

		/* <coords2d_tocss */
		toCSS: function() {
			return {
				left: this.x + 'px',
				top: this.y + 'px'
			};
		},
		/* coords2d_tocss> */

		/* <coords2d_join */
		join: function(glue) {
			if ( glue == null ) {
				glue = ',';
			}
			return [this.x, this.y].join(glue);
		},
		/* coords2d_join> */

		/* <coords2d_equal */
		equal: function(coord) {
			return this.join() == coord.join();
		}
		/* coords2d_equal> */
	});
	/* coords2d> */

	/* <anyevent */
	function AnyEvent(e) {
		if ( typeof e == 'string' ) {
			this.originalEvent = null;
			e = {"type": e, "target": null};
		}
		else {
			this.originalEvent = e;
		}

		this.type = e.type;
		this.target = e.target || e.srcElement;
		this.relatedTarget = e.relatedTarget;
		this.fromElement = e.fromElement;
		this.toElement = e.toElement;
		// this.which = e.which;
		// this.keyCode = e.keyCode;
		this.key = e.keyCode || e.which;
		this.alt = e.altKey;
		this.ctrl = e.ctrlKey;
		this.shift = e.shiftKey;
		this.button = e.button || e.which;
		/* <anyevent_lmrclick */
		this.leftClick = this.button == 1;
		this.rightClick = this.button == 2;
		this.middleClick = this.button == 4 || this.button == 1 && this.key == 2;
		this.leftClick = this.leftClick && !this.middleClick;
		/* anyevent_lmrclick> */
		this.which = this.key || this.button;
		this.detail = e.detail;

		this.pageX = e.pageX;
		this.pageY = e.pageY;
		this.clientX = e.clientX;
		this.clientY = e.clientY;

		/* <anyevent_touches */
		this.touches = e.touches ? r.array(e.touches) : null;

		if ( this.touches && this.touches[0] ) {
			this.pageX = this.touches[0].pageX;
			this.pageY = this.touches[0].pageY;
		}
		/* anyevent_touches> */

		/* <anyevent_pagexy */
		if ( this.pageX != null && this.pageY != null ) {
			this.pageXY = new Coords2D(this.pageX, this.pageY);
		}
		else if ( this.clientX != null && this.clientY != null ) {
			this.pageXY = new Coords2D(this.clientX, this.clientY).add(W.getScroll());
		}
		/* anyevent_pagexy> */

		this.data = e.dataTransfer || e.clipboardData;
		this.time = e.timeStamp || e.timestamp || e.time || Date.now();

		this.total = e.total || e.totalSize;
		this.loaded = e.loaded || e.position;
	}
	r.extend(AnyEvent, {
		/* <anyevent_summary */
		summary: function(prefix) {
			if ( prefix == null ) {
				prefix = '';
			}
			var summary = [];
			r.each(this, function(value, name) {
				var original = value;
				if ( original && r.is_a(original, 'Coords2D') ) {
					value = original.join();
				}
				else if ( original && typeof original == 'object' ) {
					value = r.class(value);
					if ( original instanceof Event || name == 'touches' || typeof name == 'number' ) {
						value += ":\n" + AnyEvent.prototype.summary.call(original, prefix + '  ');
					}
				}
				summary.push(prefix + name + ' => ' + value);
			});
			return summary.join("\n");
		},
		/* anyevent_summary> */

		preventDefault: function(e) {
			if ( e = this.originalEvent ) {
				e.preventDefault();
			}
			this.defaultPrevented = true;
		},
		stopPropagation: function(e) {
			if ( e = this.originalEvent ) {
				e.stopPropagation();
			}
			this.propagationStopped = true;
		},
		stopImmediatePropagation: function(e) {
			this.stopPropagation();

			if ( e = this.originalEvent ) {
				e.stopImmediatePropagation();
			}
			this.immediatePropagationStopped = true;
		},

		/* <anyevent_subject */
		setSubject: function(subject) {
			this.subject = subject;
			if ( this.pageXY ) {
				this.subjectXY = this.pageXY;
				if ( this.subject.getPosition ) {
					this.subjectXY = this.subjectXY.subtract(this.subject.getPosition());
				}
			}
		}
		/* anyevent_subject> */
	});
	/* anyevent> */

	/* <event_keys */
	Event.Keys = {enter: 13, up: 38, down: 40, left: 37, right: 39, esc: 27, space: 32, backspace: 8, tab: 9, "delete": 46};
	/* event_keys> */

	/* <event_custom */
	Event.Custom = {
		/* <_event_custom_mousenterleave */
		mouseenter: {
			type: 'mouseover',
			filter: function(e) {
				return e.fromElement != this && !this.contains(e.fromElement);
			}
		},
		mouseleave: {
			type: 'mouseout',
			filter: function(e) {
				return e.toElement != this && !this.contains(e.toElement);
			}
		},
		/* _event_custom_mousenterleave> */

		/* <event_custom_mousewheel */
		mousewheel: {
			type: 'onmousewheel' in W ? 'mousewheel' : 'mousescroll'
		},
		/* event_custom_mousewheel> */

		/* <event_custom_directchange */
		directchange: {
			type: 'keyup',
			filter: function(e) {
				var lastValue = this._dc == null ? this.defaultValue : this._dc,
					currentValue = this.value;
				this._dc = currentValue;
				return lastValue == null || lastValue != currentValue;
			}
		}
		/* event_custom_directchange> */
	};

	/* <_event_custom_mousenterleave */
	if ( 'onmouseenter' in html ) {
		delete Event.Custom.mouseenter;
	}
	if ( 'onmouseleave' in html ) {
		delete Event.Custom.mouseleave;
	}
	/* _event_custom_mousenterleave> */
	/* event_custom> */

	/* <native_extend */
	r.each([
		W,
		D,
		Element,
		/* <elements */
		Elements
		/* elements> */
	], function(Host) {
		Host.extend = function(methods) {
			r.extend([this], methods);
		};
	});
	/* native_extend> */

	/* <eventable */
	function Eventable(subject) {
		this.subject = subject;
		this.time = Date.now();
	}
	r.extend(Eventable, {
		/* <eventable_on */
		on: function(eventType, matches, callback) {
			if ( !callback ) {
				callback = matches;
				matches = null;
			}

			var options = {
				bubbles: !!matches,
				subject: this || W
			};

			var baseType = eventType,
				customEvent;
			if ( customEvent = Event.Custom[eventType] ) {
				if ( customEvent.type ) {
					baseType = customEvent.type;
				}
			}

			var onCallback = function(e, arg2) {
				if ( e && !(e instanceof AnyEvent) ) {
					e = new AnyEvent(e);
				}

				// Find event subject
				var subject = options.subject;
				if ( e && e.target && matches ) {
					if ( !(subject = e.target.selfOrAncestor(matches)) ) {
						return;
					}
				}

				// Custom event type filter
				if ( customEvent && customEvent.filter ) {
					if ( !customEvent.filter.call(subject, e, arg2) ) {
						return;
					}
				}

				/* <anyevent_subject */
				if ( !e.subject ) {
					e.setSubject(subject);
				}
				/* anyevent_subject> */
				return callback.call(subject, e, arg2);
			};

			if ( customEvent && customEvent.before ) {
				if ( customEvent.before.call(this, options) === false ) {
					return this;
				}
			}

			var events = options.subject.$events || (options.subject.$events = {});
			events[eventType] || (events[eventType] = []);
			events[eventType].push({
				type: baseType,
				original: callback,
				callback: onCallback,
				bubbles: options.bubbles
			});

			if ( options.subject.addEventListener ) {
				options.subject.addEventListener(baseType, onCallback, options.bubbles);
			}

			return this;
		},
		/* eventable_on> */

		/* <eventable_off */
		off: function(eventType, callback) {
			if ( this.$events && this.$events[eventType] ) {
				var events = this.$events[eventType],
					changed = false;
				r.each(events, function(listener, i) {
					if ( !callback || callback == listener.original ) {
						changed = true;
						delete events[i];
						if ( this.removeEventListener ) {
							this.removeEventListener(listener.type, listener.callback, listener.bubbles);
						}
					}
				}, this);
				if ( changed ) {
					this.$events[eventType] = events.filter(Array.defaultFilterCallback);
				}
			}
			return this;
		},
		/* eventable_off> */

		/* <eventable_fire */
		fire: function(eventType, e, arg2) {
			if ( this.$events && this.$events[eventType] ) {
				if ( !e ) {
					e = new AnyEvent(eventType);
				}
				var immediatePropagationStopped = false;
				r.each(this.$events[eventType], function(listener) {
					if ( !immediatePropagationStopped ) {
						listener.callback.call(this, e, arg2);
						immediatePropagationStopped |= e.immediatePropagationStopped;
					}
				}, this);
			}
			return this;
		},
		/* eventable_fire> */

		/* <eventable_globalfire */
		globalFire: function(globalType, localType, originalEvent, arg2) {
			var e = originalEvent ? originalEvent : new AnyEvent(localType),
				eventType = (globalType + '-' + localType).camel();
			e.target = e.subject = this;
			e.type = localType;
			e.globalType = globalType;
			W.fire(eventType, e, arg2);
			return this;
		}
		/* eventable_globalfire> */
	});
	/* eventable> */

	/* <native_eventable */
	r.extend([W, D, Element, XMLHttpRequest], Eventable.prototype);
	if ( W.XMLHttpRequestUpload ) {
		r.extend([W.XMLHttpRequestUpload], Eventable.prototype);
	}
	/* native_eventable> */

	r.extend(Node, {
		/* <element_ancestor */
		ancestor: function(selector) {
			var el = this;
			while ( (el = el.parentNode) && el != D ) {
				if ( el.is(selector) ) {
					return el;
				}
			}
		},
		/* element_ancestor> */

		/* <element_siblings */
		getNext: function(selector) {
			/* <element_is */
			if ( !selector ) {
				/* element_is> */
				return this.nextElementSibling;
				/* <element_is */
			}

			var sibl = this;
			while ( (sibl = sibl.nextElementSibling) && !sibl.is(selector) );
			return sibl;
			/* element_is> */
		},
		getPrev: function(selector) {
			/* <element_is */
			if ( !selector ) {
				/* element_is> */
				return this.previousElementSibling;
				/* <element_is */
			}

			var sibl = this;
			while ( (sibl = sibl.previousElementSibling) && !sibl.is(selector) );
			return sibl;
			/* element_is> */
		},
		/* element_siblings> */

		/* <element_remove */
		remove: function() {
			return this.parentNode.removeChild(this);
		},
		/* element_remove> */

		/* <element_parent */
		getParent: function() {
			return this.parentNode;
		},
		/* element_parent> */

		/* <element_insertafter */
		insertAfter: function(el, ref) {
			var next = ref.nextSibling; // including Text
			if ( next ) {
				return this.insertBefore(el, next);
			}
			return this.appendChild(el);
		},
		/* element_insertafter> */

		/* <element_index */
		nodeIndex: function() {
			return indexOf.call(this.parentNode.childNodes, this);
		}
		/* element_index> */
	});

	/* <document_el */
	r.extend(D, {
		el: function(tagName, attrs) {
			var el = this.createElement(tagName);
			if ( attrs ) {
				el.attr(attrs);
			}
			return el;
		}
	});
	/* document_el> */

	/* <element_attr2method */
	Element.attr2method = {
		/* <element_attr2method_html */
		html: function(value) {
			return value == null ? this.getHTML() : this.setHTML(value);
		},
		/* element_attr2method_html> */

		/* <element_attr2method_text */
		text: function(value) {
			return value == null ? this.getText() : this.setText(value);
		}
		/* element_attr2method_text> */
	};
	/* element_attr2method> */

	var EP = Element.prototype;
	r.extend(Element, {
		/* <element_prop */
		prop: function(name, value) {
			if ( value !== undefined ) {
				this[name] = value;
				return this;
			}

			return this[name];
		},
		/* element_prop> */

		/* <element_is */
		is: EP.matches || EP.matchesSelector || EP.webkitMatchesSelector || EP.mozMatchesSelector || EP.msMatchesSelector || function(selector) {
			return $$(selector).contains(this);
		},
		/* element_is> */

		/* <element_value */
		getValue: function(force) {
			if ( !this.disabled || force ) {
				if ( this.nodeName == 'SELECT' && this.multiple ) {
					return [].reduce.call(this.options, function(values, option) {
						if ( option.selected ) {
							values.push(option.value);
						}
						return values;
					}, []);
				}
				else if ( this.type == 'radio' || this.type == 'checkbox' && !this.checked ) {
					return;
				}
				return this.value;
			}
		},
		/* element_value> */

		/* <element_toquerystring */
		toQueryString: function() {
			var els = this.getElements('input[name], select[name], textarea[name]'),
				query = [];
			els.forEach(function(el) {
				var value = el.getValue();
				if ( value instanceof Array ) {
					value.forEach(function(val) {
						query.push(el.name + '=' + encodeURIComponent(val));
					});
				}
				else if ( value != null ) {
					query.push(el.name + '=' + encodeURIComponent(value));
				}
			});
			return query.join('&');
		},
		/* element_toquerystring> */

		/* <element_ancestor */
		selfOrAncestor: function(selector) {
			return this.is(selector) ? this : this.ancestor(selector);
		},
		/* element_ancestor> */

		/* <element_children */
		getChildren: function(selector) {
			return new Elements(this.children || this.childNodes, selector);
		},
		/* element_children> */

		/* <element_firstlast */
		getFirst: function() {
			if ( this.firstElementChild !== undefined ) {
				return this.firstElementChild;
			}

			return this.getChildren().first();
		},
		getLast: function() {
			if ( this.lastElementChild !== undefined ) {
				return this.lastElementChild;
			}

			return this.getChildren().last();
		},
		/* element_firstlast> */

		/* <element_attr */
		attr: function(name, value, prefix) {
			if ( prefix == null ) {
				prefix = '';
			}
			if ( value === undefined ) {
				// Get single attribute
				if ( typeof name == 'string' ) {
					/* <element_attr2method */
					if ( Element.attr2method[prefix + name] ) {
						return Element.attr2method[prefix + name].call(this, value, prefix);
					}
					/* element_attr2method> */

					return this.getAttribute(prefix + name);
				}

				// (un)set multiple attributes
				r.each(name, function(value, name) {
					if ( value === null ) {
						this.removeAttribute(prefix + name);
					}
					else {
						/* <element_attr2method */
						if ( Element.attr2method[prefix + name] ) {
							return Element.attr2method[prefix + name].call(this, value, prefix);
						}
						/* element_attr2method> */

						this.setAttribute(prefix + name, value);
					}
				}, this);
			}
			// Unset single attribute
			else if ( value === null ) {
				this.removeAttribute(prefix + name);
			}
			// Set single attribute
			else {
				if ( typeof value == 'function' ) {
					value = value.call(this, this.getAttribute(prefix + name));
				}

				/* <element_attr2method */
				if ( Element.attr2method[prefix + name] ) {
					return Element.attr2method[prefix + name].call(this, value, prefix);
				}
				/* element_attr2method> */

				this.setAttribute(prefix + name, value);
			}

			return this;
		},
		/* element_attr> */

		/* <element_data */
		data: function(name, value) {
			return this.attr(name, value, 'data-');
		},
		/* element_data> */

		/* <element_html */
		getHTML: function() {
			return this.innerHTML;
		},
		setHTML: function(html) {
			this.innerHTML = html;
			return this;
		},
		/* element_html> */

		/* <element_text */
		getText: function() {
			return this.innerText || this.textContent;
		},
		setText: function(text) {
			this.textContent = this.innerText = text;
			return this;
		},
		/* element_text> */

		getElement: function(selector) {
			return this.querySelector(selector);
		},

		/* <elements */
		getElements: function(selector) {
			return $$(this.querySelectorAll(selector));
		},
		/* elements> */

		/* <element_by_text */
		getElementsByText: function(text, simple) {
			return this.getElements('*').filter(function(el) {
				if ( simple || el.children.length == 0 ) {
					var tc = simple ? el.textContent.trim() : el.textContent;
					return tc === text;
				}

				return false;
			});
		},
		getElementByText: function(text, simple) {
			return this.getElementsByText(text, simple)[0];
		},
		/* element_by_text> */

		/* <element_class */
		removeClass: function(token) {
			this.classList.remove(token);
			return this;
		},
		addClass: function(token) {
			this.classList.add(token);
			return this;
		},
		toggleClass: function(token, add) {
			this.classList.toggle.apply(this.classList, arguments);
			return this;
		},
		replaceClass: function(before, after) {
			return this.removeClass(before).addClass(after);
		},
		hasClass: function(token) {
			return this.classList.contains(token);
		},
		/* element_class> */

		/* <element_inject */
		injectBefore: function(ref) {
			ref.parentNode.insertBefore(this, ref);
			return this;
		},
		injectAfter: function(ref) {
			ref.parentNode.insertAfter(this, ref);
			return this;
		},
		inject: function(parent) {
			parent.appendChild(this);
			return this;
		},
		appendTo: function(parent) {
			return this.inject(parent); // Alias for inject()
		},
		injectTop: function(parent) {
			if ( parent.firstChild ) {
				parent.insertBefore(this, parent.firstChild);
			}
			else {
				parent.appendChild(this);
			}
			return this;
		},
		/* element_inject> */

		/* <element_append */
		append: function(child) {
			if ( typeof child == 'string' ) {
				child = D.createTextNode(child);
			}
			this.appendChild(child);
			return this;
		},
		/* element_append> */

		/* <element_style */
		getStyle: function(property) {
			return getComputedStyle(this).getPropertyValue(property);
		},
		/* element_style> */

		/* <element_css */
		css: function(property, value) {
			if ( value === undefined ) {
				// Get single property
				if ( typeof property == 'string' ) {
					return this.getStyle(property);
				}

				// Set multiple properties
				r.each(property, function(value, name) {
					this.style[name] = value;
				}, this);
				return this;
			}

			// Set single property
			this.style[property] = value;
			return this;
		},
		/* element_css> */

		/* <element_show */
		show: function() {
			if ( !cssDisplays[this.nodeName] ) {
				var el = D.el(this.nodeName).inject(this.ownerDocument.body);
				cssDisplays[this.nodeName] = el.getStyle('display');
				el.remove();
			}
			return this.css('display', cssDisplays[this.nodeName]);
		},
		hide: function() {
			return this.css('display', 'none');
		},
		toggle: function(show) {
			if ( show == null ) {
				show = this.getStyle('display') == 'none';
			}

			return show ? this.show() : this.hide();
		},
		/* element_show> */

		/* <element_empty */
		empty: function() {
			try {
				this.innerHTML = '';
			}
			catch (ex) {
				while ( this.firstChild ) {
					this.removeChild(this.firstChild);
				}
			}
			return this;
		},
		/* element_empty> */

		/* <element_index */
		elementIndex: function() {
			return this.parentNode.getChildren().indexOf(this);
		},
		/* element_index> */

		/* <element_position */
		getPosition: function() {
			var bcr = this.getBoundingClientRect();
			return new Coords2D(bcr.left, bcr.top).add(W.getScroll());
		},
		/* element_position> */

		/* <element_scroll */
		getScroll: function() {
			return new Coords2D(this.scrollLeft, this.scrollTop);
		}
		/* element_scroll> */
	});

	r.extend(D, {
		getElement: Element.prototype.getElement,
		/* <elements */
		getElements: Element.prototype.getElements,
		/* elements> */
		/* <element_by_text */
		getElementsByText: Element.prototype.getElementsByText,
		getElementByText: Element.prototype.getElementByText,
		/* element_by_text> */
	});

	/* <windoc_scroll */
	r.extend([W, D], {
		getScroll: function() {
			return new Coords2D(
				D.documentElement.scrollLeft || D.body.scrollLeft,
				D.documentElement.scrollTop || D.body.scrollTop
			);
		}
	});
	/* windoc_scroll> */

	/* <domready */
	Event.Custom.ready = {
		before: function() {
			if ( this == D ) {
				if ( !domReadyAttached ) {
					attachDomReady();
				}
			}
		}
	};

	function attachDomReady() {
		domReadyAttached = true;

		D.on('DOMContentLoaded', function(e) {
			this.fire('ready');
		});
	}
	/* domready> */

	function $(id, selector) {
		/* <domready */
		if ( typeof id == 'function' ) {
			if ( D.readyState == 'interactive' || D.readyState == 'complete' ) {
				setTimeout(id, 1);
				return D;
			}

			return D.on('ready', id);
		}
		/* domready> */

		// By [id]
		if ( !selector ) {
			return D.getElementById(id);
		}

		// By selector
		return D.getElement(id);
	}

	/* <elements */
	function $$(selector) {
		return r.arrayish(selector) ? new Elements(selector) : D.getElements(selector);
	}
	/* elements> */

	/* <xhr */
	function XHR(url, options) {
		var defaults = {
			method: 'GET',
			async: true,
			send: true,
			data: null,
			url: url,
			requester: 'XMLHttpRequest',
			execScripts: true
		};
		options = options ? r.merge({}, defaults, options) : defaults;
		options.method = options.method.toUpperCase();

		var xhr = new XMLHttpRequest;
		xhr.open(options.method, options.url, options.async, options.username, options.password);
		xhr.options = options;
		xhr.on('load', function(e) {
			var success = this.status == 200,
				eventType = success ? 'success' : 'error',
				t = this.responseText;

			try {
				this.responseJSON = (t[0] == '[' || t[0] == '{') && JSON.parse(t);
			}
			catch (ex) {}
			var response = this.responseJSON || t;

			var scripts;

			// Collect <SCRIPT>s from probable HTML response
			if ( this.options.execScripts ) {
				scripts = [];
				if ( typeof response == 'string' ) {
					var regex = /<script[^>]*>([\s\S]*?)<\/script>/i,
						script;
					while ( script = response.match(regex) ) {
						response = response.replace(regex, '');
						if ( script = script[1].trim() ) {
							scripts.push(script);
						}
					}
				}
			}

			// Specific events
			this.fire(eventType, e, response);
			this.fire('done', e, response);

			// Execute collected <SCRIPT>s after specific callback, but before global
			if ( this.options.execScripts && scripts && scripts.length ) {
				scripts.forEach(function(code) {
					eval.call(W, code);
				});
			}

			/* <xhr_global */
			this.globalFire('xhr', eventType, e, response);
			this.globalFire('xhr', 'done', e, response);
			/* xhr_global> */
		});
		xhr.on('error', function(e) {
			this.fire('done', e);

			/* <xhr_global */
			this.globalFire('xhr', 'error', e);
			this.globalFire('xhr', 'done', e);
			/* xhr_global> */
		});
		if ( options.method == 'POST' ) {
			if ( !r.is_a(options.data, 'FormData') ) {
				var encoding = options.encoding ? '; charset=' + encoding : '';
				xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded' + encoding);
			}
		}
		if ( options.send ) {
			if ( options.requester ) {
				xhr.setRequestHeader('X-Requested-With', options.requester);
			}

			/* <xhr_global */
			xhr.globalFire('xhr', 'start');
			/* xhr_global> */
			xhr.fire('start');

			if ( options.async ) {
				setTimeout(function() {
					xhr.send(options.data);
				}, 1);
			}
			else {
				xhr.send(options.data);
			}
		}
		return xhr;
	}

	Event.Custom.progress = {
		before: function(options) {
			if ( this instanceof XMLHttpRequest && this.upload ) {
				options.subject = this.upload;
			}
		}
	};

	function shortXHR(method) {
		return function(url, data, options) {
			if ( !options ) {
				options = {};
			}
			options.method = method;
			options.data = data;
			var xhr = XHR(url, options);
			return xhr;
		};
	}
	/* xhr> */



	// Expose to `r` & `$`
	r.$ = $;
	W.$ = W.r = r;

	/* <elements */
	r.$$ = $$;
	/* elements> */

	/* <xhr */
	r.xhr = XHR;
	r.get = shortXHR('get');
	r.post = shortXHR('post');
	/* xhr> */

	/* <elements */
	W.$$ = $$;
	W.Elements = Elements;
	/* elements> */

	/* <anyevent */
	W.AnyEvent = AnyEvent;
	/* anyevent> */

	/* <eventable */
	W.Eventable = Eventable;
	/* eventable> */

	/* <coords2d */
	W.Coords2D = Coords2D;
	/* coords2d> */

	// } catch (ex) { alert(ex); }

})(this, this.document);
