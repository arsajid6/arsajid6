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

    // --- Dynamic Timetable Configuration ---
    const TIMES = [
        '04:00 AM - 05:00 AM', '05:00 AM - 06:00 AM', '06:00 AM - 07:00 AM',
        '07:00 AM - 08:00 AM', '08:00 AM - 09:00 AM', '09:00 AM - 10:00 AM',
        '10:00 AM - 11:00 AM', '11:00 AM - 12:00 PM', '12:00 PM - 01:00 PM',
        '01:00 PM - 02:00 PM', '02:00 PM - 03:00 PM', '03:00 PM - 04:00 PM',
        '04:00 PM - 05:00 PM', '05:00 PM - 06:00 PM', '06:00 PM - 07:00 PM',
        '07:00 PM - 08:00 PM', '08:00 PM - 09:00 PM', '09:00 PM - 10:00 PM',
        '10:00 PM - 11:00 PM'
    ];
    const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    function renderTimetable(bookings = []) {
        const wrapper = document.getElementById('timetable-wrapper');
        if (!wrapper) return;

        wrapper.innerHTML = ''; // Clear loading state

        DAYS.forEach(dayName => {
            const shortDay = dayName.substring(0, 3);
            const isSunday = shortDay === 'Sun';

            // Filter times to hide Mon-Sat 7 AM to 5 PM
            const availableTimesForDay = TIMES.filter(time => {
                if (isSunday) return true;
                // Parse hour
                const match = time.match(/^(\d+):00 (AM|PM)/);
                let h = parseInt(match[1]);
                const ampm = match[2];
                if (ampm === 'PM' && h !== 12) h += 12;
                if (ampm === 'AM' && h === 12) h = 0;

                // Return true if NOT between 7 AM (7) and 5 PM (17)
                return (h < 7 || h >= 17);
            });

            if (availableTimesForDay.length === 0) return;

            const dayRow = document.createElement('div');
            dayRow.className = 'timetable-day-row';

            const header = document.createElement('div');
            header.className = 'day-header';
            header.innerHTML = `<span>${dayName}</span> <small>${availableTimesForDay.length} Slots</small>`;
            dayRow.appendChild(header);

            const slotsFlex = document.createElement('div');
            slotsFlex.className = 'slots-flex';

            availableTimesForDay.forEach(time => {
                const fullTimeKey = `${shortDay}: ${time}`;
                const booking = bookings.find(b => (b.selected_time || b) === fullTimeKey);

                const isPM = time.includes('PM');
                const hourNum = parseInt(time.split(':')[0]);
                let icon = '🌅'; // Default morning
                if (isPM) {
                    if (hourNum >= 1 && hourNum < 5) icon = '☀️';
                    else if (hourNum >= 5 && hourNum < 8) icon = '🌇';
                    else icon = '🌙';
                } else {
                    if (hourNum >= 10 && hourNum < 12) icon = '☀️';
                }

                const slotDiv = document.createElement('div');
                slotDiv.className = 'slot available';
                slotDiv.setAttribute('data-time', fullTimeKey);
                slotDiv.innerHTML = `<span class="slot-icon">${icon}</span> <span>${time}</span>`;

                if (booking) {
                    const status = (booking.status || 'approved').toLowerCase();
                    slotDiv.classList.remove('available');
                    if (status === 'new' || status === 'pending' || status === 'waiting') {
                        slotDiv.classList.add('waiting');
                        slotDiv.innerHTML = `<span class="slot-icon">⏳</span> <span>${time}</span>`;
                    } else {
                        slotDiv.classList.add('booked');
                        slotDiv.innerHTML = `<span class="slot-icon">🔒</span> <span style="text-decoration: line-through;">${time}</span>`;
                    }
                }

                // Add click listener
                slotDiv.addEventListener('click', function () {
                    if (this.classList.contains('booked') || this.classList.contains('waiting')) return;

                    document.querySelectorAll('.slot.selected').forEach(s => s.classList.remove('selected'));
                    this.classList.add('selected');

                    if (preferredTimeInput) {
                        preferredTimeInput.value = this.getAttribute('data-time');
                        preferredTimeInput.style.borderColor = 'var(--primary)';
                    }
                });

                slotsFlex.appendChild(slotDiv);
            });

            dayRow.appendChild(slotsFlex);
            wrapper.appendChild(dayRow);
        });
    }

    // Booking Sync
    function fetchAndApplyBookings() {
        const isWordPress = typeof quran_ajax !== 'undefined';
        let fetchPromise;

        if (isWordPress) {
            fetchPromise = fetch(quran_ajax.ajax_url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({ 'action': 'quran_get_bookings' })
            }).then(response => response.json()).then(data => data.success ? data.data : []);
        } else {
            fetchPromise = fetch(GOOGLE_SHEET_URL)
                .then(response => response.json())
                .then(data => data.success ? data.data : [])
                .catch(() => []);
        }

        fetchPromise.then(bookings => {
            renderTimetable(bookings);
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
