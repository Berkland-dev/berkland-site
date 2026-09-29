/**
 * BERKLAND — common.js
 * Shared UI behavior across every page. Plain navigation now (no iframe),
 * so links are just normal <a href="page.html">.
 */

// Sticky header glass effect on scroll
window.addEventListener('scroll', () => {
  const header = document.getElementById('mainHeader');
  if (!header) return;
  header.classList.toggle('scrolled', window.scrollY > 40);
});

// Mobile nav toggle
function toggleMobileMenu() {
  const el = document.getElementById('mobileDropdown');
  if (el) el.classList.toggle('open');
}

// FAQ accordion
function toggleFaq(el) {
  const item = el.closest('.faq-item');
  const wasOpen = item.classList.contains('open');
  document.querySelectorAll('.faq-item.open').forEach(i => i.classList.remove('open'));
  if (!wasOpen) item.classList.add('open');
}

// Subtle 3D tilt on service cards
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.service-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left, y = e.clientY - rect.top;
      const cx = rect.width / 2, cy = rect.height / 2;
      const rotateX = ((y - cy) / cy) * -5;
      const rotateY = ((x - cx) / cx) * 5;
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)';
    });
  });

  // Highlight the current page in the nav
  const path = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .mobile-dropdown a').forEach(a => {
    const href = a.getAttribute('href');
    if (href && href.split('#')[0] === path) a.style.color = 'var(--leaf-green)';
  });

  // Fill in phone/email placeholders from config (keeps contact info in ONE file)
  document.querySelectorAll('[data-cfg-phone]').forEach(el => el.textContent = SITE_CONFIG.COMPANY_PHONE);
  document.querySelectorAll('[data-cfg-phone-href]').forEach(el => el.href = 'tel:' + SITE_CONFIG.COMPANY_PHONE_TEL);
  document.querySelectorAll('[data-cfg-email]').forEach(el => el.textContent = SITE_CONFIG.OFFICIAL_EMAIL);
});

// Hero video loader (home page only, but safe to include everywhere)
function loadHeroVideo() {
  const container = document.getElementById('videoContainer');
  if (!container) return;
  const raw = (SITE_CONFIG.HERO_BG_VIDEO || '').trim();

  function extractYouTubeID(url) {
    const m = url.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/);
    return (m && m[2].length === 11) ? m[2] : null;
  }

  const ytId = extractYouTubeID(raw);
  if (ytId) {
    container.innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${ytId}?autoplay=1&mute=1&loop=1&playlist=${ytId}&controls=0&showinfo=0&modestbranding=1&playsinline=1&rel=0" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>`;
  } else {
    const src = raw || 'https://assets.mixkit.co/videos/preview/mixkit-cleaning-staff-working-in-an-office-41364-large.mp4';
    container.innerHTML = `<video autoplay loop muted playsinline><source src="${src}" type="video/mp4"></video>`;
  }
}

// Rotating hero phrase (home page only)
function startHeroRotator() {
  const target = document.getElementById('rotatorText');
  if (!target) return;
  const phrases = ["Homes & Apartments", "Offices & Businesses", "Schools & Facilities", "Embassies & Diplomatic Missions"];
  let i = 0;
  setInterval(() => {
    target.style.opacity = '0';
    target.style.transform = 'translateY(-6px)';
    setTimeout(() => {
      i = (i + 1) % phrases.length;
      target.textContent = phrases[i];
      target.style.opacity = '1';
      target.style.transform = 'translateY(0)';
    }, 400);
  }, 3200);
}
