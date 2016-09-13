frozenether.getAccount = function(owner, id) {
	var i, len;

	len = frozenether.accounts.length;
	for (i = 0; i < len; i++) {
		if ((frozenether.accounts[i].owner == owner) &&
				frozenether.accounts[i].id.eq(id)) {
			return frozenether.accounts[i];
		}
	}
	return undefined;
}

frozenether.amountToString = function(amount) {
	var string = '';
	var units = ['wei', 'Kwei', 'Mwei', 'Gwei', 'szabo', 'finney', 'ether', 'Kether', 'Mether', 'Gether', 'Tether'];
	var i = 0;
	var len = units.length;

	do {
		if (amount.lessThan(1000)) {
			string = amount.round(3).toString() + ' ' + units[i];
			return string;
		}
		i++;
	} while (amount = amount.div(1000));
	return 'unknwon';
}

frozenether.updateTotalAmount = function() {
	var i, len;
	var amount = new BigNumber(0);

	len = frozenether.accounts.length;
	for (i = 0; i < len; i++) {
		amount = amount.plus(frozenether.accounts[i].amount());
	}
	$('#total_amount').text(frozenether.amountToString(amount));
}

frozenether.Account = function(owner, id) {
	this.owner = owner;
	this.id = new BigNumber(id);
	this.history = new frozenether.History(this.selector('history'));
	this.createHtml();
	this.events();

	$('#accounts_empty').hide();
	$('#accounts_full').show();
}

frozenether.Account.prototype.selector = function(suffix) {
	var selector = '#' + this.owner + '_' + this.id.toString();
	if (typeof suffix === 'string') {
		selector += '_' + suffix;
	}
	return selector;
}

frozenether.Account.prototype.createHtml = function() {
	var html = '<p id="' + this.selector('account') + '">';
	html += 'Owner: ' + this.owner + ' ';
	html += 'Amount: <span id="' + this.selector('data_amount') + '">' + frozenether.amountToString(this.amount()) + '</span> ';
	html += '<input type="button" id="' + this.selector('modify') + '" value="Modify"></input>';
	html += '</p>';
	$('#accounts').after(html);

	html = '<section id="' + this.selector('page_account') + '" class="col-sm-10">';
	html += '<div class="col-sm-9">';
	html += '<h3>Configuration</h3>';
	html += '<p>';
	html += 'Owner: ' + this.owner + '<br>';
	html += 'Identifier: ' + this.id.toString() + '<br>';
	html += 'Amount: <span id="' + this.selector('data_amount') + '">' + frozenether.amountToString(this.amount()) + '</span><br>';
	html += 'Duration:<span id="' + this.selector('data_duration') + '">' + this.remainingTime() + '</span> seconds<br>';
	html += '</p>';
	html += '<h3>Actions</h3>';
	html += '<form>';
	html += '<p>';
	html += '<label id="' + this.selector('action_amount') + '">Amount</label>: ';
	html += '<input type="text" id="' + this.selector('action_amount') + '" placeholder="0"></input><br>';
	html += '<label id="' + this.selector('action_duration') + '">Duration</label>: ';
	html += '<input type="number" min="0" id="' + this.selector('action_duration') + '" placeholder="0"></input><br>';
	html += '<input type="button" id="' + this.selector('deposit') + '" value="Deposit"></input>';
	html += '<input type="button" id="' + this.selector('withdraw') + '" value="Withdraw"></input>';
	html += '<input type="button" id="' + this.selector('freeze') + '" value="Freeze"></input>';
	html += '<input type="button" id="' + this.selector('close') + '" value="Close"></input>';
	html += '<br>';
	html += '</p>';
	html += '</form>';
	html += '</div>';
	html += '<aside class="col-sm-3">';
	html += '<h2>History</h2>';
	html += '<div id="' + this.selector('history') + '"></div>'
	html += '</aside>';
	html += '</section>';
	$('#pages').append(html);
	$(this.selector('page_account')).hide();
}

