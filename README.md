🏦 JavaScript Banking System - OOP Project
A comprehensive banking system simulation built with vanilla JavaScript to demonstrate Object-Oriented Programming principles in a real-world application.

🚀 Live Demo
Simply open index.html in your web browser to start using the application immediately. No installation or server required!

📋 Quick Start Guide
1. Initialization
Open index.html in your browser

Click "Initialize Bank" button

Watch the system log confirm: "🏦 OOP Bank initialized in Digital City"

2. Register Your First Customer
Use the pre-filled form or enter:

First Name: John

Last Name: Doe

Email: john@example.com

Password: secret123

Click "Register Customer"

3. Open Accounts
Select your customer from dropdown

Choose account type (Savings/Checking)

Set initial deposit (e.g., $1000)

Click "Open Account"

4. Perform Transactions
Select an account from dropdown

Enter amount

Click Deposit, Withdraw, or Transfer

5. Run Complete Demo
Click "Run Full Demo" to see all OOP features in action automatically.

🎯 Core Features
🔐 Customer Management
Register multiple customers with unique emails

Secure password hashing (simulated)

Customer information encapsulation

Account ownership tracking

💰 Account Types
Account Type	Features	OOP Concept
Savings Account	2% annual interest, $100 minimum balance	Method overriding
Checking Account	$500 overdraft limit, $10 monthly fee	Polymorphism
Base Account	Daily withdrawal limit ($1000), transaction history	Inheritance
🔄 Transaction System
Every action creates a Transaction record

Types: deposit, withdrawal, transfer, interest, fees

Timestamp and status tracking (pending/completed/failed)

Immutable transaction history

📊 Bank Operations
Singleton Bank instance (only one can exist)

Apply interest to all savings accounts

Charge monthly fees on checking accounts

Generate comprehensive bank reports

Calculate total deposits across all custome
