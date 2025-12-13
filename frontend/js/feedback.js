// frontend/js/feedback.js

document.addEventListener('DOMContentLoaded', async () => {
    const feedbackForm = document.getElementById('feedbackForm');
    const testimonialCarousel = document.querySelector('.testimonial-carousel');
    const feedbackErrorDiv = document.getElementById('feedbackError'); // Assuming an error div for feedback form

    // Helper function to display errors
    const displayError = (message) => {
        if (feedbackErrorDiv) {
            feedbackErrorDiv.textContent = message;
            feedbackErrorDiv.style.display = 'block';
        }
    };

    // Function to fetch and populate testimonials
    const fetchAndPopulateTestimonials = async () => {
        try {
            const response = await fetch('/api/testimonials');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json(); // Expecting List<Dictionary<string, object>>

            testimonialCarousel.innerHTML = ''; // Clear existing static placeholders

            if (data.length > 0) {
                data.forEach(feedback => {
                    const testimonialItem = document.createElement('div');
                    testimonialItem.classList.add('testimonial-item', 'bg-white', 'text-center', 'border', 'p-4');
                    testimonialItem.innerHTML = `
                        <img class="bg-white rounded-circle shadow p-1 mx-auto mb-3" src="css/img/im.png" style="width: 80px; height: 80px;">
                        <h5 class="mb-0">${feedback.Name || feedback.UserName}</h5>
                        <p>${feedback.FeedbackDate ? new Date(feedback.FeedbackDate).toLocaleDateString() : 'N/A'}</p>
                        <p>Rate: ${feedback.Rating} <small class="fa fa-star"></small></p>
                        <p class="mb-0">
                            ${feedback.Comments}
                        </p>
                    `;
                    testimonialCarousel.appendChild(testimonialItem);
                });
                // Initialize Owl Carousel if it's supposed to be dynamic
                if (typeof jQuery !== 'undefined' && $.fn.owlCarousel) {
                    $(testimonialCarousel).owlCarousel({
                        autoplay: true,
                        smartSpeed: 1000,
                        center: true,
                        margin: 24,
                        dots: true,
                        loop: true,
                        nav: false,
                        responsive: {
                            0: { items: 1 },
                            768: { items: 2 },
                            992: { items: 3 }
                        }
                    });
                }
            } else {
                testimonialCarousel.innerHTML = '<p class="text-center">No feedback available yet.</p>';
            }
        } catch (error) {
            console.error('Error fetching testimonials:', error);
            // displayError('Failed to load testimonials.'); // Optionally display, but not critical for page load
        }
    };

    // Call to fetch testimonials on page load
    fetchAndPopulateTestimonials();


    if (feedbackForm) {
        feedbackForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            feedbackErrorDiv.style.display = 'none'; // Hide previous errors

            const comments = document.getElementById('feedback').value;
            const rating = parseInt(document.getElementById('rating').value);

            // Basic validation
            if (!comments || isNaN(rating) || rating < 1 || rating > 5) {
                displayError('Please provide comments and a rating between 1 and 5.');
                return;
            }

            try {
                const response = await fetch('/api/feedback', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ Comments: comments, Rating: rating }),
                });

                const data = await response.json();

                if (response.ok) {
                    console.log('Feedback submitted successfully:', data);
                    alert('Feedback submitted successfully!');
                    feedbackForm.reset(); // Clear form
                    // Re-fetch testimonials to show the new one
                    await fetchAndPopulateTestimonials();
                } else {
                    console.error('Feedback submission failed:', data);
                    displayError(data.message || 'Feedback submission failed.');
                }
            } catch (error) {
                console.error('Network error during feedback submission:', error);
                displayError('An unexpected error occurred. Please try again.');
            }
        });
    }

    // Star rating logic (copied from original feedback.cshtml)
    const stars = document.querySelectorAll('.rating');
    const ratingInput = document.getElementById('rating');

    stars.forEach((star) => {
        star.addEventListener('click', () => {
            const ratingValue = parseInt(star.getAttribute('data-rating'));
            ratingInput.value = ratingValue;

            stars.forEach((s, index) => {
                if (index < ratingValue) {
                    s.classList.add('rated');
                } else {
                    s.classList.remove('rated');
                }
            });
        });
    });
});
