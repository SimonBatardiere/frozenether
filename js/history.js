const FROZEN_ETHER_HISTORY_MAX = 8;

frozenether.History = function(id, max) {
	this.id = id;
	if (typeof max === 'integer') {
		this.max = max;
	} else {
		this.max = parseInt($('#parameter_history_size').val(localStorage.getItem('history_size')));
	}
	this.msgs = [];
}

frozenether.History.prototype.push = function(msg) {
	if (typeof msg === 'undefined') {
		return;
	}
	if (this.msgs.length >= this.max) {
		this.shift();
	}
	this.msgs.push(msg);
	this.add(msg);
}

frozenether.History.prototype.pop = function() {
	var msg = this.msgs.pop();
	if (typeof msg === 'undefined') {
		return undefined;
	}
	this.remove(msg);
	return msg;
}

frozenether.History.prototype.shift = function() {
	var msg = this.msgs.shift();
	if (typeof msg === 'undefined') {
		return undefined;
	}
	this.remove(msg);
	return msg;
}

frozenether.History.prototype.empty = function() {
	while (typeof this.pop() !== 'undefined') {
	}
}

frozenether.History.prototype.add = function(msg) {
	if (typeof msg === 'undefined') {
		return;
	}
	var html = '<div id="' + this.selector(msg, 'event') + '">';
	html += '<p>';
	html += 'Event: ' + this.msg.event + '<br>';
	html += '</p>';
	html += '</div>';
	$('#' + this.id).after(html);
}

frozenether.History.prototype.remove = function(msg) {
	if (typeof msg === 'undefined') {
		return;
	}
	$(this.selector(msg, 'event')).remove();
}

frozenether.History.prototype.selector = function(msg, string) {
	var selector = '#' + this.id;
	selector += '_' + msg.args.owner;
	selector += '_' + msg.args.id.toString();
	selector += '_' + msg.event;
	selector += '_' + msg.blockNumber;
	if (typeof suffix === 'string') {
		selector += '_' + suffix;
	}
	return selector;
}

