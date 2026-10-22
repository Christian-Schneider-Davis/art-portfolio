/*
 * Consent manager
 * ----------------
 * Nothing in the "analytics" or "marketing" categories is allowed to load
 * until the visitor has explicitly opted in.
 *
 * HOW TO ADD A TRACKER LATER (two options):
 *
 * 1) In index.html (or privacy.html), add the script as INERT markup.
 *    Browsers never execute type="text/plain", so it stays blocked:
 *
 *      <script type="text/plain" data-consent="analytics"
 *              data-src="https://www.googletagmanager.com/gtag/js?id=G-XXXX"></script>
 *      <script type="text/plain" data-consent="analytics">
 *        window.dataLayer = window.dataLayer || [];
 *        function gtag(){dataLayer.push(arguments);}
 *        gtag('js', new Date()); gtag('config', 'G-XXXX');
 *      </script>
 *
 *    Pixels / iframes work the same way: put the URL in data-src instead of src
 *      <img data-consent="marketing" data-src="https://..." alt="" width="1" height="1">
 *
 * 2) From JavaScript:
 *      import { whenConsented } from './consent/consent';
 *      whenConsented('analytics', () => { ...load your SDK here... });
 *
 * Never put a tracker in with a normal <script src> — that bypasses consent.
 */

const STORAGE_KEY = 'csd-cookie-consent';

// Bump this when the categories or the privacy policy change materially.
// Visitors will be asked again.
export const CONSENT_VERSION = 1;

// Re-ask after 12 months (Spanish AEPD guidance: no longer than 24).
const MAX_AGE_MS = 365 * 24 * 60 * 60 * 1000;

export const CATEGORIES = [
  {
    id: 'necessary',
    label: 'Strictly necessary',
    description:
      'Remembers your cookie choice. Always on, no tracking.',
    locked: true,
  },
  {
    id: 'analytics',
    label: 'Analytics',
    description:
      'Anonymous stats on which works people view, so I can improve the site.',
  },
  {
    id: 'marketing',
    label: 'Marketing',
    description:
      'Social media pixels that measure visits from ads or shared posts.',
  },
];

// Cookie name patterns set by common trackers — cleared when consent is withdrawn.
const COOKIE_PATTERNS = {
  analytics: [/^_ga/, /^_gid$/, /^_gat/, /^_pk_/, /^_hj/, /^_clck$/, /^_clsk$/, /^plausible/],
  marketing: [/^_fbp$/, /^_fbc$/, /^_gcl_/, /^_ttp$/, /^_pin_/, /^li_/, /^IDE$/],
};

const listeners = new Set();
let current = readStored();

function readStored() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (data.version !== CONSENT_VERSION) return null;
    if (!data.timestamp || Date.now() - data.timestamp > MAX_AGE_MS) return null;
    return data;
  } catch {
    return null;
  }
}

/** The saved choice, or null if the visitor hasn't decided yet. */
export function getConsent() {
  return current;
}

export function hasConsent(category) {
  if (category === 'necessary') return true;
  return Boolean(current && current[category]);
}

/** Save a choice like { analytics: true, marketing: false }. */
export function saveConsent(choices) {
  const previous = current;
  const next = {
    version: CONSENT_VERSION,
    timestamp: Date.now(),
    necessary: true,
    analytics: Boolean(choices.analytics),
    marketing: Boolean(choices.marketing),
  };

  current = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Storage blocked (private mode etc.) — the choice still applies for this visit.
  }

  // Withdrawing consent: scripts that already ran can't be unloaded,
  // so clear their cookies and reload into a clean, untracked page.
  const revoked = ['analytics', 'marketing'].filter(
    (c) => previous && previous[c] && !next[c],
  );
  if (revoked.length) {
    revoked.forEach(clearCookies);
    window.location.reload();
    return next;
  }

  activateConsentedElements();
  listeners.forEach((fn) => fn(next));
  return next;
}

/** Run `fn` once the visitor has consented to `category` (immediately if they already have). */
export function whenConsented(category, fn) {
  if (hasConsent(category)) {
    fn();
    return () => {};
  }
  const listener = () => {
    if (hasConsent(category)) {
      listeners.delete(listener);
      fn();
    }
  };
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Swap inert data-consent elements for live ones, for every category now allowed. */
export function activateConsentedElements() {
  document.querySelectorAll('[data-consent]').forEach((el) => {
    const category = el.getAttribute('data-consent');
    if (!hasConsent(category) || el.dataset.consentActivated) return;
    el.dataset.consentActivated = 'true';

    if (el.tagName === 'SCRIPT') {
      const live = document.createElement('script');
      [...el.attributes].forEach(({ name, value }) => {
        if (['type', 'data-src', 'data-consent', 'data-consent-activated'].includes(name)) return;
        live.setAttribute(name, value);
      });
      if (el.dataset.src) live.src = el.dataset.src;
      else live.textContent = el.textContent;
      el.replaceWith(live);
    } else if (el.dataset.src) {
      el.setAttribute('src', el.dataset.src);
    }
  });
}

function clearCookies(category) {
  const patterns = COOKIE_PATTERNS[category] || [];
  const host = window.location.hostname;
  const domains = ['', host, `.${host}`, `.${host.split('.').slice(-2).join('.')}`];

  document.cookie.split(';').forEach((pair) => {
    const name = pair.split('=')[0].trim();
    if (!patterns.some((re) => re.test(name))) return;
    domains.forEach((domain) => {
      document.cookie =
        `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/` +
        (domain ? `; domain=${domain}` : '');
    });
  });
}

/** Ask the banner to reopen (used by the footer "Cookie settings" link). */
export function openCookieSettings() {
  window.dispatchEvent(new CustomEvent('csd:open-cookie-settings'));
}

// Returning visitors who already opted in: activate their allowed scripts on load.
if (current) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', activateConsentedElements);
  } else {
    activateConsentedElements();
  }
}
