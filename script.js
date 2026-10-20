/**
 * РАДИКАЛ — PORTFOLIO LANDING PAGE JAVASCRIPT
 * 3D Hologram (Three.js), Configurable Pricing Engine, 3D Card Tilt, Vanilla Interactions
 */

document.addEventListener('DOMContentLoaded', () => {
  applyConfigToDOM();
  init3DHologram();
  initPricing();
  initTiltCards();
  initCursorGlow();
  initMobileMenu();
  initPortfolioFilter();
  initScrollSpy();
  initClipboardButtons();
  initHeaderScroll();
});

/**
 * 0. Apply dynamic values from SITE_CONFIG into DOM elements
 */
function applyConfigToDOM() {
  const config = window.SITE_CONFIG;
  if (!config) return;

  // Update profile status & location if available
  const statusBadgeText = document.getElementById('statusBadgeText');
  const statusBadgeLocation = document.getElementById('statusBadgeLocation');
  if (statusBadgeText && config.profile.statusText) {
    statusBadgeText.textContent = config.profile.statusText;
  }
  if (statusBadgeLocation && config.profile.location) {
    statusBadgeLocation.textContent = config.profile.location;
  }

  // Inject telegram links into any button with [data-order-type]
  updateOrderButtons();
}

/**
 * Update all links with [data-order-type] from SITE_CONFIG.telegramLinks
 */
function updateOrderButtons() {
  const config = window.SITE_CONFIG;
  if (!config || !config.telegramLinks) return;

  const orderButtons = document.querySelectorAll('[data-order-type]');
  orderButtons.forEach((btn) => {
    const type = btn.getAttribute('data-order-type');
    const targetLink = config.telegramLinks[type] || config.telegramLinks.default;
    if (targetLink && btn.tagName.toLowerCase() === 'a') {
      btn.href = targetLink;
    }
  });
}

/**
 * 1. Interactive 3D Hologram Scene (Three.js)
 * High-performance, low GPU overhead, beautiful cybernetic glow
 */
