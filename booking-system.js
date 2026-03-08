/* 
  Nur al-Quran - Booking System Component
  Source file for both static site and WordPress plugin.
  Sync this file to the WP plugin via sync-to-wp.js
*/

document.addEventListener('DOMContentLoaded', function () {
    const slots = document.querySelectorAll('.slot');
    const preferredTimeInput = document.getElementById('preferred-time') || document.getElementById('wp-selected-time');
    const registrationSection = document.getElementById('contact');
    const timetableSection = document.getElementById('timetable');
    const feedback = document.getElementById('form-feedback') || document.getElementById('wp-form-feedback');
    const enrollmentForm = document.getElementById('enrollment-form') || document.getElementById('wp-enrollment-form');

    // Context Detection
    const isWordPress = typeof quran_ajax !== 'undefined';

    // AJAX URL logic
    const getAjaxUrl = () => {
        console.log('Nur al-Quran: Environment:', {
            protocol: window.location.protocol,
            hostname: window.location.hostname,
            isWordPress: isWordPress
        });

        if (isWordPress) return quran_ajax.ajax_url;

        if (window.location.protocol === 'file:') {
            // Hardcoded local fallback
            return 'http://localhost/quranacademy/wp-admin/admin-ajax.php';
        }
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            return '/quranacademy/wp-admin/admin-ajax.php';
        }
        // Live site relative path
        return '/wp-admin/admin-ajax.php';
    };

    const BOOKING_AJAX_URL = getAjaxUrl();

    // Timetable Interaction
    if (preferredTimeInput && timetableSection) {
        preferredTimeInput.addEventListener('click', function () {
            timetableSection.scrollIntoView({ behavior: 'smooth' });
            timetableSection.style.boxShadow = '0 0 25px rgba(197, 160, 89, 0.3)';
            setTimeout(() => { timetableSection.style.boxShadow = ''; }, 2000);
        });
    }

    slots.forEach(slot => {
        slot.addEventListener('click', function () {
            if (this.classList.contains('booked')) return;

            document.querySelectorAll('.slot.selected').forEach(s => s.classList.remove('selected'));
            this.classList.add('selected');

            const timeValue = this.getAttribute('data-time');
            if (preferredTimeInput) {
                preferredTimeInput.value = timeValue;
                preferredTimeInput.style.borderColor = 'var(--primary)';
                setTimeout(() => { preferredTimeInput.style.borderColor = ''; }, 2000);
            }

            if (registrationSection && !isWordPress) {
                setTimeout(() => { registrationSection.scrollIntoView({ behavior: 'smooth' }); }, 500);
            }
        });
    });

    // Booking Sync
    async function fetchAndApplyBookings() {
        try {
            console.log('Nur al-Quran: Syncing bookings from:', BOOKING_AJAX_URL);
            const response = await fetch(`${BOOKING_AJAX_URL}?action=quran_get_bookings`);

            if (!response.ok) {
                console.error('Nur al-Quran: Sync response not OK:', response.status, response.statusText);
                throw new Error(`HTTP ${response.status}`);
            }

            const result = await response.json();
            console.log('Nur al-Quran: Sync data received:', result);
            const bookedList = result.success ? result.data : result;

            if (Array.isArray(bookedList)) {
                bookedList.forEach(booking => {
                    const slot = document.querySelector(`.slot[data-time="${booking.selected_time}"]`);
                    if (slot) {
                        slot.classList.remove('available', 'selected');
                        slot.classList.add('booked');
                        slot.innerText = isWordPress ? 'Reserved' : 'Booked';
                        slot.style.cursor = 'not-allowed';
                    }
                });
            }
        } catch (error) {
            console.warn('Nur al-Quran: Booking sync skipped or failed:', error.message);
        }
    }
    fetchAndApplyBookings();

    // Form Handling
    if (enrollmentForm) {
        enrollmentForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerText;
            submitBtn.innerText = 'Sending...';
            submitBtn.disabled = true;

            const formData = new FormData(this);
            formData.append('action', 'quran_submit_booking');

            console.log('Nur al-Quran: Submitting to:', BOOKING_AJAX_URL);

            fetch(BOOKING_AJAX_URL, {
                method: 'POST',
                body: formData,
                // Add mode 'no-cors' only if absolutely necessary, but for AJAX it's better to stay within CORS
            })
                .then(async response => {
                    console.log('Nur al-Quran: Received response status:', response.status);
                    const isJson = response.headers.get('content-type')?.includes('application/json');
                    const textContent = await response.text();

                    let data = null;
                    try {
                        data = JSON.parse(textContent);
                    } catch (e) {
                        console.warn('Nur al-Quran: Response was not JSON:', textContent.substring(0, 100));
                    }

                    if (response.ok && (!data || data.success !== false)) {
                        feedback.innerText = 'Assalamu Alaikum! Your registration has been received.';
                        feedback.className = isWordPress ? 'feedback-msg success show' : 'form-feedback success';
                        feedback.style.display = 'block';

                        enrollmentForm.reset();
                        fetchAndApplyBookings();

                        setTimeout(() => {
                            feedback.style.display = 'none';
                            feedback.classList.remove('show');
                        }, 10000);
                    } else {
                        const errorMsg = data?.data || 'Server error or invalid response';
                        console.error('Nur al-Quran: Submission failed:', errorMsg);
                        feedback.innerText = `Oops! ${errorMsg}. Please try again or contact us via WhatsApp.`;
                        feedback.className = isWordPress ? 'feedback-msg error show' : 'form-feedback error';
                        feedback.style.display = 'block';
                    }
                })
                .catch(error => {
                    console.error('Nur al-Quran: Fetch error:', error);
                    feedback.innerText = 'Connection error. Please ensure your local server (XAMPP) is running.';
                    feedback.className = isWordPress ? 'feedback-msg error show' : 'form-feedback error';
                    feedback.style.display = 'block';

                    // IF AJAX fails on static site, maybe allow default FormSubmit as fallback?
                    // But we want it in the database. Let's stick to debugging for now.
                })
                .finally(() => {
                    submitBtn.innerText = originalText;
                    submitBtn.disabled = false;
                });
        });
    }
});
