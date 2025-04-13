document.addEventListener('DOMContentLoaded', () => {
    const showTableBtn = document.getElementById('showTableBtn');
    const addAccountBtn = document.getElementById('addAccountBtn');
    const deleteAccountBtn = document.getElementById('deleteAccountBtn');
    const editAccountBtn = document.getElementById('editAccountBtn');

    const addAccountFormContainer = document.getElementById('addAccountFormContainer');
    const successMsgContainer = document.getElementById('successMsgContainer');
    const accountTableContainer = document.getElementById('accountTableContainer');
    const accountDeleteTableContainer = document.getElementById('accountDeleteTableContainer');
    const accountEditTableContainer = document.getElementById('accountEditTableContainer');
    const accountForm = document.getElementById('accountForm');

    const accountTableBody = document.getElementById('accountTableBody');
    const accountDeleteTableBody = document.getElementById('accountDeleteTableBody');
    const accountEditTableBody = document.getElementById('accountEditTableBody');
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');

    const editModal = document.getElementById('editModal');
    const editCloseBtn = editModal.querySelector('.close');
    const editAccountForm = document.getElementById('editAccountForm');
    const editAccountIdInput = document.getElementById('editAccountId');
    const editCustomerIdInput = document.getElementById('editCustomerId');
    const editAccountTypeInput = document.getElementById('editAccountType');
    const editBalanceInput = document.getElementById('editBalance');

    // Add error message container
    const errorMessageContainer = document.createElement('div');
    errorMessageContainer.id = 'errorMsgContainer';
    errorMessageContainer.className = 'error-msg';
    errorMessageContainer.style.display = 'none';
    document.body.insertBefore(errorMessageContainer, document.querySelector('main'));

    let editAccountId = null;
    let selectedAccountIds = [];

    function hideAllSections() {
        addAccountFormContainer.style.display = 'none';
        successMsgContainer.style.display = 'none';
        accountTableContainer.style.display = 'none';
        accountDeleteTableContainer.style.display = 'none';
        accountEditTableContainer.style.display = 'none';
        editModal.style.display = 'none';
        errorMessageContainer.style.display = 'none';
    }

    function displayErrorMessage(message) {
        errorMessageContainer.textContent = message;
        errorMessageContainer.style.display = 'block';
    }

    showTableBtn.addEventListener('click', () => {
        hideAllSections();
        accountTableContainer.style.display = 'block';
        loadAccountData();
    });

    addAccountBtn.addEventListener('click', () => {
        hideAllSections();
        addAccountFormContainer.style.display = 'block';
    });

    deleteAccountBtn.addEventListener('click', () => {
        hideAllSections();
        accountDeleteTableContainer.style.display = 'block';
        loadAccountDataForDelete();
    });

    editAccountBtn.addEventListener('click', () => {
        hideAllSections();
        accountEditTableContainer.style.display = 'block';
        loadAccountDataForEdit();
    });

    accountForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const customerId = document.getElementById('customerId').value;
        const accountType = document.getElementById('accountType').value;
        const balance = document.getElementById('balance').value;

        fetch('/add_account', {
            method: 'POST',
            body: new URLSearchParams({ customerId, accountType, balance }),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        })
        .then(response => {
            if (response.ok) {
                hideAllSections();
                successMsgContainer.style.display = 'block';
                accountForm.reset();
                loadAccountData();
            } else {
                return response.text().then(text => { throw new Error(text) });
            }
        })
        .catch(error => {
            displayErrorMessage('Error adding account: ' + error.message);
        });
    });

    function loadAccountData() {
        fetch('/load_accounts')
        .then(response => response.text())
        .then(data => {
            accountTableBody.innerHTML = data;
        })
        .catch(error => {
            console.error('Error loading account data:', error);
            displayErrorMessage('Error loading account data. Check console for details.');
            accountTableBody.innerHTML = '<tr><td colspan="4">Error loading data.</td></tr>';
        });
    }

    function loadAccountDataForDelete() {
        fetch('/load_accounts_delete')
        .then(response => response.text())
        .then(data => {
            accountDeleteTableBody.innerHTML = data;
            const checkboxes = accountDeleteTableContainer.querySelectorAll('.delete-checkbox-input');
            checkboxes.forEach(checkbox => {
                checkbox.addEventListener('change', () => {
                    selectedAccountIds = Array.from(checkboxes)
                        .filter(cb => cb.checked)
                        .map(cb => parseInt(cb.value));
                    confirmDeleteBtn.style.display = selectedAccountIds.length > 0 ? 'block' : 'none';
                });
            });
        })
        .catch(error => {
            console.error('Error loading account data for deletion:', error);
            displayErrorMessage('Error loading account data for deletion. Check console for details.');
            accountDeleteTableBody.innerHTML = '<tr><td colspan="5">Error loading data.</td></tr>';
        });
    }

    function loadAccountDataForEdit() {
        fetch('/load_accounts_edit')
        .then(response => response.text())
        .then(data => {
            accountEditTableBody.innerHTML = data;
            const editLinks = accountEditTableContainer.querySelectorAll('.edit-link');
            editLinks.forEach(link => {
                link.addEventListener('click', (event) => {
                    event.preventDefault();
                    const accountId = link.dataset.id;
                    editAccountId = accountId;
                    openEditModal(accountId);
                });
            });
        })
        .catch(error => {
            console.error('Error loading account data for editing:', error);
            displayErrorMessage('Error loading account data for editing. Check console for details.');
            accountEditTableBody.innerHTML = '<tr><td colspan="5">Error loading data.</td></tr>';
        });
    }

    confirmDeleteBtn.addEventListener('click', () => {
        if (selectedAccountIds.length > 0) {
            fetch('/delete_accounts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ids: selectedAccountIds }),
            })
            .then(response => response.text())
            .then(data => {
                displayErrorMessage(data);
                loadAccountDataForDelete();
                loadAccountData();
                confirmDeleteBtn.style.display = 'none';
            })
            .catch(error => {
                displayErrorMessage('Error deleting accounts: ' + error);
            });
        } else {
            displayErrorMessage('Please select accounts to delete.');
        }
    });

    function openEditModal(accountId) {
        fetch(`/get_account_data/${accountId}`)
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                displayErrorMessage('Error: ' + data.error);
                return;
            }
            editAccountIdInput.value = accountId;
            editCustomerIdInput.value = data.customer_id;
            editAccountTypeInput.value = data.account_type;
            editBalanceInput.value = data.balance;
            editModal.style.display = 'block';
        })
        .catch(error => {
            displayErrorMessage('Error fetching account data for edit: ' + error);
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

    editAccountForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const accountId = editAccountIdInput.value;
        const customerId = editCustomerIdInput.value;
        const accountType = editAccountTypeInput.value;
        const balance = editBalanceInput.value;

        fetch(`/update_account/${accountId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ customer_id: customerId, account_type: accountType, balance: balance }),
        })
        .then(response => response.json())
        .then(data => {
            displayErrorMessage(data.message);
            editModal.style.display = 'none';
            loadAccountDataForEdit();
            loadAccountData();
        })
        .catch(error => {
            displayErrorMessage('Error updating account: ' + error);
        });
    });

    //show table on load
    hideAllSections();
    accountTableContainer.style.display = 'block';
    loadAccountData();
});
