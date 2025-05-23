import { getDistance } from 'geolocation-utils';
import { NGO, Donation } from '../types';

interface Coordinates {
  latitude: number;
  longitude: number;
}

class LocationService {
  private readonly MAX_DISTANCE = 50; // Maximum distance in kilometers

  async getCurrentLocation(): Promise<Coordinates> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          reject(error);
        }
      );
    });
  }

  async findNearbyNGOs(donation: Donation, ngos: NGO[]): Promise<NGO[]> {
    try {
      const donorLocation = await this.getLocationFromAddress(donation.pickupAddress);
      
      return ngos.filter(ngo => {
        const ngoLocation = this.getLocationFromAddress(ngo.address);
        const distance = this.calculateDistance(donorLocation, ngoLocation);
        return distance <= this.MAX_DISTANCE;
      });
    } catch (error) {
      console.error('Error finding nearby NGOs:', error);
      return [];
    }
  }

  private calculateDistance(point1: Coordinates, point2: Coordinates): number {
    return getDistance(
      { lat: point1.latitude, lon: point1.longitude },
      { lat: point2.latitude, lon: point2.longitude }
    ) / 1000; // Convert meters to kilometers
  }

  private async getLocationFromAddress(address: string): Promise<Coordinates> {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=YOUR_GOOGLE_MAPS_API_KEY`
      );
      const data = await response.json();
      
      if (data.results && data.results.length > 0) {
        const location = data.results[0].geometry.location;
        return {
          latitude: location.lat,
          longitude: location.lng
        };
      }
      throw new Error('No results found for the address');
    } catch (error) {
      console.error('Error geocoding address:', error);
      throw error;
    }
  }
}

export const locationService = new LocationService(); 