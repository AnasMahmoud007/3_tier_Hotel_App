// frontend/js/updateService.js

document.addEventListener('DOMContentLoaded', async () => {
    const updateServiceForm = document.getElementById('updateServiceForm');
    const messageDisplay = document.getElementById('messageDisplay');

    // Get service ID from URL query parameter
    const urlParams = new URLSearchParams(window.location.search);
    const serviceID = urlParams.get('id');

    if (!serviceID) {
        console.error('No service ID found in URL for update.');
        if (messageDisplay) {
            messageDisplay.className = 'alert alert-danger mt-3';
            messageDisplay.textContent = 'Error: No service specified for update.';
            messageDisplay.style.display = 'block';
        }
        return;
    }

    // Function to fetch and populate service data
    const fetchServiceData = async () => {
        try {
            const response = await fetch(`/api/admin/services?serviceID=${serviceID}`); // Assuming an API to get single service by ID
            if (!response.ok) {
                if (response.status === 401) {
                    console.warn('User not authenticated for service data. Redirecting to login.');
                    // window.location.href = '/login-signup.html';
                    return;
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const serviceData = await response.json();
            
            // Assuming the API returns a list, and we want the first item
            if (serviceData && serviceData.length > 0) {
                const service = serviceData[0];
                document.getElementById('serviceID').value = service.ServiceID || '';
                document.getElementById('amenityName').value = service.AmenityName || '';
                document.getElementById('description').value = service.Description || '';
                document.getElementById('availability').checked = service.Availability === 1;
                document.getElementById('additionalCharges').value = service.AdditionalCharges || '';
                document.getElementById('icon').value = service.icon || '';
            } else {
                if (messageDisplay) {
                    messageDisplay.className = 'alert alert-warning mt-3';
                    messageDisplay.textContent = 'Service not found.';
                    messageDisplay.style.display = 'block';
                }
            }

        } catch (error) {
            console.error('Error fetching service data:', error);
            if (messageDisplay) {
                messageDisplay.className = 'alert alert-danger mt-3';
                messageDisplay.textContent = 'Failed to load service data.';
                messageDisplay.style.display = 'block';
            }
        }
    };

    // Fetch service data on page load
    await fetchServiceData();

    // Handle form submission
    if (updateServiceForm) {
        updateServiceForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            messageDisplay.style.display = 'none';
            messageDisplay.className = 'alert mt-3';
            messageDisplay.textContent = '';

            const updatedData = {
                ServiceID: parseInt(document.getElementById('serviceID').value),
                AmenityName: document.getElementById('amenityName').value,
                Description: document.getElementById('description').value,
                Availability: document.getElementById('availability').checked ? 1 : 0,
                AdditionalCharges: parseFloat(document.getElementById('additionalCharges').value),
                icon: document.getElementById('icon').value
            };

            try {
                const response = await fetch('/api/admin/updateservice', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(updatedData),
                });

                const data = await response.json();

                if (response.ok) {
                    messageDisplay.classList.add('alert-success');
                    messageDisplay.textContent = data.message || 'Service updated successfully!';
                    messageDisplay.style.display = 'block';
                    // Optionally refresh data or redirect
                    // window.location.href = '/ShowAllTables.html';
                } else {
                    messageDisplay.classList.add('alert-danger');
                    messageDisplay.textContent = data.message || 'Failed to update service.';
                    messageDisplay.style.display = 'block';
                }
            } catch (error) {
                console.error('Network error during service update:', error);
                messageDisplay.classList.add('alert-danger');
                messageDisplay.textContent = 'An unexpected error occurred. Please try again.';
                messageDisplay.style.display = 'block';
            }
        });
    }
});
