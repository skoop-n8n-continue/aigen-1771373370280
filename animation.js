/* ============================================================
   ZEN GARDEN DISPENSARY — animation.js
   Creative concept: Products drift in from upstream on the
   river current — each card glides in from the left like a
   leaf floating on water, settles gently, breathes softly,
   then dissolves downstream to the right. River ripples
   and mist particles create an immersive living environment.
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
   Card 1 = center (slightly lower)
   Card 2 = lower right zone
*/
const CARD_POSITIONS = [
  { left: 148, top: 155 },   // upstream left, higher on the "bank"
  { left: 790, top: 265 },   // mid-river center
  { left: 1418, top: 165 },  // downstream right
];

/* ── Drift offsets — entry from left, exit to right ── */
const CARD_ENTRY_X = [-440, -440, -440];  // all enter from off-screen left
const CARD_ENTRY_Y = [20, -15, 25];        // slight vertical drift variance

let PRODUCTS = [];
let ambientTimeline = null;
let particlesTl = null;

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
  /* Spawn ambient particles */
  spawnParticles();

  /* Animate lotus petals gently */
  gsap.to('#lotus-petals', {
    rotation: 3,
    transformOrigin: '50% 90%',
    duration: 6,
    ease: 'sine.inOut',
    yoyo: true,
    repeat: -1
  });

  /* Header elements fade in */
  gsap.from('#header-bar', { opacity: 0, y: -12, duration: 1.8, ease: 'power2.out', delay: 0.3 });
  gsap.from('#footer-strip', { opacity: 0, y: 12, duration: 1.8, ease: 'power2.out', delay: 0.5 });

  /* DrawSVG header line reveal */
  gsap.fromTo('#header-line-path',
    { drawSVG: '0%' },
    { drawSVG: '100%', duration: 2.4, ease: 'power2.inOut', delay: 0.6 }
  );
}

/* ============================================================
   AMBIENT ENVIRONMENT — looping subtle motion
   ============================================================ */
function startAmbient() {
  ambientTimeline = gsap.timeline({ repeat: -1 });

  /* Slow background parallax drift */
  ambientTimeline.to('#background', {
    x: 18,
    y: 6,
    duration: 28,
    ease: 'sine.inOut',
  }, 0)
  .to('#background', {
    x: -12,
    y: -4,
    duration: 28,
    ease: 'sine.inOut',
  }, 28)
  .to('#background', {
    x: 0,
    y: 0,
    duration: 14,
    ease: 'sine.inOut',
  }, 56);

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

  /* River currents flowing */
  animateRiverCurrents();

  /* Ripple rings */
  scheduleRipples();
}

function animateRiverCurrents() {
  const currents = ['#current-1', '#current-2', '#current-3', '#current-4'];
  currents.forEach((id, i) => {
    gsap.fromTo(id,
      { strokeDashoffset: 600 + i * 120 },
      {
        strokeDashoffset: 0,
        duration: 14 + i * 3,
        ease: 'none',
        repeat: -1,
        delay: i * 1.2
      }
    );
    // Set stroke-dasharray for the flow effect
    const el = document.querySelector(id);
    if (el) {
      el.style.strokeDasharray = `${40 + i * 15} ${20 + i * 8}`;
    }
  });
}

