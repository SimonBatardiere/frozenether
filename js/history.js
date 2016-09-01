function History(max) {
	if (typeof max === 'integer') {
		this.max = max;
	} else {
		this.max = 8;
	}
	this.msgs = [];
}

History.prototype.push = function(msg) {
	if (typeof msg === 'undefined') {
		return;
	}
	if (this.msgs.length >= this.max) {
		this.shift();
	}
	this.msgs.push(msg);
}

History.prototype.pop = function() {
	var msg = this.msgs.pop();
	if (typeof msg === 'undefined') {
		return undefined;
	}
	this.remove(msg);
	return msg;
}

History.prototype.shift = function() {
	var msg = this.msgs.shift();
	if (typeof msg === 'undefined') {
		return undefined;
	}
	this.remove(msg);
	return msg;
}

History.prototype.empty = function() {
	while (typeof this.pop() !== 'undefined') {
	}
}

History.prototype.add = function(msg) {
	if (typeof msg === 'undefined') {
		return;
	}
}

History.prototype.remove = function(msg) {
	if (typeof msg === 'undefined') {
		return;
	}
}

