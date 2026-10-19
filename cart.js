/* Kaji Rose Studio • multi-item quote cart, no payment processing.
   Works on GitHub Pages: FormSubmit AJAX emails a combined request.
   First-use email activation must be completed by Kaji. */
(() => {
  'use strict';
  if (!document.getElementById('requestForm') || typeof products === 'undefined') return;

  const CART_KEY = 'kaji-rose-studio-quote-cart-v1';
  const EMAIL_ENDPOINT = 'https://formsubmit.co/ajax/kajirosestudio@gmail.com';
  const normalForm = document.getElementById('requestForm');
  const productSelect = document.getElementById('productSelect');
  const variantSelect = document.getElementById('variantSelect');
  const qtyInput = document.getElementById('quantity');
  const countLabel = 'Quote cart';
  const money = amount => '$' + Number(amount).toFixed(2);
  const cleanText = v => String(v || '').trim();
  const capQuantity = v => Math.max(1, Math.min(99, Math.floor(Number(v) || 1)));
  let cart = [];
  try {
    const stored = JSON.parse(localStorage.getItem(CART_KEY) || '[]');
    if (Array.isArray(stored)) cart = stored.filter(x => x && typeof x.productId === 'string' && typeof x.name === 'string' && Number.isFinite(x.qty) && x.qty >= 1).slice(0, 100);
  } catch (_) { cart = []; }

  const nav = document.getElementById('mainNav');
  if (nav && !nav.querySelector('#quoteCartNav')) {
    const link = document.createElement('a'); link.href = '#quote-cart'; link.id = 'quoteCartNav';
    link.textContent = 'Cart (0)'; link.setAttribute('aria-label', 'Open quote request cart');
    nav.append(link);
    link.addEventListener('click', ev => { ev.preventDefault(); openCart(); nav.classList.remove('open'); document.getElementById('menuToggle')?.setAttribute('aria-expanded','false'); });
  }
  const cartDock = document.createElement('button');
  cartDock.type = 'button'; cartDock.className = 'krs-cart-dock'; cartDock.id = 'krsCartDock';
  cartDock.textContent = '🛒 Request Cart (0)'; cartDock.setAttribute('aria-label', 'Open request cart');
  cartDock.addEventListener('click', openCart);
  document.body.append(cartDock);

  const dialog = document.createElement('dialog');
  dialog.id = 'quoteCartDialog'; dialog.className = 'krs-cart-dialog';
  dialog.setAttribute('aria-labelledby', 'quoteCartTitle');
  dialog.innerHTML = `
    <div class="krs-cart-body">
      <header class="krs-cart-header"><div><span class="krs-cart-eyebrow">Multiple items • One email request</span><h2 id="quoteCartTitle">Your Request Cart</h2></div><button class="krs-cart-close" type="button" aria-label="Close cart">×</button></header>
      <p class="krs-cart-intro">This is a <strong>quote request, not an order or payment.</strong> Add as many items as you wish. Kaji Rose Studio will review your details and email the confirmed total, including shipping, before payment.</p>
      <div id="krsCartLines" class="krs-cart-lines" aria-live="polite"></div>
      <div class="krs-cart-totals" id="krsCartTotals"></div>
      <form id="krsQuoteForm">
        <h3>Where should Kaji send your quote?</h3>
        <div class="krs-cart-fields two">
          <label>Full name <input name="name" type="text" maxlength="120" autocomplete="name" required></label>
          <label>Email <input name="email" type="email" maxlength="254" autocomplete="email" required></label>
          <label>Phone (optional) <input name="phone" type="tel" maxlength="40" autocomplete="tel"></label>
          <label>Shipping method <select name="fulfillment" id="krsFulfillment"><option value="Ship to my address">Ship to my address</option><option value="Ask about local pickup">Ask about local pickup</option></select></label>
        </div>
        <fieldset id="krsShippingFields" class="krs-ship-fieldset"><legend>Shipping address (for final shipping quote)</legend>
          <div class="krs-cart-fields two">
            <label class="wide">Street address <input name="street" maxlength="180" autocomplete="shipping street-address" required></label>
            <label>City <input name="city" maxlength="100" autocomplete="shipping address-level2" required></label>
            <label>State / Province <input name="state" maxlength="100" autocomplete="shipping address-level1" required></label>
            <label>ZIP / Postal code <input name="postal" maxlength="25" autocomplete="shipping postal-code" required></label>
            <label>Country <input name="country" value="United States" maxlength="100" autocomplete="shipping country-name" required></label>
          </div>
        </fieldset>
        <label class="krs-cart-note-label">Additional instructions for the full cart
          <textarea name="orderNotes" maxlength="3000" rows="3" placeholder="Delivery timing, special questions, requests that apply to every item…"></textarea>
        </label>
        <label class="krs-cart-confirm"><input type="checkbox" required><span>I understand this is a request for a final price including shipping, not a completed purchase, and that Kaji Rose Studio will contact me by email about my request. No payment information is collected here.</span></label>
        <p class="krs-cart-privacy">Your information and request will be emailed through the third-party service FormSubmit. Photos/artwork are not uploaded through this form; Kaji can arrange to receive them through Messenger.</p>
        <input class="krs-trap" name="_honey" autocomplete="off" tabindex="-1" aria-hidden="true">
        <div class="krs-cart-status" id="krsCartStatus" role="status" aria-live="polite"></div>
        <div class="krs-cart-actions"><button class="krs-cart-secondary" type="button" id="krsContinueShopping">Continue shopping</button><button class="krs-cart-primary" type="submit" id="krsSubmitQuote">Email My Cart for a Final Quote</button></div>
      </form>
    </div>`;
  document.body.append(dialog);
  const lines = dialog.querySelector('#krsCartLines');
  const totals = dialog.querySelector('#krsCartTotals');
  const form = dialog.querySelector('#krsQuoteForm');
  const status = dialog.querySelector('#krsCartStatus');
  const submit = dialog.querySelector('#krsSubmitQuote');

  function store() {
    try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch (_) { /* disabled/private storage */ }
    draw();
  }
  function count() { return cart.reduce((sum, i) => sum + capQuantity(i.qty), 0); }
  function priced() { return cart.reduce((sum, i) => sum + (Number.isFinite(i.unitPrice) ? i.unitPrice * capQuantity(i.qty) : 0), 0); }
  function unknownCount() { return cart.filter(i => !Number.isFinite(i.unitPrice)).length; }
  function donation() { return cart.reduce((sum, i) => sum + (i.sunshine ? 5 * capQuantity(i.qty) : 0), 0); }
  function el(tag, cls, value) {
    const e = document.createElement(tag); if (cls) e.className = cls; if (value !== undefined) e.textContent = String(value); return e;
  }
  function detailText(i) {
    const details = [];
    const pairs = [
      ['For', i.details.recipient], ['Occasion',i.details.occasion], ['Custom text',i.details.customText],
      ['Colors',i.details.colors], ['Needed by',i.details.deadline], ['Favorite things',i.details.favorites],
      ['Avoid',i.details.avoid], ['Design notes',i.details.notes]
    ];
    pairs.forEach(([k,v]) => { if (cleanText(v)) details.push(`${k}: ${cleanText(v)}`); });
    return details.join(' | ');
  }
  function draw() {
    const num = count();
    const navCart = document.getElementById('quoteCartNav');
    if (navCart) navCart.textContent = `Cart (${num})`;
    cartDock.textContent = `🛒 Request Cart (${num})`;
    lines.replaceChildren();
    if (!cart.length) {
      lines.append(el('p','krs-cart-empty','Your cart is empty. Select an item and choose “Add Item to Request Cart” to get started.'));
    }
    cart.forEach((item,index) => {
      const row = el('article','krs-cart-line');
      const description = el('div','krs-cart-line-description');
      description.append(el('strong','',item.name));
      description.append(el('p','',item.variant));
      const note = detailText(item);
      if (note) description.append(el('small','',note));
      if (item.sunshine) description.append(el('small','krs-cart-cause',`Sunshine Squad • $${5*capQuantity(item.qty)} minimum donation included`));
      const actions = el('div','krs-cart-line-actions');
      const price = el('strong','',Number.isFinite(item.unitPrice) ? money(item.unitPrice * capQuantity(item.qty)) : 'Price on request');
      const amount = el('div','krs-cart-qty');
      const minus = el('button','','−'); minus.type='button'; minus.dataset.action='minus'; minus.dataset.index=String(index); minus.setAttribute('aria-label',`Decrease quantity of ${item.name}`);
      const number = el('span','',capQuantity(item.qty));
      const plus = el('button','','+'); plus.type='button'; plus.dataset.action='plus'; plus.dataset.index=String(index); plus.setAttribute('aria-label',`Increase quantity of ${item.name}`);
      amount.append(minus,number,plus);
      const remove = el('button','krs-cart-remove','Remove'); remove.type='button'; remove.dataset.action='remove'; remove.dataset.index=String(index); remove.setAttribute('aria-label',`Remove ${item.name}`);
      actions.append(price,amount,remove); row.append(description,actions); lines.append(row);
    });
    totals.replaceChildren();
    totals.append(el('strong','',`Estimated merchandise subtotal: ${money(priced())}${unknownCount() ? ' + items priced on request' : ''}`));
    totals.append(el('small','', 'Shipping, applicable tax, and any final adjustments are NOT included. Kaji will email the actual quote before payment.'));
    if (donation()) totals.append(el('small','krs-cart-cause', `Sunshine Squad minimum donation included in listed merchandise prices: ${money(donation())}. No added fee.`));
    submit.disabled = !cart.length;
  }
  lines.addEventListener('click', ev => {
    const button = ev.target.closest('button[data-action]'); if (!button) return;
    const index = Number(button.dataset.index);
    if (!Number.isInteger(index) || index < 0 || index >= cart.length) return;
    const action = button.dataset.action;
    if (action === 'remove') cart.splice(index,1);
    if (action === 'plus') cart[index].qty = capQuantity(cart[index].qty+1);
    if (action === 'minus') cart[index].qty <= 1 ? cart.splice(index,1) : cart[index].qty--;
    status.textContent = '';
    store();
  });
  function openCart() {
    draw();
    if (typeof dialog.showModal === 'function' && !dialog.open) dialog.showModal();
    else dialog.setAttribute('open','');
  }
  function closeCart() { if (typeof dialog.close === 'function' && dialog.open) dialog.close(); else dialog.removeAttribute('open'); }
  dialog.querySelector('.krs-cart-close').addEventListener('click', closeCart);
  dialog.querySelector('#krsContinueShopping').addEventListener('click', closeCart);
  dialog.addEventListener('click', ev => { if (ev.target === dialog) closeCart(); });

  // Stop the legacy single-item Messenger submit and add the customized line to cart instead.
  normalForm.addEventListener('submit', ev => {
    ev.preventDefault(); ev.stopImmediatePropagation();
    const product = products.find(p => p.id === productSelect.value);
    const option = product?.variants[Number(variantSelect.value)];
    if (!product || !option) return;
    if (cart.length >= 100) { alert('The cart can hold at most 100 different item requests.'); return; }
    const get = id => cleanText(document.getElementById(id)?.value);
    const sunshine = product.category === 'sunshine' || product.id.startsWith('sunshine-');
    // Previous Sunshine extension may temporarily append a pledge to the notes on submit.
    const notes = get('designNotes').split('SUNSHINE SQUAD ARTWORK:')[0].trim();
    cart.push({
      productId: product.id, name: product.name, variant: String(option[0]),
      unitPrice: option[1] === null || option[1] === undefined ? null : Number(option[1]),
      qty: capQuantity(qtyInput.value), sunshine,
      details: { recipient:get('intendedFor'), occasion:get('occasionPurpose'), customText:get('customText'),
        colors:get('colorScheme'), deadline:get('designDeadline'), favorites:get('favoriteThings'),
        avoid:get('designAvoid'), notes }
    });
    store();
    if (typeof closeCustomizer === 'function') closeCustomizer();
    normalForm.reset();
    if (typeof updateVariants === 'function') updateVariants();
    status.textContent = '';
    openCart();
  }, true);

  const shippingSelect = dialog.querySelector('#krsFulfillment');
  function updateShippingRequired() {
    const shipping = shippingSelect.value === 'Ship to my address';
    dialog.querySelector('#krsShippingFields').hidden = !shipping;
    dialog.querySelectorAll('#krsShippingFields input').forEach(i => { i.required = shipping; });
  }
  shippingSelect.addEventListener('change', updateShippingRequired);
  updateShippingRequired();

  function numberId() {
    const d = new Date();
    return 'KRS-CART-' + [d.getFullYear(), String(d.getMonth()+1).padStart(2,'0'), String(d.getDate()).padStart(2,'0')].join('') + '-' + Math.floor(10000 + Math.random()*90000);
  }
  function makeSummary(no, data) {
    const addr = shippingSelect.value === 'Ship to my address' ?
      [data.street, data.city, data.state, data.postal, data.country].filter(Boolean).join(', ') : 'Pickup requested; confirm arrangements';
    const items = cart.map((i, index) => {
      const parts = [`${index+1}. ${i.name}`,`Option: ${i.variant}`,`Quantity: ${capQuantity(i.qty)}`,
        `Listed unit price: ${Number.isFinite(i.unitPrice) ? money(i.unitPrice) : 'To be confirmed'}`,
        `Line estimate: ${Number.isFinite(i.unitPrice) ? money(i.unitPrice*capQuantity(i.qty)) : 'To be confirmed'}`];
      if (i.sunshine) parts.push(`Sunshine Squad donation INCLUDED in price: at least ${money(5*capQuantity(i.qty))} for this line.`);
      const detail = detailText(i); if (detail) parts.push('Customization: ' + detail);
      return parts.join('\n');
    }).join('\n\n');
    return `KAJI ROSE STUDIO — MULTI-ITEM QUOTE REQUEST\nRequest number: ${no}\n\nCUSTOMER\nName: ${data.name}\nEmail: ${data.email}\nPhone: ${data.phone||'Not supplied'}\nFulfillment: ${data.fulfillment}\nShipping destination: ${addr}\nCart instructions: ${data.orderNotes||'None'}\n\nCART ITEMS (${count()} total units)\n${items}\n\nESTIMATED MERCHANDISE SUBTOTAL: ${money(priced())}${unknownCount() ? ` + ${unknownCount()} item line(s) priced on request` : ''}\nSHIPPING: To be quoted by Kaji Rose Studio\nTAX / ADJUSTMENTS: To be confirmed\nSUNSHINE SQUAD MINIMUM DONATION ALREADY INCLUDED: ${money(donation())}\nFINAL TOTAL: Not yet determined — Kaji Rose Studio will reply with price including shipping.\n\nCustomer is requesting a quote only. No payment collected, no order confirmed, no final proof approved. Original artwork may follow separately through Messenger.`;
  }
  form.addEventListener('submit', async ev => {
    ev.preventDefault();
    if (!cart.length || submit.disabled) return;
    const data = Object.fromEntries(new FormData(form).entries());
    if (data._honey) return;
    const id = numberId();
    const summary = makeSummary(id,data);
    const payload = new FormData();
    payload.set('_subject', `Kaji Rose Studio: New cart quote request ${id}`);
    payload.set('_replyto', data.email);
    payload.set('_captcha', 'false');
    payload.set('_honey','');
    payload.set('name', data.name);
    payload.set('email', data.email);
    payload.set('phone', data.phone || 'Not provided');
    payload.set('request_number', id);
    payload.set('shipping_address', shippingSelect.value === 'Ship to my address' ?
      [data.street,data.city,data.state,data.postal,data.country].join(', ') : 'Local pickup requested');
    payload.set('message', summary);
    status.className = 'krs-cart-status';
    status.replaceChildren();
    status.textContent = 'Sending your quote request…';
    submit.disabled = true;
    try {
      const response = await fetch(EMAIL_ENDPOINT, {method:'POST', body:payload, headers:{Accept:'application/json'}});
      let result; try { result = await response.json(); } catch (_) { result = null; }
      if (!response.ok || !(result && (result.success === true || result.success === 'true'))) {
        throw new Error(cleanText(result?.message) || 'Email service did not confirm delivery.');
      }
      cart = [];
      store();
      form.reset(); updateShippingRequired();
      status.className = 'krs-cart-status success';
      status.textContent = `Request ${id} was accepted by the email service! This is not a paid order. Please watch your inbox for Kaji’s final quote including shipping. If this is the service's first use, Kaji must also confirm the FormSubmit activation email.`;
    } catch (error) {
      status.className = 'krs-cart-status error';
      status.replaceChildren();
      status.append(el('strong','', 'We could not confirm that your email request was delivered. Your cart is still saved.'));
      status.append(el('p','', 'Copy the complete request below and email it to kajirosestudio@gmail.com, or try again later.'));
      const textarea = el('textarea','krs-fallback-textarea',summary); textarea.readOnly=true; textarea.rows=7;
      status.append(textarea);
      const copy = el('button','krs-cart-secondary','Copy request'); copy.type='button';
      copy.addEventListener('click', async () => {
        try { await navigator.clipboard.writeText(summary); copy.textContent = 'Copied'; }
        catch (_) { textarea.focus(); textarea.select(); }
      });
      const mail = el('a','krs-cart-mailto','Open email app');
      mail.href = 'mailto:kajirosestudio@gmail.com?subject=' + encodeURIComponent('Kaji Rose Studio quote request ' + id) + '&body=' + encodeURIComponent(summary.slice(0,1600) + '\n\n(See copied full request for any additional items.)');
      status.append(copy,mail);
    } finally { submit.disabled = !cart.length; }
  });
  draw();
})();
