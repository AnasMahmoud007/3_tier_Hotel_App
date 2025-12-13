// frontend/js/addAdmin.js

document.addEventListener('DOMContentLoaded', () => {
    const addAdminForm = document.getElementById('addAdminForm');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'alert mt-3';
    messageDiv.style.display = 'none';
    addAdminForm.parentNode.insertBefore(messageDiv, addAdminForm.nextSibling);

    if (addAdminForm) {
        addAdminForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const usernameInput = document.getElementById('username');
            const passwordInput = document.getElementById('password');

            const username = usernameInput.value;
            const password = passwordInput.value;

            // Clear previous messages
            messageDiv.style.display = 'none';
            messageDiv.className = 'alert mt-3';
            messageDiv.textContent = '';

            try {
                const response = await fetch('/api/admin/addadmin', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ UserName: username, Password: password }),
                });

                const data = await response.json();

                if (response.ok) {
                    messageDiv.classList.add('alert-success');
                    messageDiv.textContent = data.message || 'Admin added successfully!';
                    messageDiv.style.display = 'block';
                    addAdminForm.reset(); // Clear form fields
                } else {
                    messageDiv.classList.add('alert-danger');
                    messageDiv.textContent = data.message || 'Failed to add admin.';
                    messageDiv.style.display = 'block';
                }
            } catch (error) {
                console.error('Network error during admin addition:', error);
                messageDiv.classList.add('alert-danger');
                messageDiv.textContent = 'An unexpected error occurred. Please try again.';
                messageDiv.style.display = 'block';
            }
        });
    }
});
