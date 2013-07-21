
/**
	Usage:

	// Create Element.Sortable
	$('container')
		.sortable({
			handle: 'td.id'
		})

		// Specific event to directly save the new order somewhere
		.on('sortableEnd', function(e) {
			saveSortableTable( this.getChildren().map(function() {
				return this.data('id');
			}) );
		});
	;

	// GLOBAL events for all Sortables everywhere to handle visual response
	window
		.on('sortableStart', function(e) {
			e.subject.getElements('.last-dragged').removeClass('last-dragged');
			e.data.dragging.addClass('dragging');
		}).on('sortableDrag', function(e) {
			e.data.switched.getFirst().textContent += '*';
		}).on('sortableEnd', function(e) {
			e.subject.getElements('.dragging').removeClass('dragging');
			e.data.dragging.addClass('last-dragged');
		})
	;
/**/

Element.Sortable = function(container, options) {
    this.options = options || {};
    this.container = container;
    container.$sortable = this;
    
    $each(this.handlers, function(fn, name) {
        this[name] = fn.bind(this);
    }, this);
    
    container.getChildren()
        .on('mousedown', options.handle, this.onStart)
        .addClass('rjs-sortable-row');
    return this;
};
$extend(Element.Sortable, {
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

Element.extend({sortable: function(options) {
    this.$sortable = new Element.Sortable(this, options);
    return this;
}});
