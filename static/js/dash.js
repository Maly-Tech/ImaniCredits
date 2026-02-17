let currentStep = 1;
const totalSteps = 6;

const loanSlider = document.getElementById('loanSlider');
const loanAmount = document.getElementById('loanAmount');
const loanForm = document.getElementById('loanForm');


async function fetchAndPrefillUserFields() {
    try {
        const response = await fetch('/user_profile');
        if (!response.ok) throw new Error('Failed to fetch user data');

        const data = await response.json();

        // Prefill fields
        Object.entries(data).forEach(([key, value]) => {
            const field = document.querySelector(`[data-field="${key}"]`);
            if (field) {
                field.value = value;

                // Format Kenya phone
                if (key === "phoneNumber") {
                    field.value = formatKenyaPhone(value);
                }
            }
        });

        // Update Step 6 summary immediately if user is on Step 6
        if (currentStep === 6) updateSummary();

    } catch (err) {
        console.error('Error fetching user data:', err);
    }
}

// Call it on page load
document.addEventListener('DOMContentLoaded', fetchAndPrefillUserFields);

/* =========================
   SLIDER DISPLAY
========================= */
if (loanSlider && loanAmount) {
    loanSlider.addEventListener('input', function () {
        const value = parseInt(this.value);
        loanAmount.textContent = '$' + value.toLocaleString();
        this.classList.remove('error');
    });
}

/* =========================
   VALIDATION HELPERS
========================= */

// Kenya phone validation
function validateKenyaPhoneNumber(phone) {
    const cleaned = phone.replace(/[\s\-()]/g, '');
    const kenyaPhonePattern = /^(?:\+254|0)(?:7[0-9]|1[0-1])[0-9]{6}$/;
    return kenyaPhonePattern.test(cleaned);
}

// Format Kenya phone
function formatKenyaPhone(phone) {
    let cleaned = phone.replace(/[\s\-()]/g, '');

    if (cleaned.startsWith('0')) {
        cleaned = '254' + cleaned.substring(1);
    }

    if (cleaned.startsWith('254')) {
        return '+' + cleaned;
    }

    return phone;
}

// Email validation
function validateEmail(email) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
}

/* =========================
   FIELD VALIDATION
========================= */

function getFieldsForCurrentStep() {
    const section = document.querySelector(
        `[data-step="${currentStep}"].form-section`
    );
    return section ? section.querySelectorAll('[data-field]') : [];
}

function validateField(field) {
    const fieldName = field.getAttribute('data-field');
    const value =
        field.type === 'checkbox' ? field.checked : field.value.trim();

    const errorEl = field.closest('.form-group')
        ? field.closest('.form-group').querySelector('.error-message')
        : null;

    let isValid = true;

    if (fieldName === 'phoneNumber') {
        isValid = validateKenyaPhoneNumber(value);
    } else if (fieldName === 'email') {
        isValid = validateEmail(value);
    } else if (fieldName === 'terms') {
        isValid = value === true;
    } else if (
        fieldName === 'annualSalary' ||
        fieldName === 'monthlyExpenses' ||
        fieldName === 'existingDebt'
    ) {
        isValid = value !== '' && !isNaN(value) && parseFloat(value) >= 0;
    } else if (fieldName === 'yearsInJob') {
        isValid = value !== '' && !isNaN(value) && parseInt(value) >= 0;
    } else {
        isValid = value !== '';
    }

    if (!isValid) {
        field.classList.add('error');
        if (errorEl) errorEl.classList.add('show');
    } else {
        field.classList.remove('error');
        if (errorEl) errorEl.classList.remove('show');
    }

    return isValid;
}

function validateCurrentStep() {
    const fields = getFieldsForCurrentStep();
    let isValid = true;

    fields.forEach(field => {
        if (!validateField(field)) {
            isValid = false;
        }
    });

    return isValid;
}

function showValidationErrors() {
    getFieldsForCurrentStep().forEach(validateField);
}


function prefillUserFields() {
    for (const [key, value] of Object.entries(storedUserData)) {
        const field = document.querySelector(`[data-field="${key}"]`);
        if (field) {
            field.value = value;

            // Format Kenya phone nicely
            if (key === "phoneNumber") {
                field.value = formatKenyaPhone(value);
            }
        }
    }
}


/* =========================
   STEP NAVIGATION
========================= */

function updateStep(step) {
    currentStep = step;

    // Toggle sections
    document.querySelectorAll('.form-section').forEach(section => {
        section.classList.remove('active');
    });

    const activeSection = document.querySelector(
        `[data-step="${step}"].form-section`
    );
    if (activeSection) activeSection.classList.add('active');

    // Update sidebar steps
    document.querySelectorAll('.step').forEach(stepEl => {
        const stepNum = parseInt(stepEl.dataset.step);
        stepEl.classList.remove('active', 'completed', 'pending');

        if (stepNum === step) {
            stepEl.classList.add('active');
        } else if (stepNum < step) {
            stepEl.classList.add('completed');
        } else {
            stepEl.classList.add('pending');
        }
    });

    // Update step text
    document.getElementById('currentStep').textContent = `Step ${step}`;

    // Toggle buttons
    document.getElementById('prevBtn').disabled = step === 1;
    document.getElementById('nextBtn').style.display =
        step === totalSteps ? 'none' : 'block';
    document.getElementById('submitBtn').style.display =
        step === totalSteps ? 'block' : 'none';

    // Scroll top
    document.querySelector('.main-content').scrollTop = 0;
}

function changeStep(direction) {
    if (direction === 1) {
        if (!validateCurrentStep()) {
            showValidationErrors();
            return;
        }
    }

    const newStep = currentStep + direction;

    if (newStep >= 1 && newStep <= totalSteps) {
        updateStep(newStep);

        // Populate summary when entering Step 6
        if (newStep === 6) {
            updateSummary();
        }
    }
}

/* =========================
   SUMMARY POPULATION
========================= */

function updateSummary() {
    document.querySelectorAll('[data-summary]').forEach(summaryEl => {
        const fieldName = summaryEl.getAttribute('data-summary');
        const field = document.querySelector(
            `[data-field="${fieldName}"]`
        );

        if (!field) return;

        let value;

        if (field.type === 'checkbox') {
            value = field.checked ? 'Yes' : 'No';
        } else if (
            fieldName === 'annualSalary' ||
            fieldName === 'monthlyExpenses' ||
            fieldName === 'existingDebt' ||
            fieldName === 'loanSlider'
        ) {
            value = '$' + parseInt(field.value || 0).toLocaleString();
        } else {
            value = field.value.trim();
        }

        summaryEl.textContent = value || '-';
    });
}

/* =========================
   FORM SUBMISSION
========================= */

if (loanForm) {
    loanForm.addEventListener('submit', function (e) {
        if (!validateCurrentStep()) {
            e.preventDefault();
            showValidationErrors();
        }
    });
}

/* =========================
   PHONE FORMAT ON BLUR
========================= */

const phoneInput = document.getElementById('phoneNumber');
if (phoneInput) {
    phoneInput.addEventListener('blur', function () {
        if (this.value) {
            this.value = formatKenyaPhone(this.value);
        }
    });
}

/* =========================
   REAL-TIME VALIDATION
========================= */

document.addEventListener('input', function (e) {
    if (e.target.hasAttribute('data-field')) {
        validateField(e.target);
    }
});

/* =========================
   INITIALIZE
========================= */

updateStep(1);

