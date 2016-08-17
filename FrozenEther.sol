contract FrozenEther {
    struct Account {
        uint expire;
        uint amount;
    }

    mapping (address => mapping (uint => Account)) private accounts;
    
    event Create(address owner, uint nonce, uint remainingTime, uint amount);
    event Deposit(address owner, uint nonce, uint remainingTime, uint amount);
    event Withdraw(address owner, uint nonce, uint remainingTime, uint amount);

    function FrozenEter() {
        if (msg.value != 0) {
            if (!create(0, 0)) {
                throw;
            }
        }
    }

    function () {
        throw;
    }

    function remainingTime(uint nonce) public constant returns(uint) {
        Account account = accounts[msg.sender][nonce];

        return remainingAccountTime(account);
    }

    function amount(uint nonce) public constant returns(uint) {
        return accounts[msg.sender][nonce].amount;
    }

    function create(uint nonce, uint duration) public returns(bool) {
        Account account = accounts[msg.sender][nonce];
        uint time = 0;

        if (!initializeAccount(account, duration, msg.value)) {
            throw;
        }
        
        time = remainingAccountTime(account);
        Create(msg.sender, nonce, time, account.amount);
        return true;
    }

    function deposit(uint nonce) public returns(bool) {
        Account account = accounts[msg.sender][nonce];
        uint time = 0;

        if (msg.value == 0) {
            return false;
        }
        if (!depositOnAccount(account, msg.value)) {
            throw;
        }

        time = remainingAccountTime(account);
        Deposit(msg.sender, nonce, time, msg.value);
        return true;
    }

    function withdraw(uint nonce, uint amount) public returns(bool) {
        Account account = accounts[msg.sender][nonce];
        uint value = 0;
        uint time = 0;

        if (msg.value != 0) {
            throw;
        }
        value = withdrawFromAccount(account, amount);
        if (value == 0) {
            return false;
        }

        if (!msg.sender.send(value)) {
            throw;
        }

        time = remainingAccountTime(account);
        Withdraw(msg.sender, nonce, time, value);
        return true;
    }

    function isAccountExist(Account storage account) internal constant
        returns(bool)
    {
        return (account.expire != 0);
    }

    function isAccountExpired(Account storage account) internal constant
        returns(bool)
    {
        return (account.expire < now);
    }

    function remainingAccountTime(Account storage account) internal constant
        returns(uint)
    {
        uint time = 0;

        if (now < account.expire) {
            time = account.expire - now;
        }
        return time;
    }

    function initializeAccount(
        Account storage account,
        uint duration,
        uint amount
    )
        internal
        returns(bool)
    {
        if (isAccountExist(account)) {
            return false;
        }
        account.expire = now + duration;
        if (account.expire < now) {
            return false;
        }
        account.amount = amount;
        return true;
    }

    function depositOnAccount(Account storage account, uint amount) internal
        returns(bool)
    {
        if (!isAccountExist(account)) {
            return false;
        }
        if (isAccountExpired(account)) {
            return false;
        }
        account.amount += amount;
        return true;
    }

    function withdrawFromAccount(Account storage account, uint amount) internal
        returns(uint)
    {
        uint value;

        if (!isAccountExist(account)) {
            return 0;
        }
        if (!isAccountExpired(account)) {
            return 0;
        }
        value = amount < account.amount ? amount : account.amount;
        account.amount -= value;
        return value;
    }
}
