import "../stylesheets/frozenether.css";
import { default as Web3 } from 'web3';
import { default as contract } from 'truffle-contract'
import frozenether_artifacts from '../../build/contracts/FrozenEther.json'

var frozenether = {
	contract: {},
	active: {},
	accounts: [],
	history: {}
};

frozenether.fail = function(string) {
	var html = '';

	html += '<div class="alert alert-danger alert-dismissable fade in">';
	html += '<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>';
	html += '<strong>Warning: </strong>';
	html += string;
	html += '</div>';
	$('#popup_error').append(html);
}

frozenether.amountToString = function(amount) {
	var string = '';
	var units = ['Wei', 'Kwei', 'Mwei', 'Gwei', 'Szabo', 'Finney', 'Ether', 'Kether', 'Mether', 'Gether', 'Tether'];
	var i = 0;
	var len = units.length;

	if (typeof amount === 'undefined') {
		return '';
	}

	do {
		if (amount.lessThan(1000)) {
			string = amount.round(3).toString() + ' ' + units[i];
			return string;
		}
		i++;
	} while (amount = amount.div(1000));
	return '';
}

frozenether.durationToString = function(duration) {
	var string = '';

	if (typeof duration === 'undefined') {
		return string;
	}

	if (duration.gte(31536000)) {
		var years = duration.divToInt(31536000);
		var months = duration.modulo(31536000).divToInt(2629800);

		string += years.toString() + ' Years';
		if (months.gt(0)) {
			string += ' ' + months.toString() + ' Months';
		}
	} else if (duration.gte(2629800)) {
		var months = duration.divToInt(2629800);
		var weeks = duration.modulo(2629800).divToInt(604800);

		string += months.toString() + ' Months';
		if (weeks.gt(0)) {
			string += ' ' + weeks.toString() + ' Weeks';
		}
	} else if (duration.gte(604800)) {
		var weeks = duration.divToInt(604800);
		var days = duration.modulo(604800).divToInt(86400);

		string += weeks.toString() + ' Weeks';
		if (days.gt(0)) {
			string += ' ' + days.toString() + ' Days';
		}
	} else if (duration.gte(86400)) {
		var days = duration.divToInt(86400);
		var hours = duration.modulo(86400).divToInt(3600);

		string += days.toString() + ' Days';
		if (hours.gt(0)) {
			string += ' ' + hours.toString() + ' Hours';
		}
	} else if (duration.gte(3600)) {
		var hours = duration.divToInt(3600);
		var minutes = duration.modulo(3600).divToInt(60);

		string += hours.toString() + ' Hours';
		if (minutes.gt(0)) {
			string += ' ' + minutes.toString() + ' Minutes';
		}
	} else if (duration.gte(60)) {
		var minutes = duration.divToInt(60);
		var seconds = duration.modulo(60);

		string += minutes.toString() + ' Minutes';
		if (seconds.gt(0)) {
			string += ' ' + seconds.toString() + ' Seconds';
		}
	} else if (duration.gt(0)) {
		string += duration.toString() + ' Seconds';
	} else {
		string += 'Expired';
	}
	return string;
}

frozenether.durationToInt = function(value, unit) {
	var duration = web3.toBigNumber(value);
	if (typeof unit === 'undefined') {
		console.error('Duration unit is undefined: use \'Days\'');
		unit = 'Days';
	}

	switch(unit) {
	case 'Seconds':
		break;
	case 'Minutes':
		duration = duration.times('60');
		break;
	case 'Hours':
		duration = duration.times('3600');
		break;
	case 'Days':
		duration = duration.times('86400');
		break;
	case 'Weeks':
		duration = duration.times('604800');
		break;
	case 'Months':
		duration = duration.times('2629800');
		break;
	case 'Years':
		duration = duration.times('31536000');
		break;
	default:
		console.error('Unknown duration unit(' + unit + '): use \'Days\'');
		duration = duration.times('86400');
		break;
	}
	return duration;
}

