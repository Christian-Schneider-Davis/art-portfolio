import React from 'react';

export default function ArtModal({ art, onClose }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>

      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
      >

        <button
          className="close-btn"
          onClick={onClose}
        >
          &times;
        </button>

        <div className="modal-body">

          <div className="modal-image-container">

            {art.images.map((image, index) => (
              <img
                key={index}
                src={`${import.meta.env.BASE_URL}${image}`}
                alt={`${art.title} - Image ${index + 1}`}
              />
            ))}

          </div>

          <div className="modal-details">

            <h2>{art.title}</h2>

            <p className="modal-meta">
              <strong>Category:</strong> {art.category}
            </p>

            <p className="modal-meta">
              <strong>Medium:</strong> {art.medium} ({art.year})
            </p>

            <p className="modal-desc">
              {art.description}
            </p>

          </div>

        </div>

      </div>

    </div>
  );
}
