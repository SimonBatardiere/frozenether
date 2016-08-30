var frozenether = {
	accounts: [],
};

function getAccount(owner, id) {
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

function Account(owner, id, amount) {
	this.owner = owner;
	this.id = id;
	this.amount = amount;
	this.duration = 0;
	this.createHtml();
	this.events();
}

Account.prototype.createHtml = function() {
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
	html += '<input type="text" id="' + this.selector('action_amount') + '"></input></br>'
	html += '<label id="' + this.selector('action_duration') + '">Duration</label>: '
	html += '<input type="number" min="0" id="' + this.selector('action_duration') + '"></input></br>'
	html += '<input type="button" id="' + this.selector('deposit') + '" value="Deposit"></input>'
	html += '<input type="button" id="' + this.selector('withdraw') + '" value="Withdraw"></input>'
	html += '<input type="button" id="' + this.selector('freeze') + '" value="Freeze"></input>'
	html += '</br>'
	html += '</p>'
	html += '</form>'
	html += '</div>'
	$('#accounts').after(html);
}

Account.prototype.events = function() {
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

Account.prototype.deposit = function(amount) {
	this.amount += amount;
	$(this.selector('data_amount')).text(this.amount);
}

Account.prototype.withdraw = function(amount) {
	this.amount -= amount;
	$(this.selector('data_amount')).text(this.amount);
	if (this.amount <= 0) {
		this.destroy();
	}
}

Account.prototype.destroy = function() {
	$(this.selector('account')).remove();
}

Account.prototype.selector = function(suffix) {
	var selector = '#' + this.owner + '_' + this.id;
	if (typeof suffix === 'string') {
		selector = selector + '_' + suffix;
	}
	return selector;
}

$(function() {
	$('#create_button').on('click', function() {
		var account = $('#create_account').val();
		var amount = parseFloat($('#create_amount').val());
		var duration = parseInt($('#create_duration').val());
		var errcode = create(account, duration, amount, 'finney');
		if (!errcode) {
			console.err('Create account failed');
		}
		frozenether.accounts.push(new Account(account, id, amount, duration));
	});
});