function scheduleRipples() {
  function animateRipple(id, delay) {
    const tl = gsap.timeline({ delay, repeat: -1, repeatDelay: 4 + Math.random() * 3 });
    tl.to(id, { r: 0, opacity: 0, duration: 0, immediateRender: true })
      .to(id, {
        r: 35,
        opacity: 1,
        duration: 0.4,
        ease: 'power2.out'
      })
      .to(id, {
        r: 90,
        opacity: 0,
        duration: 1.8,
        ease: 'power1.out'
      });
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
    const startY = 600 + Math.random() * 380; // lower half — near river
    const opacity = 0.15 + Math.random() * 0.45;

    p.style.width = size + 'px';
    p.style.height = size + 'px';
    p.style.left = startX + 'px';
    p.style.top = startY + 'px';
    p.style.opacity = 0;

    container.appendChild(p);

    /* Each particle drifts rightward and slightly upward, fading in/out */
    const duration = 12 + Math.random() * 18;
    const delay = Math.random() * 20;

    gsap.fromTo(p,
      { opacity: 0, x: 0, y: 0 },
      {
        opacity: opacity,
        x: 220 + Math.random() * 180,
        y: -(30 + Math.random() * 60),
        duration: duration,
        delay: delay,
        ease: 'none',
        repeat: -1,
        repeatDelay: 0,
        onRepeat: function() {
          gsap.set(p, {
            x: 0,
            y: 0,
            opacity: 0,
            left: Math.random() * 1920,
            top: 600 + Math.random() * 380
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
  if (!product.labResults || product.labResults.length === 0) return null;
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
    const hasDiscount = product.discounted_price && product.discounted_price > 0;
    const strainType = (product.strainType || 'Hybrid').toLowerCase();

    const card = document.createElement('div');
    card.className = 'product-card';
    card.dataset.index = index;
    card.style.left = pos.left + 'px';
    card.style.top = pos.top + 'px';
    /* Start offscreen left — animation will bring it in */
    card.style.transform = `translateX(${CARD_ENTRY_X[index]}px) translateY(${CARD_ENTRY_Y[index]}px)`;
    card.style.opacity = '0';

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
  });
}

/* ============================================================
   MAIN CYCLE ANIMATION
   ============================================================ */
function animateCycle(batchIndex) {
  const batch = getBatch(batchIndex);
  renderBatch(batch);

  const cards = document.querySelectorAll('.product-card');
  const CYCLE_DURATION = 9;    // total seconds per batch
  const ENTRANCE_DUR = 1.6;    // each card floats in
  const IDLE_DUR = 5.8;        // living moment duration
  const EXIT_DUR = 1.4;        // drift away downstream

  const tl = gsap.timeline({
    onComplete: () => animateCycle(batchIndex + 1)
  });

  /* ── ACT 1: ENTRANCE — cards float in from upstream (left) ── */
  cards.forEach((card, i) => {
    const entryY = CARD_ENTRY_Y[i];
    const staggerOffset = i * 0.38;

    tl.to(card, {
      x: 0,
      y: 0,
      opacity: 1,
      duration: ENTRANCE_DUR,
      ease: 'riverFloat',
    }, staggerOffset);
  });

  /* ── ACT 2: IDLE — living moment, gentle water-bob & breathe ── */
  const idleStart = ENTRANCE_DUR + (cards.length - 1) * 0.38 + 0.2;

  cards.forEach((card, i) => {
    /* Gentle vertical bob — each slightly different phase */
    const bobDuration = 3.8 + i * 0.55;
    const bobAmount = 4 + i * 1.5;

    tl.to(card, {
      y: -bobAmount,
      duration: bobDuration / 2,
      ease: 'sine.inOut',
    }, idleStart + i * 0.3);

    tl.to(card, {
      y: 0,
      duration: bobDuration / 2,
      ease: 'sine.inOut',
      repeat: 1,
      yoyo: true
    }, idleStart + bobDuration / 2 + i * 0.3);

    /* Subtle rotation drift — like floating on water */
    tl.to(card, {
      rotation: 0.35 * (i % 2 === 0 ? 1 : -1),
      duration: 4.5,
      ease: 'sine.inOut',
    }, idleStart + i * 0.5);

    tl.to(card, {
      rotation: 0,
      duration: 2,
      ease: 'sine.inOut',
    }, idleStart + 4.5 + i * 0.5);

    /* Scale breathe */
    tl.to(card, {
      scale: 1.012,
      duration: 3.2,
      ease: 'sine.inOut',
      transformOrigin: 'center bottom',
    }, idleStart + 0.8 + i * 0.4);

    tl.to(card, {
      scale: 1,
      duration: 2.2,
      ease: 'sine.inOut',
    }, idleStart + 0.8 + 3.2 + i * 0.4);
  });

  /* ── ACT 3: EXIT — cards drift downstream (to the right) ── */
  const exitStart = idleStart + IDLE_DUR;

  cards.forEach((card, i) => {
    const staggerOffset = i * 0.28;
    tl.to(card, {
      x: 2200,                  // drift off right edge
      y: 30 + i * 8,            // slight downward drift as they go
      opacity: 0,
      duration: EXIT_DUR,
      ease: 'waterExit',
    }, exitStart + staggerOffset);
  });

  /* ── Small pause before next batch ── */
  tl.to({}, { duration: 0.4 }, exitStart + EXIT_DUR + (cards.length - 1) * 0.28);

  return tl;
}

/* ============================================================
   KICK OFF
   ============================================================ */
window.addEventListener('DOMContentLoaded', loadProducts);
