import React from 'react'
import ReactDOM from 'react-dom/client'
import PrivacyPolicy from './components/PrivacyPolicy.jsx'
import CookieConsent from './components/CookieConsent.jsx'
import SiteFooter from './components/SiteFooter.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <div className="app-container">
      <PrivacyPolicy />
      <SiteFooter />
      <CookieConsent />
    </div>
  </React.StrictMode>,
)
