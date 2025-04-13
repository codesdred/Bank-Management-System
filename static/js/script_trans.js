document.addEventListener('DOMContentLoaded', () => {
    const showTableBtn = document.getElementById('showTransactionsTableBtn');
    const addTransactionBtn = document.getElementById('addTransactionBtn');
    const deleteTransactionBtn = document.getElementById('deleteTransactionBtn');
    const editTransactionBtn = document.getElementById('editTransactionBtn');

    const addTransactionFormContainer = document.getElementById('addTransactionFormContainer');
    const successMsgContainer = document.getElementById('successMsgContainer');
    const transactionTableContainer = document.getElementById('transactionTableContainer');
    const transactionDeleteTableContainer = document.getElementById('transactionDeleteTableContainer');
    const transactionEditTableContainer = document.getElementById('transactionEditTableContainer');
    const transactionForm = document.getElementById('transactionForm');

    const transactionTableBody = document.getElementById('transactionTableBody');
    const transactionDeleteTableBody = document.getElementById('transactionDeleteTableBody');
    const transactionEditTableBody = document.getElementById('transactionEditTableBody');
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');

    const editModal = document.getElementById('editModal');
    const editCloseBtn = editModal.querySelector('.close');
    const editTransactionForm = document.getElementById('editTransactionForm');
    const editTransactionIdInput = document.getElementById('editTransactionId');
    const editAccountIdInput = document.getElementById('editAccountId');
    const editAmountInput = document.getElementById('editAmount');
    const editTransactionTypeInput = document.getElementById('editTransactionType');
    const editDateInput = document.getElementById('editDate');

    // Add an error message container
    const errorMessageContainer = document.createElement('div');
    errorMessageContainer.id = 'errorMsgContainer';
    errorMessageContainer.className = 'error-msg';
    errorMessageContainer.style.display = 'none';  // Initially hidden
    document.body.insertBefore(errorMessageContainer, document.querySelector('main')); // Insert before main content, adjust as needed.

    let editTransactionId = null;
    let selectedTransactionIds = [];

    function hideAllSections() {
        addTransactionFormContainer.style.display = 'none';
        successMsgContainer.style.display = 'none';
        transactionTableContainer.style.display = 'none';
        transactionDeleteTableContainer.style.display = 'none';
        transactionEditTableContainer.style.display = 'none';
        editModal.style.display = 'none';
        errorMessageContainer.style.display = 'none'; // Also hide error message
    }

    function displayErrorMessage(message) {
        errorMessageContainer.textContent = message;
        errorMessageContainer.style.display = 'block';
    }

    showTableBtn.addEventListener('click', () => {
        hideAllSections();
        transactionTableContainer.style.display = 'block';
        loadTransactionData();
    });

    addTransactionBtn.addEventListener('click', () => {
        hideAllSections();
        addTransactionFormContainer.style.display = 'block';
    });

    deleteTransactionBtn.addEventListener('click', () => {
        hideAllSections();
        transactionDeleteTableContainer.style.display = 'block';
        loadTransactionDataForDelete();
    });

    editTransactionBtn.addEventListener('click', () => {
        hideAllSections();
        transactionEditTableContainer.style.display = 'block';
        loadTransactionDataForEdit();
    });

    transactionForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const accountId = document.getElementById('accountId').value;
        const amount = document.getElementById('amount').value;
        const transactionType = document.getElementById('transactionType').value;
        const date = document.getElementById('date').value;


        fetch('/add_transaction', {
            method: 'POST',
            body: new URLSearchParams({ accountId, amount, transactionType, date }),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        })
        .then(response => {
            if (response.ok) {
                hideAllSections();
                successMsgContainer.style.display = 'block';
                transactionForm.reset();
                loadTransactionData(); // Reload the table
            } else {
                return response.text().then(text => { throw new Error(text) });
            }
        })
        .catch(error => {
            displayErrorMessage('Error adding transaction: ' + error.message);
        });
    });

    function loadTransactionData() {
        fetch('/load_transactions')
        .then(response => response.text())
        .then(data => {
            transactionTableBody.innerHTML = data;
        })
        .catch(error => {
            console.error('Error loading transaction data:', error);
            displayErrorMessage('Error loading transaction data. Check console for details.');
            transactionTableBody.innerHTML = '<tr><td colspan="5">Error loading data.</td></tr>'; //prevent table error.
        });
    }

    function loadTransactionDataForDelete() {
        fetch('/load_transactions_delete')
        .then(response => response.text())
        .then(data => {
            transactionDeleteTableBody.innerHTML = data;
            const checkboxes = transactionDeleteTableContainer.querySelectorAll('.delete-checkbox-input');
            checkboxes.forEach(checkbox => {
                checkbox.addEventListener('change', () => {
                    selectedTransactionIds = Array.from(checkboxes)
                        .filter(cb => cb.checked)
                        .map(cb => parseInt(cb.value));
                    confirmDeleteBtn.style.display = selectedTransactionIds.length > 0 ? 'block' : 'none';
                });
            });
        })
        .catch(error => {
            console.error('Error loading transaction data for deletion:', error);
            displayErrorMessage('Error loading transaction data for deletion. Check console for details.');
            transactionDeleteTableBody.innerHTML = '<tr><td colspan="6">Error loading data.</td></tr>';
        });
    }

    function loadTransactionDataForEdit() {
        fetch('/load_transactions_edit')
        .then(response => response.text())
        .then(data => {
            transactionEditTableBody.innerHTML = data;
            const editLinks = transactionEditTableContainer.querySelectorAll('.edit-link');
            editLinks.forEach(link => {
                link.addEventListener('click', (event) => {
                    event.preventDefault();
                    const transactionId = link.dataset.id;
                    editTransactionId = transactionId;
                    openEditModal(transactionId);
                });
            });
        })
        .catch(error => {
            console.error('Error loading transaction data for editing:', error);
            displayErrorMessage('Error loading transaction data for editing. Check console for details.');
            transactionEditTableBody.innerHTML = '<tr><td colspan="6">Error loading data.</td></tr>';
        });
    }

    confirmDeleteBtn.addEventListener('click', () => {
        if (selectedTransactionIds.length > 0) {
            fetch('/delete_transactions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ids: selectedTransactionIds }),
            })
            .then(response => response.text())
            .then(data => {
                // Instead of alert, update a message on the page
                displayErrorMessage(data);
                loadTransactionDataForDelete(); // Refresh the delete table
                loadTransactionData(); //refresh main table
                confirmDeleteBtn.style.display = 'none';
            })
            .catch(error => {
                displayErrorMessage('Error deleting transactions: ' + error);
            });
        } else {
            displayErrorMessage('Please select transactions to delete.');
        }
    });

    function openEditModal(transactionId) {
        fetch(`/get_transaction_data/${transactionId}`)
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                displayErrorMessage('Error: ' + data.error);
                return;
            }
            editTransactionIdInput.value = transactionId;
            editAccountIdInput.value = data.account_id;
            editAmountInput.value = data.amount;
            editTransactionTypeInput.value = data.transaction_type;
            editDateInput.value = data.date;
            editModal.style.display = 'block';
        })
        .catch(error => {
            displayErrorMessage('Error fetching transaction data for edit: ' + error);
        });
    }

    editCloseBtn.addEventListener('click', () => {
        editModal.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        if (event.target === editModal) {
            editModal.style.display = 'none';
        }
    })

    editTransactionForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const transactionId = editTransactionIdInput.value;
        const accountId = editAccountIdInput.value;
        const amount = editAmountInput.value;
        const transactionType = editTransactionTypeInput.value;
        const date = editDateInput.value;


        fetch(`/update_transaction/${transactionId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ account_id: accountId, amount, transaction_type: transactionType, date }),
        })
        .then(response => response.json())
        .then(data => {
            displayErrorMessage(data.message);
            editModal.style.display = 'none';
            loadTransactionDataForEdit(); // Refresh edit table
            loadTransactionData();
        })
        .catch(error => {
            displayErrorMessage('Error updating transaction: ' + error);
        });
    });
    hideAllSections();
    transactionTableContainer.style.display = 'block';
    loadTransactionData();
});
