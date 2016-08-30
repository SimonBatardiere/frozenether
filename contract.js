const FROZEN_ETHER_ADDRESS = '0x0000000000000000000000000000000000000000';
const FROZEN_ETHER_ADDRESS_TESTNET = '0xb466C54ac0edD7B84F2D186a64dE1090afbbC4dE';
const FROZEN_ETHER_STARTING_BLOCK = 0;
const FROZEN_ETHER_STARTING_BLOCK_TESTNET = 1536935;
const FROZEN_ETHER_ABI = [{"constant":true,"inputs":[{"name":"id","type":"uint256"}],"name":"remainingTime","outputs":[{"name":"","type":"uint256"}],"type":"function"},{"constant":false,"inputs":[{"name":"id","type":"uint256"},{"name":"duration","type":"uint256"}],"name":"lenghtenFrozenState","outputs":[{"name":"","type":"bool"}],"type":"function"},{"constant":false,"inputs":[{"name":"id","type":"uint256"},{"name":"amount","type":"uint256"}],"name":"withdraw","outputs":[{"name":"","type":"bool"}],"type":"function"},{"constant":true,"inputs":[{"name":"id","type":"uint256"}],"name":"amount","outputs":[{"name":"","type":"uint256"}],"type":"function"},{"constant":false,"inputs":[{"name":"id","type":"uint256"},{"name":"duration","type":"uint256"}],"name":"create","outputs":[{"name":"","type":"bool"}],"type":"function"},{"constant":false,"inputs":[{"name":"id","type":"uint256"}],"name":"deposit","outputs":[{"name":"","type":"bool"}],"type":"function"},{"inputs":[],"type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"name":"owner","type":"address"},{"indexed":false,"name":"id","type":"uint256"},{"indexed":false,"name":"amount","type":"uint256"}],"name":"Create","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"owner","type":"address"},{"indexed":false,"name":"id","type":"uint256"}],"name":"Destroy","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"owner","type":"address"},{"indexed":false,"name":"id","type":"uint256"},{"indexed":false,"name":"amount","type":"uint256"}],"name":"Deposit","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"owner","type":"address"},{"indexed":false,"name":"id","type":"uint256"},{"indexed":false,"name":"amount","type":"uint256"}],"name":"Withdraw","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"owner","type":"address"},{"indexed":false,"name":"id","type":"uint256"},{"indexed":false,"name":"duration","type":"uint256"}],"name":"Freeze","type":"event"}];

var contract;
var startingBlock;

function init() {
	console.log('Initialize');
	if (!initWeb3()) {
		return false;
	}
	initContract();
	initEvents();
	initAccounts();
	return true;
}

function initWeb3() {
	if (typeof web3 !== 'undefined' && typeof Web3 !== 'undefined') {
		web3 = new Web3(web3.currentProvider);
	} else if (typeof Web3 !== 'undefined') {
		web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));
	} else {
		console.log('Web3 is not supported');
		return false;
	}
	return true;
}

function initContract() {
	var contractAddress = FROZEN_ETHER_ADDRESS;

	startingBlock = FROZEN_ETHER_STARTING_BLOCK;
	web3.eth.getCode(contractAddress, function(error, result) {
		if (error) {
			console.error('Cannot get Ethereum contract\'s code for ' + contractAddress);
			return;
		}

		if (result.length < 3) {
			console.log('Switch on test network');
			contractAddress = FROZEN_ETHER_ADDRESS_TESTNET;
			startingBlock = FROZEN_ETHER_STARTING_BLOCK_TESTNET;
		}
		contract = web3.eth.contract(FROZEN_ETHER_ABI).at(contractAddress);
	})
}

function checkAccount(account) {
	var i, len;

	if (!web3.eth.accounts) {
		return false;
	}

	len = web3.eth.accounts.length;
	for (i = 0; i < len; i++) {
		if (web3.eth.accounts[i] == account) {
			return true;
		}
	}
	return false;
}

