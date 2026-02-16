const slides = document.querySelectorAll('.slide');
let index = 0;

function showSlide() {
    slides.forEach(slide => slide.classList.remove('active'));
    slides[index].classList.add('active');
    index = (index + 1) % slides.length;
}

setInterval(showSlide, 4500);

// LOGIN
document.getElementById("loginForm").addEventListener("submit", async e => {
    e.preventDefault();

    let formData = new FormData(e.target);

    let res = await fetch("/login", {
        method: "POST",
        body: formData
    });

    let data = await res.json();
    document.getElementById("msg").innerText = data.message;
});

// OTP
document.getElementById("otpBtn").onclick = async () => {
    alert("OTP sent (API ready)");
};