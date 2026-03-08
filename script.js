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

// Function to open and scroll to the timetable
function openTimetable(e) {
    if (e && e.type === 'click' && e.target.tagName === 'A') {
        e.preventDefault();
    }

    // The timetable section itself has the hidden class, so remove it directly
    if (timetableSection && timetableSection.classList.contains('hidden')) {
        timetableSection.classList.remove('hidden');
    }

    // Scroll to it for clear visibility
    setTimeout(() => {
        timetableSection.scrollIntoView({ behavior: 'smooth' });
        // Add a subtle highlight to the timetable
        timetableSection.style.boxShadow = '0 0 25px rgba(197, 160, 89, 0.3)';
        setTimeout(() => {
            timetableSection.style.boxShadow = '';
        }, 2000);
    }, 100); // slight delay to let it expand
}

// Open timetable when clicking the input
if (preferredTimeInput) {
    preferredTimeInput.addEventListener('click', openTimetable);
}

// Open timetable when clicking "View Timetable" buttons
document.querySelectorAll('a[href="#timetable"]').forEach(btn => {
    btn.addEventListener('click', openTimetable);
});


slots.forEach(slot => {
    slot.addEventListener('click', function () {
        if (this.classList.contains('booked')) return;

        // Remove selection from others
        document.querySelectorAll('.slot.selected').forEach(s => s.classList.remove('selected'));

        // Add selection to this one
        this.classList.add('selected');

        // Extract data
        const timeValue = this.getAttribute('data-time');

        // Populate form
        if (preferredTimeInput) {
            preferredTimeInput.value = timeValue;

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

// Form Submission Handling (See booking-system.js for detailed logic)
// This file can now focus on global UI interactions (sticky header, scroll reveal, etc.)
