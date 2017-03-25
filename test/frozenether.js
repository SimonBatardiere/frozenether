var FrozenEther = artifacts.require("./FrozenEther.sol");

function increase_time(offset) {
	return new Promise(function(resolve, reject) {
		return web3.currentProvider.sendAsync({
				jsonrpc: "2.0",
				method: "evm_increaseTime",
				id: new Date().getTime(),
				params: [ offset ]
		}, error => {
			if (error) {
				reject(error);
			} else {
				resolve();
			}
		});
	});
}

function check(account, index, amount, duration, options)
{
	var prefix = "Account " + account + "[" + index + "] ";
	var contract;

	return FrozenEther.deployed().then(function(instance) {
		contract = instance;
		return contract.isExist(index, {from: account});
	}).then(function(exist) {
		if (options === undefined || options.exist === undefined || options.exist != 0) {
			assert(exist, prefix + "doesn't exist");
		}
		return contract.amount(index, {from: account});
	}).then(function(value) {
		console.log(options);
		if (options === undefined || options.amount === undefined || options.amount != 0) {
			assert(value.eq(amount), prefix + "has invalid amount(" + value.toString() + "/" +
					amount.toString() + ")");
		}
		return contract.remainingTime(index, {from: account});
	}).then(function(time) {
		if (options === undefined || options.duration === undefined || options.duration != 0) {
			assert(time.lte(duration), prefix + "has invalid remaining time(" + time.toString() + "/" +
					duration.toString() + ")");
		}
	});
}

function create(account, index, amount, duration) {
	var contract;

	return FrozenEther.deployed().then(function(instance) {
		contract = instance;
		return contract.create(index, duration, {from: account, value: amount});
	}).then(function(tx) {
		return check(account, index, amount, duration);
	});
}

function deposit(account, index, amount) {
	var contract;
	var total;

	return FrozenEther.deployed().then(function(instance) {
		contract = instance;
		return contract.amount(index, {from: account});
	}).then(function(value) {
		total = value.plus(amount);
		return contract.deposit(index, {from: account, value: amount});
	}).then(function(tx) {
		return check(account, index, total, 0, {duration: 0});
	});
}

function withdraw(account, index, amount, options) {
	var contract;
	var total;

	return FrozenEther.deployed().then(function(instance) {
		contract = instance;
		return contract.amount(index, {from: account});
	}).then(function(value) {
		total = value.minus(amount);
		return contract.withdraw(index, amount, {from: account});
	}).then(function(tx) {
		if (options === undefined) {
			options = {};
		}
		options.duration = 0;
		return check(account, index, total, 0, options);
	});
}

contract('FrozenEther', function(accounts) {
	var account;
	var i;
	var j;

	it("Create one account", function() {
		return create(accounts[0], 1000, 1000, 1000);
	});

	/*it("Create a lot of accounts", function() {
		for (i = 0; i < 10; i++) {
			account = accounts[i];
			for (j = 0; j < 10; j++) {
				create(account, j, 15, 1000000);
			}
		}
	});*/
});

contract('FrozenEther', function(accounts) {
	it("Deposit Ether on an account", function() {
		return FrozenEther.deployed().then(function(instance) {
			return create(accounts[0], 0, 50, 3);
		}).then(function() {
			return deposit(accounts[0], 0, 10);
		});
	});

	it("Withdraw Ether from an account", function() {
		return FrozenEther.deployed().then(function(instance) {
			return create(accounts[0], 1, 50, 1000);
		}).then(function() {
			return withdraw(accounts[0], 1, 10, {amount: 0});
		}).then(function() {
			return increase_time(1000);
		}).then(function() {
			return withdraw(accounts[0], 1, 10);
		}).then(function() {
			return withdraw(accounts[0], 1, 40, {exist: 0});
		});
	});

	it("Withdraw more Ether than available from an account", function() {
		return FrozenEther.deployed().then(function(instance) {
			return create(accounts[0], 1, 50, 1000);
		}).then(function() {
			return increase_time(1000);
		}).then(function() {
			return withdraw(accounts[0], 1, 60, {exist: 0});
		});
	});
});

