import "../stylesheets/frozenether.css";
import { default as Web3 } from 'web3';
import { default as contract } from 'truffle-contract'
import frozenether_artifacts from '../../build/contracts/FrozenEther.json'

var frozenether = {
	contract: {},
	active: {},
	accounts: []
};

frozenether.amountToString = function(amount) {
	var string = '';
	var units = ['Wei', 'Kwei', 'Mwei', 'Gwei', 'Szabo', 'Finney', 'Ether', 'Kether', 'Mether', 'Gether', 'Tether'];
	var i = 0;
	var len = units.length;

	if (amount === undefined) {
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

	if (duration === undefined) {
		return '';
	}
	return '';
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
		duration = duration.times('31557600');
		break;
	default:
		console.error('Unknown duration unit(' + unit + '): use \'Days\'');
		duration = duration.times('86400');
		break;
	}
	return duration;
}

frozenether.Account = function(owner, amount, duration) {
	var self = this;
	var frozen;

	this.owner = owner;
	this.id = undefined;
	this.amount = undefined;
	this.duration = undefined;

	frozenether.contract.deployed().then(function(instance) {
		frozen = instance;
		return Math.floor(Math.random() * 65536);
	}).then(function(id) {
		self.id = web3.toBigNumber(id);
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
		console.error('Create new Frozen Ether account failed');
	});
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
		if (self.duration !== undefined && self.duration.gt(0)) {
			$(self.selector('button_deposit')).prop('disabled', false);
			$(self.selector('button_withdraw')).prop('disabled', true);
		} else {
			$(self.selector('button_deposit')).prop('disabled', true);
			$(self.selector('button_withdraw')).prop('disabled', false);
		}
	});
}

frozenether.Account.prototype.htmlSummary = function() {
	var self = this;
	var html = '';

	html += '<div id="' + this.identifier('summary') + '" class="col-6 col-sm-3">';
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
	html += '<thead><tr><th>Date</th><th>Account</th><th>Identifier</th><th>Action</th><th>Amount</th></tr></thead>';
	html += '<tbody>';
	html += '<tr><td>9 Mar 2017, 10:31</td><td>0x6483d4DBBEAe052F69C90b0Bd26cCFF2A44Ada13</td><td>31</td><td>Create</td><td>10</td></tr>';
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
		console.error('Deposit on Frozen Ether account failed');
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
		console.error('Withdraw from Frozen Ether account failed');
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
		return frozen.lengthen(self.id, duration, { from: self.owner });
	}).then(function() {
		return self.updateHtml();
	}).then(function() {
		$('#popup_lengthen').modal('toggle');
		$('#lengthen_button').prop('disabled', false);
	}).catch(function() {
		console.error('Lengthen the Frozen Ether account failed');
	});
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

	account = new frozenether.Account(owner, amount, duration);
	frozenether.accounts.push(account);
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
	if (account === undefined) {
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
	if (account === undefined) {
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
	if (account === undefined) {
		console.error('Get account failed: owner(' + owner + ') id(' + id + ')');
		return;
	}

	account.lengthen(duration);
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

frozenether.initStorage = function() {
	var first_name = localStorage.getItem('first_name');
	if (first_name === null) {
		localStorage.setItem('first_name', 'presentation');
	}

	var history_size = localStorage.getItem('history_size');
	if (history_size === null) {
		localStorage.setItem('history_size', 8);
	}

	var terms_accepted = localStorage.getItem('terms_accepted');
	if (terms_accepted === null) {
		localStorage.setItem('terms_accepted', false);
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
}

frozenether.initFailed = function(message) {
	alert(message);
}

$(function() {
	frozenether.initContract().then(function() {
		frozenether.initStorage();
	}).then(function() {
		frozenether.initNav();
	}).then(function() {
		frozenether.initDropdown();
	}).then(function() {
		frozenether.initCheckbox();
	}).then(function() {
		frozenether.initButton();
	}).catch(function(message) {
		frozenether.initFailed(message);
	});
});

