// frontend/js/userProfile.js

document.addEventListener('DOMContentLoaded', async () => {
    const usernameDisplay = document.getElementById('usernameDisplay');
    const profileUsername = document.getElementById('profileUsername');
    const profileName = document.getElementById('profileName');
    const profileEmail = document.getElementById('profileEmail');
    const profileUserInformation = document.getElementById('profileUserInformation');

    const storedUsername = sessionStorage.getItem('username');

    if (!storedUsername) {
        console.warn('No username found in session storage. Redirecting to login.');
        // Optionally redirect to login page
        // window.location.href = '/login-signup.html';
        return;
    }

    if (usernameDisplay) {
        usernameDisplay.textContent = storedUsername;
    }

    // Populate profile username immediately
    if (profileUsername) {
        profileUsername.textContent = storedUsername;
    }

    try {
        const response = await fetch('/api/user/profile');
        if (!response.ok) {
            if (response.status === 401) {
                console.warn('User not authenticated. Redirecting to login.');
                // window.location.href = '/login-signup.html';
                return;
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const userData = await response.json();
        console.log('User Profile Data:', userData);

        if (profileName) {
            profileName.textContent = userData.Name || 'N/A';
        }
        if (profileEmail) {
            profileEmail.textContent = userData.UserInformation || 'N/A'; // Assuming UserInformation is email
        }
        if (profileUserInformation) {
            // Display UserInformation if it's something other than email, or a generic field
            // If UserInformation is the email, we already displayed it, so just keep it empty or display something else.
            profileUserInformation.textContent = userData.UserInformation || 'N/A';
        }

    } catch (error) {
        console.error('Error fetching user profile:', error);
        // Display an error message on the page if needed
        const profileDetailsDiv = document.querySelector('.user-profile-details');
        if (profileDetailsDiv) {
            profileDetailsDiv.innerHTML = '<p class="text-danger">Failed to load user profile.</p>';
        }
    }
});
