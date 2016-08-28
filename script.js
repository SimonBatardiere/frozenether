var web3 = {};
web3.toWei = function(amount, unit) {
	return amount;
};

var button;
var frozenether = {
	accounts: [],
};

button = document.querySelector("#create_button");
button.addEventListener("click", function(event) {
	var accountDom;
	var account;
	var amountDom;
	var amount;
	var durationDom;
	var duration;

	accountDom = document.querySelector("#create_account");
	account = accountDom.value;
	amountDom = document.querySelector("#create_amount");
	amount = web3.toWei(parseFloat(amountDom.value), "ether");
	if (isNaN(amount)) {
		displayError("Invalid amount");
		return;
	}
	durationDom = document.querySelector("#create_duration");
	duration = parseInt(durationDom.value);
	if (isNaN(duration)) {
		displayError("Invalid duration");
		return;
	}
	create(account, amount, duration);
});

function displayError(message) {
	alert("Error: " + message);
}

function create(account, amount, duration) {
	var id;

	id = Math.floor(Math.random() * 65536);
	frozenether.accounts.push(new Account(account, id, amount));
}

function Account(owner, id, amount) {
	this.owner = owner;
	this.id = id;
	this.amount = amount;
	this.createHtml();
	this.addEventListener();
}

Account.prototype.createHtml = function() {
	var div;
	var h3;
	var p;
	var form;
	var label;
	var input;
	var span;
	var br;

	div = document.createElement("div");
	div.id = this.owner + "_" + this.id + "_account";

	h3 = document.createElement("h3");
	h3.appendChild(document.createTextNode("Configuration"));
	div.appendChild(h3);

	p = document.createElement("p");
	p.appendChild(document.createTextNode("Owner: " + this.owner));
	p.appendChild(document.createElement("br"));
	p.appendChild(document.createTextNode("ID: " + this.id));
	p.appendChild(document.createElement("br"));
	p.appendChild(document.createTextNode("Amount: "));
	span = document.createElement("span");
	span.id = this.owner + "_" + this.id + "_amount";
	span.appendChild(document.createTextNode(this.amount));
	p.appendChild(span);
	p.appendChild(document.createElement("br"));
	p.appendChild(document.createTextNode("Duration: "));
	span = document.createElement("span");
	span.id = this.owner + "_" + this.id + "_duration";
	span.appendChild(document.createTextNode("0"));
	p.appendChild(span);
	div.appendChild(p);

	h3 = document.createElement("h3");
	h3.appendChild(document.createTextNode("Deposit"));
	div.appendChild(h3);

	form = document.createElement("form");
	p = document.createElement("p");
	label = document.createElement("label");
	label.htmlFor = this.owner + "_" + this.id + "_deposit_amount";
	label.appendChild(document.createTextNode("Amount"));
	p.appendChild(label);
	p.appendChild(document.createTextNode(": "));
	input = document.createElement("input");
	input.type = "text";
	input.id = this.owner + "_" + this.id + "_deposit_amount";
	p.appendChild(input);
	p.appendChild(document.createTextNode(" wei"));
	p.appendChild(document.createElement("br"));
	input = document.createElement("input");
	input.type = "button";
	input.value = "Deposit";
	input.id = this.owner + "_" + this.id + "_deposit_button";
	p.appendChild(input);
	form.appendChild(p);
	div.appendChild(form);

	h3 = document.createElement("h3");
	h3.appendChild(document.createTextNode("Withdraw"));
	div.appendChild(h3);

	form = document.createElement("form");
	p = document.createElement("p");
	label = document.createElement("label");
	label.htmlFor = this.owner + "_" + this.id + "_withdraw_amount";
	label.appendChild(document.createTextNode("Amount"));
	p.appendChild(label);
	p.appendChild(document.createTextNode(": "));
	input = document.createElement("input");
	input.type = "text";
	input.id = this.owner + "_" + this.id + "_withdraw_amount";
	p.appendChild(input);
	p.appendChild(document.createTextNode(" wei"));
	p.appendChild(document.createElement("br"));
	input = document.createElement("input");
	input.type = "button";
	input.value = "Withdraw";
	input.id = this.owner + "_" + this.id + "_withdraw_button";
	p.appendChild(input);
	form.appendChild(p);
	div.appendChild(form);

	h3 = document.createElement("h3");
	h3.appendChild(document.createTextNode("Freeze"));
	div.appendChild(h3);

	form = document.createElement("form");
	p = document.createElement("p");
	label = document.createElement("label");
	label.htmlFor = this.owner + "_" + this.id + "_freeze_duration";
	label.appendChild(document.createTextNode("Duration"));
	p.appendChild(label);
	p.appendChild(document.createTextNode(": "));
	input = document.createElement("input");
	input.type = "number";
	input.min = "0";
	input.id = this.owner + "_" + this.id + "_freeze_duration";
	p.appendChild(input);
	p.appendChild(document.createTextNode(" seconds"));
	p.appendChild(document.createElement("br"));
	input = document.createElement("input");
	input.type = "button";
	input.value = "Freeze";
	input.id = this.owner + "_" + this.id + "_freeze_button";
	p.appendChild(input);
	form.appendChild(p);
	div.appendChild(form);

	accounts = document.querySelector("#accounts");
	accounts.appendChild(div);
}

Account.prototype.addEventListener = function() {
	var button;
	var account = this;

	button = document.querySelector("#" + this.owner + "_" + this.id + "_deposit_button");
	button.addEventListener("click", function(event) {
		var node;
		var amount;

		node = document.querySelector("#" + account.owner + "_" + account.id + "_deposit_amount");
		amount = web3.toWei(parseFloat(node.value), "ether");
		if (isNaN(amount)) {
			displayError("Invalid amount");
			return;
		}
		account.deposit(amount);
	});

	button = document.querySelector("#" + this.owner + "_" + this.id + "_withdraw_button");
	button.addEventListener("click", function(event) {
		var node;
		var amount;

		node = document.querySelector("#" + account.owner + "_" + account.id + "_withdraw_amount");
		amount = web3.toWei(parseFloat(node.value), "ether");
		if (isNaN(amount)) {
			displayError("Invalid amount");
			return;
		}
		account.withdraw(amount);
	});

	button = document.querySelector("#" + this.owner + "_" + this.id + "_freeze_button");
	button.addEventListener("click", function(event) {
		var node;
		var duration;

		node = document.querySelector("#" + account.owner + "_" + account.id + "_freeze_duration");
		duration = parseInt(node.value);
		if (isNaN(duration)) {
			displayError("Invalid duration");
			return;
		}
		account.freeze(duration);
	});
}

Account.prototype.updateHtml = function() {
	var node;

	node = document.querySelector("#" + this.owner + "_" + this.id + "_amount");
	while (node.firstChild) {
		node.removeChild(node.firstChild);
	}
	node.appendChild(document.createTextNode(this.amount));
}

Account.prototype.deposit = function(amount) {
	this.amount += amount;
	this.updateHtml();
}

Account.prototype.withdraw = function(amount) {
	this.amount -= amount;
	this.updateHtml();
	if (this.amount <= 0) {
		this.destroy();
	}
}

Account.prototype.freeze = function(duration) {
}

Account.prototype.destroy = function() {
	var node;

	node = document.querySelector("#" + this.owner + "_" + this.id + "_account");
	node.parentNode.removeChild(node);
}