function init3DHologram() {
  const container = document.getElementById('hero3dCanvasContainer');
  const config = window.SITE_CONFIG?.threeD;

  if (!container || !window.THREE || (config && !config.enabled)) return;

  // Accessibility check for reduced motion
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Scene & Camera
  const scene = new THREE.Scene();
  const width = container.clientWidth || 380;
  const height = container.clientHeight || 380;

  const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
  camera.position.z = 6.2;

  // Renderer
  const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true,
    powerPreference: 'high-performance'
  });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.innerHTML = '';
  container.appendChild(renderer.domElement);

  // Group to rotate everything together
  const mainGroup = new THREE.Group();
  scene.add(mainGroup);

  // 1. Primary Hologram Mesh (Torus Knot or Icosahedron)
  const geomType = config?.geometryType || 'torusKnot';
  let primaryGeometry;
  if (geomType === 'icosahedron') {
    primaryGeometry = new THREE.IcosahedronGeometry(2.0, 1);
  } else if (geomType === 'octahedron') {
    primaryGeometry = new THREE.OctahedronGeometry(2.1, 1);
  } else {
    // TorusKnot is super futuristic and organic
    primaryGeometry = new THREE.TorusKnotGeometry(1.4, 0.38, 100, 16);
  }

  // Outer glowing wireframe
  const wireframeMaterial = new THREE.MeshBasicMaterial({
    color: config?.primaryColor || 0x8b5cf6,
    wireframe: true,
    transparent: true,
    opacity: 0.85
  });
  const wireframeMesh = new THREE.Mesh(primaryGeometry, wireframeMaterial);
  mainGroup.add(wireframeMesh);

  // Inner semi-transparent cyber core
  const coreGeometry = new THREE.IcosahedronGeometry(1.0, 1);
  const coreMaterial = new THREE.MeshStandardMaterial({
    color: config?.secondaryColor || 0x38bdf8,
    roughness: 0.2,
    metalness: 0.8,
    transparent: true,
    opacity: 0.6,
    wireframe: false
  });
  const coreMesh = new THREE.Mesh(coreGeometry, coreMaterial);
  mainGroup.add(coreMesh);

  // 2. Orbital Rings
  const ringGeo1 = new THREE.RingGeometry(2.6, 2.65, 64);
  const ringMat1 = new THREE.MeshBasicMaterial({
    color: 0x6366f1,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.4
  });
  const ring1 = new THREE.Mesh(ringGeo1, ringMat1);
  ring1.rotation.x = Math.PI / 3;
  mainGroup.add(ring1);

  const ringGeo2 = new THREE.RingGeometry(2.9, 2.94, 64);
  const ringMat2 = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.3
  });
  const ring2 = new THREE.Mesh(ringGeo2, ringMat2);
  ring2.rotation.y = Math.PI / 4;
  ring2.rotation.x = -Math.PI / 6;
  mainGroup.add(ring2);

  // 3. Floating Hologram Particle Field
  const particleCount = config?.particlesCount || 85;
  const particleGeometry = new THREE.BufferGeometry();
  const particlePositions = new Float32Array(particleCount * 3);

  for (let i = 0; i < particleCount * 3; i += 3) {
    const radius = 3.5 + Math.random() * 2.5;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(Math.random() * 2 - 1);
    particlePositions[i] = radius * Math.sin(phi) * Math.cos(theta);
    particlePositions[i + 1] = radius * Math.sin(phi) * Math.sin(theta);
    particlePositions[i + 2] = radius * Math.cos(phi);
  }
  particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

  const particleMaterial = new THREE.PointsMaterial({
    color: 0xa78bfa,
    size: 0.08,
    transparent: true,
    opacity: 0.75
  });
  const particles = new THREE.Points(particleGeometry, particleMaterial);
  mainGroup.add(particles);

  // Lights
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
  scene.add(ambientLight);

  const pointLightPurple = new THREE.PointLight(0x8b5cf6, 2, 20);
  pointLightPurple.position.set(4, 5, 4);
  scene.add(pointLightPurple);

  const pointLightCyan = new THREE.PointLight(0x38bdf8, 2, 20);
  pointLightCyan.position.set(-4, -5, -2);
  scene.add(pointLightCyan);

  // Mouse Interaction Variables
  let mouseX = 0;
  let mouseY = 0;
  let targetRotationX = 0;
  let targetRotationY = 0;
  let isDragging = false;
  let previousMousePosition = { x: 0, y: 0 };

  const handlePointerMove = (e) => {
    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    mouseX = (x / rect.width) * 2;
    mouseY = (y / rect.height) * 2;
  };

  container.addEventListener('mousemove', handlePointerMove, { passive: true });

  // Drag to rotate
  container.addEventListener('mousedown', (e) => {
    isDragging = true;
    previousMousePosition = { x: e.clientX, y: e.clientY };
  });

  window.addEventListener('mouseup', () => {
    isDragging = false;
  });

  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const deltaX = e.clientX - previousMousePosition.x;
    const deltaY = e.clientY - previousMousePosition.y;

    targetRotationY += deltaX * 0.008;
    targetRotationX += deltaY * 0.008;

    previousMousePosition = { x: e.clientX, y: e.clientY };
  });

  // Window Resize
  const handleResize = () => {
    if (!container) return;
    const newWidth = container.clientWidth;
    const newHeight = container.clientHeight;
    camera.aspect = newWidth / newHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(newWidth, newHeight);
  };
  window.addEventListener('resize', handleResize, { passive: true });

  // Animation Loop
  const baseSpeed = config?.rotationSpeed || 0.005;

  function animate() {
    if (!prefersReducedMotion) {
      requestAnimationFrame(animate);
    }

    // Default gentle auto-rotation
    targetRotationY += baseSpeed;
    targetRotationX += baseSpeed * 0.5;

    // Smooth Lerp towards mouse tilt
    const mouseInfluenceX = mouseY * 0.6;
    const mouseInfluenceY = mouseX * 0.6;

    mainGroup.rotation.y += (targetRotationY + mouseInfluenceY - mainGroup.rotation.y) * 0.05;
    mainGroup.rotation.x += (targetRotationX + mouseInfluenceX - mainGroup.rotation.x) * 0.05;

    // Independent counter-rotation for orbital rings
    ring1.rotation.z += 0.004;
    ring2.rotation.z -= 0.003;
    coreMesh.rotation.y -= 0.008;

    renderer.render(scene, camera);
  }

  animate();
}

/**
 * 2. Configurable 3-Tier Pricing Engine
 * Loads categories and services dynamically from SITE_CONFIG.pricing
 */
