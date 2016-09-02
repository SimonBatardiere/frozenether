const FROZEN_ETHER_ADDRESS = '0x0000000000000000000000000000000000000000';
const FROZEN_ETHER_ADDRESS_TESTNET = '0xb466c54ac0edd7b84f2d186a64de1090afbbc4de';
const FROZEN_ETHER_STARTING_BLOCK = 0;
const FROZEN_ETHER_STARTING_BLOCK_TESTNET = 1536935;
const FROZEN_ETHER_ABI = [{"constant":true,"inputs":[{"name":"id","type":"uint256"}],"name":"remainingTime","outputs":[{"name":"","type":"uint256"}],"type":"function"},{"constant":false,"inputs":[{"name":"id","type":"uint256"},{"name":"duration","type":"uint256"}],"name":"lenghtenFrozenState","outputs":[{"name":"","type":"bool"}],"type":"function"},{"constant":false,"inputs":[{"name":"id","type":"uint256"},{"name":"amount","type":"uint256"}],"name":"withdraw","outputs":[{"name":"","type":"bool"}],"type":"function"},{"constant":true,"inputs":[{"name":"id","type":"uint256"}],"name":"amount","outputs":[{"name":"","type":"uint256"}],"type":"function"},{"constant":false,"inputs":[{"name":"id","type":"uint256"},{"name":"duration","type":"uint256"}],"name":"create","outputs":[{"name":"","type":"bool"}],"type":"function"},{"constant":false,"inputs":[{"name":"id","type":"uint256"}],"name":"deposit","outputs":[{"name":"","type":"bool"}],"type":"function"},{"inputs":[],"type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"name":"owner","type":"address"},{"indexed":false,"name":"id","type":"uint256"},{"indexed":false,"name":"amount","type":"uint256"}],"name":"Create","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"owner","type":"address"},{"indexed":false,"name":"id","type":"uint256"}],"name":"Destroy","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"owner","type":"address"},{"indexed":false,"name":"id","type":"uint256"},{"indexed":false,"name":"amount","type":"uint256"}],"name":"Deposit","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"owner","type":"address"},{"indexed":false,"name":"id","type":"uint256"},{"indexed":false,"name":"amount","type":"uint256"}],"name":"Withdraw","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"owner","type":"address"},{"indexed":false,"name":"id","type":"uint256"},{"indexed":false,"name":"duration","type":"uint256"}],"name":"Freeze","type":"event"}];

function init() {
	console.log('Initialize');
	if (!initWeb3()) {
		return false;
	}
	initAccounts();
	frozenether.contract = new frozenether.Contract();
	return true;
}

function initWeb3() {
	if (typeof web3 !== 'undefined' && typeof Web3 !== 'undefined') {
		web3 = new Web3(web3.currentProvider);
	} else if (typeof Web3 !== 'undefined') {
		web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));
	} else if (typeof web3 == 'undefined' && typeof Web3 == 'undefined') {
		console.log('Web3 is not supported');
		return false;
	}
	return true;
}

frozenether.Contract = function() {
	this.contract = {};
	this.startingBlock = FROZEN_ETHER_STARTING_BLOCK;
	this.init();
}

frozenether.Contract.prototype.init = function() {
	var contractAddress = FROZEN_ETHER_ADDRESS;

	web3.eth.getCode(contractAddress, function(error, code) {
		if (error) {
			console.error('Cannot get Ethereum contract\'s code for ' + contractAddress);
			return;
		}

		if (code.length < 3) {
			console.log('Switch on test network');
			contractAddress = FROZEN_ETHER_ADDRESS_TESTNET;
			this.startingBlock = FROZEN_ETHER_STARTING_BLOCK_TESTNET;
		}
		this.contract = web3.eth.contract(FROZEN_ETHER_ABI).at(contractAddress);
		this.start();
	})
}

frozenether.Contract.prototype.start = function() {
	this.watchEvents();
}