function remainingTime(account, id) {
	if (!checkAccount(account)) {
		console.error('Account ' + account + ' is invalid');
		return 0;
	}
	return contract.remainingTime(id, {from: account});
}

function exist(account, id) {
	if (remainingTime(account, id) == 0) {
		return false;
	}
	return true;
}

function amount(account, id) {
	if (!checkAccount(account)) {
		console.error('Account ' + account + ' is invalid');
		return 0;
	}
	return contract.amount(id, {from: account});
}

function create(account, duration, amount, unit) {
	var id = 0;
	var wei = 0;

	if (!checkAccount(account)) {
		console.error('Account ' + account + ' is invalid');
		return false;
	}

	wei = web3.toWei(amount, unit);
	if (isNaN(wei) || wei < 0) {
		console.error('Amount is invalid');
		return false;
	}

	while (exist(account, id)) {
		id = Math.floor(Math.random() * 65536);
	}

	if (isNaN(duration) || duration < 0) {
		console.error('Duration is invalid');
		return false;
	}

	console.log('Send create transaction: account: ' + account + ' id: ' + id + ' duration: ' + duration + ' amount: ' + wei);
	contract.create(id, duration, {from: account, value: wei}, function(error) {
		if (error) {
			console.error('Create transaction failed');
			return;
		}
		console.log('Create transaction done');
	});
	return true;
}

function deposit(account, id, amount, unit) {
	var wei = 0;

	if (!checkAccount(account)) {
		console.error('Account ' + account + ' is invalid');
		return false;
	}

	if (isNaN(id) || id < 0) {
		console.error('Identifier is invalid');
		return false;
	}

	wei = web3.toWei(amount, unit);
	if (isNaN(wei) || wei <= 0) {
		console.error('Amount is invalid');
		return false;
	}

	console.log('Send deposit transaction: account: ' + account + ' id: ' + id + ' amount: ' + wei);
	contract.deposit(id, {from: account, value: wei}, function(error) {
		if (error) {
			console.error('Deposit transaction failed');
			return;
		}
		console.log('Deposit transaction done');
	});
	return true;
}

function withdraw(account, id, amount, unit) {
	var wei = 0;

	if (!checkAccount(account)) {
		console.error('Account ' + account + ' is invalid');
		return false;
	}

	if (isNaN(id) || id < 0) {
		console.error('Identifier is invalid');
		return false;
	}

	wei = web3.toWei(amount, unit);
	if (isNaN(wei) || wei <= 0) {
		console.error('Amount is invalid');
		return false;
	}

	console.log('Send withdraw transaction: account: ' + account + ' id: ' + id + ' amount: ' + wei);
	contract.withdraw(id, wei, {from: account}, function(error) {
		if (error) {
			console.error('Withdraw transaction failed');
			return;
		}
		console.log('Withdraw transaction done');
	});
	return true;
}

function lenghtenFrozenState(account, id, duration) {
	if (!checkAccount(account)) {
		console.error('Account ' + account + ' is invalid');
		return false;
	}

	if (isNaN(id) || id < 0) {
		console.error('Identifier is invalid');
		return false;
	}

	if (isNaN(duration) || duration < 0) {
		console.error('Duration is invalid');
		return false;
	}

	console.log('Send lengthen frozen state transaction: account: ' + account + ' id: ' + id + ' duration: ' + duration);
	contract.lenghtenFrozenState(id, duration, {from: account}, function(error) {
		if (error) {
			console.error('Lengthen frozen state transaction failed');
			return;
		}
		console.log('Lengthen frozen state transaction done');
	});
	return true;
}

function onCreate(account, id, amount) {
	if (!checkAccount(account)) {
		console.error('Account ' + account + ' is invalid');
		return false;
	}
}

function onDestroy(account, id) {
	if (!checkAccount(account)) {
		console.error('Account ' + account + ' is invalid');
		return false;
	}
}

function onDeposit(account, id, amount) {
	if (!checkAccount(account)) {
		console.error('Account ' + account + ' is invalid');
		return false;
	}
}

