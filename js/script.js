frozenether.accounts = [];

frozenether.getAccount = function(owner, id) {
	var i, len;

	len = frozenether.accounts.lenght;
	for (i = 0; i < len; i++) {
		if ((frozenether.accounts[i].owner == owner) &&
				(frozenether.accounts[i].id == id)) {
			return frozenether.accounts[i];
		}
	}
	return undefined;
}

frozenether.Account = function(owner, id) {
	this.owner = owner;
	this.id = id;
	this.history = new History();
	this.createHtml();
	this.events();
}

frozenether.Account.prototype.selector = function(suffix) {
	var selector = '#' + this.owner + '_' + this.id;
	if (typeof suffix === 'string') {
		selector = selector + '_' + suffix;
	}
	return selector;
}

frozenether.Account.prototype.createHtml = function() {
	var html = '<div id="' + this.selector('account') + '">'
	html += '<h3>Configuration</h3>'
	html += '<p>'
	html += 'Owner: ' + this.owner + '</br>'
	html += 'Identifier: ' + this.id + '</br>'
	html += 'Amount: <span id="' + this.selector('data_amount') + '">' + this.amount + '</span> wei</br>'
	html += 'Duration:<span id="' + this.selector('data_duration') + '">' + this.duration + '</span> seconds</br>'
	html += '</p>'
	html += '<h3>Actions</h3>'
	html += '<form>'
	html += '<p>'
	html += '<label id="' + this.selector('action_amount') + '">Amount</label>: '
	html += '<input type="text" id="' + this.selector('action_amount') + '" placeholder="0"></input></br>'
	html += '<label id="' + this.selector('action_duration') + '">Duration</label>: '
	html += '<input type="number" min="0" id="' + this.selector('action_duration') + '" placeholder="0"></input></br>'
	html += '<input type="button" id="' + this.selector('deposit') + '" value="Deposit"></input>'
	html += '<input type="button" id="' + this.selector('withdraw') + '" value="Withdraw"></input>'
	html += '<input type="button" id="' + this.selector('freeze') + '" value="Freeze"></input>'
	html += '</br>'
	html += '</p>'
	html += '</form>'
	html += '</div>'
	$('#accounts').after(html);
}

frozenether.Account.prototype.destroy = function() {
	var i, len;

	len = frozenether.accounts.lenght;
	for (i = 0; i < len; i++) {
		if ((frozenether.accounts[i].owner == this.owner) &&
				(frozenether.accounts[i].id == this.id)) {
			frozenether.accounts.slice(i, i);
		}
	}
	$(this.selector('account')).remove();
}

frozenether.Account.prototype.events = function() {
	var account = this;

	$(this.selector('deposit')).on('click', function() {
		var amount = parseFloat($(this.selector('action_amount')).val());
		var errcode = deposit(account.account, account.id, amount, 'finney');
		if (!errcode) {
			console.err('Deposit on account failed');
		}
	});

	$(this.selector('withdraw')).on('click', function() {
		var amount = parseFloat($(this.selector('action_amount')).val());
		var errcode = withdraw(this.account, account.id, amount, 'finney');
		if (!errcode) {
			console.err('Withdraw from account failed');
		}
	});

	$(this.selector('freeze')).on('click', function() {
		var duration = parseInt($(this.selector('action_duration')).val());
		var errcode = freeze(account.account, account.id, duration);
		if (!errcode) {
			console.err('Freeze  account failed');
		}
	});
}

frozenether.Account.prototype.getAmount = function() {
	return amount(this.owner, this.id);
}

frozenether.Account.prototype.getDuration = function() {
	return remainingTime(this.owner, this.id);
}

frozenether.Account.prototype.update = function(msg) {
	var amount = this.getAmount();
	var duration = this.getDuration();

	$(this.selector('data_amount')).text(amount);
	$(this.selector('data_duration')).text(duration);
	if (typeof msg !== 'undefined') {
		this.history.push(msg);
	}
	if (amount <= 0) {
		this.destroy();
	}
}

$(function() {
	$('#create_button').on('click', function() {
		var owner = $('#create_owner').val();
		var amount = parseFloat($('#create_amount').val());
		var duration = parseInt($('#create_duration').val());

		if (typeof amount === 'undefined') {
			amount = 0;
		}
		if (typeof duration === 'undefined') {
			duration = 0;
		}
		var id = 5;
		id = create(owner, duration, amount, 'finney');
		if (!errcode) {
			console.err('Create account failed');
		}
		frozenether.accounts.push(new frozenether.Account(owner, id));
	});
});


