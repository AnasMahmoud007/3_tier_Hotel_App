// frontend/js/reservation.js

document.addEventListener('DOMContentLoaded', async () => {
    const reservationForm = document.getElementById('reservationForm');
    const roomTypeSelect = document.getElementById('Room');
    const serviceSelect = document.getElementById('Service');
    const roomNumberSelect = document.getElementById('RoomN');
    const reservationErrorDiv = document.getElementById('reservationError');

    // Function to display errors
    const displayError = (message) => {
        if (reservationErrorDiv) {
            reservationErrorDiv.textContent = message;
            reservationErrorDiv.style.display = 'block';
        }
    };

    // Function to fetch and populate dropdowns
    const populateDropdown = async (url, selectElement, valueField, textField) => {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json(); // Data is a DataTable
            
            selectElement.innerHTML = ''; // Clear existing options
            const defaultOption = document.createElement('option');
            defaultOption.value = '';
            defaultOption.textContent = `Select your ${selectElement.id}`;
            defaultOption.selected = true;
            defaultOption.disabled = true;
            defaultOption.classList.add('text-black');
            selectElement.appendChild(defaultOption);

            data.forEach(item => {
                const option = document.createElement('option');
                option.value = item[valueField];
                option.textContent = item[textField];
                option.classList.add('text-black');
                selectElement.appendChild(option);
            });
        } catch (error) {
            console.error(`Error populating ${selectElement.id}:`, error);
            displayError(`Failed to load ${selectElement.id}.`);
        }
    };

    // Populate dropdowns on page load
    await populateDropdown('/api/roomtypes', roomTypeSelect, 'CategoryName', 'CategoryName');
    await populateDropdown('/api/services', serviceSelect, 'AmenityName', 'AmenityName'); // Assuming AmenityName for value and text
    await populateDropdown('/api/rooms', roomNumberSelect, 'RoomNumber', 'RoomNumber');

    if (reservationForm) {
        reservationForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            reservationErrorDiv.style.display = 'none'; // Hide previous errors

            const roomN = roomNumberSelect.value;
            const checkinDate = document.getElementById('checkIn').value;
            const checkoutDate = document.getElementById('checkOut').value;
            const service = serviceSelect.value; // Store selected service if needed, though not part of InsertReservation

            // Basic validation
            if (!roomN || !checkinDate || !checkoutDate) {
                displayError('Please fill in all required fields.');
                return;
            }

            try {
                const response = await fetch('/api/reservations', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        RoomN: parseInt(roomN),
                        CheckInDateString: checkinDate, // Corrected key
                        CheckOutDateString: checkoutDate // Corrected key
                    }),
                });

                const data = await response.json();

                if (response.ok) {
                    console.log('Reservation successful:', data);
                    alert('Reservation created successfully!');
                    window.location.href = '/index.html'; // Redirect to home page
                } else {
                    console.error('Reservation failed:', data);
                    displayError(data.message || 'Reservation failed.');
                }
            } catch (error) {
                console.error('Network error during reservation:', error);
                displayError('An unexpected error occurred. Please try again.');
            }
        });
    }
});
