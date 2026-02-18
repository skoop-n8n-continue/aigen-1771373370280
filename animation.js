/* ============================================================
   ZEN GARDEN DISPENSARY — animation.js
   Creative concept: Products drift in from upstream on the
   river current — each card glides in from the left like a
   leaf floating on water, settles gently, breathes softly,
   then dissolves downstream to the right.
   ============================================================ */

gsap.registerPlugin(SplitText, CustomEase, DrawSVGPlugin);

/* ── Custom eases ── */
CustomEase.create("riverFloat", "M0,0 C0.1,0 0.2,0.6 0.4,0.8 0.6,1.0 0.8,1.0 1,1");
CustomEase.create("gentleSettle", "M0,0 C0.25,0.1 0.1,1.05 0.5,0.98 0.75,0.95 1,1");
CustomEase.create("waterExit", "M0,0 C0.2,0 0.5,0.3 0.7,0.7 0.85,0.95 1,1");

/* ── DESIGN: 3 product cards shown per cycle ── */
const PRODUCTS_PER_CYCLE = 3;

/* ── Layout: 3-card staggered river arrangement ──
   Cards are positioned asymmetrically, as if
   floating at different depths in the stream.
   Card 0 = upper left zone
   Card 1 = center
   Card 2 = lower right zone
*/
const CARD_POSITIONS = [
  { left: 148, top: 155 },
  { left: 790, top: 265 },
  { left: 1418, top: 165 },
];

let PRODUCTS = [];

/* ============================================================
   BOOTSTRAP
   ============================================================ */
async function loadProducts() {
  try {
    const response = await fetch('./products.json?v=' + Date.now());
    const data = await response.json();
    PRODUCTS = data.products || [];
  } catch (err) {
    console.warn('products.json not found, using empty set', err);
    PRODUCTS = [];
  }

  initScene();
  startAmbient();
  animateCycle(0);
}

/* ============================================================
   SCENE INIT — one-time setup for persistent elements
   ============================================================ */
function initScene() {
  spawnParticles();

  /* Lotus petal gentle sway */
  gsap.to('#lotus-petals', {
    rotation: 3,
    transformOrigin: '50% 90%',
    duration: 6,
    ease: 'sine.inOut',
    yoyo: true,
    repeat: -1
  });

  /* Header / footer fade in */
  gsap.from('#header-bar', { opacity: 0, y: -12, duration: 1.8, ease: 'power2.out', delay: 0.3 });
  gsap.from('#footer-strip', { opacity: 0, y: 12, duration: 1.8, ease: 'power2.out', delay: 0.5 });

  /* Animate the header gold line via scaleX — no DrawSVG needed on <line> */
  gsap.fromTo('#header-line-inner',
    { scaleX: 0, transformOrigin: 'left center' },
    { scaleX: 1, duration: 2.4, ease: 'power2.inOut', delay: 0.6 }
  );
}

/* ============================================================
   AMBIENT ENVIRONMENT — looping subtle motion
   ============================================================ */
function startAmbient() {
  /* Slow background parallax drift */
  const bgTl = gsap.timeline({ repeat: -1 });
  bgTl
    .to('#background', { x: 18, y: 6, duration: 28, ease: 'sine.inOut' }, 0)
    .to('#background', { x: -12, y: -4, duration: 28, ease: 'sine.inOut' }, 28)
    .to('#background', { x: 0, y: 0, duration: 14, ease: 'sine.inOut' }, 56);

  /* Foreground botanicals gentle sway */
  gsap.to('#foreground-botanicals', {
    x: 8,
    y: -5,
    rotation: 0.4,
    transformOrigin: '0% 0%',
    duration: 8,
    ease: 'sine.inOut',
    yoyo: true,
    repeat: -1
  });

  animateRiverCurrents();
  scheduleRipples();
}

