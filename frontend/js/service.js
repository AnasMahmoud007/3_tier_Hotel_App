// frontend/js/service.js

document.addEventListener('DOMContentLoaded', async () => {
    const servicesContainer = document.getElementById('servicesContainer');

    if (!servicesContainer) {
        console.error('Services container not found.');
        return;
    }

    servicesContainer.innerHTML = '<div class="col-12 text-center">Loading services...</div>';

    try {
        const response = await fetch('/api/admin/services');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const services = await response.json();

        servicesContainer.innerHTML = ''; // Clear loading message

        if (services.length > 0) {
            services.forEach(service => {
                const serviceItem = document.createElement('div');
                serviceItem.className = 'col-lg-4 col-sm-6 wow fadeInUp';
                serviceItem.setAttribute('data-wow-delay', '0.1s'); // Keep animation effect

                serviceItem.innerHTML = `
                    <div class="service-item rounded pt-3">
                        <div class="p-4">
                            <i class="fa fa-${service.icon || 'star'} fa-2x text-success mb-4"></i>
                            <h5>${service.AmenityName}</h5>
                            <p>${service.Description}</p>
                            <p class="text-muted">Available: ${service.Availability == 1 ? 'Yes' : 'No'}</p>
                            <p class="text-muted">Charges: $${service.AdditionalCharges ? service.AdditionalCharges.toFixed(2) : '0.00'}</p>
                        </div>
                    </div>
                `;
                servicesContainer.appendChild(serviceItem);
            });
        } else {
            servicesContainer.innerHTML = '<div class="col-12 text-center">No services available.</div>';
        }

    } catch (error) {
        console.error('Error fetching services:', error);
        servicesContainer.innerHTML = `<div class="col-12 text-center text-danger">Failed to load services: ${error.message}</div>`;
    }
});
