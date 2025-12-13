// frontend/js/addManager.js

document.addEventListener('DOMContentLoaded', () => {
    const addManagerForm = document.getElementById('addManagerForm');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'alert mt-3';
    messageDiv.style.display = 'none';
    addManagerForm.parentNode.insertBefore(messageDiv, addManagerForm.nextSibling);

    if (addManagerForm) {
        addManagerForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const usernameInput = document.getElementById('username');
            const nameInput = document.getElementById('name');
            const passwordInput = document.getElementById('password');
            const modifyInformationInput = document.getElementById('modifyInformation');
            const informationAboutStaffInput = document.getElementById('informationAboutStaff');
            const informationAboutHotelInput = document.getElementById('informationAboutHotel');

            const username = usernameInput.value;
            const managerName = nameInput.value;
            const password = passwordInput.value;
            const modifyInformation = modifyInformationInput.checked ? 1 : 0;
            const informationAboutStaff = informationAboutStaffInput.checked ? 1 : 0;
            const informationAboutHotel = informationAboutHotelInput.checked ? 1 : 0;

            // Clear previous messages
            messageDiv.style.display = 'none';
            messageDiv.className = 'alert mt-3';
            messageDiv.textContent = '';

            try {
                const response = await fetch('/api/admin/addmanager', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        UserName: username,
                        Password: password,
                        ManagerName: managerName,
                        ModifyInformation: modifyInformation,
                        InformationAboutStaff: informationAboutStaff,
                        InformationAboutHotel: informationAboutHotel
                    }),
                });

                const data = await response.json();

                if (response.ok) {
                    messageDiv.classList.add('alert-success');
                    messageDiv.textContent = data.message || 'Manager added successfully!';
                    messageDiv.style.display = 'block';
                    addManagerForm.reset(); // Clear form fields
                } else {
                    messageDiv.classList.add('alert-danger');
                    messageDiv.textContent = data.message || 'Failed to add manager.';
                    messageDiv.style.display = 'block';
                }
            } catch (error) {
                console.error('Network error during manager addition:', error);
                messageDiv.classList.add('alert-danger');
                messageDiv.textContent = 'An unexpected error occurred. Please try again.';
                messageDiv.style.display = 'block';
            }
        });
    }
});