function animateRiverCurrents() {
  const currentConfigs = [
    { id: '#current-1', dasharray: '55 25', duration: 14, offset: 600 },
    { id: '#current-2', dasharray: '45 20', duration: 17, offset: 720 },
    { id: '#current-3', dasharray: '38 18', duration: 19, offset: 840 },
    { id: '#current-4', dasharray: '30 15', duration: 21, offset: 960 },
  ];

  currentConfigs.forEach((cfg, i) => {
    const el = document.querySelector(cfg.id);
    if (!el) return;
    el.style.strokeDasharray = cfg.dasharray;
    gsap.fromTo(el,
      { strokeDashoffset: cfg.offset },
      {
        strokeDashoffset: 0,
        duration: cfg.duration,
        ease: 'none',
        repeat: -1,
        delay: i * 1.2
      }
    );
  });
}

function scheduleRipples() {
  /* Animate SVG circle r attribute using gsap attr plugin */
  function animateRipple(id, delay) {
    const el = document.querySelector(id);
    if (!el) return;
    const tl = gsap.timeline({ delay, repeat: -1, repeatDelay: 4 + Math.random() * 3 });
    tl
      .set(el, { attr: { r: 0 }, opacity: 0 })
      .to(el, { attr: { r: 35 }, opacity: 0.8, duration: 0.4, ease: 'power2.out' })
      .to(el, { attr: { r: 90 }, opacity: 0, duration: 1.8, ease: 'power1.out' });
  }
  animateRipple('#ripple-a', 1.5);
  animateRipple('#ripple-b', 3.8);
  animateRipple('#ripple-c', 6.2);
}

/* ============================================================
   PARTICLES — floating mist / pollen dots
   ============================================================ */
function spawnParticles() {
  const container = document.getElementById('particles-layer');
  const COUNT = 22;

  for (let i = 0; i < COUNT; i++) {
    const p = document.createElement('div');
    p.className = 'particle';

    const size = 2 + Math.random() * 5;
    const startX = Math.random() * 1920;
    const startY = 600 + Math.random() * 380;
    const opacity = 0.15 + Math.random() * 0.45;
    const duration = 12 + Math.random() * 18;
    const delay = Math.random() * 20;

    p.style.width = size + 'px';
    p.style.height = size + 'px';
    p.style.left = startX + 'px';
    p.style.top = startY + 'px';
    p.style.opacity = '0';

    container.appendChild(p);

    gsap.fromTo(p,
      { opacity: 0, x: 0, y: 0 },
      {
        opacity: opacity,
        x: 220 + Math.random() * 180,
        y: -(30 + Math.random() * 60),
        duration,
        delay,
        ease: 'none',
        repeat: -1,
        onRepeat: function() {
          gsap.set(p, {
            x: 0, y: 0, opacity: 0,
            left: Math.random() * 1920 + 'px',
            top: (600 + Math.random() * 380) + 'px'
          });
        }
      }
    );
  }
}

/* ============================================================
   BATCH HELPERS
   ============================================================ */
function getBatch(batchIndex) {
  const start = (batchIndex * PRODUCTS_PER_CYCLE) % Math.max(PRODUCTS.length, 1);
  const batch = [];
  for (let i = 0; i < PRODUCTS_PER_CYCLE; i++) {
    if (PRODUCTS.length > 0) {
      batch.push(PRODUCTS[(start + i) % PRODUCTS.length]);
    }
  }
  return batch;
}

function formatPrice(priceStr) {
  const price = parseFloat(priceStr);
  if (isNaN(price)) return priceStr;
  return price.toFixed(2);
}

function getThcValue(product) {
  if (!product.labResults || !product.labResults.length) return null;
  const thc = product.labResults.find(r => r.labTest === 'THC');
  return thc ? thc.value : null;
}

/* ============================================================
   RENDER BATCH — create card DOM
   ============================================================ */