function initPricing() {
  const tabsContainer = document.getElementById('pricingTabs');
  const cardsGrid = document.getElementById('pricingCardsGrid');
  const config = window.SITE_CONFIG?.pricing;

  if (!tabsContainer || !cardsGrid || !config) return;

  const categories = config.categories || [];
  const services = config.services || {};

  let currentCategory = categories[0]?.id || 'uiux';

  // Render Category Tabs
  function renderTabs() {
    tabsContainer.innerHTML = '';
    categories.forEach((cat) => {
      const btn = document.createElement('button');
      btn.className = `pricing-tab-btn ${cat.id === currentCategory ? 'active' : ''}`;
      btn.setAttribute('data-category', cat.id);
      btn.innerHTML = `<span>${cat.title}</span>`;
      btn.addEventListener('click', () => {
        if (currentCategory === cat.id) return;
        currentCategory = cat.id;
        document.querySelectorAll('.pricing-tab-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        renderPricingCards(currentCategory);
      });
      tabsContainer.appendChild(btn);
    });
  }

  // Render 3 Tiers (Basic, Pro, Premium)
  function renderPricingCards(categoryId) {
    const tierList = services[categoryId] || [];
    cardsGrid.style.opacity = '0';
    cardsGrid.style.transform = 'translateY(8px)';

    setTimeout(() => {
      cardsGrid.innerHTML = '';

      tierList.forEach((item) => {
        const card = document.createElement('div');
        card.className = `pricing-card glass-panel tilt-card ${item.popular ? 'is-popular' : ''}`;

        // Top Badge (Popular or Custom)
        const badgeHtml = item.badge 
          ? `<span class="pricing-top-badge">${item.badge}</span>` 
          : `<span class="pricing-tier-tag">Тариф</span>`;

        // Features List
        const featuresHtml = item.features.map((feat) => `
          <li>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
            <span>${feat}</span>
          </li>
        `).join('');

        // Link
        const telegramLinks = window.SITE_CONFIG?.telegramLinks || {};
        const targetLink = telegramLinks[item.telegramLinkKey] || telegramLinks.default;

        card.innerHTML = `
          <div class="pricing-card-header">
            <div class="pricing-badge-wrapper">
              ${badgeHtml}
            </div>
            <h3 class="pricing-tier-name">${item.name}</h3>
            <div class="pricing-price-wrap">
              <span class="pricing-price">${item.price}</span>
              <span class="pricing-deadline">${item.deadline}</span>
            </div>
            <p class="pricing-card-desc">${item.description}</p>
          </div>

          <div class="pricing-features-wrap">
            <span class="features-label">Что входит в тариф:</span>
            <ul class="pricing-features-list">
              ${featuresHtml}
            </ul>
          </div>

          <div class="pricing-card-action">
            <a href="${targetLink}" target="_blank" rel="noopener noreferrer" class="btn ${item.popular ? 'btn-primary' : 'btn-secondary'} btn-block glow-button">
              <span>${item.ctaText || 'Заказать этот тариф'}</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M22 2L11 13"></path><path d="M22 2L15 22L11 13L2 9L22 2Z"></path></svg>
            </a>
          </div>
        `;

        cardsGrid.appendChild(card);
      });

      // Re-init tilt on newly created cards
      initTiltCards();

      cardsGrid.style.transition = 'opacity 0.35s ease, transform 0.35s ease';
      cardsGrid.style.opacity = '1';
      cardsGrid.style.transform = 'translateY(0)';
    }, 150);
  }

  renderTabs();
  renderPricingCards(currentCategory);
}

/**
 * 3. 3D Card Tilt Effect on Mouse Move
 */
function initTiltCards() {
  if (window.matchMedia('(pointer: coarse)').matches) return;

  const tiltCards = document.querySelectorAll('.tilt-card');
  tiltCards.forEach((card) => {
    // Avoid double-binding
    if (card.dataset.tiltBound) return;
    card.dataset.tiltBound = 'true';

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const deltaX = (x - centerX) / centerX;
      const deltaY = (y - centerY) / centerY;

      // Max tilt angle 6 degrees
      const rotX = -deltaY * 6;
      const rotY = deltaX * 6;

      card.style.transform = `perspective(1000px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) translateY(-5px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)`;
    });
  });
}

/**
 * 4. Ambient Cursor Glow Effect
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
    mouseY = currentY + window.scrollY;
  }, { passive: true });

  function renderCursor() {
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
 * 5. Mobile Menu Drawer
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

  mobileLinks.forEach((link) => {
    link.addEventListener('click', () => toggleMenu(false));
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileDrawer.classList.contains('open')) {
      toggleMenu(false);
    }
  });
}

/**
 * 6. Portfolio Project Filter
 */
function initPortfolioFilter() {
  const filterButtons = document.querySelectorAll('.filter-btn');
  const portfolioCards = document.querySelectorAll('.portfolio-card');

  if (!filterButtons.length || !portfolioCards.length) return;

  filterButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      filterButtons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      const filterValue = btn.getAttribute('data-filter');

      portfolioCards.forEach((card) => {
        const category = card.getAttribute('data-category');
        if (filterValue === 'all' || category === filterValue) {
          card.classList.remove('is-hidden');
          card.style.animation = 'fadeInCard 0.4s ease forwards';
        } else {
          card.classList.add('is-hidden');
        }
      });
    });
  });
}

/**
 * 7. Active Navigation Link Highlighting via IntersectionObserver
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
 * 8. Clipboard Copy with Toast Notification
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
    el.addEventListener('click', async () => {
      const textToCopy = el.getAttribute('data-copy');
      if (!textToCopy) return;

      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(textToCopy);
        } else {
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
 * 9. Header Styling on Scroll
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