frozenether.Event = function(msg, identifier) {
	var html = '';
	var date;

	this.identifier = identifier + '_' + msg.transactionHash + '_' + msg.event;
	html += '<tr id="' + this.identifier + '">';
	if (msg.event == 'Create') {
		html += '<td><span class="glyphicon glyphicon-plus" aria-hidden="true"></td>';
	} else if (msg.event == 'Deposit') {
		html += '<td><span class="glyphicon glyphicon-log-in" aria-hidden="true"></td>';
	} else if (msg.event == 'Withdraw') {
		html += '<td><span class="glyphicon glyphicon-log-out" aria-hidden="true"></td>';
	} else if (msg.event == 'Freeze') {
		html += '<td><span class="glyphicon glyphicon-time" aria-hidden="true"></td>';
	} else if (msg.event == 'Destroy') {
		html += '<td><span class="glyphicon glyphicon-remove" aria-hidden="true"></td>';
	} else {
		html += '<td></td>';
	}

	web3.eth.getBlock(msg.blockNumber, false, function(e, block) {
		if (e) {
			html += '<td></td>';
		} else {
			date = new Date(block.timestamp * 1000);
			html += '<td>' + date.toString().split(' GMT').shift() + '</td>';
		}
		html += '<td>' + msg.args.owner + '</td>';
		html += '<td>' + msg.args.id + '</td>';
		html += '<td>' + msg.event + '</td>';
		html += '<td>';
		html += frozenether.amountToString(msg.args.amount);
		html += frozenether.durationToString(msg.args.duration);
		html += '</td>';
		html += '</tr>';
		$('#' + identifier).prepend(html);
	});
}

frozenether.Event.prototype.destroy = function() {
	$('#' + this.identifier).remove();
}

frozenether.History = function(identifier) {
	this.identifier = identifier;
	this.max = parseInt(localStorage.getItem('history_size'), 10);
	this.events = [];
}

frozenether.History.prototype.setMax = function(max) {
	this.max = parseInt(max, 10);
	while (this.events.length >= this.max) {
		this.shift();
	}
}

frozenether.History.prototype.push = function(evt) {
	if (typeof evt === 'undefined') {
		return;
	}
	if (this.events.length >= this.max) {
		this.shift();
	}
	this.events.push(evt);
}

frozenether.History.prototype.pop = function() {
	var evt = this.events.pop();
	if (typeof evt === 'undefined') {
		return undefined;
	}
	evt.destroy();
	return evt;
}

frozenether.History.prototype.shift = function() {
	var evt = this.events.shift();
	if (typeof evt === 'undefined') {
		return undefined;
	}
	evt.destroy();
	return evt;
}

frozenether.History.prototype.empty = function() {
	while (typeof this.pop() !== 'undefined') {
	}
}

frozenether.History.prototype.onEvent = function(msg) {
	var evt = new frozenether.Event(msg, this.identifier);
	this.push(evt);
}

frozenether.Account = function(owner, id) {
	this.owner = owner;
	this.id = id;
	this.amount = undefined;
	this.duration = undefined;
	this.history = {};
	frozenether.accounts.push(this);

	if (typeof this.id !== 'undefined') {
		this.history = new frozenether.History(this.identifier('history'));
		this.html();
		localStorage.setItem('first_name', 'accounts');
	}
}

frozenether.Account.prototype.isEqual = function(owner, id) {
	if (this.owner != owner) {
		return false;
	} else if (!this.id.eq(id)) {
		return false;
	}
	return true;
}

frozenether.Account.prototype.identifier = function(suffix) {
	var identifier;

	identifier = 'account_' + this.owner + '_' + this.id.toString();
	if (typeof suffix === 'string') {
		identifier += '_' + suffix;
	}
	return identifier;
}

frozenether.Account.prototype.selector = function(suffix) {
	var selector;

	selector = '#' + this.identifier(suffix);
	return selector;
}

frozenether.Account.prototype.update = function() {
	var self = this;
	var frozen;

	return frozenether.contract.deployed().then(function(instance) {
		frozen = instance;
		return frozen.isExist.call(self.id, { from: self.owner });
	}).then(function(exist) {
		if (!exist) {
			console.error('The account doesn\'t exist');
			this.reject();
			return;
		}
		return frozen.amount.call(self.id, { from: self.owner });
	}).then(function(amount) {
		self.amount = amount;
		return frozen.remainingTime.call(self.id, { from: self.owner });
	}).then(function(duration) {
		self.duration = duration;
	}).catch(function() {
		self.amount = undefined;
		self.duration = undefined;
	});
}

