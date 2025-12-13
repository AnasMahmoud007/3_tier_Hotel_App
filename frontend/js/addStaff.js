// frontend/js/addStaff.js

document.addEventListener('DOMContentLoaded', () => {
    const addStaffForm = document.getElementById('addStaffForm');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'alert mt-3';
    messageDiv.style.display = 'none';
    addStaffForm.parentNode.insertBefore(messageDiv, addStaffForm.nextSibling);

    if (addStaffForm) {
        addStaffForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const staffEmployeeIDInput = document.getElementById('staffEmployeeID');
            const usernameInput = document.getElementById('username');
            const nameInput = document.getElementById('name');
            const passwordInput = document.getElementById('password');
            const roleInput = document.getElementById('role');
            const managerInput = document.getElementById('manager');
            const adminInput = document.getElementById('admin');
            const accessibilityInput = document.getElementById('accessibility');

            const staffEmployeeID = parseInt(staffEmployeeIDInput.value);
            const sUsername = usernameInput.value;
            const password = passwordInput.value;
            const name = nameInput.value;
            const role = roleInput.value;
            const managerUserName = managerInput.value;
            const adminUserName = adminInput.value;
            const accessibility = accessibilityInput.checked ? 1 : 0;

            // Clear previous messages
            messageDiv.style.display = 'none';
            messageDiv.className = 'alert mt-3';
            messageDiv.textContent = '';

            try {
                const response = await fetch('/api/admin/addstaff', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        StaffEmployeeID: staffEmployeeID,
                        Accessibility: accessibility,
                        SUsername: sUsername,
                        Password: password,
                        Name: name,
                        Role: role,
                        ManagerUserName: managerUserName,
                        AdminUserName: adminUserName
                    }),
                });

                const data = await response.json();

                if (response.ok) {
                    messageDiv.classList.add('alert-success');
                    messageDiv.textContent = data.message || 'Staff added successfully!';
                    messageDiv.style.display = 'block';
                    addStaffForm.reset(); // Clear form fields
                } else {
                    messageDiv.classList.add('alert-danger');
                    messageDiv.textContent = data.message || 'Failed to add staff.';
                    messageDiv.style.display = 'block';
                }
            } catch (error) {
                console.error('Network error during staff addition:', error);
                messageDiv.classList.add('alert-danger');
                messageDiv.textContent = 'An unexpected error occurred. Please try again.';
                messageDiv.style.display = 'block';
            }
        });
    }
});