// transaction.js
class Transaction {
    static idCounter = 1;
    
    constructor(type, amount, description = '') {
        this.id = Transaction.idCounter++;
        this.type = type; // 'deposit', 'withdrawal', 'transfer'
        this.amount = amount;
        this.description = description;
        this.timestamp = new Date();
        this.status = 'pending'; // 'completed', 'failed'
    }
    
    complete() {
        this.status = 'completed';
        return this;
    }
    
    fail() {
        this.status = 'failed';
        return this;
    }
    
    toString() {
        return `[${this.timestamp.toLocaleString()}] ${this.type.toUpperCase()}: $${this.amount} - ${this.description}`;
    }
}




// account.js
class Account {
    static accountCounter = 1000;
    
    constructor(customerId, initialBalance = 0, accountType = 'checking') {
        if (this.constructor === Account) {
            throw new Error("Cannot instantiate abstract Account class");
        }
        
        this._accountNumber = Account.accountCounter++;
        this._customerId = customerId;
        this._balance = initialBalance;
        this._accountType = accountType;
        this._transactions = [];
        this._isActive = true;
        this._dailyWithdrawalLimit = 1000;
        this._todayWithdrawn = 0;
        
        // Record opening transaction
        this._addTransaction('account_opening', initialBalance, 'Account opened');
    }
    
    // Protected method (convention with _)
    _addTransaction(type, amount, description) {
        const transaction = new Transaction(type, amount, description);
        transaction.complete();
        this._transactions.push(transaction);
        return transaction;
    }
    
    // Public methods
    deposit(amount) {
        if (amount <= 0) {
            throw new Error("Deposit amount must be positive");
        }
        
        this._balance += amount;
        this._addTransaction('deposit', amount, `Deposit to account ${this._accountNumber}`);
        return this._balance;
    }
    
    withdraw(amount) {
        if (amount <= 0) {
            throw new Error("Withdrawal amount must be positive");
        }
        
        if (!this._canWithdraw(amount)) {
            throw new Error(`Cannot withdraw $${amount}. Insufficient funds or limit exceeded`);
        }
        
        this._balance -= amount;
        this._todayWithdrawn += amount;
        this._addTransaction('withdrawal', amount, `Withdrawal from account ${this._accountNumber}`);
        return this._balance;
    }
    
    // Protected validation method
    _canWithdraw(amount) {
        return this._balance >= amount && 
               (this._todayWithdrawn + amount) <= this._dailyWithdrawalLimit;
    }
    
    // Getter methods (encapsulation)
    get balance() {
        return this._balance;
    }
    
    get accountNumber() {
        return this._accountNumber;
    }
    
    get accountType() {
        return this._accountType;
    }
    
    get transactions() {
        return [...this._transactions]; // Return copy for encapsulation
    }
    
    // Abstract method (to be implemented by child classes)
    calculateInterest() {
        throw new Error("calculateInterest must be implemented by child class");
    }
    
    getAccountInfo() {
        return {
            accountNumber: this._accountNumber,
            customerId: this._customerId,
            balance: this._balance,
            accountType: this._accountType,
            isActive: this._isActive,
            transactionCount: this._transactions.length
        };
    }
}



// savings-account.js
class SavingsAccount extends Account {
    constructor(customerId, initialBalance = 0) {
        super(customerId, initialBalance, 'savings');
        this._interestRate = 0.02; // 2% annual
        this._minBalance = 100; // Minimum balance requirement
    }
    
    // Override parent method
    _canWithdraw(amount) {
        const canWithdrawFromParent = super._canWithdraw(amount);
        const maintainsMinBalance = (this._balance - amount) >= this._minBalance;
        
        return canWithdrawFromParent && maintainsMinBalance;
    }
    
    // Implement abstract method
    calculateInterest(months = 1) {
        const monthlyRate = this._interestRate / 12;
        const interest = this._balance * monthlyRate * months;
        return interest;
    }
    
    applyInterest(months = 1) {
        const interest = this.calculateInterest(months);
        this._balance += interest;
        this._addTransaction('interest', interest, `Interest applied for ${months} month(s)`);
        return interest;
    }
}

// checking-account.js
class CheckingAccount extends Account {
    constructor(customerId, initialBalance = 0) {
        super(customerId, initialBalance, 'checking');
        this._overdraftLimit = 500;
        this._monthlyFee = 10;
    }
    
    // Override with different logic
    _canWithdraw(amount) {
        const availableBalance = this._balance + this._overdraftLimit;
        return availableBalance >= amount && 
               (this._todayWithdrawn + amount) <= this._dailyWithdrawalLimit;
    }
    
    chargeMonthlyFee() {
        if (this._balance >= this._monthlyFee) {
            this._balance -= this._monthlyFee;
            this._addTransaction('fee', -this._monthlyFee, 'Monthly maintenance fee');
            return true;
        }
        return false;
    }
    
    calculateInterest() {
        return 0; // Checking accounts typically don't earn interest
    }
}

// customer.js
class Customer {
    static customerCounter = 1;
    
    constructor(firstName, lastName, email, password) {
        this._customerId = Customer.customerCounter++;
        this._firstName = firstName;
        this._lastName = lastName;
        this._email = email;
        this._password = this._hashPassword(password); // Simple hash
        this._accounts = new Map(); // accountNumber -> Account object
        this._isActive = true;
        this._createdDate = new Date();
    }
    
    _hashPassword(password) {
        // Simple hash for demo - in real app, use bcrypt
        return btoa(password + 'salt');
    }
    
    verifyPassword(password) {
        return this._hashPassword(password) === this._password;
    }
    
