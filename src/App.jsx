import React, { useState } from 'react'; 
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
  
function App() { 
  const [selectedArt, setSelectedArt] = useState(null); 
  
  return ( 
    <div className="app-container"> 
      <Navbar />
      <Header /> 

      <main> 
        <Gallery artPieces={artData} onSelect={setSelectedArt} /> 
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