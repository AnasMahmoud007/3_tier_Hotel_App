// frontend/js/updateAdmin.js

document.addEventListener('DOMContentLoaded', async () => {
    const updateAdminForm = document.getElementById('updateAdminForm');
    const messageDisplay = document.getElementById('messageDisplay');

    // Get admin username from URL query parameter
    const urlParams = new URLSearchParams(window.location.search);
    const username = urlParams.get('id');

    if (!username) {
        console.error('No admin username (id) found in URL for update.');
        if (messageDisplay) {
            messageDisplay.className = 'alert alert-danger mt-3';
            messageDisplay.textContent = 'Error: No admin specified for update.';
            messageDisplay.style.display = 'block';
        }
        return;
    }

    // Function to fetch and populate admin data
    const fetchAdminData = async () => {
        try {
            const response = await fetch(`/api/admin/admin/${username}`);
            if (!response.ok) {
                if (response.status === 401) {
                    console.warn('User not authenticated for admin data. Redirecting to login.');
                    // window.location.href = '/login-signup.html';
                    return;
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const adminData = await response.json();
            
            // Assuming the API returns a single object
            if (adminData) {
                document.getElementById('username').value = adminData.UserName || '';
                document.getElementById('password').value = ''; // Never pre-fill password
                document.getElementById('systemAdministration').checked = adminData.SystemAdministration === 1;
                document.getElementById('createOtherAdminUser').checked = adminData.CreateOtherAdminUser === 1;
                document.getElementById('createStaff').checked = adminData.CreateStaff === 1;
            } else {
                if (messageDisplay) {
                    messageDisplay.className = 'alert alert-warning mt-3';
                    messageDisplay.textContent = 'Admin not found.';
                    messageDisplay.style.display = 'block';
                }
            }

        } catch (error) {
            console.error('Error fetching admin data:', error);
            if (messageDisplay) {
                messageDisplay.className = 'alert alert-danger mt-3';
                messageDisplay.textContent = 'Failed to load admin data.';
                messageDisplay.style.display = 'block';
            }
        }
    };

    // Fetch admin data on page load
    await fetchAdminData();

    // Handle form submission
    if (updateAdminForm) {
        updateAdminForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            messageDisplay.style.display = 'none';
            messageDisplay.className = 'alert mt-3';
            messageDisplay.textContent = '';

            const updatedData = {
                UserName: document.getElementById('username').value,
                Password: document.getElementById('password').value,
                SystemAdministration: document.getElementById('systemAdministration').checked ? 1 : 0,
                CreateOtherAdminUser: document.getElementById('createOtherAdminUser').checked ? 1 : 0,
                CreateStaff: document.getElementById('createStaff').checked ? 1 : 0,
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
                const response = await fetch('/api/admin/updateadmin', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(updatedData),
                });

                const data = await response.json();

                if (response.ok) {
                    messageDisplay.classList.add('alert-success');
                    messageDisplay.textContent = data.message || 'Admin updated successfully!';
                    messageDisplay.style.display = 'block';
                    // Optionally refresh data or redirect
                    // window.location.href = '/ShowAllTables.html';
                } else {
                    messageDisplay.classList.add('alert-danger');
                    messageDisplay.textContent = data.message || 'Failed to update admin.';
                    messageDisplay.style.display = 'block';
                }
            } catch (error) {
                console.error('Network error during admin update:', error);
                messageDisplay.classList.add('alert-danger');
                messageDisplay.textContent = 'An unexpected error occurred. Please try again.';
                messageDisplay.style.display = 'block';
            }
        });
    }
});
