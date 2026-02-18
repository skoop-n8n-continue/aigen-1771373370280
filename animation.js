/* ============================================================
   ZEN GARDEN DISPENSARY — animation.js
   GSAP 3 (all plugins now free via CDN)
   ============================================================ */

// Register all plugins — all are now free and CDN-available
gsap.registerPlugin(SplitText, CustomEase, MotionPathPlugin, DrawSVGPlugin, MorphSVGPlugin);

/* ── Custom eases ── */
CustomEase.create("riverFloat", "M0,0 C0.08,0 0.18,0.55 0.38,0.78 0.58,0.98 0.82,1.0 1,1");
CustomEase.create("gentleSettle", "M0,0 C0.25,0.1 0.1,1.05 0.5,0.98 0.75,0.95 1,1");
CustomEase.create("waterExit", "M0,0 C0.2,0 0.45,0.25 0.65,0.65 0.82,0.93 1,1");

/* ── DESIGN: 3 product cards shown per cycle ── */
const PRODUCTS_PER_CYCLE = 3;

/* ── Layout: 3-card staggered river arrangement ──
   Card 0 = upper left zone
   Card 1 = center
   Card 2 = lower right zone                        */
const CARD_POSITIONS = [
  { left: 120,  top: 140 },
  { left: 790,  top: 260 },
  { left: 1455, top: 155 },
];

let PRODUCTS = [];
let cycleRunning = false;

/* ============================================================
   FALLBACK PRODUCT DATA — used if fetch fails
   ============================================================ */
const FALLBACK_PRODUCTS = [
  {
    id: "1",
    name: "Money Saki 1g Preroll",
    category: "Distillate Cartridge",
    vendor: "Hansen Pharms",
    price: "2.5",
    image_url: "https://skoop-general.s3.us-east-1.amazonaws.com/n8n_image_gen%2Fmkx_cartridge_box-1770340372957.png",
    discounted_price: 0,
    strainType: "Sativa",
    labResults: [{ labTest: "THC", value: 75.09, labResultUnit: "Percentage" }]
  },
  {
    id: "2",
    name: "DIME Disposable 0.9g | Blueberry Lemon Haze",
    category: "All-In-One Vape",
    vendor: "Hansen Pharms",
    price: "3.5",
    image_url: "https://skoop-general.s3.us-east-1.amazonaws.com/n8n_image_gen%2Flegit_labs_box-1770340400372.png",
    discounted_price: 2.5,
    strainType: "Sativa",
    labResults: [{ labTest: "THC", value: 82.3, labResultUnit: "Percentage" }]
  },
  {
    id: "3",
    name: "Blueberry Muffin Live Rosin | 0.5g",
    category: "Rosin Cartridge",
    vendor: "Hansen Pharms",
    price: "4.0",
    image_url: "https://skoop-general.s3.us-east-1.amazonaws.com/n8n_image_gen%2Fmkx_disposable_cyan-1770340426216.png",
    discounted_price: 0,
    strainType: "Hybrid",
    labResults: [{ labTest: "THC", value: 68.5, labResultUnit: "Percentage" }]
  },
  {
    id: "4",
    name: "Purple Punch Live Resin",
    category: "Concentrate",
    vendor: "Hansen Pharms",
    price: "5.0",
    image_url: "https://skoop-general.s3.us-east-1.amazonaws.com/n8n_image_gen%2Flegit_labs_box-1770340400372.png",
    discounted_price: 3.5,
    strainType: "Indica",
    labResults: [{ labTest: "THC", value: 89.2, labResultUnit: "Percentage" }]
  }
];

/* ============================================================
   BOOTSTRAP
   ============================================================ */
async function loadProducts() {
  try {
    const response = await fetch('./products.json?v=' + Date.now());
    if (!response.ok) throw new Error('HTTP ' + response.status);
    const data = await response.json();
    const loaded = data.products || [];
    PRODUCTS = loaded.length > 0 ? loaded : FALLBACK_PRODUCTS;
    console.log('[ZenMenu] Loaded', PRODUCTS.length, 'products from products.json');
  } catch (err) {
    console.warn('[ZenMenu] Using fallback products. Error:', err.message);
    PRODUCTS = FALLBACK_PRODUCTS;
  }

  initScene();
  startAmbient();
  animateCycle(0);
}

/* ============================================================
   SCENE INIT — one-time persistent element setup
   ============================================================ */
