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

    // --- GOOGLE SHEETS SETUP ---
    // User will paste their Apps Script Web App URL here later
    const GOOGLE_SHEET_URL = 'https://script.google.com/macros/s/AKfycbyhMlo2Vl9UQgaS5Rn8XwcuyYMCC1J_oB-0_MFRjsGkU1_j_tlxNV1RVnnFO6Qa4FTTAg/exec';

    // AJAX URL logic
    const getBackendUrl = () => {
        // 1. If we are running inside the WordPress Plugin (Shortcode)
        if (isWordPress) return quran_ajax.ajax_url;

        // 2. If Google Sheets URL is provided (For Vercel / Live Local HTML file)
        if (GOOGLE_SHEET_URL && GOOGLE_SHEET_URL.startsWith('https://script.google.com')) {
            console.log('Nur al-Quran: Using Google Sheets Backend');
            return GOOGLE_SHEET_URL;
        }

        // 3. Fallbacks for local XAMPP testing (if Google Sheet URL is empty)
        console.log('Nur al-Quran: Environment:', {
            protocol: window.location.protocol,
            hostname: window.location.hostname
        });

        if (window.location.protocol === 'file:') {
            return 'http://localhost/quranacademy/wp-admin/admin-ajax.php';
        }
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            return '/quranacademy/wp-admin/admin-ajax.php';
        }

        return '/wp-admin/admin-ajax.php';
    };

    const BACKEND_URL = getBackendUrl();

    const viewTimetableBtn = document.getElementById('view-timetable-btn');
    if (viewTimetableBtn && timetableSection) {
        viewTimetableBtn.addEventListener('click', function (e) {
            e.preventDefault();
            const isHidden = timetableSection.classList.toggle('hidden');
            this.innerText = isHidden ? 'View Timetable' : 'Minimize Timetable';

            if (!isHidden) {
                timetableSection.scrollIntoView({ behavior: 'smooth' });
                timetableSection.style.boxShadow = '0 0 25px rgba(197, 160, 89, 0.3)';
                setTimeout(() => { timetableSection.style.boxShadow = ''; }, 2000);
            }
        });
    }

    // Timetable Interaction
    if (preferredTimeInput && timetableSection) {
        preferredTimeInput.addEventListener('click', function () {
            if (timetableSection.classList.contains('hidden')) {
                timetableSection.classList.remove('hidden');
                if (viewTimetableBtn) viewTimetableBtn.innerText = 'Minimize Timetable';
            }
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
    function fetchAndApplyBookings() {
        const isWordPress = typeof quran_ajax !== 'undefined';
        let fetchPromise;

        if (isWordPress) {
            // Fetch from WordPress AJAX
            fetchPromise = fetch(quran_ajax.ajax_url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    'action': 'quran_get_bookings'
                })
            }).then(response => response.json())
                .then(data => data.success ? data.data : []);
        } else {
            // Fetch from Google Apps Script
            const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyc9R05b4t0P-v0wN7x_iHozQZp6M8IuX2D-nI34zJ5gT77-AIny-Yx3wSCA7VbF7E/exec'; // Ensure real URL
            fetchPromise = fetch(GOOGLE_SCRIPT_URL)
                .then(response => response.json())
                .then(data => data.success ? data.data : [])
                .catch(error => {
                    console.error("Error fetching from GAS:", error);
                    return [];
                });
        }

        fetchPromise.then(bookings => {
            if (!bookings || bookings.length === 0) return;

            // bookings can be array of objects: {selected_time: 'Mon: 07:00...', status: 'new'} or just objects with selected_time
            bookings.forEach(booking => {
                const timeSlotText = booking.selected_time || booking;
                const status = booking.status ? booking.status.toLowerCase() : 'approved'; // Default to approved for older data if missing

                // Find the slot in the DOM
                const slotElement = document.querySelector(`.slot[data-time="${timeSlotText}"]`);

                if (slotElement) {
                    // Clear existing availability classes
                    slotElement.classList.remove('available', 'booked', 'waiting', 'selected');

                    if (status === 'new' || status === 'pending' || status === 'waiting') {
                        // Waiting status
                        slotElement.classList.add('waiting');
                        slotElement.textContent = 'Waiting';
                    } else if (status === 'approved' || status === 'booked') {
                        // Fully booked status
                        slotElement.classList.add('booked');
                        slotElement.textContent = 'Reserved';
                    } else {
                        // Fallback to booked if weird status
                        slotElement.classList.add('booked');
                        slotElement.textContent = 'Reserved';
                    }
                }
            });
        });
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
            if (isWordPress) {
                formData.append('action', 'quran_submit_booking');
            }

            const dataToPost = isWordPress ? formData : new URLSearchParams(formData);
            const headers = isWordPress ? {} : { 'Content-Type': 'application/x-www-form-urlencoded' };

            console.log('Nur al-Quran: Submitting to:', BACKEND_URL);

            fetch(BACKEND_URL, {
                method: 'POST',
                body: dataToPost,
                headers: headers
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
                        feedback.innerText = 'Assalamu Alaikum! Your application has been received. Please check your email for confirmation.';
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
