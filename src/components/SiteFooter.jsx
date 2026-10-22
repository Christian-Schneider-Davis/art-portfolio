import React from 'react';
import { openCookieSettings } from '../consent/consent';

export default function SiteFooter() {
  return (
    <footer>
      <p>© {new Date().getFullYear()} Christian Schneider-Davis. All rights reserved.</p>
      <p className="footer-links">
        <a href={`${import.meta.env.BASE_URL}privacy.html`}>Privacy policy</a>
        <span aria-hidden="true">·</span>
        <button type="button" onClick={openCookieSettings}>
          Cookie settings
        </button>
      </p>
    </footer>
  );
}