frozenether.Account.prototype.destroy = function() {
	var i, len;

	len = frozenether.accounts.length;
	for (i = 0; i < len; i++) {
		if ((frozenether.accounts[i].owner == this.owner) &&
				frozenether.accounts[i].id.eq(id)) {
			frozenether.accounts.slice(i, i);
		}
	}
	$(this.selector('account')).remove();

	if (frozenether.accounts.length <= 0) {
		$('#accounts_empty').show();
		$('#accounts_full').hide();
	}
}

frozenether.Account.prototype.events = function() {
	var account = this;

	$(this.selector('modify')).on('click', function() {
		$('#accounts_full').hide();
		$(this.selector('page_account')).show();
	});

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

	$(this.selector('close')).on('click', function() {
		$(this.selector('page_account')).hide();
		$('#accounts_full').show();
	});
}

frozenether.Account.prototype.amount = function() {
	return frozenether.contract.amount(this.owner, this.id);
}

frozenether.Account.prototype.remainingTime = function() {
	return frozenether.contract.remainingTime(this.owner, this.id);
}

frozenether.Account.prototype.update = function(msg) {
	var amount = this.amount().toString();
	var duration = this.remainingTime().toString();

	$(this.selector('data_amount')).text(amount);
	$(this.selector('data_duration')).text(duration);
	if (typeof msg !== 'undefined') {
		this.history.push(msg);
	}
	if (amount <= 0) {
		this.destroy();
	}
	frozenether.updateTotalAmount();
}

frozenether.changePage = function(page) {
	if (typeof frozenether.current_page !== 'undefined') {
		$(frozenether.current_page).hide();
	}
	if (typeof page === 'undefined') {
		page = frozenether.previous_page;
	}
	if (typeof page === 'undefined') {
		page = '#page_presentation';
	}
	$(page).show();
	frozenether.previous_page = frozenether.current_page;
	frozenether.current_page = page;
}

frozenether.initNav = function() {
	$('#page_accounts').hide();
	$('#page_help').hide();
	$('#page_parameters').hide();
	$('#accounts_full').hide();
	frozenether.changePage();
}

$(function() {
	frozenether.initNav();

	$('#create_button').on('click', function() {
		var owner = $('#create_owner').val();
		var amount = parseFloat($('#create_amount').val());
		var duration = parseInt($('#create_duration').val());
		var id;

		if (typeof amount === 'undefined') {
			amount = 0;
		}
		if (typeof duration === 'undefined') {
			duration = 0;
		}
		id = frozenether.contract.create(owner, duration, amount, 'finney');
		frozenether.accounts.push(new frozenether.Account(owner, id));
	});

	$('#parameters_button').on('click', function() {
		frozenether.changePage('#page_parameters');
		$('input[name="parameter_language"][value="' + localStorage.getItem('language') + '"]').prop('checked', true);
		$('input[name="parameter_mode"][value="' + localStorage.getItem('mode') + '"]').prop('checked', true);
		$('#parameter_history_size').val(localStorage.getItem('history_size'));
	});

	$('#close_parameters').on('click', function() {
		frozenether.changePage();
	});

	$('#apply_parameters').on('click', function() {
		localStorage.setItem('language', $('input[name="parameter_language"]:checked').val());
		localStorage.setItem('mode', $('input[name="parameter_mode"]:checked').val());
		localStorage.setItem('history_size', $('#parameter_history_size').val());
		frozenether.changePage();
	});

	$('#navigation_presentation').on('click', function() {
		frozenether.changePage('#page_presentation');
	});

	$('#navigation_accounts').on('click', function() {
		frozenether.changePage('#page_accounts');
	});

	$('#navigation_help').on('click', function() {
		frozenether.changePage('#page_help');
	});
});

$(function() {
	var language = localStorage.getItem('language');
	if (typeof language === 'undefined') {
		localStorage.setItem('language', 'english');
	}

	var mode = localStorage.getItem('mode');
	if (typeof mode === 'undefined') {
		localStorage.setItem('mode', 'basic');
	}

	var history_size = localStorage.getItem('history_size');
	if (typeof history_size === 'undefined') {
		localStorage.setItem('history_size', 8);
	}
});