frozenether.Account.prototype.updateHtml = function() {
	var self = this;

	return this.update().then(function() {
		$(self.selector('summary_amount')).text(frozenether.amountToString(self.amount));
		$(self.selector('summary_duration')).text(frozenether.durationToString(self.duration));
		$(self.selector('section_amount')).text(frozenether.amountToString(self.amount));
		$(self.selector('section_duration')).text(frozenether.durationToString(self.duration));
		if (typeof self.duration !== 'undefined' && self.duration.gt(0)) {
			$(self.selector('button_deposit')).prop('disabled', false);
			$(self.selector('button_withdraw')).prop('disabled', true);
		} else {
			$(self.selector('button_deposit')).prop('disabled', true);
			$(self.selector('button_withdraw')).prop('disabled', false);
		}
		frozenether.updateTotalAmount();
	});
}

frozenether.Account.prototype.htmlSummary = function() {
	var self = this;
	var html = '';

	html += '<div id="' + this.identifier('summary') + '" class="col-6 col-sm-3 fe-hand">';
	html += '<img src="data:image/gif;base64,R0lGODlhAQABAIABAADcgwAAACwAAAAAAQABAAACAkQBADs=" width="200" height="200" class="img-fluid img-circle" alt="Frozen Ether account representation">';
	html += '<h4>Account</h4>';
	html += '<div id="' + this.identifier('summary_amount') + '" class="text-muted"></div>';
	html += '<div id="' + this.identifier('summary_duration') + '" class="text-muted"></div>';
	html += '</div>';
	$('#accounts_summary').append(html);

	$(this.selector('summary')).on('click', function() {
		self.naviguate();
	});
}

frozenether.Account.prototype.htmlSection = function() {
	var html = '';

	html += '<div id="section_' + this.identifier() + '" class="container-fluid">';
	html += '<div class="row">';
	html += '<main class="col-sm-12 offset-sm-0 col-md-12 offset-md-0 pt-3">';
	html += '<section class="row text-left">';
	html += '<div class="col-sm-3">';
	html += '<img src="data:image/gif;base64,R0lGODlhAQABAIABAADcgwAAACwAAAAAAQABAAACAkQBADs=" width="200" height="200" class="img-fluid img-circle" alt="Account representation">';
	html += '<div class="btn-group fe-account-controls" role="group" aria-label="Account\'s actions">';
	html += '<button id="' + this.identifier('button_deposit') + '" type="button" data-toggle="modal" href="#popup_deposit" class="btn btn-default" title="Deposit">';
	html += '<span class="glyphicon glyphicon-log-in" aria-hidden="true">';
	html += '<span class="sr-only">Deposit</span>';
	html += '</button>';
	html += '<button id="' + this.identifier('button_withdraw') + '" type="button" data-toggle="modal" href="#popup_withdraw" class="btn btn-default" title="Withdraw">';
	html += '<span class="glyphicon glyphicon-log-out" aria-hidden="true">';
	html += '<span class="sr-only">Withdraw</span>';
	html += '</button>';
	html += '<button type="button" data-toggle="modal" href="#popup_lengthen" class="btn btn-default" title="Lengthen duration">';
	html += '<span class="glyphicon glyphicon-time" aria-hidden="true">';
	html += '<span class="sr-only">Lengthen duration</span>';
	html += '</button>';
	html += '</div>';
	html += '</div>';
	html += '<div class="col-sm-9 table-responsive">';
	html += '<table class="table">';
	html += '<tbody>';
	html += '<tr><th>Address</th><td>' + this.owner + '</td></tr>';
	html += '<tr><th>Identifier</th><td>' + this.id.toString() + '</td></tr>';
	html += '<tr><th>Amount</th><td id="' + this.identifier('section_amount') + '"></td></tr>';
	html += '<tr><th>Remaining time</th><td id="' + this.identifier('section_duration') + '"></td></tr>';
	html += '</tbody>';
	html += '</table>';
	html += '</div>';
	html += '</section>';
	html += '<h1>History</h1>';
	html += '<div class="table-responsive">';
	html += '<table class="table table-striped">';
	html += '<thead><tr><th></th><th>Date</th><th>Account</th><th>Identifier</th><th>Action</th><th>Value</th></tr></thead>';
	html += '<tbody id="' + this.identifier('history') + '">';
        html += '</tbody>';
	html += '</table>';
	html += '</div>';
	html += '</main>';
	html += '</div>';
	html += '</div>';

	$('body').append(html);
	$('#section_' + this.identifier()).hide();
}

frozenether.Account.prototype.html = function() {
	this.htmlSummary();
	this.htmlSection();
	this.updateHtml();
}

