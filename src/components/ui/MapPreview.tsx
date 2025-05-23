import React from 'react';

interface MapPreviewProps {
  latitude: number;
  longitude: number;
}

const MapPreview: React.FC<MapPreviewProps> = ({ latitude, longitude }) => {
  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${longitude-0.01},${latitude-0.01},${longitude+0.01},${latitude+0.01}&layer=mapnik&marker=${latitude},${longitude}`;

  return (
    <div className="w-full h-48 border rounded-md overflow-hidden">
      <iframe
        title="Location Map"
        width="100%"
        height="100%"
        frameBorder="0"
        scrolling="no"
        src={mapUrl}
      />
    </div>
  );
};

export default MapPreview; 