// HERO SLIDER
const slides = document.querySelectorAll(".slide");
let current = 0;

setInterval(() => {
  slides[current].classList.remove("active");
  current = (current + 1) % slides.length;
  slides[current].classList.add("active");
}, 6000);

// SCROLL ANIMATION
const animated = document.querySelectorAll(".animate");

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("show");
    }
  });
}, { threshold: 0.3 });

animated.forEach(el => observer.observe(el));

/* TESTIMONIAL AUTO VERTICAL SLIDER */
const track = document.querySelector(".testimonial-track");
const testimonials = document.querySelectorAll(".testimonial");

let index = 0;
const gap = 26;

function slideTestimonials() {
  const cardHeight = testimonials[0].offsetHeight + gap;
  index = (index + 1) % testimonials.length;
  track.style.transform = `translateY(-${index * cardHeight}px)`;
}

setInterval(slideTestimonials, 4500);