frozenether.Account.prototype.naviguate = function() {
	this.updateHtml();
	frozenether.naviguate(this.identifier());
	$('#deposit_owner').text(this.owner);
	$('#deposit_id').text(this.id);
	$('#withdraw_owner').text(this.owner);
	$('#withdraw_id').text(this.id);
	$('#lengthen_owner').text(this.owner);
	$('#lengthen_id').text(this.id);
}

frozenether.Account.prototype.create = function(amount, duration) {
	var self = this;
	var frozen;

	if (typeof this.id !== 'undefined') {
		console.error('Account is already created');
		return;
	}

	frozenether.contract.deployed().then(function(instance) {
		frozen = instance;
		return Math.floor(Math.random() * 65536);
	}).then(function(id) {
		self.id = web3.toBigNumber(id);
		self.history = new frozenether.History(self.identifier('history'));
		return frozen.isExist.call(self.id, { from: self.owner });
	}).then(function(exist) {
		if (exist) {
			console.error('The account already exists');
			this.reject();
			return;
		}
		return frozen.create(self.id, duration, { from: self.owner, value: amount });
	}).then(function() {
		self.html();
		localStorage.setItem('first_name', 'accounts');
		$('#popup_create').modal('toggle');
		$('#create_button').prop('disabled', false);
	}).catch(function() {
		$('#popup_create').modal('toggle');
		$('#create_button').prop('disabled', false);
		frozenether.fail('Create new Frozen Ether account failed');
	});
}

frozenether.Account.prototype.deposit = function(amount) {
	var self = this;
	var frozen;

	frozenether.contract.deployed().then(function(instance) {
		frozen = instance;
		return frozen.isExist.call(self.id, { from: self.owner });
	}).then(function(exist) {
		if (!exist) {
			console.error('The account doesn\'t exist');
			this.reject();
			return;
		}
		return frozen.deposit(self.id, { from: self.owner, value: amount });
	}).then(function() {
		return self.updateHtml();
	}).then(function() {
		$('#popup_deposit').modal('toggle');
		$('#deposit_button').prop('disabled', false);
	}).catch(function() {
		$('#popup_deposit').modal('toggle');
		$('#deposit_button').prop('disabled', false);
		frozenether.fail('deposit on Frozen Ether account failed');
	});
}

frozenether.Account.prototype.withdraw = function(amount) {
	var self = this;
	var frozen;

	frozenether.contract.deployed().then(function(instance) {
		frozen = instance;
		return frozen.isExist.call(self.id, { from: self.owner });
	}).then(function(exist) {
		if (!exist) {
			console.error('The account doesn\'t exist');
			this.reject();
			return;
		}
		return frozen.withdraw(self.id, amount, { from: self.owner });
	}).then(function() {
		return self.updateHtml();
	}).then(function() {
		$('#popup_withdraw').modal('toggle');
		$('#withdraw_button').prop('disabled', false);
	}).catch(function() {
		$('#popup_withdraw').modal('toggle');
		$('#withdraw_button').prop('disabled', false);
		frozenether.fail('withdraw from Frozen Ether account failed');
	});
}

frozenether.Account.prototype.lengthen = function(duration) {
	var self = this;
	var frozen;

	frozenether.contract.deployed().then(function(instance) {
		frozen = instance;
		return frozen.isExist.call(self.id, { from: self.owner });
	}).then(function(exist) {
		if (!exist) {
			console.error('The account doesn\'t exist');
			this.reject();
			return;
		}
		return frozen.lenghtenFrozenState(self.id, duration, { from: self.owner });
	}).then(function() {
		return self.updateHtml();
	}).then(function() {
		$('#popup_lengthen').modal('toggle');
		$('#lengthen_button').prop('disabled', false);
	}).catch(function() {
		$('#popup_lengthen').modal('toggle');
		$('#lengthen_button').prop('disabled', false);
		frozenether.fail('lengthen the Frozen Ether account failed');
	});
}

frozenether.Account.prototype.onEvent = function(msg) {
	this.history.onEvent(msg);
	this.updateHtml();
}

frozenether.getAccount = function(owner, id) {
	var found = undefined;

	frozenether.accounts.forEach(function(account) {
		if (account.isEqual(owner, id)) {
			found = account;
		}
	});
	return found;
}

frozenether.create = function() {
	var owner = $('#create_owner').text().trim();
	var amount;
	var amount_value = parseFloat($('#create_amount_value').val());
	var amount_unit = $('#create_amount_unit').text().trim();
	var duration;
	var duration_value = parseInt($('#create_duration_value').val());
	var duration_unit = $('#create_duration_unit').text().trim();
	var account;

	amount = web3.toWei(amount_value, amount_unit);
	duration = frozenether.durationToInt(duration_value, duration_unit);

	account = new frozenether.Account(owner);
	account.create(amount, duration);
}

