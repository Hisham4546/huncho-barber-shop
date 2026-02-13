// ===================================
// HUNCHO BARBER SHOP - JavaScript
// Interactive Features & Functionality
// ===================================

// Mobile Navigation Toggle
const navToggle = document.querySelector('.nav-toggle');
const navMenu = document.querySelector('.nav-menu');
const navLinks = document.querySelectorAll('.nav-menu a');

if (navToggle) {
    navToggle.addEventListener('click', () => {
        navToggle.classList.toggle('active');
        navMenu.classList.toggle('active');
        document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
    });

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navToggle.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.style.overflow = '';
        });
    });
}

// Smooth Scrolling Enhancement
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const headerOffset = 80;
            const elementPosition = target.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// Header Scroll Effect
let lastScroll = 0;
const header = document.querySelector('.header');

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    if (currentScroll > 100) {
        header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
    } else {
        header.style.boxShadow = 'none';
    }

    lastScroll = currentScroll;
});

// Set minimum date for appointment booking (today)
const dateInput = document.getElementById('date');
if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.setAttribute('min', today);
}

// Booking Form Submission with Supabase
const bookingForm = document.getElementById('bookingForm');
const formMessage = document.getElementById('formMessage');

// Initialize Supabase Client
const SUPABASE_URL = 'https://zitrlhunnceduqjribzh.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InppdHJsaHVubmNlZHVxanJpYnpoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg4MzEyNjUsImV4cCI6MjA4NDQwNzI2NX0.KJVP5M-bfPVQjYhRFqQ77ZTly9Tz7t88NwQBZsw23FY';

let supabase = null;

// Load Supabase library dynamically
function loadSupabase() {
    return new Promise((resolve, reject) => {
        if (window.supabase) {
            resolve(window.supabase);
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
        script.onload = () => {
            if (window.supabase) {
                resolve(window.supabase);
            } else {
                reject(new Error('Supabase library failed to load'));
            }
        };
        script.onerror = () => reject(new Error('Failed to load Supabase library'));
        document.head.appendChild(script);
    });
}

// Initialize Supabase client
async function initializeSupabase() {
    try {
        const supabaseLib = await loadSupabase();
        supabase = supabaseLib.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        return true;
    } catch (error) {
        console.error('Failed to initialize Supabase:', error);
        return false;
    }
}

// Handle form submission
if (bookingForm) {
    bookingForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const submitButton = bookingForm.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.textContent;

        submitButton.disabled = true;
        submitButton.textContent = 'BOOKING...';
        formMessage.style.display = 'none';
        formMessage.className = 'form-message';

        const formData = {
            customer_name: document.getElementById('name').value.trim(),
            phone_number: document.getElementById('phone').value.trim(),
            service: document.getElementById('service').value,
            appointment_date: document.getElementById('date').value,
            appointment_time: document.getElementById('time').value,
            notes: document.getElementById('notes').value.trim()
        };

        try {
            if (!supabase) {
                const initialized = await initializeSupabase();
                if (!initialized) {
                    throw new Error('Failed to connect to booking system');
                }
            }

            const { data, error } = await supabase
                .from('appointments')
                .insert([formData])
                .select();

            if (error) throw error;

            formMessage.textContent = 'Appointment booked successfully! We will contact you shortly to confirm.';
            formMessage.classList.add('success');
            formMessage.style.display = 'block';

            bookingForm.reset();

            setTimeout(() => {
                formMessage.style.display = 'none';
            }, 5000);

        } catch (error) {
            console.error('Booking error:', error);
            formMessage.textContent = 'Failed to book appointment. Please call us directly or try again later.';
            formMessage.classList.add('error');
            formMessage.style.display = 'block';
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = originalButtonText;
        }
    });
}

// Initialize Supabase when page loads
document.addEventListener('DOMContentLoaded', () => {
    initializeSupabase().catch(err => {
        console.warn('Supabase initialization delayed:', err);
    });
});

// Animate elements on scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

document.querySelectorAll('.service-card, .gallery-item').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});

// Form validation helpers
function validatePhone(phone) {
    const phoneRegex = /^[\d\s\+\-\(\)]+$/;
    return phoneRegex.test(phone) && phone.length >= 10;
}

function validateDate(date) {
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return selectedDate >= today;
}

// Add real-time validation
if (bookingForm) {
    const phoneInput = document.getElementById('phone');
    const dateInputValidate = document.getElementById('date');

    phoneInput.addEventListener('blur', function() {
        if (this.value && !validatePhone(this.value)) {
            this.style.borderColor = '#dc3545';
            showInputError(this, 'Please enter a valid phone number');
        } else {
            this.style.borderColor = '';
            clearInputError(this);
        }
    });

    dateInputValidate.addEventListener('change', function() {
        if (this.value && !validateDate(this.value)) {
            this.style.borderColor = '#dc3545';
            showInputError(this, 'Please select a future date');
            this.value = '';
        } else {
            this.style.borderColor = '';
            clearInputError(this);
        }
    });
}

function showInputError(input, message) {
    clearInputError(input);
    const errorDiv = document.createElement('div');
    errorDiv.className = 'input-error';
    errorDiv.style.color = '#dc3545';
    errorDiv.style.fontSize = '0.875rem';
    errorDiv.style.marginTop = '0.25rem';
    errorDiv.textContent = message;
    input.parentElement.appendChild(errorDiv);
}

function clearInputError(input) {
    const errorDiv = input.parentElement.querySelector('.input-error');
    if (errorDiv) {
        errorDiv.remove();
    }
}

// Lazy loading for images
if ('loading' in HTMLImageElement.prototype) {
    const images = document.querySelectorAll('img');
    images.forEach(img => {
        img.loading = 'lazy';
    });
}

// Add current year to footer
const currentYear = new Date().getFullYear();
const footerText = document.querySelector('.footer-bottom p');
if (footerText) {
    footerText.textContent = footerText.textContent.replace('2024', currentYear);
}

console.log('HUNCHO BARBER SHOP website loaded successfully!');
