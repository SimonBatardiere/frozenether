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
	this.history = new frozenether.History(this.identifier('history'));
	this.createHtml();
	this.events();

	localStorage.setItem('first_page', 'page_accounts');
	$('#accounts_empty').hide();
	$('#accounts_full').show();
}

frozenether.Account.prototype.identifier = function(suffix) {
	var identifier = 'account_' + this.owner + '_' + this.id.toString();
	if (typeof suffix === 'string') {
		identifier += '_' + suffix;
	}
	return identifier;
}

frozenether.Account.prototype.selector = function(suffix) {
	var selector = '#' + this.identifier(suffix);
	return selector;
}

frozenether.Account.prototype.createHtml = function() {
	var html = '<p id="' + this.identifier() + '">';
	html += this.owner + ' - ';
	html += '<span id="' + this.identifier('amount') + '">' + frozenether.amountToString(this.amount()) + '</span> ';
	html += '<input type="button" id="' + this.identifier('modify') + '" value="Modify"></input>';
	html += '</p>';
	$('#accounts').after(html);

	html = '<section id="' + this.identifier('page') + '" class="col-sm-10">';
	html += '<div class="col-sm-9">';
	html += '<h3>Configuration</h3>';
	html += '<p>';
	html += 'Owner: ' + this.owner + '<br>';
	html += 'Identifier: ' + this.id.toString() + '<br>';
	html += 'Amount: <span id="' + this.identifier('data_amount') + '">' + frozenether.amountToString(this.amount()) + '</span><br>';
	html += 'Duration:<span id="' + this.identifier('data_duration') + '">' + this.remainingTime() + '</span> seconds<br>';
	html += '</p>';
	html += '<h3>Actions</h3>';
	html += '<form>';
	html += '<p>';
	html += '<label for="' + this.identifier('action_amount') + '">Amount</label>: ';
	html += '<input type="text" id="' + this.identifier('action_amount') + '" placeholder="0"></input><br>';
	html += '<label for="' + this.identifier('action_duration') + '">Duration</label>: ';
	html += '<input type="number" min="0" id="' + this.identifier('action_duration') + '" placeholder="0"></input><br>';
	html += '<input type="button" id="' + this.identifier('deposit') + '" value="Deposit"></input>';
	html += '<input type="button" id="' + this.identifier('withdraw') + '" value="Withdraw"></input>';
	html += '<input type="button" id="' + this.identifier('freeze') + '" value="Freeze"></input>';
	html += '<input type="button" id="' + this.identifier('close') + '" value="Close"></input>';
	html += '<br>';
	html += '</p>';
	html += '</form>';
	html += '</div>';
	html += '<aside class="col-sm-3">';
	html += '<h2>History</h2>';
	html += '<div id="' + this.identifier('history') + '"></div>'
	html += '</aside>';
	html += '</section>';
	$('#pages').append(html);
	$(this.selector('page')).hide();
}

frozenether.Account.prototype.destroy = function() {
	var i, len;

	len = frozenether.accounts.length;
	for (i = 0; i < len; i++) {
		if ((frozenether.accounts[i].owner == this.owner) &&
				frozenether.accounts[i].id.eq(this.id)) {
			frozenether.accounts.slice(i, i);
		}
	}
	$(this.selector()).remove();
	if ($(this.selector('page')).is(":visible")) {
		frozenether.changePage('#page_accounts');
	}
	$(this.selector('page')).remove();

	if (frozenether.accounts.length <= 0) {
		localStorage.setItem('first_page', 'page_presentation');
		$('#accounts_empty').show();
		$('#accounts_full').hide();
	}
}

frozenether.Account.prototype.events = function() {
	var account = this;

	$(this.selector('modify')).on('click', function() {
		frozenether.changePage(account.selector('page'));
	});

	$(this.selector('deposit')).on('click', function() {
		var amount = parseFloat($(account.selector('action_amount')).val());
		var errcode = frozenether.contract.deposit(account.owner, account.id, amount, 'finney');
		if (!errcode) {
			console.error('Deposit on account failed');
		}
	});

	$(this.selector('withdraw')).on('click', function() {
		var amount = parseFloat($(account.selector('action_amount')).val());
		var errcode = frozenether.contract.withdraw(account.owner, account.id, amount, 'finney');
		if (!errcode) {
			console.error('Withdraw from account failed');
		}
	});

	$(this.selector('freeze')).on('click', function() {
		var duration = parseInt($(account.selector('action_duration')).val());
		var errcode = frozenether.contract.freeze(account.owner, account.id, duration);
		if (!errcode) {
			console.error('Freeze  account failed');
		}
	});

	$(this.selector('close')).on('click', function() {
		$(account.selector('page')).hide();
		frozenether.changePage('#page_accounts');
	});
}

frozenether.Account.prototype.amount = function() {
	return frozenether.contract.amount(this.owner, this.id);
}

frozenether.Account.prototype.remainingTime = function() {
	return frozenether.contract.remainingTime(this.owner, this.id);
}

frozenether.Account.prototype.update = function(msg) {
	var amount = frozenether.amountToString(this.amount());
	var duration = this.remainingTime().toString();

	$(this.selector('amount')).text(amount);
	$(this.selector('data_amount')).text(amount);
	$(this.selector('data_duration')).text(duration);
	if (typeof msg !== 'undefined') {
		this.history.push(msg);
	}
	if (this.amount().lte(0)) {
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
		page = '#' + localStorage.getItem('first_page');
	}
	$(page).show();
	frozenether.previous_page = frozenether.current_page;
	frozenether.current_page = page;
}

frozenether.initNav = function() {
	$('#page_presentation').hide();
	$('#page_accounts').hide();
	$('#page_help').hide();
	$('#page_parameters').hide();
	$('#accounts_full').hide();
	frozenether.changePage();
}

$(function() {
	var first_page = localStorage.getItem('first_page');
	if (first_page === null) {
		localStorage.setItem('first_page', 'page_presentation');
	}

	var language = localStorage.getItem('language');
	if (language === null) {
		localStorage.setItem('language', 'english');
	}

	var mode = localStorage.getItem('mode');
	if (mode === null) {
		localStorage.setItem('mode', 'basic');
	}

	var history_size = localStorage.getItem('history_size');
	if (history_size === null) {
		localStorage.setItem('history_size', 8);
	}
});

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

