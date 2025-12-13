// frontend/js/roomtype.js

document.addEventListener('DOMContentLoaded', async () => {
    const offersContainer = document.querySelector('.row.g-5.justify-content-center'); // Adjust selector as needed
    const roomtypesContainer = document.querySelector('.row.g-4'); // Adjust selector for room types

    const populateOffers = async () => {
        try {
            const response = await fetch('/api/offers');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const offers = await response.json();

            offersContainer.innerHTML = ''; // Clear existing static offers

            if (offers.length > 0) {
                offers.forEach(offer => {
                    const offerItem = document.createElement('div');
                    offerItem.classList.add('col-lg-4', 'col-md-6', 'wow', 'fadeInUp');
                    offerItem.setAttribute('data-wow-delay', '0.1s'); // Placeholder delay
                    offerItem.innerHTML = `
                        <div class="package-item">
                            <div class="overflow-hidden">
                                <img class="img-fluid" src="css/img/package-1.jpg" alt=""> <!-- Use offer.photo if available -->
                            </div>
                            <div class="d-flex border-bottom">
                                <small class="flex-fill text-center border-end py-2"><i class="fa fa-calendar-alt text-success me-2"></i>${offer.days} days</small>
                                <small class="flex-fill text-center py-2"><i class="fa fa-user text-success me-2"></i>${offer.Person} Person</small>
                            </div>
                            <div class="text-center p-4">
                                <h1 class="mb-0">${offer.OffersName}</h1>
                                <h3 class="mb-0">$${offer.Price.toFixed(2)}</h3>
                                <div class="mb-3">
                                    <small class="fa fa-star text-success"></small>
                                    <small class="fa fa-star text-success"></small>
                                    <small class="fa fa-star text-success"></small>
                                    <small class="fa fa-star text-success"></small>
                                    <small class="fa fa-star text-success"></small>
                                </div>
                                <p>${offer.Description}</p>
                                <div class="d-flex justify-content-center mb-2">
                                    <a href="Error.html" class="btn btn-sm btn-success px-3 border-end" style="border-radius: 30px 0 0 30px;">Read More</a>
                                    <a href="reservation.html" class="btn btn-sm btn-success px-3" style="border-radius: 0 30px 30px 0;">Book Now</a>
                                </div>
                            </div>
                        </div>
                    `;
                    offersContainer.appendChild(offerItem);
                });
            } else {
                offersContainer.innerHTML = '<p class="text-center w-100">No offers available yet.</p>';
            }
        } catch (error) {
            console.error('Error fetching offers:', error);
            // Optionally display error on page
        }
    };

    // Populate offers on page load
    populateOffers();

    // The room types section will also need dynamic loading, similar to offers.
    // For now, it will remain static.
    // Future API call for room types: /api/roomtypes
});
