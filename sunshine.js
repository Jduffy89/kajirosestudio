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

  // Sunshine Squad has its own complete collection below the regular shop.
  // Keep products in the shared customizer, but do not repeat their cards
  // inside the general store's "All" listing.
  const renderStoreProducts = renderProducts;
  renderProducts = function(filter = 'all') {
    renderStoreProducts(filter);
    if (filter === 'all') {
      document.querySelectorAll('#productGrid [data-product-id]').forEach(button => {
        if (sunshineIds.has(button.dataset.productId)) {
          button.closest('.product-card')?.remove();
        }
      });
    }
  };
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
      <div class="ss-collection-head" id="ss-collection"><div><span class="ss-eyebrow">Shop for a cause</span><h3>Sunshine Squad merchandise</h3></div><p>Choose an item below to prepare your request with Kaji Rose Studio.</p></div>
      <div class="ss-products" id="ssProducts"></div>
    </div>`;
  const existingProducts = document.getElementById('products');
  // Regular store products first, then the Sunshine Squad collection.
  if (existingProducts) existingProducts.after(section);

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
    button.className = 'ss-button ss-product-action'; button.textContent = 'Customize & Add';
    button.addEventListener('click', () => openCustomizer(p.id));
    bottom.append(price, button); content.append(heading, description, bottom);
    card.append(illustration, content); productContainer.appendChild(card);
  });

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

  // CLASSIC STUDIO PORTFOLIO — separate from Sunshine Squad shopping.
  // Metadata, captions and photo/video sources live in studio-gallery.json.
  const gallery = document.createElement('section');
  gallery.id = 'gallery';
  gallery.className = 'ss-gallery-section ss-classic-gallery';
  gallery.setAttribute('aria-labelledby','ss-gallery-title');
  gallery.innerHTML = `
    <div class="wrap">
      <div class="ss-gallery-heading">
        <div>
          <span class="ss-eyebrow">The Kaji Rose Studio portfolio</span>
          <h2 id="ss-gallery-title">A little gallery of everything we make.</h2>
        </div>
        <p>Explore custom gifts, apparel, keepsakes, artwork, and Sunshine Squad creations. Select any project to see a larger photo or video.</p>
      </div>
      <div class="ss-gallery-toolbar">
        <div class="ss-gallery-filters" role="group" aria-label="Filter work by category">
          <button type="button" class="ss-gallery-filter active" data-gallery-category="all" aria-pressed="true">All Work</button>
          <button type="button" class="ss-gallery-filter" data-gallery-category="blankets" aria-pressed="false">Blankets</button>
          <button type="button" class="ss-gallery-filter" data-gallery-category="apparel" aria-pressed="false">Apparel</button>
          <button type="button" class="ss-gallery-filter" data-gallery-category="tumblers" aria-pressed="false">Tumblers</button>
          <button type="button" class="ss-gallery-filter" data-gallery-category="accessories" aria-pressed="false">Accessories</button>
          <button type="button" class="ss-gallery-filter" data-gallery-category="sunshine" aria-pressed="false">Sunshine Squad</button>
          <button type="button" class="ss-gallery-filter" data-gallery-category="artwork" aria-pressed="false">Art &amp; Designs</button>
          <button type="button" class="ss-gallery-filter" data-gallery-category="videos" aria-pressed="false">Videos</button>
        </div>
        <p id="ssGalleryCount" class="ss-gallery-count" aria-live="polite"></p>
      </div>
      <div class="ss-gallery-grid" id="ssGalleryGrid"></div>
      <p class="ss-gallery-empty" id="ssGalleryEmpty" hidden>No projects in this category yet.</p>
      <div class="ss-gallery-more-wrap">
        <button class="ss-gallery-more" id="ssGalleryMore" type="button" hidden>Show More Projects <span aria-hidden="true">↓</span></button>
      </div>
    </div>
    <dialog class="ss-lightbox" id="ssLightbox" aria-labelledby="ssLightboxCaption">
      <div class="ss-lightbox-inner">
        <div class="ss-viewer-header">
          <span class="ss-viewer-counter" id="ssViewerCounter"></span>
          <button type="button" class="ss-lightbox-close" aria-label="Close gallery viewer">×</button>
        </div>
        <div class="ss-viewer-stage">
          <button class="ss-viewer-arrow ss-viewer-prev" type="button" aria-label="Previous project">‹</button>
          <div id="ssLightboxContent"></div>
          <button class="ss-viewer-arrow ss-viewer-next" type="button" aria-label="Next project">›</button>
        </div>
        <p id="ssLightboxCaption"></p>
        <p id="ssLightboxCategory" class="ss-viewer-category"></p>
      </div>
    </dialog>`;
  // Keep the whole studio gallery below BOTH stores, above How It Works.
  const galleryPlacement = document.getElementById('how') || document.querySelector('footer');
  galleryPlacement?.before(gallery);

  const galleryGrid = document.getElementById('ssGalleryGrid');
  const galleryEmpty = document.getElementById('ssGalleryEmpty');
  const galleryCount = document.getElementById('ssGalleryCount');
  const galleryMore = document.getElementById('ssGalleryMore');
  const viewer = document.getElementById('ssLightbox');
  const viewerContent = document.getElementById('ssLightboxContent');
  const viewerCaption = document.getElementById('ssLightboxCaption');
  const viewerCategory = document.getElementById('ssLightboxCategory');
  const viewerCounter = document.getElementById('ssViewerCounter');
  let galleryItems = [];
  let visibleItems = [];
  let selectedCategory = 'all';
  let shown = 16;
  let selectedIndex = 0;
  let viewing = false;
  const PAGE_SIZE = 16;
  // Only same-site assets and HTTPS image URLs; untrusted markup is never inserted.
  const safeSrc = value => typeof value === 'string' &&
    /^(?:assets\/[a-z0-9_./%\-]+|https:\/\/[\w.\-]+\/[a-z0-9_./%?=&\-]+)$/i.test(value) &&
    !value.split('/').includes('..');
  const categoryLabels = {
    blankets:'Blankets', apparel:'Apparel', tumblers:'Tumblers',
    accessories:'Bags & Accessories', sunshine:'Sunshine Squad',
    artwork:'Art & Designs', videos:'Videos'
  };
  const photoCount = () => galleryItems.filter(item => item.type === 'image').length;
  const videoCount = () => galleryItems.filter(item => item.type === 'video').length;
  const matches = item => selectedCategory === 'all' ||
    (selectedCategory === 'videos' ? item.type === 'video' : item.category === selectedCategory);
  const make = (tag, className, text) => {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (text !== undefined) el.textContent = String(text);
    return el;
  };
  const clearViewerMedia = () => {
    viewerContent.querySelector('video')?.pause();
    viewerContent.replaceChildren();
  };
  function showMedia(index) {
    if (!visibleItems.length) return;
    selectedIndex = (index + visibleItems.length) % visibleItems.length;
    const item = visibleItems[selectedIndex];
    clearViewerMedia();
    const element = document.createElement(item.type === 'video' ? 'video' : 'img');
    element.src = item.src;
    if (item.type === 'video') {
      element.controls = true;
      element.playsInline = true;
      element.preload = 'metadata';
      if (safeSrc(item.poster)) element.poster = item.poster;
    } else element.alt = item.alt || item.caption || 'Kaji Rose Studio project';
    viewerContent.appendChild(element);
    viewerCaption.textContent = item.caption || 'Kaji Rose Studio project';
    viewerCategory.textContent = categoryLabels[item.category] || 'Studio Portfolio';
    viewerCounter.textContent = `${selectedIndex + 1} of ${visibleItems.length}`;
    if (!viewer.open) {
      if (typeof viewer.showModal === 'function') viewer.showModal();
      else viewer.setAttribute('open','');
    }
    viewing = true;
  }
  function closeMedia() {
    if (typeof viewer.close === 'function' && viewer.open) viewer.close();
    else viewer.removeAttribute('open');
    clearViewerMedia();
    viewing = false;
  }
  viewer.querySelector('.ss-lightbox-close').addEventListener('click', closeMedia);
  viewer.querySelector('.ss-viewer-prev').addEventListener('click', () => showMedia(selectedIndex - 1));
  viewer.querySelector('.ss-viewer-next').addEventListener('click', () => showMedia(selectedIndex + 1));
  viewer.addEventListener('click', e => { if (e.target === viewer) closeMedia(); });
  viewer.addEventListener('close', () => { clearViewerMedia(); viewing = false; });
  viewer.addEventListener('keydown', e => {
    if (!viewing || e.target?.tagName === 'VIDEO') return;
    if (e.key === 'ArrowLeft') { e.preventDefault(); showMedia(selectedIndex - 1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); showMedia(selectedIndex + 1); }
  });

  function makeCard(item, index) {
    const button = make('button','ss-gallery-item');
    button.type = 'button';
    button.setAttribute('aria-label', `View ${item.type === 'video' ? 'video' : 'photo'}: ${item.caption || 'studio project'}`);
    const preview = make('div','ss-gallery-preview');
    if (item.type === 'image' || safeSrc(item.poster)) {
      const picture = document.createElement('img');
      picture.src = item.type === 'video' ? item.poster : item.src;
      picture.alt = item.alt || item.caption || 'Studio project';
      picture.loading = index < 4 ? 'eager' : 'lazy';
      picture.decoding = 'async';
      if (index < 4) picture.fetchPriority = 'low';
      picture.addEventListener('error', () => {
        preview.classList.add('ss-media-unavailable'); picture.remove();
      });
      preview.appendChild(picture);
    }
    if (item.type === 'video') {
      preview.appendChild(make('span','ss-video-badge','▶ Video'));
      preview.appendChild(make('span','ss-gallery-play','▶'));
    }
    const content = make('div','ss-gallery-caption');
    content.appendChild(make('span','ss-gallery-card-category',categoryLabels[item.category] || 'Studio Work'));
    content.appendChild(make('strong','',item.caption || 'Kaji Rose Studio creation'));
    button.append(preview,content);
    button.addEventListener('click', () => showMedia(index));
    return button;
  }
  function renderGallery() {
    // A uniform grid of cards: only paint the first page and reveal more on demand.
    visibleItems = galleryItems.filter(matches);
    const displayed = visibleItems.slice(0,shown);
    galleryGrid.replaceChildren(...displayed.map(makeCard));
    galleryEmpty.hidden = visibleItems.length > 0;
    galleryEmpty.textContent = selectedCategory === 'videos'
      ? 'Videos will be added here as they become available.'
      : 'More work from this category is coming soon.';
    galleryCount.textContent = `${displayed.length} of ${visibleItems.length} projects · ${photoCount()} photos & ${videoCount()} video${videoCount() === 1 ? '' : 's'} total`;
    galleryMore.hidden = visibleItems.length <= shown;
    if (!galleryMore.hidden) galleryMore.textContent = `Show More Projects (${visibleItems.length-shown} remaining) ↓`;
  }
  gallery.querySelectorAll('[data-gallery-category]').forEach(button => button.addEventListener('click', () => {
    selectedCategory = button.dataset.galleryCategory;
    shown = PAGE_SIZE;
    gallery.querySelectorAll('[data-gallery-category]').forEach(b => {
      const active = b === button;
      b.classList.toggle('active', active);
      b.setAttribute('aria-pressed', String(active));
    });
    renderGallery();
  }));
  galleryMore.addEventListener('click', () => { shown += PAGE_SIZE; renderGallery(); });
  // If gallery data is still being uploaded, display the existing product samples.
  const fallbackGallery = [
    {type:'image',src:'assets/product-blanket-logo.jpg',caption:'Custom blanket sample',category:'blankets'},
    {type:'image',src:'assets/product-tumbler-logo.jpg',caption:'Personalized tumbler sample',category:'tumblers'},
    {type:'image',src:'assets/product-adult-tshirt.jpg',caption:'Custom graphic T-shirt sample',category:'apparel'},
    {type:'image',src:'assets/product-tote-logo.jpg',caption:'Custom tote bag sample',category:'accessories'}
  ];
  galleryItems = fallbackGallery;
  renderGallery();

  // Preserve the original Sunshine Squad logo on every collection item.
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

  fetch('studio-gallery.json', { cache:'no-store' })
    .then(response => { if (!response.ok) throw new Error('Gallery file not found'); return response.json(); })
    .then(data => {
      if (!Array.isArray(data.items)) throw new Error('Invalid gallery data');
      const validCategories = new Set(['blankets','apparel','tumblers','accessories','sunshine','artwork']);
      const loaded = data.items.filter(item => item &&
        ['image','video'].includes(item.type) && safeSrc(item.src) &&
        (!item.poster || safeSrc(item.poster)) &&
        validCategories.has(item.category));
      if (!loaded.length) throw new Error('Gallery has no entries');
      galleryItems = loaded;
      renderGallery();
    })
    .catch(err => {
      console.warn('Studio gallery unavailable; displaying built-in samples.', err);
      galleryItems = fallbackGallery;
      renderGallery();
    });
})();
