// Scroll animations
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry, index) => {
    if (entry.isIntersecting) {
      // Add staggered delay based on element's position
      const delay = entry.target.dataset.delay || 0;
      setTimeout(() => {
        entry.target.classList.add('visible');
      }, delay * 100);
    }
  });
}, observerOptions);

// Observe all animated elements with staggered delays
document.querySelectorAll('.animate').forEach((el, index) => {
  el.dataset.delay = index % 4; // Stagger in groups of 4
  observer.observe(el);
});

// Mobile menu toggle
const navToggle = document.querySelector('.nav-toggle');
const mobileMenu = document.querySelector('.mobile-menu');
let menuOpen = false;

navToggle.addEventListener('click', () => {
  menuOpen = !menuOpen;
  mobileMenu.classList.toggle('active', menuOpen);

  // Animate hamburger to X
  const spans = navToggle.querySelectorAll('span');
  if (menuOpen) {
    spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
    spans[1].style.transform = 'rotate(-45deg)';
  } else {
    spans[0].style.transform = '';
    spans[1].style.transform = '';
  }
});

// Close mobile menu on link click
document.querySelectorAll('.mobile-link').forEach(link => {
  link.addEventListener('click', () => {
    menuOpen = false;
    mobileMenu.classList.remove('active');
    const spans = navToggle.querySelectorAll('span');
    spans[0].style.transform = '';
    spans[1].style.transform = '';
  });
});

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});

// Pendulum Wave Animation - Distant & Grand
(function() {
  const canvas = document.getElementById('fractal-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const isMobile = window.innerWidth <= 768;
  const width = isMobile ? window.innerWidth : 800;
  const height = isMobile ? 400 : 800;
  canvas.width = width;
  canvas.height = height;

  let time = 0;
  const pendulumCount = isMobile ? 25 : 35;
  const centerX = width / 2;
  const anchorY = isMobile ? 50 : 100;

  function draw() {
    // Clear
    ctx.fillStyle = '#fafafb';
    ctx.fillRect(0, 0, width, height);

    time += 0.015;

    // Draw pendulums
    for (let i = 0; i < pendulumCount; i++) {
      const margin = isMobile ? 40 : 100;
      const x = margin + (i / (pendulumCount - 1)) * (width - margin * 2);
      const frequency = 0.8 + i * 0.03;
      const baseLength = isMobile ? 180 : 300;
      const length = baseLength + Math.sin(i * 0.2) * (isMobile ? 30 : 50);
      const angle = Math.sin(time * frequency) * 0.4;

      const bobX = x + Math.sin(angle) * length;
      const bobY = anchorY + Math.cos(angle) * length;

      // Distance fade - center pendulums more visible
      const centerDist = Math.abs(i - pendulumCount / 2) / (pendulumCount / 2);
      const baseFade = 1 - centerDist * 0.6;

      // String - visible but lighter than bob
      ctx.beginPath();
      ctx.moveTo(x, anchorY);
      ctx.lineTo(bobX, bobY);
      ctx.strokeStyle = `rgba(26, 26, 26, ${0.12 * baseFade})`;
      ctx.lineWidth = 1;
      ctx.stroke();

      // Bob - more visible
      const bobSize = isMobile ? (4 + (1 - centerDist) * 4) : (5 + (1 - centerDist) * 5);
      ctx.beginPath();
      ctx.arc(bobX, bobY, bobSize, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(26, 26, 26, ${0.2 * baseFade})`;
      ctx.fill();

      // Trail effect - ghost positions
      for (let t = 1; t <= 3; t++) {
        const trailTime = time - t * 0.08;
        const trailAngle = Math.sin(trailTime * frequency) * 0.4;
        const trailX = x + Math.sin(trailAngle) * length;
        const trailY = anchorY + Math.cos(trailAngle) * length;

        ctx.beginPath();
        ctx.arc(trailX, trailY, bobSize * 0.6, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(26, 26, 26, ${0.05 * baseFade / t})`;
        ctx.fill();
      }
    }

    // Horizontal anchor line
    const lineMargin = isMobile ? 30 : 80;
    ctx.beginPath();
    ctx.moveTo(lineMargin, anchorY);
    ctx.lineTo(width - lineMargin, anchorY);
    ctx.strokeStyle = 'rgba(26, 26, 26, 0.06)';
    ctx.lineWidth = 1;
    ctx.stroke();

    requestAnimationFrame(draw);
  }

  draw();
})();
