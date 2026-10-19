/**
 * РАДИКАЛ — PORTFOLIO LANDING PAGE JAVASCRIPT
 * High-performance, vanilla JS interactions
 */

document.addEventListener('DOMContentLoaded', () => {
  initCursorGlow();
  initMobileMenu();
  initPortfolioFilter();
  initScrollSpy();
  initClipboardButtons();
  initHeaderScroll();
});

/**
 * 1. Ambient Cursor Glow Effect
 * Smoothly follows mouse on desktop screens without impacting performance
 */
function initCursorGlow() {
  const cursorGlow = document.getElementById('cursorGlow');
  if (!cursorGlow || window.matchMedia('(pointer: coarse)').matches) return;

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let currentX = mouseX;
  let currentY = mouseY;
  let isMoving = false;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY + window.scrollY;
    if (!isMoving) {
      isMoving = true;
      requestAnimationFrame(renderCursor);
    }
  }, { passive: true });

  window.addEventListener('scroll', () => {
    // Keep sync with scroll offset
    mouseY = currentY + window.scrollY;
  }, { passive: true });

  function renderCursor() {
    // Lerp smoothing
    currentX += (mouseX - currentX) * 0.15;
    currentY += (mouseY - currentY) * 0.15;

    cursorGlow.style.left = `${currentX}px`;
    cursorGlow.style.top = `${currentY}px`;

    const diff = Math.abs(mouseX - currentX) + Math.abs(mouseY - currentY);
    if (diff > 0.5) {
      requestAnimationFrame(renderCursor);
    } else {
      isMoving = false;
    }
  }
}

/**
 * 2. Mobile Menu Drawer
 */
function initMobileMenu() {
  const burgerBtn = document.getElementById('burgerBtn');
  const mobileDrawer = document.getElementById('mobileDrawer');
  const mobileLinks = document.querySelectorAll('.mobile-nav-link, .mobile-drawer .btn');

  if (!burgerBtn || !mobileDrawer) return;

  function toggleMenu(open) {
    const isOpen = open !== undefined ? open : !mobileDrawer.classList.contains('open');
    burgerBtn.classList.toggle('active', isOpen);
    burgerBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    mobileDrawer.classList.toggle('open', isOpen);
    mobileDrawer.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
    document.body.style.overflow = isOpen ? 'hidden' : '';
  }

  burgerBtn.addEventListener('click', () => toggleMenu());

  // Close drawer when clicking any link inside
  mobileLinks.forEach((link) => {
    link.addEventListener('click', () => toggleMenu(false));
  });

  // Close on Escape key
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileDrawer.classList.contains('open')) {
      toggleMenu(false);
    }
  });
}

/**
 * 3. Portfolio Project Filter
 */
function initPortfolioFilter() {
  const filterButtons = document.querySelectorAll('.filter-btn');
  const portfolioCards = document.querySelectorAll('.portfolio-card');

  if (!filterButtons.length || !portfolioCards.length) return;

  filterButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      // Update active button state
      filterButtons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      const filterValue = btn.getAttribute('data-filter');

      portfolioCards.forEach((card) => {
        const category = card.getAttribute('data-category');
        if (filterValue === 'all' || category === filterValue) {
          card.classList.remove('is-hidden');
          // Add micro fade-in animation
          card.style.animation = 'fadeInCard 0.4s ease forwards';
        } else {
          card.classList.add('is-hidden');
        }
      });
    });
  });
}

/**
 * 4. Active Navigation Link Highlighting via IntersectionObserver
 */
function initScrollSpy() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  if (!sections.length || !navLinks.length) return;

  const observerOptions = {
    root: null,
    rootMargin: '-20% 0px -70% 0px',
    threshold: 0
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach((link) => {
          const href = link.getAttribute('href');
          if (href === `#${id}`) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      }
    });
  }, observerOptions);

  sections.forEach((sec) => observer.observe(sec));
}

/**
 * 5. Clipboard Copy with Toast Notification
 */
function initClipboardButtons() {
  const copyElements = document.querySelectorAll('.copy-btn, .copy-card');
  const toast = document.getElementById('toast');
  const toastMessage = document.getElementById('toastMessage');
  let toastTimer = null;

  function showToast(text) {
    if (!toast) return;
    if (toastMessage) toastMessage.textContent = text;
    
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, 2800);
  }

  copyElements.forEach((el) => {
    el.addEventListener('click', async (e) => {
      const textToCopy = el.getAttribute('data-copy');
      if (!textToCopy) return;

      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(textToCopy);
        } else {
          // Fallback for non-https/older browsers
          const textarea = document.createElement('textarea');
          textarea.value = textToCopy;
          textarea.style.position = 'fixed';
          textarea.style.opacity = '0';
          document.body.appendChild(textarea);
          textarea.select();
          document.execCommand('copy');
          document.body.removeChild(textarea);
        }

        const isDiscord = textToCopy === 'rad1kal';
        showToast(isDiscord ? 'Discord тег скопирован: rad1kal' : 'Ссылка скопирована в буфер обмена!');
      } catch (err) {
        console.warn('Не удалось скопировать:', err);
      }
    });
  });
}

/**
 * 6. Header Styling on Scroll
 */
function initHeaderScroll() {
  const header = document.getElementById('header');
  if (!header) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header.style.background = 'rgba(7, 8, 13, 0.9)';
      header.style.borderBottomColor = 'rgba(255, 255, 255, 0.1)';
    } else {
      header.style.background = 'rgba(7, 8, 13, 0.75)';
      header.style.borderBottomColor = 'rgba(255, 255, 255, 0.06)';
    }
  }, { passive: true });
}
