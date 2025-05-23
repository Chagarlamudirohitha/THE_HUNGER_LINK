interface GeocodingResult {
  lat: number;
  lng: number;
  display_name: string;
}

export const geocodingService = {
  geocodeAddress: async (address: string): Promise<GeocodingResult | null> => {
    try {
      const encodedAddress = encodeURIComponent(address);
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1`,
        {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'FoodBridge App (https://github.com/yourusername/food-bridge)'
          }
        }
      );

      const data = await response.json();

      if (data && data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon),
          display_name: data[0].display_name
        };
      }

      return null;
    } catch (error) {
      console.error('Geocoding error:', error);
      return null;
    }
  },

  reverseGeocode: async (lat: number, lng: number): Promise<string | null> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
        {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'FoodBridge App (https://github.com/yourusername/food-bridge)'
          }
        }
      );

      const data = await response.json();

      if (data && data.display_name) {
        return data.display_name;
      }

      return null;
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return null;
    }
  }
}; 