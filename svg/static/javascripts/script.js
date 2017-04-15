import { default as Web3 } from 'web3';
import { default as contract } from 'truffle-contract'
import frozenether_artifacts from '../../../build/contracts/FrozenEther.json'

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

frozenether.Account = function(owner, id) {
	this.owner = owner;
	this.id = new BigNumber(id);
	this.amount = undefined;
	this.duration = undefined;
	this.html();
	localStorage.setItem('first_name', 'accounts');
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
		return frozen.amount.call(self.id, { from: self.owner });
	}).then(function(amount) {
		self.amount = amount;
		return frozen.remainingTime.call(self.id, { from: self.owner });
	}).then(function(duration) {
		self.duration = duration;
	}).catch(function(e) {
		self.amount = undefined;
		self.duration = undefined;
		console.error(e);
	}
}

frozenether.Account.prototype.updateHtml = function() {
	var self = this;
	return update().then(function() {
		$(self.selector('summary_amount')).text(frozenether.amountToString(self.amount));
		$(self.selector('summary_duration')).text(frozenether.durationToString(self.duration));
		$(self.selector('section_amount')).text(frozenether.amountToString(self.amount));
		$(self.selector('section_duration')).text(frozenether.durationToString(self.duration));
	});
}

frozenether.Account.prototype.htmlSummary = function() {
	var html = '';

	html += '<div id="' + self.selector('summary') + '" class="col-6 col-sm-3 placeholder">'
	html += '<img src="data:image/gif;base64,R0lGODlhAQABAIABAADcgwAAACwAAAAAAQABAAACAkQBADs=" width="200" height="200" class="img-fluid rounded-circle" alt="Frozen Ether account representation">'
	html += '<h4>Account</h4>'
	html += '<div id="' + self.selector('summary_amount') + '" class="text-muted"></div>'
	html += '<div id="' + self.selector('summary_duration') + '" class="text-muted"></div>'
	html += '</div>'
	$('#accounts').after(html);

	$('#section_' + this.identifier()).on('click', function() {
		frozenether.naviguate(this.identifier);
	});
}

frozenether.Account.prototype.htmlSection = function() {
	var html = '';

	html += '<div id="section' + this.identifier() + '" class="container-fluid">'
	html += '<div class="row">'
	html += '<main class="col-sm-12 offset-sm-0 col-md-12 offset-md-0 pt-3">'
	html += '<section class="row text-left">'
	html += '<div class="col-sm-3">'
	html += '<img src="data:image/gif;base64,R0lGODlhAQABAIABAADcgwAAACwAAAAAAQABAAACAkQBADs=" width="200" height="200" class="img-fluid img-circle" alt="Account representation">'
	html += '<div class="btn-group fe-account-controls" role="group" aria-label="Account\'s actions">'
	html += '<button type="button" data-toggle="modal" href="#popup_deposit" class="btn btn-default" title="Deposit">'
	html += '<span class="glyphicon glyphicon-log-in" aria-hidden="true">'
	html += '<span class="sr-only">Deposit</span>'
	html += '</button>'
	html += '<button type="button" data-toggle="modal" href="#popup_withdraw" class="btn btn-default" title="Withdraw">'
	html += '<span class="glyphicon glyphicon-log-out" aria-hidden="true">
	html += '<span class="sr-only">Withdraw</span>'
	html += '</button>'
	html += '<button type="button" data-toggle="modal" href="#popup_lengthen" class="btn btn-default" title="Lengthen duration">'
	html += '<span class="glyphicon glyphicon-time" aria-hidden="true">'
	html += '<span class="sr-only">Lengthen duration</span>'
	html += '</button>'
	html += '</div>'
	html += '</div>'
	html += '<div class="col-sm-9 table-responsive">'
	html += '<table class="table">'
	html += '<tbody>'
	html += '<tr><th>Address</th><td>' + this.owner + '</td></tr>'
	html += '<tr><th>Identifier</th><td>' + this.id.toString() + '</td></tr>'
	html += '<tr><th>Amount</th><td id="' + this.identifier('section_amount') + '"></td></tr>'
	html += '<tr><th>Remaining time</th><td id="' + this.identifier('section_duration' + '"></td></tr>'
	html += '</tbody>'
	html += '</table>'
	html += '</div>'
	html += '</section>'
	html += '<h1>History</h1>'
	html += '<div class="table-responsive">'
	html += '<table class="table table-striped">'
	html += '<thead><tr><th>Date</th><th>Account</th><th>Identifier</th><th>Action</th><th>Amount</th></tr></thead>'
	html += '<tbody>'
	html += '<tr><td>9 Mar 2017, 10:31</td><td>0x6483d4DBBEAe052F69C90b0Bd26cCFF2A44Ada13</td><td>31</td><td>Create</td><td>10</td></tr>
        html += '</tbody>'
	html += '</table>'
	html += '</div>'
	html += '</main>'
	html += '</div>'
	html += '</div>'
}

frozenether.Account.prototype.html = function() {
	this.htmlSummary();
	this.htmlSection();
	this.updateHtml();
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
	if ($(nav).length) {
		nav = '#nav_accounts';
	}
	if ($(section).length) {
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
			frozenether.accounts = accounts;
			resolve();
		}
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

frozenether.initFailed = function(message) {
	alert(message);
}

$(function() {
	frozenether.initContract().then(function() {
		frozenether.initStorage();
	}.then(function() {
		frozenether.initNav();
	}.catch(function(message) {
		frozenether.initFailed(message);
	}
});

