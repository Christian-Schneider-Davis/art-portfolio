import React from 'react'; 
  
export default function ArtCard({ art, onClick }) { 
  return ( 
    <div className="art-card" onClick={onClick}> 
      <div className="card-image-wrapper"> 
        <img src={art.image} alt={art.title} loading="lazy" /> 
        <div className="card-overlay"> 
          <span>View Details</span> 
        </div> 
      </div> 
      <div className="card-info"> 
        <h3>{art.title}</h3> 
        <p>{art.medium} • {art.year}</p> 
      </div> 
    </div> 
  ); 
}