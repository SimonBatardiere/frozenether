var frozenether = {
	active: {},
	accounts: [],
	contract: {}
};

frozenether.amountToString = function(amount) {
	var string = '';
	var units = ['Wei', 'Kwei', 'Mwei', 'Gwei', 'Szabo', 'Finney', 'Ether', 'Kether', 'Mether', 'Gether', 'Tether'];
	var i = 0;
	var len = units.length;

	do {
		if (amount.lessThan(1000)) {
			string = amount.round(3).toString() + ' ' + units[i];
			return string;
		}
		i++;
	} while (amount = amount.div(1000));
	return 'Unknwon';
}

frozenether.Account = function(owner, id) {
	this.owner = owner;
	this.id = new BigNumber(id);
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

frozenether.Account.prototype.htmlAccounts = function() {
	var html = '';

	html += '<div class="col-6 col-sm-3 placeholder">'
	html += '<img src="data:image/gif;base64,R0lGODlhAQABAIABAADcgwAAACwAAAAAAQABAAACAkQBADs=" width="200" height="200" class="img-fluid rounded-circle" alt="Frozen Ether account representation">'
	html += '<h4>Account</h4>'
	html += '<div class="text-muted">' + this.amountToString() + '</div>'
	html += '<div class="text-muted">' + this.durationToString() + '</div>'
	html += '</div>'
	$('#accounts').after(html);

	$('blbla').on('click', function() {
		frozenether.naviguate('presentation');
	});
}

frozenether.Account.prototype.htmlSection = function() {
}

frozenether.Account.prototype.html = function() {
	this.htmlAccounts();
	this.htmlSection();
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

	$(nav).addClass('active');
	$(nav + ' > a > span').text(' (current)');
	$(section).show();
	frozenether.active.nav = nav;
	frozenether.active.section = section;
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

$(function() {
	frozenether.initStorage();
	frozenether.initNav();
});

