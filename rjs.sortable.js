
/**
 * Usage:
 *
 * See sortable.html
 */

r.Sortable = function(container, options) {
	this.options = options || {};
	this.container = container;
	container.$sortable = this;

	r.each(this.handlers, function(fn, name) {
		this[name] = fn.bind(this);
	}, this);

	container.getChildren()
		.on('mousedown', options.handle, this.onStart)
		.addClass('rjs-sortable-row');
};
r.extend(r.Sortable, {
	stateEvent: function(type) {
		var e = new AnyEvent(type);
		e.data = this;
		return e;
	},
	fire: function(localType, originalEvent) {
		var globalType = 'sortable',
			fullType = (globalType + '-' + localType).camel(),
			e = this.stateEvent(fullType);
		e.originalEvent = originalEvent;
		this.container.fire(fullType, e);
		this.container.globalFire(globalType, localType, e)
	},
	handlers: {
		onStart: function(e) {
			e.preventDefault();

			var row = e.subject.selfOrFirstAncestor('.rjs-sortable-row');

			this.container.on('mousemove', '.rjs-sortable-row', this.onDrag);
			document.on('mouseup', this.onEnd);

			this.dragging = row;
			this.fire('start', e);
		},
		onDrag: function(e) {
			var row = e.subject;

			if ( this.dragging != row ) {
				// dragged up
				if ( row.getNext() == this.dragging ) {
					row.injectAfter(this.dragging);
				}
				// dragged down
				else if ( row.getPrev() == this.dragging ) {
					row.injectBefore(this.dragging);
				}
				else {
					return;
				}

				this.switched = row;
				this.fire('drag', e);
				delete this.switched;
			}
		},
		onEnd: function(e) {
			this.container.off('mousemove', this.onDrag);
			document.off('mouseup', this.onEnd);

			this.fire('end', e);
			delete this.dragging;
		}
	}
});

Element.extend({
	sortable: function(options) {
		this.$sortable = new r.Sortable(this, options);
		return this;
	}
});
