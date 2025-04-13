DROP DATABASE IF EXISTS BANK;

-- Create the database
CREATE DATABASE BANK;

-- Use the database
USE BANK;

-- Create the Customer table
CREATE TABLE Customer (
    customer_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(15),
    address VARCHAR(255),
    -- Add the CHECK constraint for phone number validation
    CONSTRAINT chk_phone_format CHECK (phone REGEXP '^[0-9]{10}$')
);

-- Create the Account table
CREATE TABLE Account (
    account_id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT,
    account_type VARCHAR(20),
    balance DECIMAL(10, 2),
    FOREIGN KEY (customer_id)
        REFERENCES Customer(customer_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    -- Constraint for account_type
    CONSTRAINT chk_account_type CHECK (account_type IN ('Savings', 'Checking')),
    -- Constraint for balance to be positive.
    CONSTRAINT chk_balance_positive CHECK (balance >= 0)
);

-- Create the Transaction table
CREATE TABLE Transaction (
    transaction_id INT AUTO_INCREMENT PRIMARY KEY,
    account_id INT,
    amount DECIMAL(10,2),
    transaction_type VARCHAR(10), -- 'debit' or 'credit'
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (account_id)
        REFERENCES Account(account_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    -- Constraint for transaction type
    CONSTRAINT chk_transaction_type CHECK (transaction_type IN ('debit', 'credit')),
    -- Constraint for amount to be positive
    CONSTRAINT chk_amount_positive CHECK (amount >= 0)
);

-- Insert 25 demo values into the Customer table
INSERT INTO Customer (name, email, phone, address) VALUES
('Alice Smith', 'alice.smith@example.com', '1234567890', '14 Oak Lane, Anytown, USA'),
('Bob Johnson', 'bob.johnson@example.com', '9876543210', '22 Pine Street, Springfield, USA'),
('Charlie Brown', 'charlie.brown@example.com', '5551234567', '10 Peanuts Place, Smallville, USA'),
('Diana Miller', 'diana.miller@example.com', '1112223333', '77 Sunset Blvd, Hollywood, USA'),
('Ethan Davis', 'ethan.davis@example.com', '4445556666', '42 Wallaby Way, Sydney, Australia'),
('Fiona Green', 'fiona.green@example.com', '7778889999', '16 Downing Street, London, UK'),
('George White', 'george.white@example.com', '2223334444', '8 Rue de la Paix, Paris, France'),
('Hannah Black', 'hannah.black@example.com', '9990001111', '5 Chome, Ginza, Tokyo, Japan'),
('Isaac Grey', 'isaac.grey@example.com', '6667778888', '99 Piazza Navona, Rome, Italy'),
('Julia Red', 'julia.red@example.com', '3334445555', '1 Infinite Loop, Cupertino, USA'),
('Kevin Blue', 'kevin.blue@example.com', '8881239876', '123 Main St, New York, NY'),
('Linda Purple', 'linda.purple@example.com', '2345678901', '456 Elm St, Chicago, IL'),
('Michael Yellow', 'michael.yellow@example.com', '3456789012', '789 Oak Ave, Houston, TX'),
('Nancy Orange', 'nancy.orange@example.com', '4567890123', '101 Pine Ln, Phoenix, AZ'),
('Oliver Green', 'oliver.green@example.com', '5678901234', '222 Cedar Rd, Los Angeles, CA'),
('Penelope Pink', 'penelope.pink@example.com', '6789012345', '333 Birch Ct, Miami, FL'),
('Quincy Teal', 'quincy.teal@example.com', '7890123456', '444 Maple Dr, Atlanta, GA'),
('Rose Silver', 'rose.silver@example.com', '8901234567', '555 Spruce St, Denver, CO'),
('Samuel Gold', 'samuel.gold@example.com', '9012345678', '666 Willow Way, Seattle, WA'),
('Tiffany Bronze', 'tiffany.bronze@example.com', '0123456789', '777 Oak St, Portland, OR'),
('Ursula Magenta', 'ursula.magenta@example.com', '1023456789', '888 Pine Ave, Austin, TX'),
('Victor Olive', 'victor.olive@example.com', '2034567890', '999 Elm St, Dallas, TX'),
('Wendy Lime', 'wendy.lime@example.com', '3045678901', '1000 Oak Ln, San Diego, CA'),
('Xavier Indigo', 'xavier.indigo@example.com', '4056789012', '1001 Pine Rd, San Jose, CA'),
('Yasmine Coral', 'yasmine.coral@example.com', '5067890123', '1002 Cedar Ct, Sacramento, CA');


-- Insert 25 demo values into the Account table
INSERT INTO Account (customer_id, account_type, balance) VALUES
(1, 'Savings', 2500.00),
(1, 'Checking', 1200.50),
(2, 'Savings', 5000.00),
(3, 'Checking', 850.75),
(4, 'Savings', 10000.00),
(5, 'Checking', 2000.00),
(6, 'Savings', 7500.00),
(7, 'Checking', 1500.25),
(8, 'Savings', 9000.00),
(9, 'Checking', 1800.00),
(10, 'Savings', 3000.00),
(11, 'Checking', 1000.00),
(12, 'Savings', 6000.00),
(13, 'Checking', 950.00),
(14, 'Savings', 11000.00),
(15, 'Checking', 2100.00),
(16, 'Savings', 8500.00),
(17, 'Checking', 1600.00),
(18, 'Savings', 10000.00),
(19, 'Checking', 1900.00),
(20, 'Savings', 4000.00),
(21, 'Checking', 1100.00),
(22, 'Savings', 7000.00),
(23, 'Checking', 1050.00),
(24, 'Savings', 12000.00);

-- Insert 25 demo values into the Transaction table
INSERT INTO Transaction (account_id, amount, transaction_type) VALUES
(1, 100.00, 'credit'),
(1, 50.00, 'debit'),
(2, 200.00, 'credit'),
(3, 75.50, 'debit'),
(4, 500.00, 'credit'),
(5, 100.00, 'debit'),
(6, 300.00, 'credit'),
(7, 25.25, 'debit'),
(8, 400.00, 'credit'),
(9, 90.00, 'debit'),
(10, 150.00, 'credit'),
(11, 60.00, 'debit'),
(12, 250.00, 'credit'),
(13, 80.50, 'debit'),
(14, 550.00, 'credit'),
(15, 110.00, 'debit'),
(16, 350.00, 'credit'),
(17, 30.25, 'debit'),
(18, 450.00, 'credit'),
(19, 95.00, 'debit'),
(20, 200.00, 'credit'),
(21, 70.00, 'debit'),
(22, 300.00, 'credit'),
(23, 85.50, 'debit'),
(24, 600.00, 'credit');
