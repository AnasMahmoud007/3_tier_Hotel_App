// frontend/js/updateStaff.js

document.addEventListener('DOMContentLoaded', async () => {
    const updateStaffForm = document.getElementById('updateStaffForm');
    const messageDisplay = document.getElementById('messageDisplay');

    // Get staff username from URL query parameter
    const urlParams = new URLSearchParams(window.location.search);
    const sUsername = urlParams.get('id'); // Assuming 'id' parameter is the username

    if (!sUsername) {
        console.error('No staff username (id) found in URL for update.');
        if (messageDisplay) {
            messageDisplay.className = 'alert alert-danger mt-3';
            messageDisplay.textContent = 'Error: No staff specified for update.';
            messageDisplay.style.display = 'block';
        }
        return;
    }

    // Function to fetch and populate staff data
    const fetchStaffData = async () => {
        try {
            const response = await fetch(`/api/admin/staff/${sUsername}`);
            if (!response.ok) {
                if (response.status === 401) {
                    console.warn('User not authenticated for staff data. Redirecting to login.');
                    // window.location.href = '/login-signup.html';
                    return;
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const staffData = await response.json();
            
            // Assuming the API returns a list, and we want the first item
            if (staffData && staffData.length > 0) {
                const staff = staffData[0];
                document.getElementById('staffEmployeeID').value = staff.StaffEmployeeID || '';
                document.getElementById('sUsername').value = staff.SUsername || '';
                document.getElementById('name').value = staff.Name || '';
                document.getElementById('password').value = ''; // Never pre-fill password
                document.getElementById('role').value = staff.Role || '';
                document.getElementById('managerUserName').value = staff.ManagerUserName || '';
                document.getElementById('adminUserName').value = staff.AdminUserName || '';
                document.getElementById('accessibility').checked = staff.Accessibility === 1;
            } else {
                if (messageDisplay) {
                    messageDisplay.className = 'alert alert-warning mt-3';
                    messageDisplay.textContent = 'Staff member not found.';
                    messageDisplay.style.display = 'block';
                }
            }

        } catch (error) {
            console.error('Error fetching staff data:', error);
            if (messageDisplay) {
                messageDisplay.className = 'alert alert-danger mt-3';
                messageDisplay.textContent = 'Failed to load staff data.';
                messageDisplay.style.display = 'block';
            }
        }
    };

    // Fetch staff data on page load
    await fetchStaffData();

    // Handle form submission
    if (updateStaffForm) {
        updateStaffForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            messageDisplay.style.display = 'none';
            messageDisplay.className = 'alert mt-3';
            messageDisplay.textContent = '';

            const updatedData = {
                StaffEmployeeID: parseInt(document.getElementById('staffEmployeeID').value),
                SUsername: document.getElementById('sUsername').value,
                Password: document.getElementById('password').value, // This will be the new password
                Name: document.getElementById('name').value,
                Role: document.getElementById('role').value,
                ManagerUserName: document.getElementById('managerUserName').value,
                AdminUserName: document.getElementById('adminUserName').value,
                Accessibility: document.getElementById('accessibility').checked ? 1 : 0,
            };

            // Basic validation for password
            if (!updatedData.Password) {
                if (messageDisplay) {
                    messageDisplay.classList.add('alert-danger');
                    messageDisplay.textContent = 'Password cannot be empty.';
                    messageDisplay.style.display = 'block';
                }
                return;
            }

            try {
                const response = await fetch('/api/admin/updatestaff', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(updatedData),
                });

                const data = await response.json();

                if (response.ok) {
                    messageDisplay.classList.add('alert-success');
                    messageDisplay.textContent = data.message || 'Staff updated successfully!';
                    messageDisplay.style.display = 'block';
                    // Optionally refresh data or redirect
                    // window.location.href = '/ShowAllTables.html';
                } else {
                    messageDisplay.classList.add('alert-danger');
                    messageDisplay.textContent = data.message || 'Failed to update staff.';
                    messageDisplay.style.display = 'block';
                }
            } catch (error) {
                console.error('Network error during staff update:', error);
                messageDisplay.classList.add('alert-danger');
                messageDisplay.textContent = 'An unexpected error occurred. Please try again.';
                messageDisplay.style.display = 'block';
            }
        });
    }
});