function renderBatch(products) {
  const container = document.getElementById('products-container');
  container.innerHTML = '';

  products.forEach((product, index) => {
    const pos = CARD_POSITIONS[index];
    const thc = getThcValue(product);
    const hasDiscount = product.discounted_price && parseFloat(product.discounted_price) > 0;
    const strainType = (product.strainType || 'Hybrid').toLowerCase();

    const card = document.createElement('div');
    card.className = 'product-card';
    card.dataset.index = index;

    /* Position the card — GSAP will handle x/y transforms */
    card.style.left = pos.left + 'px';
    card.style.top = pos.top + 'px';

    card.innerHTML = `
      <span class="strain-badge ${strainType}">${product.strainType || 'Hybrid'}</span>
      <div class="product-image-wrap">
        <img class="product-image" src="${product.image_url}" alt="${product.name}" loading="eager">
      </div>
      <div class="product-info">
        <div class="product-category">${product.category || ''}</div>
        <h2 class="product-name">${product.name}</h2>
        <div class="product-divider"></div>
        <div class="product-meta-row">
          ${thc !== null ? `
            <div>
              <div class="thc-label">THC Content</div>
              <div class="thc-value">${thc.toFixed(1)}<span class="thc-unit">%</span></div>
            </div>
          ` : ''}
          <div class="product-price-row">
            ${hasDiscount ? `
              <div class="product-price has-discount"><span class="price-currency">$</span>${formatPrice(product.price)}</div>
              <div class="product-price-discounted"><span class="price-currency">$</span>${formatPrice(product.discounted_price)}</div>
            ` : `
              <div class="product-price"><span class="price-currency">$</span>${formatPrice(product.price)}</div>
            `}
          </div>
        </div>
        <div class="product-vendor">${product.vendor || ''}</div>
      </div>
    `;

    container.appendChild(card);

    /* Set GSAP initial state: offscreen left, invisible */
    gsap.set(card, { x: -500, y: 20 * (index % 2 === 0 ? 1 : -1), opacity: 0 });
  });
}

/* ============================================================
   MAIN CYCLE ANIMATION
   ============================================================ */
function animateCycle(batchIndex) {
  const batch = getBatch(batchIndex);
  renderBatch(batch);

  const cards = Array.from(document.querySelectorAll('.product-card'));

  const ENTRANCE_DUR = 1.6;
  const IDLE_DUR = 6.0;
  const EXIT_DUR = 1.4;
  const STAGGER = 0.38;
  const totalEntranceEnd = ENTRANCE_DUR + (cards.length - 1) * STAGGER;

  const tl = gsap.timeline({
    onComplete: () => animateCycle(batchIndex + 1)
  });

  /* ── ACT 1: ENTRANCE — cards float in from upstream (left) ── */
  cards.forEach((card, i) => {
    tl.to(card, {
      x: 0,
      y: 0,
      opacity: 1,
      duration: ENTRANCE_DUR,
      ease: 'riverFloat',
    }, i * STAGGER);
  });

  /* ── ACT 2: IDLE — gentle water-bob per card ── */
  const idleStart = totalEntranceEnd + 0.2;

  cards.forEach((card, i) => {
    const bobAmt = 5 + i * 1.5;
    const bobDur = 3.6 + i * 0.5;
    const rotAmt = 0.4 * (i % 2 === 0 ? 1 : -1);

    /* Vertical bob — timeline-local, won't conflict with entrance */
    tl.to(card, {
      y: -bobAmt,
      duration: bobDur,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: 1,
    }, idleStart + i * 0.3);

    /* Subtle rotation */
    tl.to(card, {
      rotation: rotAmt,
      duration: 3.5,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: 1,
    }, idleStart + i * 0.4);

    /* Scale breathe */
    tl.to(card, {
      scale: 1.013,
      duration: 2.8,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: 1,
      transformOrigin: 'center bottom',
    }, idleStart + 0.8 + i * 0.4);
  });

  /* ── ACT 3: EXIT — cards drift downstream (to the right) ── */
  const exitStart = idleStart + IDLE_DUR;

  cards.forEach((card, i) => {
    tl.to(card, {
      x: 2300,
      y: 25 + i * 8,
      opacity: 0,
      duration: EXIT_DUR,
      ease: 'waterExit',
    }, exitStart + i * 0.28);
  });

  /* Brief gap before next batch */
  tl.to({}, { duration: 0.5 }, exitStart + EXIT_DUR + (cards.length - 1) * 0.28);

  return tl;
}

/* ============================================================
   KICK OFF
   ============================================================ */
window.addEventListener('DOMContentLoaded', loadProducts);
