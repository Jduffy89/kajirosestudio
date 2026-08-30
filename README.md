# Kaji Rose Studio — GitHub Pages Site

GitHub Pages-ready storefront using the supplied Kaji Rose Studio logo and blush / white / sage-green branding.

## Current customer workflow

1. Customer chooses a fully customizable product.
2. Customer uses the browser customizer for a rough placement preview.
3. The website generates a KRS request number and order summary.
4. The summary is copied and the Kaji Rose Studio Facebook Page / Messenger link opens.
5. Customer pastes the summary and attaches original photos/artwork in Messenger.
6. Kaji Rose Studio creates at least two original design concepts.
7. Customer selects one and receives up to two reasonable revision rounds.
8. Kaji Rose Studio sends the final proof.
9. Customer reviews the proof on `approval.html`, accepts the Terms & Conditions, and electronically signs.
10. Payment becomes available only after signing.
11. Production begins after payment is received.

## Configure Facebook Messenger

Open `script.js` and find:

```js
const siteConfig = {
  facebookPageUrl: ''
};
```

Paste the Kaji Rose Studio Facebook Page or Messenger URL between the quotes.

## Configure payment

Open `approval.js` and find:

```js
const approvalConfig = { paymentUrl: '' };
```

For an early/simple setup you can paste a general hosted payment URL. A better live setup is a unique invoice/payment link per approved order.

## Important signature limitation

`approval.html` currently demonstrates the approval gate and stores the signed record in the customer's browser with `localStorage`. That is useful for testing the workflow but **is not a secure production e-signature record**. Before relying on it for actual customer agreements, connect the approval step to a secure server-side record/e-sign provider so the signed record, timestamp, final proof version, and Terms version are stored outside the customer's browser.

GitHub Pages itself cannot securely store signatures because it only serves static files.

## Pages

- `index.html` — storefront, catalog, FAQ, customizer, Messenger request flow
- `terms.html` — full Kaji Rose Studio Terms & Conditions
- `approval.html` — final design approval, required acknowledgments, signature gate, payment gate
- `script.js` — product catalog and Messenger submission logic
- `approval.js` — approval/signature/payment-gate behavior
- `styles.css` — responsive Kaji Rose Studio styling
- `assets/kaji-rose-logo.png` — supplied logo

## Publish on GitHub Pages

1. Create a GitHub repository, such as `kaji-rose-studio`.
2. Upload every file/folder in this package to the repository root.
3. Go to **Settings → Pages**.
4. Under **Build and deployment**, select **Deploy from a branch**.
5. Select `main` and `/ (root)`.
6. Save.
7. Add the IONOS custom domain in GitHub Pages after the site is working on its GitHub URL.

## Still needed before accepting real orders

- Kaji Rose Studio Facebook Page/Messenger URL
- chosen payment/invoice provider
- secure signature/approval record storage
- business contact/shipping details when finalized
- notebook prices when available
- real product photography as available