frozenether.deposit = function() {
	var owner = $('#deposit_owner').text();
	var id = $('#deposit_id').text();
	var amount;
	var amount_value = parseFloat($('#deposit_amount_value').val());
	var amount_unit = $('#deposit_amount_unit').text().trim();
	var account;

	amount = web3.toWei(amount_value, amount_unit);
	account = frozenether.getAccount(owner, id);
	if (typeof account === 'undefined') {
		console.error('Get account failed: owner(' + owner + ') id(' + id + ')');
		return;
	}

	account.deposit(amount);
}

frozenether.withdraw = function() {
	var owner = $('#withdraw_owner').text();
	var id = $('#withdraw_id').text();
	var amount;
	var amount_value = parseFloat($('#withdraw_amount_value').val());
	var amount_unit = $('#withdraw_amount_unit').text().trim();
	var account;

	if ($('#withdraw_all').is(':checked')) {
		amount = web3.toWei(1000000000, 'Ether');
	} else {
		amount = web3.toWei(amount_value, amount_unit);
		account = frozenether.getAccount(owner, id);
	}
	if (typeof account === 'undefined') {
		console.error('Get account failed: owner(' + owner + ') id(' + id + ')');
		return;
	}

	account.withdraw(amount);
}

frozenether.lengthen = function() {
	var owner = $('#lengthen_owner').text();
	var id = $('#lengthen_id').text();
	var duration;
	var duration_value = parseInt($('#lengthen_duration_value').val());
	var duration_unit = $('#lengthen_duration_unit').text().trim();
	var account;

	duration = frozenether.durationToInt(duration_value, duration_unit);
	account = frozenether.getAccount(owner, id);
	if (typeof account === 'undefined') {
		console.error('Get account failed: owner(' + owner + ') id(' + id + ')');
		return;
	}

	account.lengthen(duration);
}

frozenether.updateTotalAmount = function() {
	var total = web3.toBigNumber(0);

	frozenether.accounts.forEach(function(account) {
		if (typeof account.amount !== 'undefined') {
			total = total.plus(account.amount);
		}
	});
	$('#total_amount').text(frozenether.amountToString(total));
}

frozenether.onEvent = function(msg) {
	var account;

	account = frozenether.getAccount(msg.args.owner, msg.args.id);
	if (typeof account === 'undefined') {
		frozenether.contract.deployed().then(function(instance) {
			return instance.isExist.call(msg.args.id, { from: msg.args.owner });
		}).then(function(exist) {
			if (exist) {
				/* I recheck, because the account may created asynchronously */
				account = frozenether.getAccount(msg.args.owner, msg.args.id);
				if (typeof account === 'undefined') {
					account = new frozenether.Account(msg.args.owner, msg.args.id);
				}
				account.onEvent(msg);
			}
		});
	} else {
		account.onEvent(msg);
	}
	frozenether.history.onEvent(msg);
}

frozenether.onNewEthAccount = function(account) {
	var html = '<li><a href="#">' + account + '</a></li>';

	$('#popup_create_accounts_list').append(html);
}

frozenether.naviguate = function(name) {
	var nav;
	var section;

	if (typeof frozenether.active.nav !== 'undefined') {
		$(frozenether.active.nav).removeClass('active');
		$(frozenether.active.nav + ' > a > span').text('');
	}
	if (typeof frozenether.active.section !== 'undefined') {
		$(frozenether.active.section).hide();
	}

	if (typeof name === 'undefined') {
		name = localStorage.getItem('first_name');
	}

	nav = '#nav_' + name;
	section = '#section_' + name;
	if (!$(nav).length) {
		nav = '#nav_accounts';
	}
	if (!$(section).length) {
		section = '#section_accounts';
	}

	$(nav).addClass('active');
	$(nav + ' > a > span').text(' (current)');
	$(section).show();
	frozenether.active.nav = nav;
	frozenether.active.section = section;
}

frozenether.initContract = function() {
	return new Promise(function(resolve, reject) {
		frozenether.contract = contract(frozenether_artifacts);

		if (typeof web3 !== 'undefined') {
			window.web3 = new Web3(web3.currentProvider);
		} else {
			window.web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
		}
		frozenether.contract.setProvider(web3.currentProvider);

		web3.eth.getAccounts(function(e, accounts) {
			if (e != null) {
				reject("There was an error fetching your accounts.");
			} else if (accounts.length == 0) {
				reject("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.");
			}
			accounts.forEach(frozenether.onNewEthAccount);
			resolve();
		});
	});
}