function onWithdraw(account, id, amount) {
	if (!checkAccount(account)) {
		console.error('Account ' + account + ' is invalid');
		return false;
	}
}

function onFreeze(account, id, duration) {
	if (!checkAccount(account)) {
		console.error('Account ' + account + ' is invalid');
		return false;
	}
}

function Events() {
	this.start = function() {
		if (!web3.eth.accounts) {
			console.error('No accounts configured');
			return;
		}

		if (typeof this.create === 'undefined') {
			this.create = contract.Create({owner: web3.eth.accounts}, {fromBlock: startingBlock});
			this.create.watch(function(error, data) {
				if (error) {
					console.error('Error with create event');
					return;
				}
				console.log('Create event: owner: ' + data.args.owner + ' id: ' + data.args.id + ' amount: ' + data.args.amount);
				onCreate(data.args.owner, data.args.id, data.args.amount);
			});
		}

		if (typeof this.destroy === 'undefined') {
			this.destroy = contract.Destroy({owner: web3.eth.accounts}, {fromBlock: startingBlock});
			this.destroy.watch(function(error, data) {
				if (!error) {
					console.error('Error with destroy event');
					return;
				}
				console.log('Destroy event: owner: ' + data.args.owner + ' id: ' + data.args.id);
				onDestroy(data.args.owner, data.args.id);
			});
		}

		if (typeof this.deposit === 'undefined') {
			this.deposit = contract.Deposit({owner: web3.eth.accounts}, {fromBlock: startingBlock});
				this.deposit.watch(function(error, data) {
				if (!error) {
					console.error('Error with deposit event');
					return;
				}
				console.log('Deposit event: owner: ' + data.args.owner + ' id: ' + data.args.id + ' amount: ' + data.args.amount);
				onDeposit(data.args.owner, data.args.id, data.args.amount);
			});
		}

		if (typeof this.withdraw === 'undefined') {
			this.withdraw = contract.Withdraw({owner: web3.eth.accounts}, {fromBlock: startingBlock});
			this.withdraw.watch(function(error, data) {
				if (!error) {
					console.error('Error with withdraw event');
					return;
				}
				console.log('Withdraw event: owner: ' + data.args.owner + ' id: ' + data.args.id + ' amount: ' + data.args.amount);
				onWithdraw(data.args.owner, data.args.id, data.args.amount);
			});
		}

		if (typeof this.freeze === 'undefined') {
			this.freeze = contract.Freeze({owner: web3.eth.accounts}, {fromBlock: startingBlock});
			this.freeze.watch(function(error, data) {
				if (!error) {
					console.error('Error with freeze event');
					return;
				}
				console.log('Freeze event: owner: ' + data.args.owner + ' id: ' + data.args.id + ' duration: ' + data.args.duration);
				onFreeze(data.args.owner, data.args.id, data.args.duration);
			});
		}
	};

	this.stop = function() {
		if (typeof this.create !== 'undefined') {
			this.create.stopWatching();
			delete this.create;
		}

		if (typeof this.destroy !== 'undefined') {
			this.destroy.stopWatching();
			delete this.destroy;
		}

		if (typeof this.deposit !== 'undefined') {
			this.deposit.stopWatching();
			delete this.deposit;
		}

		if (typeof this.withdraw !== 'undefined') {
			this.withdraw.stopWatching();
			delete this.withdraw;
		}

		if (typeof this.freeze !== 'undefined') {
			this.freeze.stopWatching();
			delete this.freeze;
		}
	};

	this.restart = function() {
		this.stop();
		this.start();
	};
};

function initAccounts() {
	var i, len, html;

	if (!web3.eth.accounts) {
		console.log('No Ethereum account found');
		return;
	}

	len = web3.eth.accounts.length;
	for (i = 0; i < len; i++) {
		html = '<option value="' + web3.eth.accounts[i] + '">' + web3.eth.accounts[i] + '</option>'
		$('#create_account').after(html);
	}
}

$(function() {
	init();
});

