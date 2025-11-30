import React from 'react';

function BrandLogos() {
  const logos = [
    { src: '/isseso.png', alt: 'ISSESO Logo' },
    { src: '/DLSL_Official_logo.png', alt: 'DLSL Official Logo' }
  ];

  return (
    <div className="brand-logos">
      {logos.map(l => (
        <img
          key={l.alt}
          src={l.src}
          alt={l.alt}
          className="brand-logo"
          onError={(e) => {
            e.currentTarget.style.visibility = 'hidden';
          }}
        />
      ))}
    </div>
  );
}

export default BrandLogos;