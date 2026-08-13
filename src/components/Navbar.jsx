import React, { useState } from 'react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const scrollToSection = (sectionId) => {
    const section = document.getElementById(sectionId);

    if (section) {
      section.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }

    setIsOpen(false);
  };

  return (
    <nav className={`navbar ${isOpen ? 'nav-open' : ''}`}>

      <button
        className="nav-toggle"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle navigation"
        aria-expanded={isOpen}
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      <div className="nav-links">

        <button onClick={() => scrollToSection('about')}>
          About
        </button>

        <button onClick={() => scrollToSection('contact')}>
          Contact
        </button>

      </div>

    </nav>
  );
}