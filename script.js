// script.js — sklepgangstera.pl
// Full E-Commerce Store Interactions

'use strict';

/* ════════════════════════════════════════════
   STATE
   ════════════════════════════════════════════ */
const state = {
  cart: JSON.parse(localStorage.getItem('sg_cart') || '[]'),
  wishlist: new Set(JSON.parse(localStorage.getItem('sg_wishlist') || '[]')),
};

/* ════════════════════════════════════════════
   PRODUCTS DATA
   ════════════════════════════════════════════ */
const PRODUCTS = [
  {
    id: '001-DW',
    tag: '#001-DW',
    name: 'Kominiarka "Don Wiśnia"',
    material: '100% Kaszmir Grade A',
    price: 890,
    badge: 'DROP',
    badgeClass: 'badge-drop',
    colors: ['black', 'white', 'gold'],
    img: 'https://images.unsplash.com/photo-1520975661595-6453be3f7070?w=600&q=80&auto=format',
  },
  {
    id: '002-AU',
    tag: '#002-AU',
    name: 'Bluza "Alibaba z Ursynowa"',
    material: '500 GSM Bawełna Egipska',
    price: 490,
    badge: 'NOWOŚĆ',
    badgeClass: 'badge-new',
    colors: ['black', 'gold'],
    img: 'https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=600&q=80&auto=format',
  },
  {
    id: '003-SSN',
    tag: '#003-SSN',
    name: 'Skarpety "Szef Się Nie Tłumaczy"',
    material: '80% Bawełna, 15% Jedwab',
    price: 120,
    badge: 'BESTSELLER',
    badgeClass: 'badge-new',
    colors: ['black', 'white'],
    img: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600&q=80&auto=format',
  },
  {
    id: '004-SD',
    tag: '#004-SD',
    name: 'Czapka "Szef Dzielnicy"',
    material: 'Merino Wool Extra Fine',
    price: 280,
    badge: null,
    badgeClass: null,
    colors: ['black', 'white'],
    img: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=600&q=80&auto=format',
  },
  {
    id: '005-UZ',
    tag: '#005-UZ',
    name: 'Koszulka "Układ Zamknięty"',
    material: '220 GSM Supima Cotton',
    price: 340,
    badge: 'LIMITED',
    badgeClass: 'badge-drop',
    colors: ['white', 'black'],
    img: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80&auto=format',
  },
  {
    id: '006-KG',
    tag: '#006-KG',
    name: 'Kaps "Gangsta Regular"',
    material: 'Wool Blend Premium',
    price: 220,
    badge: 'SOLD OUT',
    badgeClass: 'badge-sold',
    colors: ['black'],
    img: 'https://images.unsplash.com/photo-1575428652377-a2d80e2277fc?w=600&q=80&auto=format',
  },
  {
    id: '007-RS',
    tag: '#007-RS',
    name: 'Rękawice "Rodzina Swój Swego"',
    material: '100% Kaszmir Grade A',
    price: 450,
    badge: 'DROP',
    badgeClass: 'badge-drop',
    colors: ['black', 'white', 'gold'],
    img: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&q=80&auto=format',
  },
  {
    id: '008-PS',
    tag: '#008-PS',
    name: 'Pasek "Pasy Nie Kłamią"',
    material: 'Full-Grain Leather, szczotkowana stal',
    price: 380,
    badge: 'NOWOŚĆ',
    badgeClass: 'badge-new',
    colors: ['black', 'gold'],
    img: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80&auto=format',
  },
];

/* ════════════════════════════════════════════
   HELPERS
   ════════════════════════════════════════════ */
function formatPrice(n) {
  return n.toLocaleString('pl-PL') + ' PLN';
}

function saveState() {
  localStorage.setItem('sg_cart', JSON.stringify(state.cart));
  localStorage.setItem('sg_wishlist', JSON.stringify([...state.wishlist]));
}

