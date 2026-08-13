import React from 'react'; 
import ArtCard from './ArtCard'; 
  
export default function Gallery({ artPieces, onSelect }) { 
  if (artPieces.length === 0) { 
    return <p className="no-results">No artwork found in this category.</p>; 
  } 
  
  return ( 
    <div className="gallery-grid"> 
      {artPieces.map(art => ( 
        <ArtCard key={art.id} art={art} onClick={() => onSelect(art)} /> 
      ))} 
    </div> 
  ); 
}