// app.js - Application Controller
document.addEventListener('DOMContentLoaded', function() {
    // Global references
    let bank = null;
    let currentCustomer = null;
    let currentAccount = null;
    
    // DOM Elements
    const systemLog = document.getElementById('systemLog');
    const accountsList = document.getElementById('accountsList');
    const transactionsList = document.getElementById('transactionsList');
    const customerDetails = document.getElementById('customerDetails');
    const customerSelect = document.getElementById('customerSelect');
    const accountSelect = document.getElementById('accountSelect');
    
    // ========== LOGGING SYSTEM ==========
    function logMessage(message, type = 'info') {
        const time = new Date().toLocaleTimeString();
        const logEntry = document.createElement('div');
        logEntry.className = `log-entry log-${type}`;
        logEntry.innerHTML = `
            <span class="log-time">[${time}]</span>
            <span>${message}</span>
        `;
        systemLog.prepend(logEntry);
        console.log(`[${type.toUpperCase()}] ${message}`);
        
        // Auto-scroll to top
        systemLog.scrollTop = 0;
        
        // Keep only last 50 entries
        const entries = systemLog.querySelectorAll('.log-entry');
        if (entries.length > 50) {
            entries[entries.length - 1].remove();
        }
    }
    
    // ========== UI UPDATES ==========
    function updateCustomerDropdown() {
        if (!bank) return;
        
        customerSelect.innerHTML = '<option value="">Select Customer</option>';
        const customers = bank.listAllCustomers();
        
        customers.forEach(customer => {
            const option = document.createElement('option');
            option.value = customer.customerId;
            option.textContent = `${customer.name} (ID: ${customer.customerId})`;
            customerSelect.appendChild(option);
        });
    }
    
    function updateAccountDropdown(customer) {
        accountSelect.innerHTML = '<option value="">Select Account</option>';
        
        if (!customer) return;
        
        customer.getAccounts().forEach(account => {
            const option = document.createElement('option');
            option.value = account.accountNumber;
            option.textContent = `${account.accountType.toUpperCase()} #${account.accountNumber} ($${account.balance})`;
            accountSelect.appendChild(option);
        });
    }
    
    function displayCustomerInfo(customer) {
        if (!customer) {
            customerDetails.innerHTML = `
                <div class="info-item">
                    <strong>Status</strong>
                    <span>No customer selected</span>
                </div>
            `;
            return;
        }
        
        const info = customer.customerInfo;
        customerDetails.innerHTML = `
            <div class="info-item">
                <strong>Customer ID</strong>
                <span>${info.customerId}</span>
            </div>
            <div class="info-item">
                <strong>Full Name</strong>
                <span>${info.name}</span>
            </div>
            <div class="info-item">
                <strong>Email</strong>
                <span>${info.email}</span>
            </div>
            <div class="info-item">
                <strong>Accounts</strong>
                <span>${info.accountCount}</span>
            </div>
            <div class="info-item">
                <strong>Total Balance</strong>
                <span>$${info.totalBalance.toFixed(2)}</span>
            </div>
            <div class="info-item">
                <strong>Member Since</strong>
                <span>${info.memberSince}</span>
            </div>
        `;
    }
    
    function displayAccounts(customer) {
        accountsList.innerHTML = '';
        
        if (!customer || customer.accountCount === 0) {
            accountsList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-wallet fa-2x"></i>
                    <p>No accounts yet. Open an account to get started.</p>
                </div>
            `;
            return;
        }
        
        customer.getAccounts().forEach(account => {
            const accountDiv = document.createElement('div');
            accountDiv.className = 'account-item';
            accountDiv.innerHTML = `
                <div class="account-header">
                    <div class="account-type">${account.accountType.toUpperCase()} Account</div>
                    <div class="account-number">#${account.accountNumber}</div>
                </div>
                <div class="account-balance">$${account.balance.toFixed(2)}</div>
                <div class="account-details">
                    <span>Daily Limit: $${account._dailyWithdrawalLimit}</span>
                    <span>Transactions: ${account.transactions.length}</span>
                </div>
            `;
            
            accountDiv.addEventListener('click', () => {
                accountSelect.value = account.accountNumber;
                currentAccount = account;
                updateAccountDropdown(currentCustomer);
                displayTransactions(account);
            });
            
            accountsList.appendChild(accountDiv);
        });
    }
    
    function displayTransactions(account) {
        transactionsList.innerHTML = '';
        
        if (!account || account.transactions.length === 0) {
            transactionsList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-exchange-alt fa-2x"></i>
                    <p>No transactions yet</p>
                </div>
            `;
            return;
        }
        
        // Show last 10 transactions
        const recentTransactions = account.transactions.slice(-10).reverse();
        
        recentTransactions.forEach(transaction => {
            const transDiv = document.createElement('div');
            transDiv.className = `transaction-item transaction-${transaction.type}`;
            transDiv.innerHTML = `
                <div class="transaction-header">
                    <div class="transaction-type">${transaction.type.toUpperCase()}</div>
                    <div class="transaction-amount">$${transaction.amount.toFixed(2)}</div>
                </div>
                <div class="transaction-description">${transaction.description}</div>
                <div class="transaction-time">
                    <i class="far fa-clock"></i>
                    ${transaction.timestamp.toLocaleString()}
                </div>
            `;
            transactionsList.appendChild(transDiv);
        });
    }
    
    // ========== EVENT HANDLERS ==========
    document.getElementById('initBank').addEventListener('click', () => {
        bank = Bank.getInstance('OOP Bank', 'Digital City');
        logMessage('Bank initialized successfully', 'success');
        updateCustomerDropdown();
    });
    
    document.getElementById('registerCustomer').addEventListener('click', () => {
        if (!bank) {
            logMessage('Please initialize the bank first', 'error');
            return;
        }
        
        const firstName = document.getElementById('firstName').value;
        const lastName = document.getElementById('lastName').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        try {
            const customer = bank.registerCustomer(firstName, lastName, email, password);
            logMessage(`Registered customer: ${customer.fullName}`, 'success');
            updateCustomerDropdown();
        } catch (error) {
            logMessage(`Registration failed: ${error.message}`, 'error');
        }
    });
    
    document.getElementById('openAccount').addEventListener('click', () => {
        if (!currentCustomer) {
            logMessage('Please select a customer first', 'error');
            return;
        }
        
        const accountType = document.getElementById('accountType').value;
        const initialDeposit = parseFloat(document.getElementById('initialDeposit').value);
        
        try {
            const account = currentCustomer.openAccount(accountType, initialDeposit);
            logMessage(`Opened ${accountType} account #${account.accountNumber} with $${initialDeposit}`, 'success');
            displayAccounts(currentCustomer);
            updateAccountDropdown(currentCustomer);
        } catch (error) {
            logMessage(`Failed to open account: ${error.message}`, 'error');
        }
    });
    
    // More event handlers for deposit, withdraw, transfer, etc.
    // Add your implementation here
    
    // ========== INITIALIZATION ==========
    logMessage('Banking System UI loaded successfully', 'info');
});