    openAccount(accountType, initialDeposit = 0) {
        let account;
        
        switch(accountType.toLowerCase()) {
            case 'savings':
                account = new SavingsAccount(this._customerId, initialDeposit);
                break;
            case 'checking':
                account = new CheckingAccount(this._customerId, initialDeposit);
                break;
            default:
                throw new Error(`Unknown account type: ${accountType}`);
        }
        
        this._accounts.set(account.accountNumber, account);
        return account;
    }
    
    getAccount(accountNumber) {
        return this._accounts.get(accountNumber);
    }
    
    getAccounts() {
        return Array.from(this._accounts.values());
    }
    
    getTotalBalance() {
        return this.getAccounts().reduce((total, account) => 
            total + account.balance, 0);
    }
    
    transfer(fromAccountNumber, toAccountNumber, amount) {
        const fromAccount = this.getAccount(fromAccountNumber);
        const toAccount = this.getAccount(toAccountNumber);
        
        if (!fromAccount || !toAccount) {
            throw new Error("One or both accounts not found");
        }
        
        if (fromAccount === toAccount) {
            throw new Error("Cannot transfer to the same account");
        }
        
        // Withdraw from source
        fromAccount.withdraw(amount);
        
        // Deposit to destination
        toAccount.deposit(amount);
        
        // Record transfer in both accounts
        fromAccount._addTransaction('transfer_out', amount, 
            `Transferred to account ${toAccountNumber}`);
        toAccount._addTransaction('transfer_in', amount, 
            `Received from account ${fromAccountNumber}`);
        
        return { from: fromAccount.balance, to: toAccount.balance };
    }
    
    // Getters for encapsulation
    get customerId() { return this._customerId; }
    get fullName() { return `${this._firstName} ${this._lastName}`; }
    get email() { return this._email; }
    get accountCount() { return this._accounts.size; }
    get customerInfo() {
        return {
            customerId: this._customerId,
            name: this.fullName,
            email: this._email,
            accountCount: this.accountCount,
            totalBalance: this.getTotalBalance(),
            memberSince: this._createdDate.toLocaleDateString()
        };
    }
}



// bank.js
class Bank {
    constructor(name, location) {
        if (Bank.instance) {
            return Bank.instance;
        }
        
        this._bankName = name;
        this._location = location;
        this._customers = new Map(); // customerId -> Customer
        this._totalDeposits = 0;
        this._totalLoans = 0;
        this._bankBalance = 1000000; // Starting capital
        this._transactionFee = 0.50; // Per transaction fee
        
        Bank.instance = this;
        console.log(`🏦 ${this._bankName} Bank initialized in ${this._location}`);
    }
    
    // Static method to get instance (Singleton pattern)
    static getInstance(name = 'Default', location = 'Unknown') {
        if (!Bank.instance) {
            new Bank(name, location);
        }
        return Bank.instance;
    }
    
    registerCustomer(firstName, lastName, email, password) {
        // Check if email already exists
        for (let customer of this._customers.values()) {
            if (customer.email === email) {
                throw new Error("Email already registered");
            }
        }
        
        const customer = new Customer(firstName, lastName, email, password);
        this._customers.set(customer.customerId, customer);
        
        console.log(`✅ New customer registered: ${customer.fullName} (ID: ${customer.customerId})`);
        return customer;
    }
    
    authenticate(email, password) {
        for (let customer of this._customers.values()) {
            if (customer.email === email && customer.verifyPassword(password)) {
                console.log(`🔑 Authentication successful for: ${customer.fullName}`);
                return customer;
            }
        }
        throw new Error("Invalid email or password");
    }
    
    getCustomer(customerId) {
        const customer = this._customers.get(customerId);
        if (!customer) {
            throw new Error(`Customer with ID ${customerId} not found`);
        }
        return customer;
    }
    
    // Bank operations
    calculateTotalDeposits() {
        this._totalDeposits = Array.from(this._customers.values())
            .reduce((total, customer) => total + customer.getTotalBalance(), 0);
        return this._totalDeposits;
    }
    
    applyInterestToAllSavingsAccounts() {
        let totalInterest = 0;
        
        this._customers.forEach(customer => {
            customer.getAccounts().forEach(account => {
                if (account instanceof SavingsAccount) {
                    const interest = account.applyInterest();
                    totalInterest += interest;
                    this._bankBalance -= interest; // Bank pays interest
                }
            });
        });
        
        console.log(`💰 Applied $${totalInterest.toFixed(2)} in interest to all savings accounts`);
        return totalInterest;
    }
    
    chargeMonthlyFees() {
        let feesCollected = 0;
        
        this._customers.forEach(customer => {
            customer.getAccounts().forEach(account => {
                if (account instanceof CheckingAccount) {
                    if (account.chargeMonthlyFee()) {
                        feesCollected += account._monthlyFee;
                        this._bankBalance += account._monthlyFee;
                    }
                }
            });
        });
        
        console.log(`💸 Collected $${feesCollected} in monthly fees`);
        return feesCollected;
    }
    
    // Reporting
    generateBankReport() {
        this.calculateTotalDeposits();
        
        return {
            bankName: this._bankName,
            location: this._location,
            totalCustomers: this._customers.size,
            totalAccounts: Array.from(this._customers.values())
                .reduce((sum, customer) => sum + customer.accountCount, 0),
            totalDeposits: this._totalDeposits,
            bankBalance: this._bankBalance,
            totalLoans: this._totalLoans,
            reserveRatio: (this._bankBalance / this._totalDeposits * 100).toFixed(2) + '%'
        };
    }
    
    listAllCustomers() {
        return Array.from(this._customers.values()).map(customer => 
            customer.customerInfo);
    }
}





