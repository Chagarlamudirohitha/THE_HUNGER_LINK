import { calculateDistance } from '../utils/distance';
import { Donation, User } from '../types';

interface CreateDonationParams {
  title: string;
  description: string;
  quantity: number;
  expiryDate: string;
  location: {
    address: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  donorId: string;
}

class DonationService {
  private readonly MAX_DISTANCE = 50; // Maximum distance in kilometers for NGO matching

  async createDonation(params: CreateDonationParams): Promise<Donation> {
    try {
      // Create the donation
      const donation: Donation = {
        id: crypto.randomUUID(),
        ...params,
        status: 'pending',
        createdAt: new Date().toISOString(),
      };

      // Save donation to storage
      const donations = await this.getDonations();
      donations.push(donation);
      await this.saveDonations(donations);

      // Find and notify nearby NGOs
      await this.notifyNearbyNGOs(donation);

      return donation;
    } catch (error) {
      console.error('Error creating donation:', error);
      throw new Error('Failed to create donation');
    }
  }

  private async notifyNearbyNGOs(donation: Donation): Promise<void> {
    try {
      // Get all NGO users
      const users = await this.getUsers();
      const ngos = users.filter(user => user.role === 'ngo');

      // Find NGOs within the maximum distance
      const nearbyNGOs = ngos.filter(ngo => {
        if (!ngo.location?.coordinates) return false;

        const distance = calculateDistance(
          donation.location.coordinates.lat,
          donation.location.coordinates.lng,
          ngo.location.coordinates.lat,
          ngo.location.coordinates.lng
        );

        return distance <= this.MAX_DISTANCE;
      });

      // Create notifications for nearby NGOs
      for (const ngo of nearbyNGOs) {
        await this.createNotification({
          userId: ngo.id,
          title: 'New Donation Available',
          body: `A new donation "${donation.title}" is available near you!`,
          type: 'donation',
          data: {
            donationId: donation.id,
            distance: calculateDistance(
              donation.location.coordinates.lat,
              donation.location.coordinates.lng,
              ngo.location.coordinates.lat,
              ngo.location.coordinates.lng
            )
          }
        });
      }
    } catch (error) {
      console.error('Error notifying nearby NGOs:', error);
    }
  }

  private async getDonations(): Promise<Donation[]> {
    try {
      const response = await fetch('/api/donations');
      return await response.json();
    } catch (error) {
      console.error('Error fetching donations:', error);
      return [];
    }
  }

  private async saveDonations(donations: Donation[]): Promise<void> {
    try {
      await fetch('/api/donations', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(donations),
      });
    } catch (error) {
      console.error('Error saving donations:', error);
      throw new Error('Failed to save donations');
    }
  }

  private async getUsers(): Promise<User[]> {
    try {
      const response = await fetch('/api/users');
      return await response.json();
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  }

  private async createNotification(notification: any): Promise<void> {
    try {
      await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(notification),
      });
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  }
}

export const donationService = new DonationService(); 