function showToast(msg, type = 'gold') {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<span>✦</span> ${msg}`;
  document.body.appendChild(toast);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => toast.classList.add('show'));
  });

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 400);
  }, 3000);
}

/* ════════════════════════════════════════════
   CART
   ════════════════════════════════════════════ */
function getCartTotal() {
  return state.cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
}

function updateCartCount() {
  const count = state.cart.reduce((sum, item) => sum + item.qty, 0);
  document.querySelectorAll('.cart-count').forEach(el => {
    el.textContent = count;
    el.style.display = count === 0 ? 'none' : 'flex';
  });
}

function addToCart(productId) {
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product || product.badge === 'SOLD OUT') return;

  const existing = state.cart.find(i => i.id === productId);
  if (existing) {
    existing.qty++;
  } else {
    state.cart.push({ ...product, qty: 1 });
  }

  saveState();
  updateCartCount();
  renderCartItems();
  showToast(`${product.name.split('"')[0].trim()} — dorzucone do układu.`);
}

function removeFromCart(productId) {
  state.cart = state.cart.filter(i => i.id !== productId);
  saveState();
  updateCartCount();
  renderCartItems();
}

function changeQty(productId, delta) {
  const item = state.cart.find(i => i.id === productId);
  if (!item) return;
  item.qty = Math.max(1, item.qty + delta);
  saveState();
  updateCartCount();
  renderCartItems();
}

function renderCartItems() {
  const body = document.getElementById('cart-body');
  const footer = document.getElementById('cart-footer');
  if (!body) return;

  if (state.cart.length === 0) {
    body.innerHTML = `
      <div class="cart-empty">
        <div class="cart-empty-icon">🖤</div>
        <div class="cart-empty-text">Układ pusty, Szefie.</div>
        <div class="cart-empty-sub">Czas napełnić koszyk klasą.</div>
      </div>`;
    footer.style.display = 'none';
    return;
  }

  footer.style.display = 'block';

  body.innerHTML = state.cart.map(item => `
    <div class="cart-item" data-id="${item.id}">
      <img src="${item.img}" alt="${item.name}" class="cart-item-img" loading="lazy">
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-meta">${item.tag} · ${item.material}</div>
        <div class="cart-item-qty">
          <button class="qty-btn" onclick="changeQty('${item.id}', -1)" aria-label="Zmniejsz ilość">−</button>
          <span class="qty-num">${item.qty}</span>
          <button class="qty-btn" onclick="changeQty('${item.id}', 1)" aria-label="Zwiększ ilość">+</button>
          <button class="qty-btn" onclick="removeFromCart('${item.id}')" aria-label="Usuń produkt" style="margin-left:auto;color:#6b6b6b">✕</button>
        </div>
      </div>
      <div class="cart-item-price">${formatPrice(item.price * item.qty)}</div>
    </div>
  `).join('');

  document.getElementById('cart-subtotal-amount').textContent = formatPrice(getCartTotal());
}

/* ════════════════════════════════════════════
   CART DRAWER
   ════════════════════════════════════════════ */
function openCart() {
  document.getElementById('cart-overlay').classList.add('open');
  document.getElementById('cart-drawer').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeCart() {
  document.getElementById('cart-overlay').classList.remove('open');
  document.getElementById('cart-drawer').classList.remove('open');
  document.body.style.overflow = '';
}

/* ════════════════════════════════════════════
   SEARCH MODAL
   ════════════════════════════════════════════ */
function openSearch() {
  document.getElementById('search-modal').classList.add('open');
  document.body.style.overflow = 'hidden';
  setTimeout(() => document.getElementById('search-input').focus(), 100);
}

function closeSearch() {
  document.getElementById('search-modal').classList.remove('open');
  document.body.style.overflow = '';
}

/* ════════════════════════════════════════════
   MOBILE NAV
   ════════════════════════════════════════════ */
function openMobileNav() {
  document.getElementById('mobile-nav').classList.add('open');
  document.getElementById('cart-overlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeMobileNav() {
  document.getElementById('mobile-nav').classList.remove('open');
  document.getElementById('cart-overlay').classList.remove('open');
  document.body.style.overflow = '';
}

/* ════════════════════════════════════════════
   WISHLIST
   ════════════════════════════════════════════ */
function toggleWishlist(productId, btn) {
  if (state.wishlist.has(productId)) {
    state.wishlist.delete(productId);
    btn.classList.remove('active');
    btn.setAttribute('aria-pressed', 'false');
    showToast('Usunięto z listy życzeń.');
  } else {
    state.wishlist.add(productId);
    btn.classList.add('active');
    btn.setAttribute('aria-pressed', 'true');
    showToast('Dodano do listy życzeń. ✦');
  }
  saveState();
}

/* ════════════════════════════════════════════
   PRODUCT GRID RENDER
   ════════════════════════════════════════════ */
function renderProducts(products = PRODUCTS) {
  const grid = document.getElementById('product-grid');
  if (!grid) return;

  grid.innerHTML = products.map(p => {
    const isSoldOut = p.badge === 'SOLD OUT';
    const isWished  = state.wishlist.has(p.id);

    return `
    <article class="product-card${isSoldOut ? ' sold-out' : ''}" data-product-id="${p.id}"
      role="article" aria-label="${p.name}">

      ${p.badge ? `<div class="product-badge ${p.badgeClass}" aria-label="Oznaczenie: ${p.badge}">${p.badge}</div>` : ''}

      <div class="product-img-wrap">
        <img
          src="${p.img}"
          alt="${p.name}"
          class="product-img"
          loading="lazy"
          decoding="async"
        >
        <div class="product-overlay" aria-hidden="true">
          <button
            class="quick-add-btn"
            onclick="addToCart('${p.id}')"
            ${isSoldOut ? 'disabled aria-disabled="true"' : ''}
            aria-label="${isSoldOut ? 'Produkt niedostępny' : 'Szybko dodaj do koszyka'}"
          >
            ${isSoldOut ? 'Niedostępny' : 'Dorzuć do Układu ✦'}
          </button>
        </div>
        <button
          class="wishlist-btn${isWished ? ' active' : ''}"
          onclick="toggleWishlist('${p.id}', this)"
          aria-label="${isWished ? 'Usuń z listy życzeń' : 'Dodaj do listy życzeń'}"
          aria-pressed="${isWished}"
        >
          ${isWished ? '♥' : '♡'}
        </button>
      </div>

      <div class="product-info">
        <div class="product-tag">${p.tag}</div>
        <h3 class="product-name">${p.name}</h3>
        <div class="product-material">${p.material}</div>
        <div class="product-footer">
          <div class="product-price" aria-label="Cena: ${formatPrice(p.price)}">${formatPrice(p.price)}</div>
          <div class="product-colors" role="list" aria-label="Dostępne kolory">
            ${p.colors.map(c => `<div class="color-dot ${c}" role="listitem" aria-label="Kolor: ${c}" title="${c}"></div>`).join('')}
          </div>
        </div>
      </div>
    </article>
  `}).join('');

  // Scroll-triggered animation
  observeProducts();
}

/* ════════════════════════════════════════════
   CATEGORY FILTER
   ════════════════════════════════════════════ */
function filterProducts(category) {
  const buttons = document.querySelectorAll('.cat-btn');
  buttons.forEach(btn => btn.classList.toggle('active', btn.dataset.cat === category));

  let filtered = PRODUCTS;
  if (category === 'glowy') {
    filtered = PRODUCTS.filter(p => ['001-DW', '004-SD', '006-KG'].includes(p.id));
  } else if (category === 'gorne') {
    filtered = PRODUCTS.filter(p => ['002-AU', '005-UZ'].includes(p.id));
  } else if (category === 'akcesoria') {
    filtered = PRODUCTS.filter(p => ['003-SSN', '007-RS', '008-PS'].includes(p.id));
  }

  renderProducts(filtered);
}

/* ════════════════════════════════════════════
   INTERSECTION OBSERVER (Stagger animations)
   ════════════════════════════════════════════ */
function observeProducts() {
  const cards = document.querySelectorAll('.product-card');
  const obs = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        entry.target.style.animationDelay = `${i * 0.06}s`;
        entry.target.classList.add('animate-in');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  cards.forEach(card => obs.observe(card));
}

function observeSections() {
  const els = document.querySelectorAll(
    '.kanarek-section, .reviews-grid, .about-section, .newsletter-section, .section-title-wrap'
  );
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  els.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(32px)';
    el.style.transition = 'opacity 0.7s ease, transform 0.7s ease';
    obs.observe(el);
  });
}

/* ════════════════════════════════════════════
   NAVBAR SCROLL
   ════════════════════════════════════════════ */
function initNavbarScroll() {
  const navbar = document.querySelector('.navbar');
  const backToTop = document.querySelector('.back-to-top');

  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY > 50;
    navbar.classList.toggle('scrolled', scrolled);

    if (backToTop) {
      backToTop.classList.toggle('visible', window.scrollY > 400);
    }
  }, { passive: true });
}

/* ════════════════════════════════════════════
   KEYBOARD NAVIGATION
   ════════════════════════════════════════════ */
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeCart();
    closeSearch();
    closeMobileNav();
  }
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault();
    openSearch();
  }
});

/* ════════════════════════════════════════════
   SEARCH
   ════════════════════════════════════════════ */
function initSearch() {
  const input = document.getElementById('search-input');
  if (!input) return;

  input.addEventListener('input', function() {
    const q = this.value.toLowerCase().trim();
    if (!q) { renderProducts(); return; }
    const filtered = PRODUCTS.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.material.toLowerCase().includes(q) ||
      p.tag.toLowerCase().includes(q)
    );
    if (document.getElementById('product-grid')) {
      renderProducts(filtered.length ? filtered : PRODUCTS);
    }
  });
}

/* ════════════════════════════════════════════
   CHECKOUT (placeholder)
   ════════════════════════════════════════════ */
function proceedToCheckout() {
  if (state.cart.length === 0) {
    showToast('Koszyk pusty, Szefie.');
    return;
  }
  showToast(`Suma: ${formatPrice(getCartTotal())} — Przejście do płatności... ✦`);
  // TODO: integrate with payment gateway (Przelewy24 / Stripe)
}

/* ════════════════════════════════════════════
   NEWSLETTER
   ════════════════════════════════════════════ */
function initNewsletter() {
  const form = document.getElementById('newsletter-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = form.querySelector('input[type="email"]');
    if (!input.value.includes('@')) { input.focus(); return; }
    showToast('Jesteś w Układzie. Będziesz pierwszy/a na liście. ✦');
    input.value = '';
  });
}

/* ════════════════════════════════════════════
   HERO PARALLAX
   ════════════════════════════════════════════ */
function initParallax() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const heroImg = document.querySelector('.hero-img');
  if (!heroImg) return;

  window.addEventListener('scroll', () => {
    const y = window.scrollY * 0.25;
    heroImg.style.transform = `translateY(${y}px) scale(1.03)`;
  }, { passive: true });
}

/* ════════════════════════════════════════════
   INIT
   ════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  renderProducts();
  renderCartItems();
  updateCartCount();
  initNavbarScroll();
  initSearch();
  initNewsletter();
  initParallax();
  observeSections();
});