frozenether.checkAccount = function(account) {
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

frozenether.Contract.prototype.remainingTime = function(account, id) {
	if (!frozenether.checkAccount(account)) {
		console.error('Account ' + account + ' is invalid');
		return 0;
	}
	return this.contract.remainingTime(id, {from: account});
}

frozenether.Contract.prototype.exist = function(account, id) {
	if (remainingTime(account, id) == 0) {
		return false;
	}
	return true;
}

frozenether.Contract.prototype.amount = function(account, id) {
	if (!frozenether.checkAccount(account)) {
		console.error('Account ' + account + ' is invalid');
		return 0;
	}
	return this.contract.amount(id, {from: account});
}

frozenether.Contract.prototype.create = function(account, duration, amount, unit) {
	var id = 0;
	var wei = 0;

	if (!frozenether.checkAccount(account)) {
		console.error('Account ' + account + ' is invalid');
		return -1;
	}

	wei = web3.toWei(amount, unit);
	if (isNaN(wei) || wei < 0) {
		console.error('Amount is invalid');
		return -1;
	}

	while (exist(account, id)) {
		id = Math.floor(Math.random() * 65536);
	}

	if (isNaN(duration) || duration < 0) {
		console.error('Duration is invalid');
		return -1;
	}

	console.log('Send create transaction: account: ' + account + ' id: ' + id + ' duration: ' + duration + ' amount: ' + wei);
	this.contract.create(id, duration, {from: account, value: wei}, function(error) {
		if (error) {
			console.error('Create transaction failed');
			return;
		}
		console.log('Create transaction done');
	});
	return id;
}

frozenether.Contract.prototype.deposit = function(account, id, amount, unit) {
	var wei = 0;

	if (!frozenether.checkAccount(account)) {
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
	this.contract.deposit(id, {from: account, value: wei}, function(error) {
		if (error) {
			console.error('Deposit transaction failed');
			return;
		}
		console.log('Deposit transaction done');
	});
	return true;
}

frozenether.Contract.prototype.withdraw = function(account, id, amount, unit) {
	var wei = 0;

	if (!frozenether.checkAccount(account)) {
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
	this.contract.withdraw(id, wei, {from: account}, function(error) {
		if (error) {
			console.error('Withdraw transaction failed');
			return;
		}
		console.log('Withdraw transaction done');
	});
	return true;
}

frozenether.Contract.prototype.lenghtenFrozenState = function(account, id, duration) {
	if (!frozenether.checkAccount(account)) {
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
	this.contract.lenghtenFrozenState(id, duration, {from: account}, function(error) {
		if (error) {
			console.error('Lengthen frozen state transaction failed');
			return;
		}
		console.log('Lengthen frozen state transaction done');
	});
	return true;
}

frozenether.Contract.prototype.onEvent = function(owner, id, account) {
	if (typeof account === 'undefined') {
		account = getAccount(owner, id);
	}
	if (typeof account === 'undefined') {
		console.error('Cannot get account(' + owner + '|' + id + ')');
		return;
	}
	account.update();
}

frozenether.Contract.prototype.onCreate = function(owner, id, amount) {
	var account = getAccount(owner, id);
	if (typeof account === 'undefined') {
		account = new frozenether.Account(owner, id);
		frozenether.accounts.push(account);
	}
	onEvent(owner, id, account);
}

frozenether.Contract.prototype.onDestroy = function(owner, id) {
	onEvent(owner, id);
}

frozenether.Contract.prototype.onDeposit = function(owner, id, amount) {
	onEvent(owner, id);
}

frozenether.Contract.prototype.onWithdraw = function(owner, id, amount) {
	onEvent(owner, id);
}

frozenether.Contract.prototype.onFreeze = function(owner, id, duration) {
	onEvent(owner, id);
}

frozenether.Contract.prototype.watchEvents = function() {
	var watcher;

	if (!web3.eth.accounts) {
		console.error('No accounts configured');
		return;
	}

	watcher = this.contract.Create({owner: web3.eth.accounts}, {fromBlock: this.startingBlock});
	watcher.watch(function(error, msg) {
		if (error) {
			console.error('Error with create event');
			return;
		}
		if (!frozenether.checkAccount(msg.args.owner)) {
			return;
		}
		console.log('Create event: owner: ' + msg.args.owner + ' id: ' + msg.args.id + ' amount: ' + msg.args.amount);
		this.onCreate(msg.args.owner, msg.args.id, msg.args.amount);
	});

	watcher = this.contract.Destroy({owner: web3.eth.accounts}, {fromBlock: this.startingBlock});
	watcher.watch(function(error, msg) {
		if (error) {
			console.error('Error with destroy event');
			return;
		}
		if (!frozenether.checkAccount(msg.args.owner)) {
			return;
		}
		console.log('Destroy event: owner: ' + msg.args.owner + ' id: ' + msg.args.id);
		this.onDestroy(msg.args.owner, msg.args.id);
	});

	watcher = this.contract.Deposit({owner: web3.eth.accounts}, {fromBlock: this.startingBlock});
	watcher.watch(function(error, msg) {
		if (error) {
			console.error('Error with deposit event');
			return;
		}
		if (!frozenether.checkAccount(msg.args.owner)) {
			return;
		}
		console.log('Deposit event: owner: ' + msg.args.owner + ' id: ' + msg.args.id + ' amount: ' + msg.args.amount);
		this.onDeposit(msg.args.owner, msg.args.id, msg.args.amount);
	});

	watcher = this.contract.Withdraw({owner: web3.eth.accounts}, {fromBlock: this.startingBlock});
	watcher.watch(function(error, msg) {
		if (error) {
			console.error('Error with withdraw event');
			return;
		}
		if (!frozenether.checkAccount(msg.args.owner)) {
			return;
		}
		console.log('Withdraw event: owner: ' + msg.args.owner + ' id: ' + msg.args.id + ' amount: ' + msg.args.amount);
		this.onWithdraw(msg.args.owner, msg.args.id, msg.args.amount);
	});

	watcher = this.contract.Freeze({owner: web3.eth.accounts}, {fromBlock: this.startingBlock});
	watcher.watch(function(error, msg) {
		if (error) {
			console.error('Error with freeze event');
			return;
		}
		if (!frozenether.checkAccount(msg.args.owner)) {
			return;
		}
		console.log('Freeze event: owner: ' + msg.args.owner + ' id: ' + msg.args.id + ' duration: ' + msg.args.duration);
		this.onFreeze(msg.args.owner, msg.args.id, msg.args.duration);
	});
}

function initAccounts() {
	var i, len, html;

	if (!web3.eth.accounts) {
		console.log('No Ethereum account found');
		return;
	}

	len = web3.eth.accounts.length;
	for (i = 0; i < len; i++) {
		html = '<option value="' + web3.eth.accounts[i] + '">' + web3.eth.accounts[i] + '</option>'
		$('#create_owner').append(html);
	}
}

$(function() {
	init();
});

