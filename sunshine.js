/* Kaji Rose Studio — Sunshine Squad collection + sitewide studio work gallery.
   Load AFTER the existing script.js. No third-party libraries or backend required. */
(() => {
  'use strict';
  if (typeof products === 'undefined' || typeof renderProducts !== 'function' ||
      typeof openCustomizer !== 'function') {
    console.error('Sunshine Squad: load sunshine.js after script.js.');
    return;
  }

  // Put the exact supplied/approved Sunshine Squad PNG at this path.
  // A friendly sunshine fallback remains until the file is uploaded.
  const SUNSHINE_LOGO = 'assets/sunshine-squad-logo.png';
  let logoAvailable = false;

  const sunshineProducts = [
    { id: 'sunshine-beanie', name: 'Sunshine Squad Special Beanie', category: 'sunshine',
      icon: '🧶', desc: 'The special Sunshine Squad beanie.', badge: 'Supports a cause',
      variants: [['Special Beanie', 25]] },
    { id: 'sunshine-tumbler', name: 'Sunshine Squad Tumbler', category: 'sunshine',
      icon: '🥤', desc: 'Choose your tumbler size and color: purple or blue.',
      variants: [['20 oz — Purple', 30], ['20 oz — Blue', 30], ['30 oz — Purple', 40],
                 ['30 oz — Blue', 40], ['40 oz — Purple', 50], ['40 oz — Blue', 50]] },
    { id: 'sunshine-wristbands', name: 'Sunshine Squad Wristband', category: 'sunshine',
      icon: '💜', desc: 'Show your Sunshine Squad support every day.',
      variants: [['Wristband', 8]] },
    { id: 'sunshine-blanket', name: 'Sunshine Squad Blanket', category: 'sunshine',
      icon: '🛏️', desc: 'Cozy Sunshine Squad blankets for every age and space.',
      variants: [['Baby — 30×40 in.', 35], ['Toddler — 40×50 in.', 45],
                 ['Twin — 50×60 in.', 55], ['Full/Queen — 60×80 in.', 65]] },
    { id: 'sunshine-shirt', name: 'Sunshine Squad T-Shirt', category: 'sunshine',
      icon: '👕', desc: 'Sunshine Squad tee. Please specify your requested size in the design notes; availability will be confirmed.',
      variants: [['Size to be confirmed', 35]] },
    { id: 'sunshine-accessories', name: 'Sunshine Accessories', category: 'sunshine',
      icon: '🎁', desc: 'Ask us about Sunshine Squad accessories and available styles.',
      variants: [['Ask about accessories — price to be confirmed', null]] }
  ];
  const sunshineIds = new Set(sunshineProducts.map(item => item.id));
  sunshineProducts.forEach(item => { if (!products.some(p => p.id === item.id)) products.push(item); });
  populateProductSelect();
  renderProducts();
  updateVariants();

  const nav = document.getElementById('mainNav');
  if (nav && !nav.querySelector('a[href="#sunshine"]')) {
    const howLink = nav.querySelector('a[href="#how"]');
    const sunshineLink = document.createElement('a');
    sunshineLink.href = '#sunshine';
    sunshineLink.textContent = 'Sunshine Squad';
    nav.insertBefore(sunshineLink, howLink || null);
    const galleryLink = document.createElement('a');
    galleryLink.href = '#gallery';
    galleryLink.textContent = 'Gallery';
    nav.insertBefore(galleryLink, howLink || null);
    [sunshineLink, galleryLink].forEach(a => a.addEventListener('click', () => {
      nav.classList.remove('open');
      document.getElementById('menuToggle')?.setAttribute('aria-expanded', 'false');
    }));
  }
  document.querySelectorAll('.footer-grid').forEach(footer => {
    const browse = [...footer.querySelectorAll('div')].find(d => d.querySelector('strong')?.textContent.trim() === 'Browse');
    if (browse && !browse.querySelector('a[href="#sunshine"]')) {
      const link = document.createElement('a'); link.href = '#sunshine'; link.textContent = 'Sunshine Squad'; browse.appendChild(link);
      const gal = document.createElement('a'); gal.href = '#gallery'; gal.textContent = 'Photo & Video Gallery'; browse.appendChild(gal);
    }
  });

  const section = document.createElement('section');
  section.className = 'ss-section';
  section.id = 'sunshine';
  section.setAttribute('aria-labelledby', 'ss-title');
  section.innerHTML = `
    <div class="wrap">
      <div class="ss-hero">
        <div class="ss-hero-copy">
          <span class="ss-eyebrow">A collection that gives back <span aria-hidden="true">☀</span></span>
          <h2 id="ss-title">The <em>Sunshine Squad</em></h2>
          <p>Kaji Rose Studio is working with the Sunshine Squad to bring you custom Sunshine Squad merch in support of this nonprofit organization. A minimum of a $5 donation will automatically go towards safe houses, animal shelters, and other organizations near and dear to us per item you purchase at no extra charge!</p>
          <div class="ss-hero-actions">
            <a class="ss-button ss-button-primary" href="#ss-collection">Shop the collection <span aria-hidden="true">→</span></a>
            <a class="ss-button ss-button-secondary" href="#gallery">Explore our studio work</a>
          </div>
        </div>
        <div class="ss-sun-art"><div class="ss-sun-ring"><img class="ss-hero-logo" src="assets/sunshine-squad-logo.png" alt="Sunshine Squad official logo" hidden /><div class="ss-logo-fallback" aria-hidden="true"><span>☀</span><small>Spread a little<br>sunshine</small></div></div></div>
      </div>
      <div class="ss-commitment" role="note"><span aria-hidden="true">♡</span><div><strong>At least $5 from every Sunshine Squad item</strong><p>Already included in the listed price. No extra donation fee is added at checkout or when you request your item.</p></div></div>
      <div class="ss-collection-head" id="ss-collection"><div><span class="ss-eyebrow">Shop for a cause</span><h3>Sunshine Squad merchandise</h3></div><p>Choose an item below to prepare your request with Kaji Rose Studio.</p></div>
      <div class="ss-products" id="ssProducts"></div>
    </div>`;
  const existingProducts = document.getElementById('products');
  if (existingProducts) existingProducts.before(section);

  const productContainer = document.getElementById('ssProducts');
  sunshineProducts.forEach((p, index) => {
    const numericPrices = p.variants.map(v => v[1]).filter(v => v != null);
    const minPrice = numericPrices.length ? Math.min(...numericPrices) : null;
    const card = document.createElement('article'); card.className = 'ss-product-card';
    const illustration = document.createElement('div');
    illustration.className = `ss-product-illustration ss-palette-${index % 6}`;
    illustration.setAttribute('aria-hidden','true');
    const symbol = document.createElement('span'); symbol.textContent = p.icon;
    const logo = document.createElement('img');
    logo.className = 'ss-item-logo';
    logo.src = SUNSHINE_LOGO;
    logo.alt = `Official Sunshine Squad logo for ${p.name}`;
    logo.hidden = true;
    // The item icon remains visible until an approved logo asset is available.
    logo.addEventListener('load', () => { logo.hidden = false; symbol.hidden = true; });
    logo.addEventListener('error', () => { logo.remove(); });
    illustration.append(symbol, logo);
    const content = document.createElement('div'); content.className = 'ss-product-content';
    const heading = document.createElement('h4'); heading.textContent = p.name;
    const description = document.createElement('p'); description.textContent = p.desc;
    const bottom = document.createElement('div'); bottom.className = 'ss-product-bottom';
    const price = document.createElement('strong');
    price.textContent = minPrice == null ? 'Price on request' :
      (new Set(numericPrices).size > 1 ? 'From ' : '') + `$${minPrice}`;
    const button = document.createElement('button'); button.type = 'button';
    button.className = 'ss-button ss-product-action'; button.textContent = 'Request item';
    button.addEventListener('click', () => openCustomizer(p.id));
    bottom.append(price, button); content.append(heading, description, bottom);
    card.append(illustration, content); productContainer.appendChild(card);
  });

  // Add Sunshine Squad to the existing category filter as well.
  const filters = document.querySelector('.filters');
  if (filters && !filters.querySelector('[data-filter="sunshine"]')) {
    const filter = document.createElement('button'); filter.type = 'button';
    filter.className = 'filter'; filter.dataset.filter = 'sunshine';
    filter.textContent = '☀ Sunshine Squad';
    const all = filters.querySelector('[data-filter="all"]');
    (all || filters.lastElementChild)?.after(filter);
    filter.addEventListener('click', () => {
      filters.querySelectorAll('.filter').forEach(b => b.classList.remove('active'));
      filter.classList.add('active'); renderProducts('sunshine');
    });
  }

  // Let the customer see the minimum donation allocation for the chosen quantity.
  const requestForm = document.getElementById('requestForm');
  // Legacy request summary expects four optional fields not currently in index.html.
  // Provide nonvisual defaults so any product request remains functional.
  ['colorScheme', 'designDeadline', 'favoriteThings', 'designAvoid'].forEach(id => {
    if (!document.getElementById(id)) {
      const optionalField = document.createElement('input');
      optionalField.type = 'hidden'; optionalField.id = id;
      requestForm?.appendChild(optionalField);
    }
  });
  const productSelect = document.getElementById('productSelect');
  const quantityInput = document.getElementById('quantity');
  const donationLine = document.createElement('div');
  donationLine.className = 'ss-form-donation'; donationLine.hidden = true;
  donationLine.setAttribute('role', 'status'); donationLine.setAttribute('aria-live', 'polite');
  requestForm?.insertBefore(donationLine, requestForm.firstChild);
  const logoNotice = document.createElement('div');
  logoNotice.className = 'ss-logo-notice';
  logoNotice.hidden = true;
  logoNotice.innerHTML = `<img src="${SUNSHINE_LOGO}" alt="Official Sunshine Squad logo" hidden /><span>The official Sunshine Squad logo will be the artwork on this item.</span>`;
  requestForm?.insertBefore(logoNotice, donationLine.nextSibling);
  const modalLogo = logoNotice.querySelector('img');
  modalLogo.addEventListener('load', () => { modalLogo.hidden = false; });
  modalLogo.addEventListener('error', () => { modalLogo.remove(); });
  const refreshDonation = () => {
    const isSunshine = sunshineIds.has(productSelect?.value);
    donationLine.hidden = !isSunshine;
    logoNotice.hidden = !isSunshine;
    if (isSunshine) {
      const qty = Math.max(1, Math.floor(Number(quantityInput?.value) || 1));
      donationLine.textContent = `☀ Sunshine Squad • Minimum included donation: $${5 * qty} ($5 × ${qty} ${qty === 1 ? 'item' : 'items'}). No additional charge.`;
    }
  };
  productSelect?.addEventListener('change', refreshDonation);
  quantityInput?.addEventListener('input', refreshDonation);
  document.querySelectorAll('[data-product-id]').forEach(b => b.addEventListener('click', refreshDonation));
  document.addEventListener('click', e => { if (e.target.closest('[data-product-id], [data-open-customizer]')) queueMicrotask(refreshDonation); });
  document.querySelectorAll('[data-open-customizer]').forEach(b => b.addEventListener('click', refreshDonation));
  productContainer.addEventListener('click', e => { if (e.target.closest('button')) refreshDonation(); });
  refreshDonation();

  // The existing summary generator includes "Additional design notes". Add the pledge to
  // Sunshine requests before that generator runs so Messenger receives the donation amount.
  // Restore the customer's own notes in a microtask; no lasting form mutation.
  requestForm?.addEventListener('submit', () => {
    if (!sunshineIds.has(productSelect?.value)) return;
    const notes = document.getElementById('designNotes');
    if (!notes) return;
    const original = notes.value;
    const qty = Math.max(1, Math.floor(Number(quantityInput?.value) || 1));
    notes.value = `${original}${original ? '\n\n' : ''}SUNSHINE SQUAD ARTWORK: Use the official Sunshine Squad logo on this item.\nSUNSHINE SQUAD DONATION: At least $${5 * qty} ($5 × ${qty} items) is included in the listed price; there is no extra charge. Donation is allocated by Kaji Rose Studio for purchased items.`;
    queueMicrotask(() => { notes.value = original; });
  }, true);

  // Main-page portfolio gallery for ALL Kaji Rose Studio work.
  // Edit studio-gallery.json to add your own project photos and videos.
  const gallery = document.createElement('section');
  gallery.id = 'gallery'; gallery.className = 'ss-gallery-section';
  gallery.setAttribute('aria-labelledby','ss-gallery-title');
  gallery.innerHTML = `<div class="wrap">
    <div class="ss-gallery-heading"><div><span class="ss-eyebrow">Made by Kaji Rose Studio</span><h2 id="ss-gallery-title">Our Work — Photo & Video Gallery</h2></div><p>Browse design and product samples across our studio, from blankets and apparel to drinkware, accessories and more. We’ll add photos and videos of finished work as they become available.</p></div>
    <div class="ss-gallery-filters" role="group" aria-label="Filter gallery">
      <button type="button" class="ss-gallery-filter active" data-kind="all" aria-pressed="true">All media</button>
      <button type="button" class="ss-gallery-filter" data-kind="image" aria-pressed="false">Photos</button>
      <button type="button" class="ss-gallery-filter" data-kind="video" aria-pressed="false">Videos</button>
    </div>
    <div class="ss-gallery-grid" id="ssGalleryGrid" aria-live="polite"></div>
    <p class="ss-gallery-empty" id="ssGalleryEmpty" hidden>More photos and videos are coming soon.</p>
  </div>
  <dialog class="ss-lightbox" id="ssLightbox" aria-label="Gallery media viewer">
    <div class="ss-lightbox-inner"><button type="button" class="ss-lightbox-close" aria-label="Close gallery viewer">×</button><div id="ssLightboxContent"></div><p id="ssLightboxCaption"></p></div>
  </dialog>`;
  // Prominent on the MAIN PAGE, right below the shop section—not inside Sunshine Squad.
  const galleryPlacement = document.getElementById('how') || document.querySelector('footer');
  galleryPlacement?.before(gallery);

  const galleryGrid = document.getElementById('ssGalleryGrid');
  const empty = document.getElementById('ssGalleryEmpty');
  const viewer = document.getElementById('ssLightbox');
  const viewerContent = document.getElementById('ssLightboxContent');
  const viewerCaption = document.getElementById('ssLightboxCaption');
  let galleryItems = [];
  let selectedKind = 'all';
  const safeSrc = src => typeof src === 'string' &&
    /^(?!\s*(?:javascript:|data:|vbscript:))(?:(?:https?:\/\/)|(?:\.\.?\/)?[\w-][\w\-./% ]*)$/i.test(src);

  function showMedia(item) {
    viewerContent.replaceChildren();
    const node = document.createElement(item.type === 'video' ? 'video' : 'img');
    node.src = item.src;
    if (item.type === 'video') { node.controls = true; node.autoplay = true; node.playsInline = true; node.preload = 'metadata'; if (safeSrc(item.poster)) node.poster = item.poster; }
    else node.alt = item.alt || item.caption || 'Gallery photo';
    viewerContent.appendChild(node);
    viewerCaption.textContent = item.caption || '';
    if (typeof viewer.showModal === 'function') viewer.showModal();
    else viewer.setAttribute('open', '');
  }
  function closeMedia() {
    viewerContent.querySelector('video')?.pause();
    if (typeof viewer.close === 'function' && viewer.open) viewer.close();
    else viewer.removeAttribute('open');
    viewerContent.replaceChildren();
  }
  viewer.querySelector('.ss-lightbox-close').addEventListener('click', closeMedia);
  viewer.addEventListener('click', e => { if (e.target === viewer) closeMedia(); });
  viewer.addEventListener('close', () => viewerContent.replaceChildren());

  function renderGallery() {
    galleryGrid.replaceChildren();
    const visible = galleryItems.filter(m => selectedKind === 'all' || m.type === selectedKind);
    empty.hidden = visible.length > 0;
    empty.textContent = selectedKind === 'video' ? 'Studio videos are coming soon!' :
      selectedKind === 'image' ? 'Photos will be added soon.' : 'Photos and videos will be added soon.';
    visible.forEach(item => {
      const button = document.createElement('button'); button.type = 'button';
      button.className = 'ss-gallery-item'; button.setAttribute('aria-label', `Open ${item.type === 'video' ? 'video' : 'photo'}: ${item.caption || 'Gallery item'}`);
      const preview = document.createElement('div'); preview.className = 'ss-gallery-preview';
      if (item.type === 'image' || (item.type === 'video' && safeSrc(item.poster))) {
        const picture = document.createElement('img');
        picture.src = item.type === 'image' ? item.src : item.poster;
        picture.alt = item.alt || item.caption || '';
        picture.loading = 'lazy';
        picture.addEventListener('error', () => { preview.classList.add('ss-media-unavailable'); picture.remove(); });
        preview.appendChild(picture);
      } else {
        preview.classList.add('ss-video-preview');
        const play = document.createElement('span'); play.textContent = '▶';
        play.setAttribute('aria-hidden', 'true'); preview.appendChild(play);
      }
      if (item.type === 'video') {
        const marker = document.createElement('span'); marker.className = 'ss-video-badge'; marker.textContent = '▶ Video'; preview.appendChild(marker);
      }
      const caption = document.createElement('div'); caption.className = 'ss-gallery-caption';
      const label = document.createElement('strong'); label.textContent = item.caption || 'Studio media';
      const origin = document.createElement('small'); origin.textContent = item.collection || 'Kaji Rose Studio';
      caption.append(label, origin);
      button.append(preview, caption); button.addEventListener('click', () => showMedia(item));
      galleryGrid.appendChild(button);
    });
  }
  gallery.querySelectorAll('.ss-gallery-filter').forEach(button => button.addEventListener('click', () => {
    selectedKind = button.dataset.kind;
    gallery.querySelectorAll('.ss-gallery-filter').forEach(b => {
      const active = b === button; b.classList.toggle('active', active); b.setAttribute('aria-pressed', String(active));
    });
    renderGallery();
  }));
  const fallbackGallery = [
    {
        "type": "image",
        "src": "assets/product-blanket-logo.jpg",
        "caption": "Custom blanket sample",
        "alt": "Kaji Rose Studio custom blanket sample",
        "collection": "Blankets"
    },
    {
        "type": "image",
        "src": "assets/product-tumbler-logo.jpg",
        "caption": "Personalized tumbler sample",
        "alt": "Kaji Rose Studio tumbler sample",
        "collection": "Drinkware"
    },
    {
        "type": "image",
        "src": "assets/product-adult-tshirt.jpg",
        "caption": "Custom adult T-shirt sample",
        "alt": "Kaji Rose Studio custom adult T-shirt sample",
        "collection": "Apparel"
    },
    {
        "type": "image",
        "src": "assets/product-baby-onesie.jpg",
        "caption": "Baby onesie sample",
        "alt": "Kaji Rose Studio baby onesie sample",
        "collection": "Baby & Kids"
    },
    {
        "type": "image",
        "src": "assets/product-kids-tshirt.jpg",
        "caption": "Kids T-shirt sample",
        "alt": "Kaji Rose Studio kids T-shirt sample",
        "collection": "Apparel"
    },
    {
        "type": "image",
        "src": "assets/product-tote-logo.jpg",
        "caption": "Custom tote bag sample",
        "alt": "Kaji Rose Studio tote bag sample",
        "collection": "Bags"
    },
    {
        "type": "image",
        "src": "assets/product-beach-towel-logo.jpg",
        "caption": "Personalized beach towel sample",
        "alt": "Kaji Rose Studio beach towel sample",
        "collection": "Accessories"
    },
    {
        "type": "image",
        "src": "assets/product-water-bottle-plastic.jpg",
        "caption": "Water bottle sample",
        "alt": "Kaji Rose Studio personalized water bottle sample",
        "collection": "Drinkware"
    }
];
  const logoLoader = document.createElement('img');
  logoLoader.addEventListener('load', () => {
    logoAvailable = true;
    sunshineProducts.forEach(product => { product.image = SUNSHINE_LOGO; });
    const activeFilter = document.querySelector('.filters .filter.active')?.dataset.filter || 'all';
    renderProducts(activeFilter);
    document.querySelectorAll('#productGrid .product-card').forEach(card => {
      const img = card.querySelector('img.product-photo[src="assets/sunshine-squad-logo.png"]');
      if (img) img.alt = 'Official Sunshine Squad merchandise logo';
    });
    const heroLogo = document.querySelector('.ss-hero-logo');
    if (heroLogo) {
      heroLogo.hidden = false;
      document.querySelector('.ss-logo-fallback')?.remove();
    }
  });
  logoLoader.src = SUNSHINE_LOGO;

  galleryItems = fallbackGallery;
  renderGallery();
  fetch('studio-gallery.json')
    .then(response => { if (!response.ok) throw Error('Gallery file not found'); return response.json(); })
    .then(data => { galleryItems = Array.isArray(data.items) ? data.items.filter(m =>
      (m.type === 'image' || m.type === 'video') && safeSrc(m.src) && (!m.poster || safeSrc(m.poster))) : fallbackGallery; renderGallery(); })
    .catch(() => { galleryItems = fallbackGallery; renderGallery(); });
})();