function initScene() {
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

  /* Header gold line reveal via scaleX */
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
  const bgTl = gsap.timeline({ repeat: -1, yoyo: true });
  bgTl
    .to('#background', { x: 18, y: 6, duration: 28, ease: 'sine.inOut' })
    .to('#background', { x: -10, y: -4, duration: 28, ease: 'sine.inOut' });

  /* Foreground botanicals gentle sway */
  gsap.to('#foreground-botanicals', {
    x: 8, y: -5, rotation: 0.4,
    transformOrigin: '0% 0%',
    duration: 8,
    ease: 'sine.inOut',
    yoyo: true,
    repeat: -1
  });

  animateRiverCurrents();
  scheduleRipples();
  spawnParticles();
}

function animateRiverCurrents() {
  const configs = [
    { id: '#current-1', dasharray: '55 25', duration: 14, startOffset: 600 },
    { id: '#current-2', dasharray: '45 20', duration: 17, startOffset: 720 },
    { id: '#current-3', dasharray: '38 18', duration: 19, startOffset: 840 },
    { id: '#current-4', dasharray: '30 15', duration: 21, startOffset: 960 },
  ];

  configs.forEach(function(cfg, i) {
    var el = document.querySelector(cfg.id);
    if (!el) return;
    el.style.strokeDasharray = cfg.dasharray;
    gsap.fromTo(el,
      { strokeDashoffset: cfg.startOffset },
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
  function doRipple(id, delay) {
    var el = document.querySelector(id);
    if (!el) return;
    var tl = gsap.timeline({ delay: delay, repeat: -1, repeatDelay: 4 + Math.random() * 3 });
    tl
      .set(el, { attr: { r: 0 }, opacity: 0 })
      .to(el, { attr: { r: 30 }, opacity: 0.7, duration: 0.4, ease: 'power2.out' })
      .to(el, { attr: { r: 85 }, opacity: 0, duration: 1.8, ease: 'power1.out' });
  }
  doRipple('#ripple-a', 1.5);
  doRipple('#ripple-b', 3.8);
  doRipple('#ripple-c', 6.2);
}

function spawnParticles() {
  var container = document.getElementById('particles-layer');
  if (!container) return;

  for (var i = 0; i < 20; i++) {
    var p = document.createElement('div');
    p.className = 'particle';
    var size = 2 + Math.random() * 5;
    var startX = Math.random() * 1920;
    var startY = 600 + Math.random() * 380;
    var dur = 12 + Math.random() * 18;
    var del = Math.random() * 20;

    p.style.cssText = 'width:' + size + 'px;height:' + size + 'px;left:' + startX + 'px;top:' + startY + 'px;';
    container.appendChild(p);

    (function(el, d, delay) {
      gsap.fromTo(el,
        { opacity: 0, x: 0, y: 0 },
        {
          opacity: 0.15 + Math.random() * 0.4,
          x: 180 + Math.random() * 200,
          y: -(25 + Math.random() * 60),
          duration: d,
          delay: delay,
          ease: 'none',
          repeat: -1,
          onRepeat: function() {
            gsap.set(el, {
              x: 0, y: 0, opacity: 0,
              left: (Math.random() * 1920) + 'px',
              top: (600 + Math.random() * 380) + 'px'
            });
          }
        }
      );
    })(p, dur, del);
  }
}

/* ============================================================
   BATCH HELPERS
   ============================================================ */
function getBatch(batchIndex) {
  if (!PRODUCTS || PRODUCTS.length === 0) return FALLBACK_PRODUCTS.slice(0, PRODUCTS_PER_CYCLE);
  var start = (batchIndex * PRODUCTS_PER_CYCLE) % PRODUCTS.length;
  var batch = [];
  for (var i = 0; i < PRODUCTS_PER_CYCLE; i++) {
    batch.push(PRODUCTS[(start + i) % PRODUCTS.length]);
  }
  return batch;
}

function formatPrice(val) {
  var n = parseFloat(val);
  return isNaN(n) ? (val || '') : n.toFixed(2);
}

function getThc(product) {
  if (!product.labResults || !product.labResults.length) return null;
  for (var i = 0; i < product.labResults.length; i++) {
    if (product.labResults[i].labTest === 'THC') return product.labResults[i].value;
  }
  return null;
}

/* ============================================================
   RENDER BATCH — build card DOM
   ============================================================ */
function renderBatch(products) {
  var container = document.getElementById('products-container');
  if (!container) {
    console.error('[ZenMenu] #products-container not found!');
    return;
  }
  container.innerHTML = '';

  products.forEach(function(product, index) {
    if (!product) return;

    var pos = CARD_POSITIONS[index] || CARD_POSITIONS[0];
    var thc = getThc(product);
    var hasDiscount = product.discounted_price && parseFloat(product.discounted_price) > 0;
    var strainRaw = product.strainType || 'Hybrid';
    var strainClass = strainRaw.toLowerCase();

    var card = document.createElement('div');
    card.className = 'product-card';
    card.dataset.index = index;

    card.innerHTML =
      '<span class="strain-badge ' + strainClass + '">' + strainRaw + '</span>' +
      '<div class="product-image-wrap">' +
        '<img class="product-image" src="' + (product.image_url || '') + '" alt="' + (product.name || '') + '">' +
      '</div>' +
      '<div class="product-info">' +
        '<div class="product-category">' + (product.category || '') + '</div>' +
        '<h2 class="product-name">' + (product.name || '') + '</h2>' +
        '<div class="product-divider"></div>' +
        '<div class="product-meta-row">' +
          (thc !== null
            ? '<div><div class="thc-label">THC Content</div><div class="thc-value">' + thc.toFixed(1) + '<span class="thc-unit">%</span></div></div>'
            : '<div></div>'
          ) +
          '<div class="product-price-row">' +
            (hasDiscount
              ? '<div class="product-price has-discount"><span class="price-currency">$</span>' + formatPrice(product.price) + '</div>' +
                '<div class="product-price-discounted"><span class="price-currency">$</span>' + formatPrice(product.discounted_price) + '</div>'
              : '<div class="product-price"><span class="price-currency">$</span>' + formatPrice(product.price) + '</div>'
            ) +
          '</div>' +
        '</div>' +
        '<div class="product-vendor">' + (product.vendor || '') + '</div>' +
      '</div>';

    container.appendChild(card);

    /* CRITICAL: set initial state BEFORE any animation touches the card
       Use gsap.set so GSAP owns the transform matrix from the start      */
    gsap.set(card, {
      position: 'absolute',
      left: pos.left,
      top: pos.top,
      x: -680,
      y: (index % 2 === 0 ? 15 : -15),
      opacity: 0,
      rotation: -1.8
    });
  });

  console.log('[ZenMenu] Rendered', products.length, 'cards');
}

/* ============================================================
   MAIN CYCLE ANIMATION
   ============================================================ */
function animateCycle(batchIndex) {
  var batch = getBatch(batchIndex);

  if (!batch || batch.length === 0) {
    gsap.delayedCall(1, function() { animateCycle(batchIndex); });
    return;
  }

  renderBatch(batch);

  var cards = document.querySelectorAll('.product-card');
  var cardArr = Array.from ? Array.from(cards) : [].slice.call(cards);

  if (cardArr.length === 0) {
    console.error('[ZenMenu] No .product-card elements found after render!');
    gsap.delayedCall(1, function() { animateCycle(batchIndex + 1); });
    return;
  }

  console.log('[ZenMenu] Animating batch', batchIndex, '—', cardArr.length, 'cards');

  var ENTRANCE_DUR = 1.6;
  var IDLE_DUR = 7.0;
  var EXIT_DUR = 1.4;
  var STAGGER = 0.40;

  var tl = gsap.timeline({
    onComplete: function() { animateCycle(batchIndex + 1); }
  });

  /* ── ACT 1: ENTRANCE ── cards float in from upstream left */
  cardArr.forEach(function(card, i) {
    tl.to(card, {
      x: 0,
      y: 0,
      opacity: 1,
      rotation: 0,
      duration: ENTRANCE_DUR,
      ease: 'riverFloat'
    }, i * STAGGER);
  });

  var entranceEnd = ENTRANCE_DUR + (cardArr.length - 1) * STAGGER;
  var idleStart = entranceEnd + 0.2;

  /* ── ACT 2: IDLE ── gentle water-bob & breathe */
  cardArr.forEach(function(card, i) {
    var bobAmt = 6 + i * 2;
    var bobDur = 3.5 + i * 0.4;
    var rotAmt = 0.35 * (i % 2 === 0 ? 1 : -1);

    tl.to(card, {
      y: -bobAmt,
      duration: bobDur,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: 1
    }, idleStart + i * 0.3);

    tl.to(card, {
      rotation: rotAmt,
      duration: 3.4,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: 1
    }, idleStart + i * 0.4);

    tl.to(card, {
      scale: 1.012,
      duration: 2.8,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: 1,
      transformOrigin: 'center bottom'
    }, idleStart + 0.7 + i * 0.35);
  });

  /* ── ACT 3: EXIT ── cards drift downstream right */
  var exitStart = idleStart + IDLE_DUR;

  cardArr.forEach(function(card, i) {
    tl.to(card, {
      x: 2500,
      y: 20 + i * 10,
      opacity: 0,
      rotation: 1.2,
      duration: EXIT_DUR,
      ease: 'waterExit'
    }, exitStart + i * 0.28);
  });

  /* brief gap before next cycle */
  tl.to({}, { duration: 0.5 });

  return tl;
}

/* ============================================================
   KICK OFF on DOMContentLoaded
   ============================================================ */
document.addEventListener('DOMContentLoaded', loadProducts);
