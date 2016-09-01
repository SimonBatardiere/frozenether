frozenether.History = function(max) {
	if (typeof max === 'integer') {
		this.max = max;
	} else {
		this.max = 8;
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
}

frozenether.History.prototype.remove = function(msg) {
	if (typeof msg === 'undefined') {
		return;
	}
}

