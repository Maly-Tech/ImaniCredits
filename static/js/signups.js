/* ===============================
   SIGNUP FORM VALIDATION
   =============================== */

const signupForm = document.getElementById("signupForm");

signupForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const password = document.querySelector('input[type="password"]').value;
    const confirmPassword = document.querySelectorAll('input[type="password"]')[1].value;
    const phone = document.querySelector('input[type="tel"]').value;
    const terms = document.querySelector('.terms input');

    // Password match check
    if (password !== confirmPassword) {
        alert("Passwords do not match");
        return;
    }

    // Password length check
    if (password.length < 6) {
        alert("Password must be at least 6 characters");
        return;
    }

    // Phone number check (Kenyan format basic)
    if (phone.length < 9) {
        alert("Enter a valid phone number");
        return;
    }

    // Terms checkbox
    if (!terms.checked) {
        alert("You must agree to the terms and conditions");
        return;
    }

    // SUCCESS
    alert("Signup successful!");
    
    // Later you will send data to backend here (AJAX / fetch)
    signupForm.reset();
});


/* ===============================
   HERO IMAGE SLIDER
   =============================== */

const slides = document.querySelectorAll(".slide");
const dots = document.querySelectorAll(".dot");

let currentSlide = 0;

function showSlide(index) {
    slides.forEach(slide => slide.classList.remove("active"));
    dots.forEach(dot => dot.classList.remove("active"));

    slides[index].classList.add("active");
    dots[index].classList.add("active");
}

setInterval(() => {
    currentSlide++;
    if (currentSlide >= slides.length) {
        currentSlide = 0;
    }
    showSlide(currentSlide);
}, 4000);