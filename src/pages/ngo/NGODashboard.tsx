import React, { useEffect, useState, useCallback } from 'react';
import { MapPin, Calendar, Clock, Users, Search, Filter, Package as Food } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import PageContainer from '../../components/layout/PageContainer';
import Button from '../../components/ui/Button';
import { Card, CardContent, CardFooter } from '../../components/ui/Card';
import Modal from '../../components/ui/Modal';
import ChatWindow from '../../components/chat/ChatWindow';
import useAuthStore from '../../store/authStore';
import useDonationStore from '../../store/donationStore';
import useChatStore from '../../store/chatStore';
import NotificationToast from '../../components/ui/Notification';
import { Donation, NGO, DonationStatus } from '../../types';

interface DonationWithStatus extends Donation {
  status: DonationStatus;
}

const NGODashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading: authLoading } = useAuthStore();
  const { 
    getAvailableDonations, 
    getDonationsByNGO, 
    updateDonationStatus 
  } = useDonationStore();
  const { createChat } = useChatStore();
  
  const [availableDonations, setAvailableDonations] = useState<DonationWithStatus[]>([]);
  const [acceptedDonations, setAcceptedDonations] = useState<DonationWithStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'available' | 'accepted'>('available');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [selectedDonation, setSelectedDonation] = useState<DonationWithStatus | null>(null);
  const [showChatModal, setShowChatModal] = useState(false);
  const [notification, setNotification] = useState<{ 
    show: boolean; 
    title: string; 
    message: string; 
    type: 'success' | 'error' | 'info' 
  }>({
    show: false,
    title: '',
    message: '',
    type: 'info'
  });
  
  const fetchDonations = useCallback(async () => {
    try {
      if (!user?.id) {
        setError('No user ID found');
        return;
      }

      setIsLoading(true);
      setError(null);
      
      // Get both available and accepted donations
      const [available, accepted] = await Promise.all([
        getAvailableDonations(),
        getDonationsByNGO(user.id)
      ]);
      
      if (!available || !accepted) {
        throw new Error('Failed to fetch donations');
      }
      
      // Filter out donations that are already accepted by this NGO from available list
      const filteredAvailable = available.filter(d => !d.ngoId);
      
      setAvailableDonations(filteredAvailable);
      setAcceptedDonations(accepted);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load donations';
      setError(errorMessage);
      setNotification({
        show: true,
        title: 'Error',
        message: errorMessage,
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, getAvailableDonations, getDonationsByNGO]);
  
  useEffect(() => {
    // Check authentication and role
    if (authLoading) {
      return;
    }
    
    if (!isAuthenticated || !user) {
      console.log('Not authenticated, redirecting to login');
      navigate('/login');
      return;
    }
    
    if (user.role !== 'ngo') {
      console.log('Invalid role, redirecting to home');
      navigate('/');
      return;
    }
    
    fetchDonations();
  }, [user, isAuthenticated, authLoading, navigate, fetchDonations]);

  // Show loading state
  if (authLoading || isLoading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </PageContainer>
    );
  }

  // Show error state
  if (error) {
    return (
      <PageContainer>
        <div className="flex flex-col items-center justify-center min-h-screen">
          <div className="text-red-600 mb-4">{error}</div>
          <Button onClick={fetchDonations}>Retry</Button>
        </div>
      </PageContainer>
    );
  }
  
  const filteredDonations = (activeTab === 'available' ? availableDonations : acceptedDonations)
    .filter(donation => {
      // Filter by food type
      const matchesType = filterType === 'all' || donation.foodType === filterType;
      
      // Filter by search term
      const matchesSearch = 
        searchTerm === '' || 
        donation.foodType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (donation.notes && donation.notes.toLowerCase().includes(searchTerm.toLowerCase())) ||
        donation.donorName.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesType && matchesSearch;
    });
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };
  
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit'
    });
  };
  
  const handleAcceptClick = (donation: DonationWithStatus) => {
    setSelectedDonation(donation);
    setShowAcceptModal(true);
  };
  
  const handleConfirmAccept = async () => {
    if (selectedDonation && user) {
      try {
        // Update donation status to accepted
        await updateDonationStatus(selectedDonation.id, 'accepted');
        
        // Refresh donations to get the updated state from server
        await fetchDonations();
        
        // Show notification
        setNotification({
          show: true,
          title: 'Donation Accepted',
          message: 'You have successfully accepted the food donation.',
          type: 'success'
        });
        
        // Close modal
        setShowAcceptModal(false);
      } catch (error) {
        setNotification({
          show: true,
          title: 'Error',
          message: 'Failed to accept donation. Please try again.',
          type: 'error'
        });
      }
    }
  };
  
  const handleStatusUpdate = async (donationId: string, newStatus: DonationStatus) => {
    try {
      // Update donation status
      await updateDonationStatus(donationId, newStatus);
      
      // Refresh donations to get the updated state from server
      await fetchDonations();
      
      // Show notification
      setNotification({
        show: true,
        title: newStatus === 'picked_up' ? 'Pickup Confirmed' : 'Donation Completed',
        message: newStatus === 'picked_up' 
          ? 'You have confirmed pickup of the donation.' 
          : 'The donation has been marked as completed.',
        type: 'success'
      });
    } catch (error) {
      setNotification({
        show: true,
        title: 'Error',
        message: 'Failed to update donation status. Please try again.',
        type: 'error'
      });
    }
  };
  
  const getDonationStatusColor = (status: DonationStatus) => {
    const colors = {
      pending: 'bg-orange-100 text-orange-800',
      accepted: 'bg-blue-100 text-blue-800',
      picked_up: 'bg-purple-100 text-purple-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || colors.pending;
  };
  
  const getDonationStatusLabel = (status: DonationStatus) => {
    const labels = {
      pending: 'Pending',
      accepted: 'Accepted',
      picked_up: 'In Transit',
      completed: 'Completed',
      cancelled: 'Cancelled'
    };
    return labels[status] || 'Pending';
  };
  
  const handleMessageClick = async (donation: DonationWithStatus) => {
    if (!user || !donation.donorId) return;
    
    try {
      await createChat([user.id, donation.donorId], donation.id);
      setSelectedDonation(donation);
      setShowChatModal(true);
    } catch (error) {
      setNotification({
        show: true,
        title: 'Error',
        message: 'Failed to open chat. Please try again.',
        type: 'error'
      });
    }
  };
  
  const handleViewDetails = (donationId: string) => {
    navigate(`/donations/${donationId}`);
  };
  
  return (
    <PageContainer>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">NGO Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Find and manage food donations for your organization
          </p>
        </div>
        
        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-primary-50 border border-primary-100">
            <CardContent className="p-4">
              <h3 className="font-semibold text-gray-800 mb-1">Available Donations</h3>
              <p className="text-3xl font-bold text-primary-600">{availableDonations.length}</p>
            </CardContent>
          </Card>
          
          <Card className="bg-blue-50 border border-blue-100">
            <CardContent className="p-4">
              <h3 className="font-semibold text-gray-800 mb-1">Accepted Donations</h3>
              <p className="text-3xl font-bold text-blue-600">
                {acceptedDonations.filter(d => 
                  (d.status as DonationStatus) === 'accepted' || (d.status as DonationStatus) === 'picked_up'
                ).length}
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-green-50 border border-green-100">
            <CardContent className="p-4">
              <h3 className="font-semibold text-gray-800 mb-1">Completed</h3>
              <p className="text-3xl font-bold text-green-600">
                {acceptedDonations.filter(d => d.status === 'completed').length}
              </p>
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
              <div className="flex mb-4 md:mb-0">
                <button
                  className={`flex items-center px-4 py-2 rounded-l-lg ${
                    activeTab === 'available'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  onClick={() => setActiveTab('available')}
                >
                  Available Donations
                </button>
                <button
                  className={`flex items-center px-4 py-2 rounded-r-lg ${
                    activeTab === 'accepted'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  onClick={() => setActiveTab('accepted')}
                >
                  My Accepted Donations
                </button>
              </div>
              
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Search size={18} className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    className="py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Search donations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <div className="relative">
                  <select
                    className="py-2 pl-10 pr-4 border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                  >
                    <option value="all">All Food Types</option>
                    <option value="cooked">Cooked Meals</option>
                    <option value="packaged">Packaged Food</option>
                    <option value="perishable">Perishable</option>
                    <option value="non-perishable">Non-Perishable</option>
                  </select>
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Filter size={18} className="text-gray-400" />
                  </div>
                </div>
              </div>
            </div>
            
            {isLoading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                <p className="mt-3 text-gray-600">Loading donations...</p>
              </div>
            ) : filteredDonations.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-gray-100 mb-4">
                  <Food size={32} className="text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">No donations found</h3>
                <p className="text-gray-600">
                  {activeTab === 'available' 
                    ? 'There are no donations available in your area right now. Check back later!' 
                    : 'You haven\'t accepted any donations yet.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredDonations.map((donation) => (
                  <Card key={donation.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-semibold text-gray-800">
                          {donation.foodType.charAt(0).toUpperCase() + donation.foodType.slice(1)} Food
                        </h3>
                        {activeTab === 'accepted' && (
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getDonationStatusColor(donation.status)}`}>
                            {getDonationStatusLabel(donation.status)}
                          </span>
                        )}
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center text-gray-600">
                          <MapPin size={16} className="mr-2" />
                          <span>{donation.location.city}, {donation.location.state}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Calendar size={16} className="mr-2" />
                          <span>{formatDate(donation.pickupTime)}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Clock size={16} className="mr-2" />
                          <span>{formatTime(donation.pickupTime)}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Users size={16} className="mr-2" />
                          <span>{donation.servings} servings</span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="p-4 bg-gray-50 border-t flex justify-between items-center">
                      {activeTab === 'available' ? (
                        <Button
                          onClick={() => handleAcceptClick(donation)}
                          className="w-full bg-primary-600 hover:bg-primary-700 text-white"
                        >
                          Accept Donation
                        </Button>
                      ) : (
                        <div className="flex gap-2 w-full">
                          <Button
                            onClick={() => handleViewDetails(donation.id)}
                            className="flex-1 bg-gray-600 hover:bg-gray-700 text-white"
                          >
                            View Details
                          </Button>
                          <Button
                            onClick={() => handleMessageClick(donation)}
                            className="flex-1 bg-primary-600 hover:bg-primary-700 text-white"
                          >
                            Message
                          </Button>
                          {donation.status === 'accepted' && (
                            <Button
                              onClick={() => handleStatusUpdate(donation.id, 'picked_up')}
                              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
                            >
                              Confirm Pickup
                            </Button>
                          )}
                          {donation.status === 'picked_up' && (
                            <Button
                              onClick={() => handleStatusUpdate(donation.id, 'completed')}
                              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                            >
                              Complete
                            </Button>
                          )}
                        </div>
                      )}
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        
        <Modal
          isOpen={showAcceptModal}
          onClose={() => setShowAcceptModal(false)}
          title="Accept Donation"
        >
          <div className="p-6">
            <p className="text-gray-600 mb-4">
              Are you sure you want to accept this donation? You will be responsible for picking it up at the specified time.
            </p>
            <div className="flex justify-end gap-4">
              <Button
                onClick={() => setShowAcceptModal(false)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-800"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmAccept}
                className="bg-primary-600 hover:bg-primary-700 text-white"
              >
                Accept
              </Button>
            </div>
          </div>
        </Modal>
        
        <Modal
          isOpen={showChatModal}
          onClose={() => setShowChatModal(false)}
          title="Chat"
        >
          {selectedDonation && (
            <ChatWindow
              chatId={selectedDonation.id}
              recipientName={selectedDonation.donorName}
              onClose={() => setShowChatModal(false)}
            />
          )}
        </Modal>
        
        <NotificationToast
          title={notification.title}
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(prev => ({ ...prev, show: false }))}
          isVisible={notification.show}
        />
      </div>
    </PageContainer>
  );
};

export default NGODashboard;