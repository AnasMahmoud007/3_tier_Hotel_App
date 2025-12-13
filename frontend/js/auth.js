// frontend/js/auth.js

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');

    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const username = loginForm.querySelector('input[name="Username"]').value;
            const password = loginForm.querySelector('input[name="Password"]').value;
            const errorDiv = document.getElementById('loginError');
            if (errorDiv) errorDiv.style.display = 'none'; // Hide previous errors

            try {
                const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ Username: username, Password: password }),
                });

                const data = await response.json();

                if (response.ok) {
                    console.log('Login successful:', data);
                    console.log('User Role received:', data.role);
                    sessionStorage.setItem('username', data.username); // Store username
                    sessionStorage.setItem('role', data.role); // Store role

                    // Redirect based on role
                    if (data.role === "Admin") {
                        console.log('Redirecting to /Admin.html');
                        window.location.href = '/Admin.html';
                    } else if (data.role === "Guest") {
                        console.log('Redirecting to /Userpage.html');
                        window.location.href = '/Userpage.html';
                    } else if (data.role === "Manager") {
                        console.log('Redirecting to /Manager.html');
                        window.location.href = '/Manager.html'; // Assuming there is a Manager.html page
                    } else {
                        console.log('No specific role-based redirect, redirecting to /index.html');
                        window.location.href = '/index.html'; // Default redirect
                    }
                } else {
                    console.error('Login failed:', data);
                    // Display error message to the user
                    if (errorDiv) {
                        errorDiv.textContent = data.message || 'Invalid username or password';
                        errorDiv.style.display = 'block';
                    }
                }
            } catch (error) {
                console.error('Network error during login:', error);
                if (errorDiv) {
                    errorDiv.textContent = 'An unexpected error occurred. Please try again.';
                    errorDiv.style.display = 'block';
                }
            }
        });
    }

    if (signupForm) {
        signupForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const username = signupForm.querySelector('input[name="Username"]').value;
            const name = signupForm.querySelector('input[name="Name"]').value;
            const email = signupForm.querySelector('input[name="Email"]').value;
            const password = signupForm.querySelector('input[name="Password"]').value;
            const errorDiv = document.getElementById('signupError');
            if (errorDiv) errorDiv.style.display = 'none'; // Hide previous errors

            try {
                const response = await fetch('/api/auth/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ Username: username, Name: name, Email: email, Password: password }),
                });

                const data = await response.json();

                if (response.ok) {
                    console.log('Registration successful:', data);
                    // Redirect to login page or show success message
                    window.location.href = '/login-signup.html'; // Redirect to login page
                } else {
                    console.error('Registration failed:', data);
                    // Display error message to the user
                    if (errorDiv) {
                        errorDiv.textContent = data.message || 'Registration failed.';
                        errorDiv.style.display = 'block';
                    }
                }
            } catch (error) {
                console.error('Network error during registration:', error);
                if (errorDiv) {
                    errorDiv.textContent = 'An unexpected error occurred. Please try again.';
                    errorDiv.style.display = 'block';
                }
            }
        });
    }
});
