// frontend/js/addServes.js

document.addEventListener('DOMContentLoaded', () => {
    const addServesForm = document.getElementById('addServesForm');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'alert mt-3';
    messageDiv.style.display = 'none';
    addServesForm.parentNode.insertBefore(messageDiv, addServesForm.nextSibling);

    if (addServesForm) {
        addServesForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const serviceIDInput = document.getElementById('serviceID');
            const amenityNameInput = document.getElementById('amenityName');
            const descriptionInput = document.getElementById('description');
            const availabilityInput = document.getElementById('availability');
            const additionalChargesInput = document.getElementById('additionalCharges');
            const iconInput = document.getElementById('icon');

            const serviceID = parseInt(serviceIDInput.value);
            const amenityName = amenityNameInput.value;
            const description = descriptionInput.value;
            const availability = availabilityInput.checked ? 1 : 0;
            const additionalCharges = parseFloat(additionalChargesInput.value);
            const icon = iconInput.value;

            // Clear previous messages
            messageDiv.style.display = 'none';
            messageDiv.className = 'alert mt-3';
            messageDiv.textContent = '';

            try {
                const response = await fetch('/api/admin/addservice', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        ServiceID: serviceID,
                        AmenityName: amenityName,
                        Description: description,
                        Availability: availability,
                        AdditionalCharges: additionalCharges,
                        icon: icon
                    }),
                });

                const data = await response.json();

                if (response.ok) {
                    messageDiv.classList.add('alert-success');
                    messageDiv.textContent = data.message || 'Service added successfully!';
                    messageDiv.style.display = 'block';
                    addServesForm.reset(); // Clear form fields
                } else {
                    messageDiv.classList.add('alert-danger');
                    messageDiv.textContent = data.message || 'Failed to add service.';
                    messageDiv.style.display = 'block';
                }
            } catch (error) {
                console.error('Network error during service addition:', error);
                messageDiv.classList.add('alert-danger');
                messageDiv.textContent = 'An unexpected error occurred. Please try again.';
                messageDiv.style.display = 'block';
            }
        });
    }
});