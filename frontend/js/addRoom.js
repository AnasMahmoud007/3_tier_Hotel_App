// frontend/js/addRoom.js

document.addEventListener('DOMContentLoaded', () => {
    const addRoomForm = document.getElementById('addRoomForm');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'alert mt-3';
    messageDiv.style.display = 'none';
    addRoomForm.parentNode.insertBefore(messageDiv, addRoomForm.nextSibling);

    if (addRoomForm) {
        addRoomForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const roomNumberInput = document.getElementById('roomNumber');
            const categoryNameInput = document.getElementById('categoryName');
            const pricePerNightInput = document.getElementById('pricePerNight');

            const roomNumber = parseInt(roomNumberInput.value);
            const categoryName = categoryNameInput.value;
            const pricePerNight = parseFloat(pricePerNightInput.value);

            // Clear previous messages
            messageDiv.style.display = 'none';
            messageDiv.className = 'alert mt-3';
            messageDiv.textContent = '';

            try {
                const response = await fetch('/api/admin/addroom', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        RoomNumber: roomNumber,
                        CategoryName: categoryName,
                        PricePerNight: pricePerNight
                    }),
                });

                const data = await response.json();

                if (response.ok) {
                    messageDiv.classList.add('alert-success');
                    messageDiv.textContent = data.message || 'Room added successfully!';
                    messageDiv.style.display = 'block';
                    addRoomForm.reset(); // Clear form fields
                } else {
                    messageDiv.classList.add('alert-danger');
                    messageDiv.textContent = data.message || 'Failed to add room.';
                    messageDiv.style.display = 'block';
                }
            } catch (error) {
                console.error('Network error during room addition:', error);
                messageDiv.classList.add('alert-danger');
                messageDiv.textContent = 'An unexpected error occurred. Please try again.';
                messageDiv.style.display = 'block';
            }
        });
    }
});
