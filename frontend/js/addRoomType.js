// frontend/js/addRoomType.js

document.addEventListener('DOMContentLoaded', () => {
    const addRoomTypeForm = document.getElementById('addRoomTypeForm');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'alert mt-3';
    messageDiv.style.display = 'none';
    addRoomTypeForm.parentNode.insertBefore(messageDiv, addRoomTypeForm.nextSibling);

    if (addRoomTypeForm) {
        addRoomTypeForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const roomTypeIDInput = document.getElementById('roomTypeID');
            const categoryNameInput = document.getElementById('categoryName');
            const priceInput = document.getElementById('price');
            const descriptionInput = document.getElementById('description');
            const bedInput = document.getElementById('bed');
            const bathInput = document.getElementById('bath');
            const photoInput = document.getElementById('photo');

            const roomTypeID = parseInt(roomTypeIDInput.value);
            const categoryName = categoryNameInput.value;
            const price = parseInt(priceInput.value);
            const description = descriptionInput.value;
            const bed = parseInt(bedInput.value);
            const bath = parseInt(bathInput.value);
            const photo = photoInput.value;

            // Clear previous messages
            messageDiv.style.display = 'none';
            messageDiv.className = 'alert mt-3';
            messageDiv.textContent = '';

            try {
                const response = await fetch('/api/admin/addroomtype', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        RoomTypeID: roomTypeID,
                        CategoryName: categoryName,
                        Price: price,
                        Description: description,
                        bed: bed,
                        bath: bath,
                        photo: photo
                    }),
                });

                const data = await response.json();

                if (response.ok) {
                    messageDiv.classList.add('alert-success');
                    messageDiv.textContent = data.message || 'Room type added successfully!';
                    messageDiv.style.display = 'block';
                    addRoomTypeForm.reset(); // Clear form fields
                } else {
                    messageDiv.classList.add('alert-danger');
                    messageDiv.textContent = data.message || 'Failed to add room type.';
                    messageDiv.style.display = 'block';
                }
            } catch (error) {
                console.error('Network error during room type addition:', error);
                messageDiv.classList.add('alert-danger');
                messageDiv.textContent = 'An unexpected error occurred. Please try again.';
                messageDiv.style.display = 'block';
            }
        });
    }
});