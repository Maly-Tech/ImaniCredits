        let currentStep = 1;
        const totalSteps = 6;

        // Field requirements by step
        const requiredFieldsByStep = {
            1: ['idType', 'idNumber', 'phoneNumber', 'dateOfBirth'],
            2: ['firstName', 'lastName', 'email', 'maritalStatus', 'streetAddress', 'city', 'state', 'postalCode'],
            3: ['employmentStatus', 'occupation', 'companyName', 'industry', 'yearsInJob'],
            4: ['annualSalary', 'incomeSource', 'monthlyExpenses', 'existingDebt', 'bankAccountType'],
            5: ['loanPurpose', 'loanTerm'],
            6: ['terms']
        };

        const loanSlider = document.getElementById('loanSlider');
        const loanAmount = document.getElementById('loanAmount');

        loanSlider.addEventListener('input', function () {
            const value = parseInt(this.value);
            loanAmount.textContent = '$' + value.toLocaleString();
            // Clear error on slider interaction
            document.getElementById('loanSlider').classList.remove('error');
        });

        // Kenya phone number validation
        function validateKenyaPhoneNumber(phone) {
            // Remove spaces and dashes
            const cleaned = phone.replace(/[\s\-()]/g, '');
            
            // Valid formats: 07XX, 01XX, +254 7XX, +254 1XX
            const kenyaPhonePattern = /^(?:\+254|0)(?:7[0-9]|1[0-1])[0-9]{6}$/;
            
            return kenyaPhonePattern.test(cleaned);
        }

        // Format Kenya phone number
        function formatKenyaPhone(phone) {
            let cleaned = phone.replace(/[\s\-()]/g, '');
            
            // Convert 0 prefix to +254
            if (cleaned.startsWith('0')) {
                cleaned = '254' + cleaned.substring(1);
            }
            
            // Remove + if present and add it back
            if (cleaned.startsWith('254')) {
                return '+' + cleaned;
            }
            
            return phone;
        }

        // Validate email
        function validateEmail(email) {
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailPattern.test(email);
        }

        // Get all form fields for current step
        function getFieldsForCurrentStep() {
            const section = document.querySelector(`[data-step="${currentStep}"].form-section`);
            return section.querySelectorAll('[data-field]');
        }

        // Validate a single field
        function validateField(field) {
            const fieldName = field.getAttribute('data-field');
            const value = field.type === 'checkbox' ? field.checked : field.value.trim();
            const errorEl = field.parentElement.querySelector('.error-message');

            let isValid = true;

            if (fieldName === 'phoneNumber') {
                isValid = validateKenyaPhoneNumber(value);
            } else if (fieldName === 'email') {
                isValid = validateEmail(value);
            } else if (fieldName === 'terms') {
                isValid = value === true;
            } else if (fieldName === 'annualSalary' || fieldName === 'monthlyExpenses' || fieldName === 'existingDebt') {
                isValid = value !== '' && !isNaN(value) && parseFloat(value) >= 0;
            } else if (fieldName === 'yearsInJob') {
                isValid = value !== '' && !isNaN(value) && parseInt(value) >= 0;
            } else {
                isValid = value !== '';
            }

            // Show/hide error message
            if (!isValid) {
                field.classList.add('error');
                if (errorEl) errorEl.classList.add('show');
            } else {
                field.classList.remove('error');
                if (errorEl) errorEl.classList.remove('show');
            }

            return isValid;
        }

        // Validate all fields in current step
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

        // Show validation errors for all fields in current step
        function showValidationErrors() {
            const fields = getFieldsForCurrentStep();
            fields.forEach(field => {
                validateField(field);
            });
        }

        // Format Kenya phone input
        const phoneInput = document.getElementById('phoneNumber');
        if (phoneInput) {
            phoneInput.addEventListener('blur', function () {
                if (this.value) {
                    this.value = formatKenyaPhone(this.value);
                }
            });
        }

        function updateStep(step) {
            currentStep = step;

            // Update form sections
            document.querySelectorAll('.form-section').forEach(section => {
                section.classList.remove('active');
            });
            document.querySelector(`[data-step="${step}"].form-section`).classList.add('active');

            // Update step indicators
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

            // Update step name in content
            document.getElementById('currentStep').textContent = `Step ${step}`;

            // Update button visibility
            document.getElementById('prevBtn').disabled = step === 1;
            document.getElementById('nextBtn').style.display = step === totalSteps ? 'none' : 'block';
            document.getElementById('submitBtn').style.display = step === totalSteps ? 'block' : 'none';

            // Scroll to top
            document.querySelector('.main-content').scrollTop = 0;
        }

        function changeStep(direction) {
            if (direction === 1) {
                // Going forward - validate current step
                if (!validateCurrentStep()) {
                    showValidationErrors();
                    console.log("[v0] Validation failed for step " + currentStep);
                    return;
                }
            }

            const newStep = currentStep + direction;
            if (newStep >= 1 && newStep <= totalSteps) {
                updateStep(newStep);
            }
        }

        function submitApplication() {
            // Validate final step
            if (!validateCurrentStep()) {
                showValidationErrors();
                console.log("[v0] Validation failed for final step");
                return;
            }

            alert('Application submitted successfully! We will review your information and contact you soon.');
            updateStep(1);
        }

        // Click on step indicator to navigate
        document.querySelectorAll('.step').forEach(step => {
            step.addEventListener('click', function () {
                const stepNum = parseInt(this.dataset.step);
                if (stepNum < currentStep) {
                    updateStep(stepNum);
                }
            });
        });

        // Real-time validation on input
        document.addEventListener('input', function (e) {
            if (e.target.hasAttribute('data-field')) {
                validateField(e.target);
            }
        });

        // Initialize
        updateStep(1);