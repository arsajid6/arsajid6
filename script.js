// Sticky Header Logic
window.addEventListener('scroll', function () {
    const header = document.querySelector('header');
    header.classList.toggle('sticky', window.scrollY > 0);
});

// Scroll Reveal Animation (using Intersection Observer)
const observerOptions = {
    threshold: 0.1
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('reveal');
        }
    });
}, observerOptions);

// Add revealing logic to sections later if needed
document.querySelectorAll('section').forEach((section) => {
    section.style.opacity = "0";
    section.style.transition = "all 1s ease-out";
    section.style.transform = "translateY(20px)";
});

const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = "1";
            entry.target.style.transform = "translateY(0)";
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll('section').forEach(section => {
    sectionObserver.observe(section);
});

// Timetable Interactivity
const slots = document.querySelectorAll('.slot');
const preferredTimeInput = document.getElementById('preferred-time');
const registrationSection = document.getElementById('contact');
const timetableSection = document.getElementById('timetable');

// Open timetable when clicking the input
if (preferredTimeInput) {
    preferredTimeInput.addEventListener('click', function () {
        timetableSection.scrollIntoView({ behavior: 'smooth' });
        // Add a subtle highlight to the timetable
        timetableSection.style.boxShadow = '0 0 25px rgba(197, 160, 89, 0.3)';
        setTimeout(() => {
            timetableSection.style.boxShadow = '';
        }, 2000);
    });
}

slots.forEach(slot => {
    slot.addEventListener('click', function () {
        if (this.classList.contains('booked')) return;

        // Remove selection from others
        document.querySelectorAll('.slot.selected').forEach(s => s.classList.remove('selected'));

        // Add selection to this one
        this.classList.add('selected');

        // Extract data
        const day = this.getAttribute('data-day');
        const time = this.getAttribute('data-time');

        // Populate form
        if (preferredTimeInput) {
            preferredTimeInput.value = `${day}: ${time}`;

            // Highlight the input temporarily
            preferredTimeInput.style.borderColor = 'var(--secondary)';
            preferredTimeInput.style.backgroundColor = 'rgba(197, 160, 89, 0.1)';

            setTimeout(() => {
                preferredTimeInput.style.borderColor = '';
                preferredTimeInput.style.backgroundColor = '';
            }, 2000);
        }

        // Scroll back to form after selection
        setTimeout(() => {
            registrationSection.scrollIntoView({ behavior: 'smooth' });
        }, 500);
    });
});

/**
 * Global Booking System Automation - WordPress Integration
 */
const BOOKING_AJAX_URL = '/quranacademy/wp-admin/admin-ajax.php';

async function fetchAndApplyBookings() {
    try {
        const response = await fetch(`${BOOKING_AJAX_URL}?action=quran_get_bookings`);
        if (!response.ok) throw new Error('Failed to fetch bookings');

        const result = await response.json();
        if (result.success) {
            updateBookedSlots(result.data);
        }
    } catch (error) {
        console.error('Error fetching booked slots:', error);
    }
}

function updateBookedSlots(bookedList) {
    if (!bookedList || !Array.isArray(bookedList)) return;

    bookedList.forEach(booking => {
        const slot = document.querySelector(`.slot[data-time="${booking.selected_time}"]`);
        if (slot) {
            slot.classList.remove('available', 'selected');
            slot.classList.add('booked');
            slot.innerText = 'Booked';
            // Disable click for booked slots
            slot.style.cursor = 'not-allowed';
        }
    });
}

// Initial fetch on load
window.addEventListener('DOMContentLoaded', () => {
    fetchAndApplyBookings();

});

// Form Submission Handling
const enrollmentForm = document.getElementById('enrollment-form');
const formFeedback = document.getElementById('form-feedback');

if (enrollmentForm) {
    enrollmentForm.addEventListener('submit', function (e) {
        e.preventDefault();

        // Show loading state
        const submitBtn = this.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerText;
        submitBtn.innerText = 'Sending...';
        submitBtn.disabled = true;

        // Collect form data
        const formData = new FormData(this);

        // Use Fetch to send to WordPress AJAX
        formData.append('action', 'quran_submit_booking');

        fetch(BOOKING_AJAX_URL, {
            method: 'POST',
            body: formData
        })
            .then(response => {
                if (response.ok) {
                    formFeedback.innerText = 'Assalamu Alaikum! Your registration has been received. We will contact you shortly.';
                    formFeedback.classList.add('success');
                    enrollmentForm.reset();
                } else {
                    formFeedback.innerText = 'Oops! There was a problem submitting your form. Please try again.';
                    formFeedback.classList.add('error');
                }
            })
            .catch(error => {
                formFeedback.innerText = 'Connection error. Please check your internet and try again.';
                formFeedback.classList.add('error');
            })
            .finally(() => {
                submitBtn.innerText = originalText;
                submitBtn.disabled = false;

                // Clear feedback after 7 seconds
                setTimeout(() => {
                    formFeedback.innerText = '';
                    formFeedback.classList.remove('success', 'error');
                }, 7000);
            });
    });
}
