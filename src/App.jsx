import React, { useRef, useState } from 'react'; 
import Header from './components/Header'; 
import Gallery from './components/Gallery'; 
import ArtModal from './components/ArtModal'; 
import { artData } from './data/artData'; 
import Navbar from './components/Navbar';
import About from './components/About';
import Contact from './components/Contact';
import BackToTop from './components/BackToTop';
import SiteFooter from './components/SiteFooter';
import CookieConsent from './components/CookieConsent';
import DynamicGallery from './components/DynamicGallery';
import ModeToggle from './components/ModeToggle';
import useViewMode from './hooks/useViewMode';
  
function App() { 
  const [selectedArt, setSelectedArt] = useState(null); 
  // Dynamic is the default on every new visit (see useViewMode).
  const [viewMode, setViewMode] = useViewMode();
  const mainRef = useRef(null);

  // The two layouts are very different heights; if the visitor switches
  // while already past the top of the gallery, land them at its start.
  const changeMode = (next) => {
    if (next === viewMode) return;
    const main = mainRef.current;
    const top = main ? main.getBoundingClientRect().top + window.scrollY : 0;
    setViewMode(next);
    if (main && window.scrollY > top) {
      requestAnimationFrame(() => window.scrollTo({ top, behavior: 'auto' }));
    }
  };
  
  return ( 
    <div className={`app-container${viewMode === 'dynamic' ? ' is-dynamic' : ''}`}> 
      <Navbar />
      <ModeToggle mode={viewMode} onChange={changeMode} />
      {/* In dynamic mode the name sits inside the gallery's hero screen. */}
      {viewMode === 'simple' && <Header />}

      <main ref={mainRef}> 
        {viewMode === 'dynamic' ? (
          <DynamicGallery
            artPieces={artData}
            onSelect={setSelectedArt}
            paused={Boolean(selectedArt)}
            header={<Header />}
          />
        ) : (
          <Gallery artPieces={artData} onSelect={setSelectedArt} />
        )}
      </main> 

      {selectedArt && ( 
        <ArtModal art={selectedArt} onClose={() => setSelectedArt(null)} /> 
      )} 
      <About />
      <Contact />
      <SiteFooter />
      <BackToTop />
      <CookieConsent />
    </div> 
  ); 
} 
  
export default App;