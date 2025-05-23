import { create } from 'zustand';
import type { Donation, DonationStatus, FoodType, UserAddress } from '../types/index';
import { apiService } from '../services/apiService';

interface DonationState {
  donations: Donation[];
  mapDonations: Donation[];
  isLoading: boolean;
  error: string | null;
  createDonation: (donationData: Partial<Donation>) => Promise<void>;
  updateDonationStatus: (donationId: string, status: DonationStatus) => Promise<void>;
  getDonationsByDonor: (donorId: string) => Promise<Donation[]>;
  getDonationsByNGO: (ngoId: string) => Promise<Donation[]>;
  getAvailableDonations: () => Promise<Donation[]>;
  getMapDonations: () => Promise<void>;
  clearError: () => void;
}

const useDonationStore = create<DonationState>((set) => ({
  donations: [],
  mapDonations: [],
  isLoading: false,
  error: null,

  createDonation: async (donationData: Partial<Donation>) => {
    set({ isLoading: true, error: null });
    
    try {
      const timestamp = new Date().toISOString();
      const newDonation: Donation = {
        id: `donation${Date.now()}`,
        donorId: donationData.donorId || '',
        donorName: donationData.donorName || '',
        foodType: donationData.foodType || 'other',
        servings: donationData.servings || 0,
        pickupTime: donationData.pickupTime || timestamp,
        expiryDate: donationData.expiryDate || timestamp,
        location: donationData.location || {
          street: '',
          city: '',
          state: '',
          pincode: '',
          country: ''
        },
        status: 'pending',
        createdAt: timestamp,
        updatedAt: timestamp,
        ...donationData
      };
      
      const success = await apiService.saveDonation(newDonation);
      
      if (!success) {
        throw new Error('Failed to create donation');
      }
      
      set({ isLoading: false });
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'An error occurred while creating donation' 
      });
    }
  },

  updateDonationStatus: async (donationId: string, status: DonationStatus) => {
    set({ isLoading: true, error: null });
    
    try {
      const donations = await apiService.getDonations();
      const donation = donations.find(d => d.id === donationId);
      
      if (!donation) {
        throw new Error('Donation not found');
      }
      
      const updatedDonation: Donation = {
        ...donation,
        status,
        ngoId: status === 'accepted' ? (await apiService.getCurrentUser())?.id : donation.ngoId,
        updatedAt: new Date().toISOString()
      };
      
      const success = await apiService.updateDonation(updatedDonation);
      
      if (!success) {
        throw new Error('Failed to update donation status');
      }
      
      set({ isLoading: false });
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'An error occurred while updating donation' 
      });
    }
  },

  getDonationsByDonor: async (donorId: string) => {
    set({ isLoading: true, error: null });
    
    try {
      const donations = await apiService.getDonationsByDonor(donorId);
      set({ donations, isLoading: false });
      return donations;
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'An error occurred while fetching donations' 
      });
      return [];
    }
  },

  getDonationsByNGO: async (ngoId: string) => {
    set({ isLoading: true, error: null });
    
    try {
      const donations = await apiService.getDonationsByNGO(ngoId);
      
      // Sort donations by status priority and date
      const sortedDonations = [...donations].sort((a, b) => {
        // First sort by status priority
        const statusPriority = {
          accepted: 0,
          picked_up: 1,
          completed: 2,
          canceled: 3
        };
        const statusDiff = statusPriority[a.status as keyof typeof statusPriority] - 
                         statusPriority[b.status as keyof typeof statusPriority];
        if (statusDiff !== 0) return statusDiff;
        
        // Then sort by date (newest first)
        return new Date(b.updatedAt || b.createdAt).getTime() - 
               new Date(a.updatedAt || a.createdAt).getTime();
      });
      
      set({ donations: sortedDonations, isLoading: false });
      return sortedDonations;
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'An error occurred while fetching donations' 
      });
      return [];
    }
  },

  getAvailableDonations: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const currentUser = await apiService.getCurrentUser();
      if (!currentUser) {
        throw new Error('User not found');
      }

      // For NGOs, get donations that match their location
      const donations = await apiService.getDonations(currentUser.id);
      const availableDonations = donations
        .filter(d => d.status === 'pending')
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      set({ donations: availableDonations, isLoading: false });
      return availableDonations;
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'An error occurred while fetching donations' 
      });
      return [];
    }
  },

  getMapDonations: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const donations = await apiService.getDonations();
      set({ mapDonations: donations, isLoading: false });
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'An error occurred while fetching map donations' 
      });
    }
  },

  clearError: () => {
    set({ error: null });
  }
}));

export default useDonationStore;