from flask import Flask, render_template, request, jsonify
from flask_mysqldb import MySQL
import config

app = Flask(__name__)

try:
    app.config['MYSQL_HOST'] = config.MYSQL_HOST
    app.config['MYSQL_USER'] = config.MYSQL_USER
    app.config['MYSQL_PASSWORD'] = config.MYSQL_PASSWORD
    app.config['MYSQL_DB'] = config.MYSQL_DB
except AttributeError as e:
    print(f"Error: Missing configuration in config.py: {e}")
    exit()

mysql = MySQL(app)

@app.route('/')
def home():
    return render_template('home.html')

# Customer Routes
@app.route('/customers')
def customers():
    return render_template('customers.html')

@app.route('/load_customers')
def load_customers():
    try:
        cur = mysql.connection.cursor()
        cur.execute("SELECT customer_id, name, email, phone, address FROM Customer ORDER BY customer_id")
        customers = cur.fetchall()
        cur.close()

        html_rows = ""
        if customers:
            for c in customers:
                html_rows += f"""
                    <tr>
                        <td>{c[0]}</td>
                        <td>{c[1]}</td>
                        <td>{c[2]}</td>
                        <td>{c[3]}</td>
                        <td>{c[4]}</td>
                    </tr>
                """
        else:
            html_rows = '<tr><td colspan="5">No customers found.</td></tr>'
        return html_rows
    except Exception as e:
        print(f"Error in load_customers: {e}")
        return '<tr><td colspan="5">Error loading customer data.</td></tr>', 500

@app.route('/load_customers_edit')
def load_customers_edit():
    try:
        cur = mysql.connection.cursor()
        cur.execute("SELECT customer_id, name, email, phone, address FROM Customer ORDER BY customer_id")
        customers = cur.fetchall()
        cur.close()

        html_rows = ""
        if customers:
            for c in customers:
                html_rows += f"""
                    <tr>
                        <td>{c[0]}</td>
                        <td>{c[1]}</td>
                        <td>{c[2]}</td>
                        <td>{c[3]}</td>
                        <td>{c[4]}</td>
                        <td><a href="#" class="edit-link" data-id="{c[0]}">Edit</a></td>
                    </tr>
                """
        else:
            html_rows = '<tr><td colspan="6">No customers found.</td></tr>'
        return html_rows
    except Exception as e:
        print(f"Error in load_customers_edit: {e}")
        return '<tr><td colspan="6">Error loading customer data for editing.</td></tr>', 500

