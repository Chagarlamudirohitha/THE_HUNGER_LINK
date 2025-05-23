import React, { useEffect, useState } from 'react';
import { 
  MapContainer, 
  TileLayer, 
  Marker, 
  Popup, 
  ZoomControl 
} from 'react-leaflet';
import L from 'leaflet';
import { Calendar, Clock, Users, AlertCircle } from 'lucide-react';
import Button from '../ui/Button';
import { DonationStatus, Donation } from '../../types';
import useDoationStore from '../../store/donationStore';
import useStatsStore from '../../store/statsStore';

// Create custom marker icons based on donation status
const createMarkerIcon = (status: DonationStatus) => {
  const markerColors = {
    pending: 'marker-pending',
    accepted: 'marker-accepted', 
    picked_up: 'marker-accepted', 
    completed: 'marker-completed',
    canceled: 'marker-canceled'
  };

  const markerClass = markerColors[status];
  
  const divIcon = L.divIcon({
    html: `<div class="donation-marker ${markerClass}"></div>`,
    className: '',
    iconSize: [36, 36],
    iconAnchor: [18, 18]
  });
  
  return divIcon;
};

// Format date for display
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  });
};

// Format time for display
const formatTime = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit'
  });
};

interface ImpactMapProps {
  isFullPage?: boolean;
}

const ImpactMap: React.FC<ImpactMapProps> = ({ isFullPage = false }) => {
  const { mapDonations, getMapDonations } = useDoationStore();
  const { stats, getStats } = useStatsStore();
  const [filter, setFilter] = useState<DonationStatus | 'all'>('all');
  
  useEffect(() => {
    getMapDonations();
    getStats();
  }, [getMapDonations, getStats]);
  
  // Filter donations based on selected status
  const filteredDonations = filter === 'all' 
    ? mapDonations 
    : mapDonations.filter(donation => donation.status === filter);
  
  const statusBadgeColor = (status: DonationStatus) => {
    const colors = {
      pending: 'bg-orange-100 text-orange-800',
      accepted: 'bg-blue-100 text-blue-800',
      picked_up: 'bg-purple-100 text-purple-800',
      completed: 'bg-green-100 text-green-800',
      canceled: 'bg-red-100 text-red-800'
    };
    return colors[status];
  };
  
  const statusLabel = (status: DonationStatus) => {
    const labels = {
      pending: 'Pending',
      accepted: 'Accepted',
      picked_up: 'In Transit',
      completed: 'Completed',
      canceled: 'Canceled'
    };
    return labels[status];
  };
  
  return (
    <div className={`bg-white ${isFullPage ? 'h-full' : 'h-[500px] md:h-[600px] lg:h-[700px]'}`}>
      <div className={`relative h-full ${isFullPage ? 'rounded-none' : 'rounded-xl overflow-hidden shadow-lg'}`}>
        {/* Map Filters */}
        <div className="absolute top-4 left-4 z-[1000] bg-white rounded-lg shadow-md p-2">
          <div className="flex flex-wrap gap-2">
            <Button 
              size="sm" 
              variant={filter === 'all' ? 'primary' : 'ghost'}
              className="py-1"
              onClick={() => setFilter('all')}
            >
              All
            </Button>
            <Button 
              size="sm" 
              variant={filter === 'pending' ? 'primary' : 'ghost'}
              className="py-1"
              onClick={() => setFilter('pending')}
            >
              Pending
            </Button>
            <Button 
              size="sm" 
              variant={filter === 'accepted' ? 'primary' : 'ghost'}
              className="py-1"
              onClick={() => setFilter('accepted')}
            >
              Accepted
            </Button>
            <Button 
              size="sm" 
              variant={filter === 'completed' ? 'primary' : 'ghost'}
              className="py-1"
              onClick={() => setFilter('completed')}
            >
              Completed
            </Button>
          </div>
        </div>
        
        {/* Map Stats */}
        <div className="absolute bottom-4 left-4 z-[1000] bg-white rounded-lg shadow-md p-4 max-w-xs">
          <h3 className="font-semibold text-sm mb-2">Community Impact</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-gray-600">Donations:</span>
              <span className="font-medium ml-1">{stats.totalDonations}</span>
            </div>
            <div>
              <span className="text-gray-600">People Fed:</span>
              <span className="font-medium ml-1">{stats.totalPeopleFed}</span>
            </div>
            <div>
              <span className="text-gray-600">NGOs:</span>
              <span className="font-medium ml-1">{stats.totalNGOs}</span>
            </div>
            <div>
              <span className="text-gray-600">Active:</span>
              <span className="font-medium ml-1">{stats.activeDonations}</span>
            </div>
          </div>
        </div>
        
        {/* Map Legend */}
        <div className="absolute bottom-4 right-4 z-[1000] bg-white rounded-lg shadow-md p-3">
          <h3 className="font-semibold text-sm mb-2">Map Legend</h3>
          <div className="space-y-2">
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full bg-orange-500 mr-2"></div>
              <span className="text-xs">Pending</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full bg-blue-500 mr-2"></div>
              <span className="text-xs">Accepted</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full bg-green-500 mr-2"></div>
              <span className="text-xs">Completed</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full bg-red-500 mr-2"></div>
              <span className="text-xs">Canceled</span>
            </div>
          </div>
        </div>
        
        <MapContainer 
          center={[37.7749, -122.4194]} 
          zoom={13} 
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ZoomControl position="bottomright" />
          
          {filteredDonations.map((donation: Donation) => (
            <Marker
              key={donation.id}
              position={[
                donation.location.coordinates?.lat || 0,
                donation.location.coordinates?.lng || 0
              ]}
              icon={createMarkerIcon(donation.status)}
            >
              <Popup>
                <div className="w-64">
                  <div className="mb-2">
                    <h3 className="font-semibold text-md">{donation.foodType.charAt(0).toUpperCase() + donation.foodType.slice(1)} Food</h3>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">From {donation.donorName}</span>
                      <span className={`text-xs py-0.5 px-2 rounded-full ${statusBadgeColor(donation.status)}`}>
                        {statusLabel(donation.status)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mb-2 pb-2 border-b border-gray-100">
                    {donation.notes && (
                      <p className="text-sm text-gray-700 my-1">{donation.notes}</p>
                    )}
                  </div>
                  
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center">
                      <Calendar size={16} className="text-gray-500 mr-2" />
                      <span className="text-gray-600">Pickup: {formatDate(donation.pickupTime)}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock size={16} className="text-gray-500 mr-2" />
                      <span className="text-gray-600">Time: {formatTime(donation.pickupTime)}</span>
                    </div>
                    <div className="flex items-center">
                      <Users size={16} className="text-gray-500 mr-2" />
                      <span className="text-gray-600">Servings: {donation.servings}</span>
                    </div>
                    <div className="flex items-center">
                      <AlertCircle size={16} className="text-gray-500 mr-2" />
                      <span className="text-gray-600">Expires: {formatDate(donation.expiryDate)}</span>
                    </div>
                  </div>
                  
                  {donation.ngoId && (
                    <div className="mt-2 pt-2 border-t border-gray-100">
                      <span className="text-xs text-gray-500">
                        {donation.status === 'completed' ? 'Distributed by: ' : 'Accepted by: '}
                        <span className="font-medium text-gray-700">{donation.ngoName}</span>
                      </span>
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
};

export default ImpactMap;