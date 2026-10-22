import React from 'react';
import { openCookieSettings } from '../consent/consent';

const CONTACT_EMAIL = 'schneiderdavis@aol.com';
const LAST_UPDATED = '22 October 2026';

export default function PrivacyPolicy() {
  return (
    <article className="privacy-page">
      <a className="privacy-back" href={import.meta.env.BASE_URL}>
        ← Back to the gallery
      </a>

      <header className="privacy-header">
        <h1>Privacy Policy</h1>
        <p className="privacy-updated">Last updated: {LAST_UPDATED}</p>
        <div className="header-line"></div>
      </header>

      <section>
        <h2>The short version</h2>
        <p>
          This is a personal art portfolio. It doesn’t sell your data, run ads,
          or build profiles of visitors. Optional analytics or marketing
          cookies are never loaded unless you say yes, and you can change your
          mind at any time.
        </p>
      </section>

      <section>
        <h2>Who is responsible for your data</h2>
        <p>
          Christian Schneider-Davis, an individual artist based in Barcelona,
          Spain, is the data controller for this website. You can reach me at{' '}
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
        </p>
      </section>

      <section>
        <h2>What data is collected and why</h2>

        <h3>When you contact me</h3>
        <p>
          The contact form doesn’t send anything to a server. When you press
          “Send”, it opens your own email app with your message pre-filled, and
          nothing leaves your device until you send that email yourself. I then
          receive your name, email address and whatever you wrote. I use this
          only to reply to you and handle your enquiry (commissions, sales,
          collaborations). The legal basis is your request and my legitimate
          interest in answering it (GDPR Art. 6(1)(b) and (f)). I keep this
          correspondence only as long as needed for that purpose, or as long as
          the law requires for things like sales records.
        </p>

        <h3>Hosting and server logs</h3>
        <p>
          The site is hosted on GitHub Pages, run by GitHub, Inc. When you
          visit, GitHub may log technical data such as your IP address to keep
          the service secure and running. I don’t have access to these logs and
          don’t use them to identify anyone. GitHub may process this data in
          the United States. See the{' '}
          <a
            href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub Privacy Statement
          </a>{' '}
          for details.
        </p>
      </section>

      <section>
        <h2>Cookies and similar technologies</h2>
        <p>
          The site groups cookies and similar technologies (like browser
          storage) into three categories:
        </p>
        <ul>
          <li>
            <strong>Strictly necessary.</strong> One entry in your browser’s
            local storage (<code>csd-cookie-consent</code>) remembers your
            cookie choice so you aren’t asked again on every visit. It stays on
            your device, isn’t shared, and expires after 12 months. Because it
            is needed to respect your choice, it doesn’t require consent.
          </li>
          <li>
            <strong>Analytics (optional).</strong> Anonymous statistics about
            which pages and artworks are viewed. Only loaded if you accept.
          </li>
          <li>
            <strong>Marketing (optional).</strong> Social media or advertising
            pixels that measure visits coming from posts or ads. Only loaded if
            you accept.
          </li>
        </ul>
        <p>
          At the moment, no analytics or marketing tools are active on this
          site. If I add any, they will only run after you opt in, and this
          policy will be updated to name the provider. When it changes in a
          meaningful way, you’ll be asked for your choice again.
        </p>
        <p>
          <button type="button" className="privacy-settings-btn" onClick={openCookieSettings}>
            Change cookie settings
          </button>
        </p>
        <p>
          If you withdraw consent, optional cookies are deleted and the page
          reloads without them.
        </p>
      </section>

      <section>
        <h2>Fonts, embeds and links</h2>
        <p>
          The site uses fonts already on your device and loads no third-party
          scripts, fonts or embeds by default. It links to external sites such
          as Instagram and Wikipedia. Those sites have their own privacy
          policies, which apply once you follow a link.
        </p>
      </section>

      <section>
        <h2>Sharing your data</h2>
        <p>
          I don’t sell, rent or trade personal data. Data is only shared with
          the service providers needed to run the site and my email (GitHub
          for hosting, and my email provider for messages you send me), or if
          the law requires it.
        </p>
      </section>

      <section>
        <h2>Your rights</h2>
        <p>
          Under the GDPR and Spanish data protection law (LOPDGDD), you can ask
          to access, correct or delete your personal data. You can also ask me
          to restrict or stop processing it, or to send it to you in a portable
          format. Where processing is based on consent, you can withdraw it at
          any time. To exercise any of these rights, email{' '}
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>. I’ll reply
          within one month.
        </p>
        <p>
          If you think your data has been mishandled, you can complain to the
          Spanish data protection authority, the{' '}
          <a href="https://www.aepd.es" target="_blank" rel="noopener noreferrer">
            Agencia Española de Protección de Datos (AEPD)
          </a>
          , or to the authority in your own country.
        </p>
      </section>

      <section>
        <h2>Children</h2>
        <p>
          This site isn’t aimed at children under 14, and I don’t knowingly
          collect their data.
        </p>
      </section>

      <section>
        <h2>Changes to this policy</h2>
        <p>
          If this policy changes, I’ll update the date at the top of this page.
          Significant changes will also trigger a new cookie prompt.
        </p>
      </section>
    </article>
  );
}
