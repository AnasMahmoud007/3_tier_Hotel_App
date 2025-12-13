// frontend/js/updateUserData.js

document.addEventListener('DOMContentLoaded', async () => {
    const usernameInput = document.getElementById('username');
    const nameInput = document.getElementById('name');
    const userInformationInput = document.getElementById('userInformation'); // This is the email field
    const newPasswordInput = document.getElementById('newPassword');
    const updateDataForm = document.getElementById('updateDataForm');
    const messageDisplay = document.getElementById('messageDisplay');

    const storedUsername = sessionStorage.getItem('username');

    if (!storedUsername) {
        console.warn('No username found in session storage. Redirecting to login.');
        // window.location.href = '/login-signup.html';
        return;
    }

    // Set username field as it's readonly
    if (usernameInput) {
        usernameInput.value = storedUsername;
    }

    // Function to fetch and populate user data
    const fetchUserData = async () => {
        try {
            const response = await fetch('/api/user/profile');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const userData = await response.json();
            
            if (nameInput) nameInput.value = userData.Name || '';
            if (userInformationInput) userInformationInput.value = userData.UserInformation || ''; // Assuming email
            // Password field is left empty for security, user will input new one
            if (newPasswordInput) newPasswordInput.value = '';

        } catch (error) {
            console.error('Error fetching user data:', error);
            if (messageDisplay) {
                messageDisplay.className = 'alert alert-danger mt-3';
                messageDisplay.textContent = 'Failed to load user data.';
                messageDisplay.style.display = 'block';
            }
        }
    };

    // Fetch user data on page load
    await fetchUserData();

    // Handle form submission
    if (updateDataForm) {
        updateDataForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            messageDisplay.style.display = 'none';
            messageDisplay.className = 'alert mt-3';
            messageDisplay.textContent = '';

            const updatedData = {
                Name: nameInput.value,
                UserInformation: userInformationInput.value,
                NewPassword: newPasswordInput.value // Send new password
            };

            try {
                const response = await fetch('/api/user/profile', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(updatedData),
                });

                const data = await response.json();

                if (response.ok) {
                    messageDisplay.classList.add('alert-success');
                    messageDisplay.textContent = data.message || 'Profile updated successfully!';
                    messageDisplay.style.display = 'block';
                    // After successful update, re-fetch data to reflect any changes if necessary,
                    // or just clear password field.
                    if (newPasswordInput) newPasswordInput.value = '';
                } else {
                    messageDisplay.classList.add('alert-danger');
                    messageDisplay.textContent = data.message || 'Failed to update profile.';
                    messageDisplay.style.display = 'block';
                }
            } catch (error) {
                console.error('Network error during profile update:', error);
                messageDisplay.classList.add('alert-danger');
                messageDisplay.textContent = 'An unexpected error occurred. Please try again.';
                messageDisplay.style.display = 'block';
            }
        });
    }
});
