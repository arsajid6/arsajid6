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

        // Use Fetch to send to FormSubmit
        fetch(this.action, {
            method: 'POST',
            body: formData,
            headers: {
                'Accept': 'application/json'
            }
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
