var frozenether = {
	active: {},
	accounts: [],
	contract: {}
};

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
}

$(function() {
	frozenether.initStorage();
	frozenether.initNav();
});

