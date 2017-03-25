var FrozenEther = artifacts.require("./FrozenEther.sol");

module.exports = function(deployer) {
  deployer.deploy(FrozenEther);
};

