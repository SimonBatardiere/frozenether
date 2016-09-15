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
	var html = '<div id="' + this.identifier(msg) + '">';
	html += '<p>';
	html += 'Event: ' + msg.event + '<br>';
	html += '</p>';
	html += '</div>';
	$('#' + this.id).append(html);
}

frozenether.History.prototype.remove = function(msg) {
	if (typeof msg === 'undefined') {
		return;
	}
	$(this.selector(msg)).remove();
}

frozenether.History.prototype.identifier = function(msg, suffix) {
	var identifier = 'msg_' + this.id;
	identifier += '_' + msg.args.owner;
	identifier += '_' + msg.args.id.toString();
	identifier += '_' + msg.event;
	identifier += '_' + msg.blockNumber;
	if (typeof suffix === 'string') {
		identifier += '_' + suffix;
	}
	return identifier;
}

frozenether.History.prototype.selector = function(msg, suffix) {
	var selector = '#' + this.identifier(msg, suffix);
	return selector;
}

