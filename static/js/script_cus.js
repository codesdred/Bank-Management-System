document.addEventListener('DOMContentLoaded', () => {
    const showTableBtn = document.getElementById('showTableBtn');
    const addCustomerBtn = document.getElementById('addCustomerBtn');
    const deleteCustomerBtn = document.getElementById('deleteCustomerBtn');
    const editCustomerBtn = document.getElementById('editCustomerBtn');

    const addCustomerFormContainer = document.getElementById('addCustomerFormContainer');
    const successMsgContainer = document.getElementById('successMsgContainer');
    const customerTableContainer = document.getElementById('customerTableContainer');
    const customerDeleteTableContainer = document.getElementById('customerDeleteTableContainer');
    const customerEditTableContainer = document.getElementById('customerEditTableContainer');
    const customerForm = document.getElementById('customerForm');

    const customerTableBody = document.getElementById('customerTableBody');
    const customerDeleteTableBody = document.getElementById('customerDeleteTableBody');
    const customerEditTableBody = document.getElementById('customerEditTableBody');
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');

    const editModal = document.getElementById('editModal');
    const editCloseBtn = editModal.querySelector('.close');
    const editCustomerForm = document.getElementById('editCustomerForm');
    const editCustomerIdInput = document.getElementById('editCustomerId');
    const editNameInput = document.getElementById('editName');
    const editEmailInput = document.getElementById('editEmail');
    const editPhoneInput = document.getElementById('editPhone');
    const editAddressInput = document.getElementById('editAddress');

     // Add an error message container
    const errorMessageContainer = document.createElement('div');
    errorMessageContainer.id = 'errorMsgContainer';
    errorMessageContainer.className = 'error-msg';
    errorMessageContainer.style.display = 'none';  // Initially hidden
    document.body.insertBefore(errorMessageContainer, document.querySelector('main')); // Insert before main content, adjust as needed.


    let editCustomerId = null;
    let selectedCustomerIds = [];

    function hideAllSections() {
        addCustomerFormContainer.style.display = 'none';
        successMsgContainer.style.display = 'none';
        customerTableContainer.style.display = 'none';
        customerDeleteTableContainer.style.display = 'none';
        customerEditTableContainer.style.display = 'none';
        editModal.style.display = 'none';
        errorMessageContainer.style.display = 'none'; // Hide error message container
    }

      function displayErrorMessage(message) {
        errorMessageContainer.textContent = message;
        errorMessageContainer.style.display = 'block';
    }

    showTableBtn.addEventListener('click', () => {
        hideAllSections();
        customerTableContainer.style.display = 'block';
        loadCustomerData();
    });

    addCustomerBtn.addEventListener('click', () => {
        hideAllSections();
        addCustomerFormContainer.style.display = 'block';
    });

    deleteCustomerBtn.addEventListener('click', () => {
        hideAllSections();
        customerDeleteTableContainer.style.display = 'block';
        loadCustomerDataForDelete();
    });

    editCustomerBtn.addEventListener('click', () => {
        hideAllSections();
        customerEditTableContainer.style.display = 'block';
        loadCustomerDataForEdit();
    });

    customerForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const phone = document.getElementById('phone').value;
        const address = document.getElementById('address').value;

        fetch('/add_customer', {
            method: 'POST',
            body: new URLSearchParams({ name, email, phone, address }),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        })
        .then(response => {
            if (response.ok) {
                hideAllSections();
                successMsgContainer.style.display = 'block';
                customerForm.reset();
                loadCustomerData();
            } else {
                 return response.text().then(text => { throw new Error(text) });
            }
        })
        .catch(error => {
            displayErrorMessage('Error adding customer: ' + error.message);
        });
    });

    function loadCustomerData() {
        fetch('/load_customers')
        .then(response => response.text())
        .then(data => {
            customerTableBody.innerHTML = data;
        })
        .catch(error => {
            console.error('Error loading customer data:', error);
            displayErrorMessage('Error loading customer data. Check console for details.');
            customerTableBody.innerHTML = '<tr><td colspan="5">Error loading data.</td></tr>';
        });
    }

    function loadCustomerDataForDelete() {
        fetch('/load_customers_delete')
        .then(response => response.text())
        .then(data => {
            customerDeleteTableBody.innerHTML = data;
            const checkboxes = customerDeleteTableContainer.querySelectorAll('.delete-checkbox-input');
            checkboxes.forEach(checkbox => {
                checkbox.addEventListener('change', () => {
                    selectedCustomerIds = Array.from(checkboxes)
                        .filter(cb => cb.checked)
                        .map(cb => parseInt(cb.value));
                    confirmDeleteBtn.style.display = selectedCustomerIds.length > 0 ? 'block' : 'none';
                });
            });
        })
        .catch(error => {
            console.error('Error loading customer data for deletion:', error);
            displayErrorMessage('Error loading customer data for deletion. Check console for details.');
            customerDeleteTableBody.innerHTML = '<tr><td colspan="6">Error loading data.</td></tr>';
        });
    }

    function loadCustomerDataForEdit() {
        fetch('/load_customers_edit')
        .then(response => response.text())
        .then(data => {
            customerEditTableBody.innerHTML = data;
            const editLinks = customerEditTableContainer.querySelectorAll('.edit-link');
            editLinks.forEach(link => {
                link.addEventListener('click', (event) => {
                    event.preventDefault();
                    const customerId = link.dataset.id;
                    editCustomerId = customerId;
                    openEditModal(customerId);
                });
            });
        })
        .catch(error => {
            console.error('Error loading customer data for editing:', error);
            displayErrorMessage('Error loading customer data for editing. Check console for details.');
            customerEditTableBody.innerHTML = '<tr><td colspan="6">Error loading data.</td></tr>';
        });
    }

    confirmDeleteBtn.addEventListener('click', () => {
        if (selectedCustomerIds.length > 0) {
            fetch('/delete_customers', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ids: selectedCustomerIds }),
            })
            .then(response => response.text())
            .then(data => {
                displayErrorMessage(data);
                loadCustomerDataForDelete();
                loadCustomerData();
                confirmDeleteBtn.style.display = 'none';
            })
            .catch(error => {
                displayErrorMessage('Error deleting customers: ' + error);
            });
        } else {
            displayErrorMessage('Please select customers to delete.');
        }
    });

    function openEditModal(customerId) {
        fetch(`/get_customer_data/${customerId}`)
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                displayErrorMessage('Error: ' + data.error);
                return;
            }
            editCustomerIdInput.value = customerId;
            editNameInput.value = data.name;
            editEmailInput.value = data.email;
            editPhoneInput.value = data.phone;
            editAddressInput.value = data.address;
            editModal.style.display = 'block';
        })
        .catch(error => {
             displayErrorMessage('Error fetching customer data for edit: ' + error);
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

    editCustomerForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const customerId = editCustomerIdInput.value;
        const name = editNameInput.value;
        const email = editEmailInput.value;
        const phone = editPhoneInput.value;
        const address = editAddressInput.value;

        fetch(`/update_customer/${customerId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, email, phone, address }),
        })
        .then(response => response.json())
        .then(data => {
            displayErrorMessage(data.message);
            editModal.style.display = 'none';
            loadCustomerDataForEdit();
            loadCustomerData();
        })
        .catch(error => {
            displayErrorMessage('Error updating customer: ' + error);
        });
    });

    //show table on load
    hideAllSections();
    customerTableContainer.style.display = 'block';
    loadCustomerData();
});
