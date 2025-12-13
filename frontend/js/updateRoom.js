// frontend/js/updateRoom.js

document.addEventListener('DOMContentLoaded', async () => {
    const updateRoomForm = document.getElementById('updateRoomForm');
    const messageDisplay = document.getElementById('messageDisplay');

    // Get room number from URL query parameter
    const urlParams = new URLSearchParams(window.location.search);
    const roomNumber = urlParams.get('id'); // Assuming 'id' parameter is the room number

    if (!roomNumber) {
        console.error('No room number (id) found in URL for update.');
        if (messageDisplay) {
            messageDisplay.className = 'alert alert-danger mt-3';
            messageDisplay.textContent = 'Error: No room specified for update.';
            messageDisplay.style.display = 'block';
        }
        return;
    }

    // Function to fetch and populate room data
    const fetchRoomData = async () => {
        try {
            const response = await fetch(`/api/admin/rooms?roomNumber=${roomNumber}`); // Assuming an API to get single room by number
            if (!response.ok) {
                if (response.status === 401) {
                    console.warn('User not authenticated for room data. Redirecting to login.');
                    // window.location.href = '/login-signup.html';
                    return;
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const roomData = await response.json();
            
            // Assuming the API returns a list, and we want the first item
            if (roomData && roomData.length > 0) {
                const room = roomData[0];
                document.getElementById('roomNumber').value = room.RoomNumber || '';
                document.getElementById('categoryName').value = room.CategoryName || '';
                document.getElementById('pricePerNight').value = room.PricePerNight || '';
            } else {
                if (messageDisplay) {
                    messageDisplay.className = 'alert alert-warning mt-3';
                    messageDisplay.textContent = 'Room not found.';
                    messageDisplay.style.display = 'block';
                }
            }

        } catch (error) {
            console.error('Error fetching room data:', error);
            if (messageDisplay) {
                messageDisplay.className = 'alert alert-danger mt-3';
                messageDisplay.textContent = 'Failed to load room data.';
                messageDisplay.style.display = 'block';
            }
        }
    };

    // Fetch room data on page load
    await fetchRoomData();

    // Handle form submission
    if (updateRoomForm) {
        updateRoomForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            messageDisplay.style.display = 'none';
            messageDisplay.className = 'alert mt-3';
            messageDisplay.textContent = '';

            const updatedData = {
                RoomNumber: parseInt(document.getElementById('roomNumber').value),
                CategoryName: document.getElementById('categoryName').value,
                PricePerNight: parseFloat(document.getElementById('pricePerNight').value),
            };

            try {
                const response = await fetch('/api/admin/updateroom', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(updatedData),
                });

                const data = await response.json();

                if (response.ok) {
                    messageDisplay.classList.add('alert-success');
                    messageDisplay.textContent = data.message || 'Room updated successfully!';
                    messageDisplay.style.display = 'block';
                    // Optionally refresh data or redirect
                    // window.location.href = '/ShowAllTables.html';
                } else {
                    messageDisplay.classList.add('alert-danger');
                    messageDisplay.textContent = data.message || 'Failed to update room.';
                    messageDisplay.style.display = 'block';
                }
            } catch (error) {
                console.error('Network error during room update:', error);
                messageDisplay.classList.add('alert-danger');
                messageDisplay.textContent = 'An unexpected error occurred. Please try again.';
                messageDisplay.style.display = 'block';
            }
        });
    }
});