frozenether.initEvents = function(owner) {
	var frozen;

	return frozenether.contract.deployed().then(function(instance) {
		frozen = instance;
		web3.eth.getAccounts(function(e, accounts) {
			frozen.allEvents({ fromBlock: 0, owner: accounts }).watch(function(e, msg) {
				if (e) {
					console.error('Error watching events');
					return;
				}
				frozenether.onEvent(msg);
			});
		});
	});
}

frozenether.initStorage = function() {
	var first_name = localStorage.getItem('first_name');
	if (first_name === null) {
		localStorage.setItem('first_name', 'presentation');
	}

	var history_size = localStorage.getItem('history_size');
	if (history_size === null) {
		localStorage.setItem('history_size', 32);
	}

	var terms_accepted = localStorage.getItem('terms_accepted');
	if (terms_accepted === null) {
		terms_accepted = 'false';
		localStorage.setItem('terms_accepted', terms_accepted);
	}
	if (terms_accepted == 'true') {
		$('#create_terms_button').hide();
	} else {
		$('#create_button').prop('disabled', false);
	}
}

frozenether.initNav = function() {
	$('#section_presentation').hide();
	$('#section_accounts').hide();
	$('#section_settings').hide();
	$('#section_about').hide();
	frozenether.naviguate();

	$('#nav_logo').on('click', function() {
		frozenether.naviguate('presentation');
	});
	$('#nav_presentation').on('click', function() {
		frozenether.naviguate('presentation');
	});
	$('#nav_accounts').on('click', function() {
		frozenether.naviguate('accounts');
	});
	$('#nav_settings').on('click', function() {
		frozenether.naviguate('settings');
	});
	$('#nav_about').on('click', function() {
		frozenether.naviguate('about');
	});
}

frozenether.initDropdown = function() {
	$('.dropdown-menu').on('click', 'a', function() {
		var text = $(this).html() + ' <span class="caret"></span>';
		$(this).closest('.dropdown').find('.dropdown-toggle').html(text);
	});
}

frozenether.initCheckbox = function() {
	$('#withdraw_all').prop('checked', false);
	$('#withdraw_all').change(function(event) {
		if (event.target.checked) {
			$('#withdraw_amount_value').val(0);
			$('#withdraw_amount_value').prop('disabled', true);
			$('#withdraw_amount_unit').prop('disabled', true);
		} else {
			$('#withdraw_amount_value').prop('disabled', false);
			$('#withdraw_amount_unit').prop('disabled', false);
		}
	});
}

frozenether.initButton = function() {
	$('#create_button').on('click', function() {
		$('#create_button').prop('disabled', true);
		frozenether.create();
	});
	$('#deposit_button').on('click', function() {
		$('#deposit_button').prop('disabled', true);
		frozenether.deposit();
	});
	$('#withdraw_button').on('click', function() {
		$('#withdraw_button').prop('disabled', true);
		frozenether.withdraw();
	});
	$('#lengthen_button').on('click', function() {
		$('#lengthen_button').prop('disabled', true);
		frozenether.lengthen();
	});
	$('#terms_button').on('click', function() {
		localStorage.setItem('terms_accepted', 'true');
		$('#create_button').prop('disabled', false);
		$('#create_terms_button').hide();
		$('#popup_terms').modal('toggle');
	});
}

frozenether.initSettings = function() {
	var size;

	$('#history_size').on('change', function() {
		size = parseInt($('#history_size').val(), 10);
		localStorage.setItem('history_size', size);
		frozenether.history.setMax(size);
		frozenether.accounts.forEach(function(account) {
			account.history.setMax(size);
		});
	});
}

$(function() {

	frozenether.initContract().then(function() {
		frozenether.initStorage();
	}).then(function() {
		frozenether.initEvents();
	}).then(function() {
		frozenether.history = new frozenether.History('history');
	}).then(function() {
		frozenether.initDropdown();
	}).then(function() {
		frozenether.initCheckbox();
	}).then(function() {
		frozenether.initButton();
	}).then(function() {
		frozenether.initSettings();
	}).then(function() {
		frozenether.initNav();
	}).catch(function(message) {
		frozenether.fail('Initialization failed ' + message);
	});
});

