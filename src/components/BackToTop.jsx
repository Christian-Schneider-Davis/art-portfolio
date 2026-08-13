import React, { useEffect, useState } from 'react';

export default function BackToTop() {
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {

    const handleScroll = () => {

      const scrollTop = window.scrollY;

      const documentHeight =
        document.documentElement.scrollHeight;

      const windowHeight =
        window.innerHeight;

      const scrollableHeight =
        documentHeight - windowHeight;

      const scrollPercentage =
        (scrollTop / scrollableHeight) * 100;

      setShowButton(scrollPercentage >= 50);
    };

    window.addEventListener('scroll', handleScroll);

    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };

  }, []);

  const scrollToTop = () => {

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });

  };

  if (!showButton) {
    return null;
  }

  return (
    <button
      className="back-to-top"
      onClick={scrollToTop}
      aria-label="Back to top"
    >
      ↑
    </button>
  );
}