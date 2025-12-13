// frontend/js/reservationHistory.js

document.addEventListener('DOMContentLoaded', async () => {
    const usernameDisplay = document.getElementById('reservationHistoryUsernameDisplay');
    const reservationHistoryTableBody = document.getElementById('reservationHistoryTableBody');
    const totalReservationsSpan = document.getElementById('totalReservations');

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

    if (!reservationHistoryTableBody) {
        console.error('Reservation history table body not found.');
        return;
    }

    reservationHistoryTableBody.innerHTML = '<tr><td colspan="5">Loading reservation history...</td></tr>';

    try {
        const response = await fetch('/api/user/reservations/history');
        if (!response.ok) {
            if (response.status === 401) {
                console.warn('User not authenticated. Redirecting to login.');
                // window.location.href = '/login-signup.html';
                return;
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const reservations = await response.json();
        console.log('Reservation History Data:', reservations);

        reservationHistoryTableBody.innerHTML = ''; // Clear loading message

        if (reservations.length > 0) {
            let counter = 1;
            reservations.forEach(reservation => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <th scope="row">${counter++}</th>
                    <td>${reservation.ReservationID}</td>
                    <td>${reservation.RoomNumber}</td>
                    <td>${new Date(reservation.CheckInDate).toLocaleDateString()}</td>
                    <td>${new Date(reservation.CheckOutDate).toLocaleDateString()}</td>
                `;
                reservationHistoryTableBody.appendChild(tr);
            });
            if (totalReservationsSpan) {
                totalReservationsSpan.textContent = reservations.length;
            }
        } else {
            reservationHistoryTableBody.innerHTML = '<tr><td colspan="5">No reservation history found.</td></tr>';
            if (totalReservationsSpan) {
                totalReservationsSpan.textContent = 0;
            }
        }

    } catch (error) {
        console.error('Error fetching reservation history:', error);
        reservationHistoryTableBody.innerHTML = `<tr class="text-danger"><td colspan="5">Failed to load reservation history: ${error.message}</td></tr>`;
    }
});
