import React, { useState } from 'react'; 
import Header from './components/Header'; 
import Gallery from './components/Gallery'; 
import ArtModal from './components/ArtModal'; 
import { artData } from './data/artData'; 
  
function App() { 
  const [selectedArt, setSelectedArt] = useState(null); 
  const [filter, setFilter] = useState('All'); 
  
  const categories = ['All', ...new Set(artData.map(item => item.category))]; 
  
  const filteredArt = filter === 'All'  
    ? artData  
    : artData.filter(item => item.category === filter); 
  
  return ( 
    <div className="app-container"> 
      <Header /> 
       
      <div className="filter-bar"> 
        {categories.map(cat => ( 
          <button  
            key={cat}  
            className={`filter-btn ${filter === cat ? 'active' : ''}`} 
            onClick={() => setFilter(cat)} 
          > 
            {cat} 
          </button> 
        ))} 
      </div> 
  
      <main> 
        <Gallery artPieces={filteredArt} onSelect={setSelectedArt} /> 
      </main> 
  
      {selectedArt && ( 
        <ArtModal art={selectedArt} onClose={() => setSelectedArt(null)} /> 
      )} 
  
      <footer> 
        <p>© {new Date().getFullYear()} Christian Schneider-Davis. All rights reserved.</p> 
      </footer> 
    </div> 
  ); 
} 
  
export default App; 