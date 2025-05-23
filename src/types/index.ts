export type UserRole = 'donor' | 'ngo';

export type DonorType = 'restaurant' | 'event' | 'hostel' | 'household' | 'other';

export type FoodType = 'cooked' | 'packaged' | 'perishable' | 'non-perishable' | 'other';

export type DonationStatus = 'pending' | 'accepted' | 'picked_up' | 'completed' | 'cancelled';

export interface Address {
  street: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

// Helper function to check if two locations are in proximity based on pincode
export function areLocationsInProximity(location1: Address, location2: Address): boolean {
  // First check if city matches
  if (location1.city.toLowerCase() !== location2.city.toLowerCase()) {
    return false;
  }
  
  // Check if last 3 digits of pincode are within range
  const lastThree1 = location1.pincode.slice(-3);
  const lastThree2 = location2.pincode.slice(-3);
  
  if (!lastThree1 || !lastThree2) {
    return true; // If either pincode is invalid, just use city match
  }
  
  return Math.abs(parseInt(lastThree1) - parseInt(lastThree2)) <= 3;
}

export interface User {
  id: string;
  email: string;
  username: string;
  role: UserRole;
  phone: string;
  address: Address;
  createdAt: string;
  updatedAt: string;
}

export interface Donor extends User {
  role: 'donor';
  donorType?: 'individual' | 'restaurant' | 'organization';
}

export interface NGO extends User {
  role: 'ngo';
  organizationName: string;
  description?: string;
}

export interface Donation {
  id: string;
  donorId: string;
  donorName: string;
  foodType: FoodType;
  servings: string;
  pickupTime: string;
  expiryDate: string;
  notes?: string;
  location: Address;
  status: DonationStatus;
  ngoId?: string;
  ngoName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'new_donation' | 'donation_accepted' | 'donation_completed' | 'new_message';
  title: string;
  message: string;
  donationId?: string;
  chatId?: string;
  read: boolean;
  createdAt: string;
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  content: string;
  createdAt: string;
  isRead: boolean;
  chatId?: string;
}

export interface Chat {
  id: string;
  donationId: string;
  participantIds: string[];
  messages: Message[];
  lastMessage?: Message;
  createdAt: string;
  updatedAt: string;
}

export interface Stats {
  totalDonations: number;
  totalServings: number;
  totalPeopleFed: number;
  totalNGOs: number;
  activeDonations: number;
  completedDonations: number;
}