@app.route('/get_customer_data/<int:customer_id>')
def get_customer_data(customer_id):
    try:
        cur = mysql.connection.cursor()
        cur.execute("SELECT name, email, phone, address FROM Customer WHERE customer_id = %s", (customer_id,))
        customer_data = cur.fetchone()
        cur.close()

        if customer_data:
            return jsonify({
                'name': customer_data[0],
                'email': customer_data[1],
                'phone': customer_data[2],
                'address': customer_data[3]
            })
        else:
            return jsonify({'error': 'Customer not found'}), 404
    except Exception as e:
        print(f"Error in get_customer_data: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/update_customer/<int:customer_id>', methods=['POST'])
def update_customer(customer_id):
    try:
        data = request.json
        name = data['name']
        email = data['email']
        phone = data['phone']
        address = data['address']

        cur = mysql.connection.cursor()
        cur.execute("UPDATE Customer SET name = %s, email = %s, phone = %s, address = %s WHERE customer_id = %s",
                    (name, email, phone, address, customer_id))
        mysql.connection.commit()
        cur.close()

        return jsonify({'message': 'Customer updated successfully'})
    except Exception as e:
        mysql.connection.rollback()
        print(f"Error in update_customer: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/add_customer', methods=['POST'])
def add_customer():
    try:
        name = request.form['name']
        email = request.form['email']
        phone = request.form['phone']
        address = request.form['address']

        if not all([name, email, phone, address]):
            return 'Missing form data', 400

        cur = mysql.connection.cursor()
        cur.execute("INSERT INTO Customer (name, email, phone, address) VALUES (%s, %s, %s, %s)",
                    (name, email, phone, address))
        mysql.connection.commit()
        cur.close()

        return 'Customer added successfully', 200
    except Exception as e:
        mysql.connection.rollback()
        print(f"Error in add_customer: {e}")
        return str(e), 500

@app.route('/delete_customers', methods=['POST'])
def delete_customers():
    try:
        customer_ids = request.json.get('ids')
        if not customer_ids:
            return "No customers selected", 400

        cur = mysql.connection.cursor()
        placeholders = ','.join(['%s'] * len(customer_ids))
        query = f"DELETE FROM Customer WHERE customer_id IN ({placeholders})"
        cur.execute(query, tuple(customer_ids))
        mysql.connection.commit()
        cur.close()

        return "Customers deleted successfully", 200
    except Exception as e:
        mysql.connection.rollback()
        print(f"Error in delete_customers: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/load_customers_delete')
def load_customers_delete():
    try:
        cur = mysql.connection.cursor()
        cur.execute("SELECT customer_id, name, email, phone, address FROM Customer ORDER BY customer_id")
        customers = cur.fetchall()
        cur.close()

        html_rows = ""
        if customers:
            for c in customers:
                html_rows += f"""
                    <tr>
                        <td><input type="checkbox" class="delete-checkbox-input" value="{c[0]}"></td>
                        <td>{c[0]}</td>
                        <td>{c[1]}</td>
                        <td>{c[2]}</td>
                        <td>{c[3]}</td>
                        <td>{c[4]}</td>
                    </tr>
                """
        else:
            html_rows = '<tr><td colspan="6">No customers found.</td></tr>'
        return html_rows
    except Exception as e:
        print(f"Error in load_customers_delete: {e}")
        return '<tr><td colspan="6">Error loading customer data for deletion.</td></tr>', 500

# Accounts Routes
@app.route('/accounts')
def accounts():
    return render_template('accounts.html')

@app.route('/load_accounts')
def load_accounts():
    try:
        cur = mysql.connection.cursor()
        cur.execute("SELECT account_id, customer_id, account_type, balance FROM Account ORDER BY account_id")
        accounts = cur.fetchall()
        cur.close()

        html_rows = ""
        if accounts:
            for a in accounts:
                html_rows += f"""
                    <tr>
                        <td>{a[0]}</td>
                        <td>{a[1]}</td>
                        <td>{a[2]}</td>
                        <td>{a[3]}</td>
                    </tr>
                """
        else:
            html_rows = '<tr><td colspan="4">No accounts found.</td></tr>'

        return html_rows
    except Exception as e:
        print(f"Error in load_accounts: {e}")
        return '<tr><td colspan="4">Error loading account data.</td></tr>', 500

@app.route('/load_accounts_edit')
def load_accounts_edit():
    try:
        cur = mysql.connection.cursor()
        cur.execute("SELECT account_id, customer_id, account_type, balance FROM Account ORDER BY account_id")
        accounts = cur.fetchall()
        cur.close()

        html_rows = ""
        if accounts:
            for a in accounts:
                html_rows += f"""
                    <tr>
                        <td>{a[0]}</td>
                        <td>{a[1]}</td>
                        <td>{a[2]}</td>
                        <td>{a[3]}</td>
                        <td><a href="#" class="edit-link" data-id="{a[0]}">Edit</a></td>
                    </tr>
                """
        else:
            html_rows = '<tr><td colspan="5">No accounts found.</td></tr>'

        return html_rows
    except Exception as e:
        print(f"Error in load_accounts_edit: {e}")
        return '<tr><td colspan="5">Error loading account data for editing.</td></tr>', 500

@app.route('/get_account_data/<int:account_id>')
def get_account_data(account_id):
    try:
        cur = mysql.connection.cursor()
        cur.execute("SELECT customer_id, account_type, balance FROM Account WHERE account_id = %s", (account_id,))
        account_data = cur.fetchone()
        cur.close()

        if account_data:
            return jsonify({
                'customer_id': account_data[0],
                'account_type': account_data[1],
                'balance': account_data[2]
            })
        else:
            return jsonify({'error': 'Account not found'}), 404
    except Exception as e:
        print(f"Error in get_account_data: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/update_account/<int:account_id>', methods=['POST'])
def update_account(account_id):
    try:
        data = request.json
        customer_id = data['customer_id']
        account_type = data['account_type']
        balance = data['balance']

        cur = mysql.connection.cursor()
        cur.execute("UPDATE Account SET customer_id = %s, account_type = %s, balance = %s WHERE account_id = %s",
                    (customer_id, account_type, balance, account_id))
        mysql.connection.commit()
        cur.close()

        return jsonify({'message': 'Account updated successfully'})
    except Exception as e:
        mysql.connection.rollback()
        print(f"Error in update_account: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/add_account', methods=['POST'])
def add_account():
    try:
        customer_id = request.form['customerId']
        account_type = request.form['accountType']
        balance = request.form['balance']

        if not all([customer_id, account_type, balance]):
            return 'Missing form data', 400

        cur = mysql.connection.cursor()
        cur.execute("INSERT INTO Account (customer_id, account_type, balance) VALUES (%s, %s, %s)",
                    (customer_id, account_type, balance))
        mysql.connection.commit()
        cur.close()

        return 'Account added successfully', 200
    except Exception as e:
        mysql.connection.rollback()
        print(f"Error in add_account: {e}")
        return str(e), 500

@app.route('/delete_accounts', methods=['POST'])
def delete_accounts():
    try:
        account_ids = request.json.get('ids')
        if not account_ids:
            return "No accounts selected", 400

        cur = mysql.connection.cursor()
        placeholders = ','.join(['%s'] * len(account_ids))
        query = f"DELETE FROM Account WHERE account_id IN ({placeholders})"
        cur.execute(query, tuple(account_ids))
        mysql.connection.commit()
        cur.close()

        return "Accounts deleted successfully", 200
    except Exception as e:
        mysql.connection.rollback()
        print(f"Error in delete_accounts: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/load_accounts_delete')
def load_accounts_delete():
    try:
        cur = mysql.connection.cursor()
        cur.execute("SELECT account_id, customer_id, account_type, balance FROM Account ORDER BY account_id")
        accounts = cur.fetchall()
        cur.close()

        html_rows = ""
        if accounts:
            for a in accounts:
                html_rows += f"""
                    <tr>
                        <td><input type="checkbox" class="delete-checkbox-input" value="{a[0]}"></td>
                        <td>{a[0]}</td>
                        <td>{a[1]}</td>
                        <td>{a[2]}</td>
                        <td>{a[3]}</td>
                    </tr>
                """
        else:
            html_rows = '<tr><td colspan="5">No accounts found.</td></tr>'
        return html_rows
    except Exception as e:
        print(f"Error in load_accounts_delete: {e}")
        return '<tr><td colspan="5">Error loading account data for deletion.</td></tr>', 500

# Transaction Routes
@app.route('/transactions')
def transactions():
    return render_template('transactions.html')

@app.route('/load_transactions')
def load_transactions():
    try:
        cur = mysql.connection.cursor()
        cur.execute("SELECT transaction_id, account_id, amount, transaction_type, date FROM Transaction ORDER BY transaction_id")
        transactions = cur.fetchall()
        cur.close()

        html_rows = ""
        if transactions:
            for t in transactions:
                html_rows += f"""
                    <tr>
                        <td>{t[0]}</td>
                        <td>{t[1]}</td>
                        <td>{t[2]}</td>
                        <td>{t[3]}</td>
                        <td>{t[4]}</td>
                    </tr>
                """
        else:
            html_rows = '<tr><td colspan="5">No transactions found.</td></tr>'
        return html_rows
    except Exception as e:
        print(f"Error in load_transactions: {e}")
        return '<tr><td colspan="5">Error loading transaction data.</td></tr>', 500

@app.route('/load_transactions_edit')
def load_transactions_edit():
    try:
        cur = mysql.connection.cursor()
        cur.execute("SELECT transaction_id, account_id, amount, transaction_type, date FROM Transaction ORDER BY transaction_id")
        transactions = cur.fetchall()
        cur.close()

        html_rows = ""
        if transactions:
            for t in transactions:
                html_rows += f"""
                    <tr>
                        <td>{t[0]}</td>
                        <td>{t[1]}</td>
                        <td>{t[2]}</td>
                        <td>{t[3]}</td>
                        <td>{t[4]}</td>
                        <td><a href="#" class="edit-link" data-id="{t[0]}">Edit</a></td>
                    </tr>
                """
        else:
            html_rows = '<tr><td colspan="6">No transactions found.</td></tr>'
        return html_rows
    except Exception as e:
        print(f"Error in load_transactions_edit: {e}")
        return '<tr><td colspan="6">Error loading transaction data for editing.</td></tr>', 500

@app.route('/get_transaction_data/<int:transaction_id>')
def get_transaction_data(transaction_id):
    try:
        cur = mysql.connection.cursor()
        cur.execute("SELECT account_id, amount, transaction_type, date FROM Transaction WHERE transaction_id = %s", (transaction_id,))
        transaction_data = cur.fetchone()
        cur.close()

        if transaction_data:
            return jsonify({
                'account_id': transaction_data[0],
                'amount': transaction_data[1],
                'transaction_type': transaction_data[2],
                'date': transaction_data[3]
            })
        else:
            return jsonify({'error': 'Transaction not found'}), 404
    except Exception as e:
        print(f"Error in get_transaction_data: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/update_transaction/<int:transaction_id>', methods=['POST'])
def update_transaction(transaction_id):
    try:
        data = request.json
        account_id = data['account_id']
        amount = data['amount']
        transaction_type = data['transaction_type']
        date = data['date']

        cur = mysql.connection.cursor()
        cur.execute("UPDATE Transaction SET account_id = %s, amount = %s, transaction_type = %s, date = %s WHERE transaction_id = %s",
                    (account_id, amount, transaction_type, date, transaction_id))
        mysql.connection.commit()
        cur.close()

        return jsonify({'message': 'Transaction updated successfully'})
    except Exception as e:
        mysql.connection.rollback()
        print(f"Error in update_transaction: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/add_transaction', methods=['POST'])
def add_transaction():
    try:
        account_id = request.form['accountId']
        amount = float(request.form['amount'])
        transaction_type = request.form['transactionType']
        date = request.form['date'] # YYYY-MM-DD

        if not all([account_id, amount, transaction_type, date]):
            return 'Missing form data', 400

        cur = mysql.connection.cursor()

        if transaction_type == 'debit':
            # Check if sufficient balance
            cur.execute("SELECT balance FROM Account WHERE account_id = %s", (account_id,))
            result = cur.fetchone()
            if result:
                current_balance = float(result[0])
                if current_balance < amount:
                    mysql.connection.rollback()
                    return jsonify({'message': 'Insufficient balance for debit'}), 400
                new_balance = current_balance - amount
                cur.execute("UPDATE Account SET balance = %s WHERE account_id = %s", (new_balance, account_id))
            else:
                mysql.connection.rollback()
                return jsonify({'message': 'Account not found'}), 400
        elif transaction_type == 'credit':
            cur.execute("SELECT balance FROM Account WHERE account_id = %s", (account_id,))
            result = cur.fetchone()
            if result:
                current_balance = float(result[0])
                new_balance = current_balance + amount
                cur.execute("UPDATE Account SET balance = %s WHERE account_id = %s", (new_balance, account_id))
            else:
                mysql.connection.rollback()
                return jsonify({'message': 'Account not found'}), 400
        else:
            mysql.connection.rollback()
            return jsonify({'message': 'Invalid transaction type'}), 400

        # Insert the transaction
        cur.execute("INSERT INTO Transaction (account_id, amount, transaction_type, date) VALUES (%s, %s, %s, %s)",
                    (account_id, amount, transaction_type, date))
        mysql.connection.commit()
        cur.close()
        return jsonify({'message': 'Transaction added successfully'}), 200

    except Exception as e:
        mysql.connection.rollback()
        print(f"Error in add_transaction: {e}")
        return jsonify({'message': str(e)}), 500

@app.route('/delete_transactions', methods=['POST'])
def delete_transactions():
    try:
        transaction_ids = request.json.get('ids')
        if not transaction_ids:
            return "No transactions selected", 400

        cur = mysql.connection.cursor()
        placeholders = ','.join(['%s'] * len(transaction_ids))
        query = f"DELETE FROM Transaction WHERE transaction_id IN ({placeholders})"
        cur.execute(query, tuple(transaction_ids))
        mysql.connection.commit()
        cur.close()

        return "Transactions deleted successfully", 200
    except Exception as e:
        mysql.connection.rollback()
        print(f"Error in delete_transactions: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/load_transactions_delete')
def load_transactions_delete():
    try:
        cur = mysql.connection.cursor()
        cur.execute("SELECT transaction_id, account_id, amount, transaction_type, date FROM Transaction ORDER BY transaction_id")
        transactions = cur.fetchall()
        cur.close()

        html_rows = ""
        if transactions:
            for t in transactions:
                html_rows += f"""
                    <tr>
                        <td><input type="checkbox" class="delete-checkbox-input" value="{t[0]}"></td>
                        <td>{t[0]}</td>
                        <td>{t[1]}</td>
                        <td>{t[2]}</td>
                        <td>{t[3]}</td>
                        <td>{t[4]}</td>
                    </tr>
                """
        else:
            html_rows = '<tr><td colspan="6">No transactions found.</td></tr>'
        return html_rows
    except Exception as e:
        print(f"Error in load_transactions_delete: {e}")
        return '<tr><td colspan="6">Error loading transaction data for deletion.</td></tr>', 500

@app.route('/analytics')
def analytics():
    return render_template('analytics.html')

@app.route('/analytics/customer_locations')
def get_customer_locations():
    """
    Returns a JSON list of customers with their addresses.
    """
    try:
        cursor = mysql.connection.cursor()
        cursor.execute("SELECT address FROM Customer")
        customers = cursor.fetchall()  #  fetchall
        customer_list = [{'address': row[0]} for row in customers] # Change the row[index] to row[column name]
        cursor.close()
        return jsonify(customer_list)
    except Exception as e:
        print(f"Error fetching customer locations: {e}")
        return jsonify({'error': 'Failed to fetch customer locations'}), 500

@app.route('/analytics/account_types')
def get_account_types():
    """
    Returns a JSON list of accounts with their types.
    """
    try:
        cursor = mysql.connection.cursor()
        cursor.execute("SELECT account_type FROM Account")
        accounts = cursor.fetchall()
        account_list = [{'account_type': row[0]} for row in accounts] # Change the row[index] to row[column name]
        cursor.close()
        return jsonify(account_list)
    except Exception as e:
        print(f"Error fetching account types: {e}")
        return jsonify({'error': 'Failed to fetch account types'}), 500

@app.route('/analytics/transaction_types')
def get_transaction_types():
    """
    Returns a JSON list of transaction types and their counts.
    """
    try:
        cursor = mysql.connection.cursor()
        cursor.execute("SELECT transaction_type, COUNT(*) as count FROM Transaction GROUP BY transaction_type")
        transaction_types = cursor.fetchall()
        transaction_list = [{'transaction_type': row[0], 'count': row[1]} for row in transaction_types]
        cursor.close()
        return jsonify(transaction_list)
    except Exception as e:
        print(f"Error fetching transaction types: {e}")
        return jsonify({'error': 'Failed to fetch transaction types'}), 500

if __name__ == '__main__':
    app.run(debug=True)
