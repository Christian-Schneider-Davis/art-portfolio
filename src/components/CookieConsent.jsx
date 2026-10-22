import React, { useEffect, useRef, useState } from 'react';
import { CATEGORIES, getConsent, saveConsent } from '../consent/consent';

const privacyHref = `${import.meta.env.BASE_URL}privacy.html`;

export default function CookieConsent() {
  const [open, setOpen] = useState(() => getConsent() === null);
  const [showPrefs, setShowPrefs] = useState(false);
  const [choices, setChoices] = useState(() => {
    const saved = getConsent();
    return {
      analytics: Boolean(saved?.analytics),
      marketing: Boolean(saved?.marketing),
    };
  });
  const panelRef = useRef(null);

  // Footer "Cookie settings" reopens the banner straight into preferences.
  useEffect(() => {
    const reopen = () => {
      const saved = getConsent();
      setChoices({
        analytics: Boolean(saved?.analytics),
        marketing: Boolean(saved?.marketing),
      });
      setShowPrefs(true);
      setOpen(true);
      requestAnimationFrame(() => panelRef.current?.focus());
    };
    window.addEventListener('csd:open-cookie-settings', reopen);
    return () => window.removeEventListener('csd:open-cookie-settings', reopen);
  }, []);

  if (!open) return null;

  const decide = (next) => {
    saveConsent(next);
    setOpen(false);
    setShowPrefs(false);
  };

  return (
    <div
      className="cookie-consent"
      role="dialog"
      aria-modal="false"
      aria-labelledby="cookie-title"
      aria-describedby="cookie-desc"
      tabIndex={-1}
      ref={panelRef}
    >
      <p className="cookie-eyebrow">Cookies</p>
      <h2 id="cookie-title" className="cookie-title">
        Your privacy, your call.
      </h2>
      <p id="cookie-desc" className="cookie-text">
        This site only uses what it needs to work. Optional analytics and
        marketing cookies stay off unless you allow them.{' '}
        <a href={privacyHref}>Privacy policy</a>
      </p>

      {showPrefs && (
        <fieldset className="cookie-prefs">
          <legend className="visually-hidden">Cookie preferences</legend>
          {CATEGORIES.map((cat) => {
            const checked = cat.locked ? true : choices[cat.id];
            return (
              <label key={cat.id} className="cookie-pref">
                <span className="cookie-pref-text">
                  <span className="cookie-pref-label">{cat.label}</span>
                  <span className="cookie-pref-desc">{cat.description}</span>
                </span>
                <input
                  type="checkbox"
                  className="cookie-switch"
                  role="switch"
                  checked={checked}
                  disabled={cat.locked}
                  aria-checked={checked}
                  onChange={(e) =>
                    setChoices((prev) => ({ ...prev, [cat.id]: e.target.checked }))
                  }
                />
              </label>
            );
          })}
        </fieldset>
      )}

      <div className="cookie-actions">
        <button
          type="button"
          className="cookie-btn cookie-btn--ghost"
          onClick={() => decide({ analytics: false, marketing: false })}
        >
          Reject all
        </button>
        <button
          type="button"
          className="cookie-btn cookie-btn--solid"
          onClick={() => decide({ analytics: true, marketing: true })}
        >
          Accept all
        </button>
      </div>

      {showPrefs ? (
        <button
          type="button"
          className="cookie-link"
          onClick={() => decide(choices)}
        >
          Save my choices
        </button>
      ) : (
        <button
          type="button"
          className="cookie-link"
          onClick={() => setShowPrefs(true)}
        >
          Customize
        </button>
      )}
    </div>
  );
}
