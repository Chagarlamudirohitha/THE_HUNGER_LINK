import React, { useState, useCallback, useEffect } from 'react';
import { MapPin, Search } from 'lucide-react';
import MapPreview from './MapPreview';
import { geocodingService } from '../../services/geocodingService';
import debounce from 'lodash/debounce';

interface LocationInputProps {
  onChange: (location: { address: string; coordinates: { lat: number; lng: number } }) => void;
  error?: string;
  required?: boolean;
  showPincodeSearch?: boolean;
}

const LocationInput: React.FC<LocationInputProps> = ({
  onChange,
  error,
  required = false,
  showPincodeSearch = true,
}) => {
  const [address, setAddress] = useState('');
  const [pincode, setPincode] = useState('');
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number }>({
    lat: 0,
    lng: 0,
  });
  const [showPreview, setShowPreview] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);

  // Debounced geocoding function
  const debouncedGeocode = useCallback(
    debounce(async (searchText: string) => {
      if (!searchText) return;
      
      setIsGeocoding(true);
      try {
        const result = await geocodingService.geocodeAddress(searchText);
        if (result) {
          const newCoordinates = { lat: result.lat, lng: result.lng };
          setCoordinates(newCoordinates);
          onChange({ address: result.display_name, coordinates: newCoordinates });
          setAddress(result.display_name);
        }
      } catch (error) {
        console.error('Geocoding failed:', error);
      } finally {
        setIsGeocoding(false);
      }
    }, 1000),
    [onChange]
  );

  useEffect(() => {
    return () => {
      debouncedGeocode.cancel();
    };
  }, [debouncedGeocode]);

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newAddress = e.target.value;
    setAddress(newAddress);
    onChange({ address: newAddress, coordinates });
    
    if (newAddress.length > 3) {
      debouncedGeocode(newAddress);
    }
  };

  const handlePincodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPincode = e.target.value;
    setPincode(newPincode);
    
    if (newPincode.length === 6) {
      debouncedGeocode(`${newPincode}, India`);
    }
  };

  const handleCoordinateChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'lat' | 'lng'
  ) => {
    const value = parseFloat(e.target.value);
    const newCoordinates = { ...coordinates, [type]: value };
    setCoordinates(newCoordinates);
    
    if (!isNaN(newCoordinates.lat) && !isNaN(newCoordinates.lng)) {
      try {
        const result = await geocodingService.reverseGeocode(
          newCoordinates.lat,
          newCoordinates.lng
        );
        if (result) {
          setAddress(result);
          onChange({ address: result, coordinates: newCoordinates });
        } else {
          onChange({ address, coordinates: newCoordinates });
        }
      } catch (error) {
        console.error('Reverse geocoding failed:', error);
        onChange({ address, coordinates: newCoordinates });
      }
    }
  };

  const handlePreviewClick = () => {
    if (coordinates.lat !== 0 || coordinates.lng !== 0) {
      setShowPreview(!showPreview);
    }
  };

  return (
    <div className="space-y-4">
      {showPincodeSearch && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            value={pincode}
            onChange={handlePincodeChange}
            className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 border-gray-300 focus:ring-primary-200 focus:border-primary-500"
            placeholder="Enter pincode to search location"
            maxLength={6}
          />
        </div>
      )}

      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
        <input
          type="text"
          value={address}
          onChange={handleAddressChange}
          className={`w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${
            error
              ? 'border-red-500 focus:ring-red-200'
              : 'border-gray-300 focus:ring-primary-200 focus:border-primary-500'
          } ${isGeocoding ? 'bg-gray-50' : ''}`}
          placeholder="Enter your address"
          required={required}
        />
        {isGeocoding && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-500"></div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Latitude
          </label>
          <input
            type="number"
            step="0.000001"
            value={coordinates.lat || ''}
            onChange={(e) => handleCoordinateChange(e, 'lat')}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-500"
            placeholder="Enter latitude"
            required={required}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Longitude
          </label>
          <input
            type="number"
            step="0.000001"
            value={coordinates.lng || ''}
            onChange={(e) => handleCoordinateChange(e, 'lng')}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-500"
            placeholder="Enter longitude"
            required={required}
          />
        </div>
      </div>

      <div>
        <button
          type="button"
          onClick={handlePreviewClick}
          className={`text-sm ${
            coordinates.lat === 0 && coordinates.lng === 0
              ? 'text-gray-400 cursor-not-allowed'
              : 'text-primary-500 hover:text-primary-600'
          }`}
          disabled={coordinates.lat === 0 && coordinates.lng === 0}
        >
          {showPreview ? 'Hide Map Preview' : 'Show Map Preview'}
        </button>

        {showPreview && (
          <div className="mt-2">
            <MapPreview latitude={coordinates.lat} longitude={coordinates.lng} />
          </div>
        )}
      </div>

      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
};

export default LocationInput; 