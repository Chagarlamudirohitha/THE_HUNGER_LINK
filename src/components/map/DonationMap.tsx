import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Donation } from '../../types';

// Fix for default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

interface DonationMapProps {
  donations: Donation[];
  onMarkerClick?: (donation: Donation) => void;
  center?: [number, number];
  zoom?: number;
}

const DonationMap: React.FC<DonationMapProps> = ({
  donations,
  onMarkerClick,
  center = [0, 0],
  zoom = 13
}) => {
  useEffect(() => {
    // Update center based on first donation if no center provided
    if (center[0] === 0 && center[1] === 0 && donations.length > 0) {
      const firstDonation = donations[0];
      if (firstDonation.location.coordinates) {
        center = [
          firstDonation.location.coordinates.lat,
          firstDonation.location.coordinates.lng
        ];
      }
    }
  }, [donations, center]);

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      style={{ height: '100%', width: '100%', minHeight: '400px' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {donations.map((donation) => {
        if (!donation.location.coordinates) return null;
        
        return (
          <Marker
            key={donation.id}
            position={[
              donation.location.coordinates.lat,
              donation.location.coordinates.lng
            ]}
            eventHandlers={{
              click: () => onMarkerClick?.(donation)
            }}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-semibold mb-1">
                  {donation.foodType.charAt(0).toUpperCase() + donation.foodType.slice(1)} Food
                </h3>
                <p className="text-sm text-gray-600 mb-1">
                  {donation.servings} servings
                </p>
                <p className="text-sm text-gray-600">
                  {donation.location.address}
                </p>
                {donation.status === 'pending' && (
                  <button
                    className="mt-2 text-sm text-primary-600 hover:text-primary-700"
                    onClick={(e) => {
                      e.stopPropagation();
                      onMarkerClick?.(donation);
                    }}
                  >
                    View Details
                  </button>
                )}
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
};

export default DonationMap; 