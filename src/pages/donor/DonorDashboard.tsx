import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, List, History, Filter, Calendar, Clock, Users, MapPin, Search, MessageCircle } from 'lucide-react';
import PageContainer from '../../components/layout/PageContainer';
import Button from '../../components/ui/Button';
import { Card, CardContent, CardFooter } from '../../components/ui/Card';
import Modal from '../../components/ui/Modal';
import ChatWindow from '../../components/chat/ChatWindow';
import useAuthStore from '../../store/authStore';
import useDonationStore from '../../store/donationStore';
import useChatStore from '../../store/chatStore';
import { Donation, DonationStatus } from '../../types';
import NotificationToast from '../../components/ui/Notification';

const DonorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { getDonationsByDonor, updateDonationStatus } = useDonationStore();
  const { createChat } = useChatStore();
  
  const [donations, setDonations] = useState<Donation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'active' | 'past'>('active');
  const [statusFilter, setStatusFilter] = useState<DonationStatus | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null);
  const [showChatModal, setShowChatModal] = useState(false);
  const [notification, setNotification] = useState<{
    show: boolean;
    title: string;
    message: string;
    type: 'success' | 'error' | 'info';
  }>({
    show: false,
    title: '',
    message: '',
    type: 'info'
  });
  
  useEffect(() => {
    const fetchDonations = async () => {
      if (user?.id) {
        const donorDonations = await getDonationsByDonor(user.id);
        setDonations(donorDonations);
        setIsLoading(false);
      }
    };
    
    fetchDonations();
  }, [user, getDonationsByDonor]);
  
  const activeStatuses: DonationStatus[] = ['pending', 'accepted', 'picked_up'];
  const pastStatuses: DonationStatus[] = ['completed', 'canceled'];
  
  const filteredDonations = donations.filter(donation => {
    // Filter by active/past tab
    const matchesTab = 
      (activeTab === 'active' && activeStatuses.includes(donation.status)) ||
      (activeTab === 'past' && pastStatuses.includes(donation.status));
    
    // Filter by status if not 'all'
    const matchesStatus = statusFilter === 'all' || donation.status === statusFilter;
    
    // Filter by search term
    const matchesSearch = 
      searchTerm === '' || 
      donation.foodType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (donation.notes && donation.notes.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (donation.ngoName && donation.ngoName.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesTab && matchesStatus && matchesSearch;
  });
  
  const handleCancelClick = (donation: Donation) => {
    setSelectedDonation(donation);
    setShowCancelModal(true);
  };
  
  const handleConfirmCancel = async () => {
    if (selectedDonation) {
      try {
        await updateDonationStatus(selectedDonation.id, 'canceled');
        
        // Update local state
        setDonations(prevDonations => 
          prevDonations.map(d => 
            d.id === selectedDonation.id ? { ...d, status: 'canceled' } : d
          )
        );
        
        // Show notification
        setNotification({
          show: true,
          title: 'Donation Canceled',
          message: 'Your donation has been successfully canceled.',
          type: 'info'
        });
        
        // Close modal
        setShowCancelModal(false);
      } catch (error) {
        setNotification({
          show: true,
          title: 'Error',
          message: 'Failed to cancel donation. Please try again.',
          type: 'error'
        });
      }
    }
  };
  
  const handleCreateDonation = () => {
    navigate('/donor/create-donation');
  };
  
  const handleMessageClick = async (donation: Donation) => {
    if (!user || !donation.ngoId) return;
    
    try {
      await createChat([user.id, donation.ngoId], donation.id);
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
  
  const getDonationStatusColor = (status: DonationStatus) => {
    const colors = {
      pending: 'bg-orange-100 text-orange-800',
      accepted: 'bg-blue-100 text-blue-800',
      picked_up: 'bg-purple-100 text-purple-800',
      completed: 'bg-green-100 text-green-800',
      canceled: 'bg-red-100 text-red-800'
    };
    return colors[status];
  };
  
  const getDonationStatusLabel = (status: DonationStatus) => {
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
    <PageContainer>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Donor Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Manage your food donations and track their status
            </p>
          </div>
          
          <div className="mt-4 md:mt-0">
            <Button
              variant="primary"
              onClick={handleCreateDonation}
              className="flex items-center"
            >
              <Plus size={20} className="mr-2" />
              Create Donation
            </Button>
          </div>
        </div>
        
        <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-primary-50 border border-primary-100">
            <CardContent className="p-4">
              <h3 className="font-semibold text-gray-800 mb-1">Total Donations</h3>
              <p className="text-3xl font-bold text-primary-600">{donations.length}</p>
            </CardContent>
          </Card>
          
          <Card className="bg-orange-50 border border-orange-100">
            <CardContent className="p-4">
              <h3 className="font-semibold text-gray-800 mb-1">Pending</h3>
              <p className="text-3xl font-bold text-orange-600">
                {donations.filter(d => d.status === 'pending').length}
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-blue-50 border border-blue-100">
            <CardContent className="p-4">
              <h3 className="font-semibold text-gray-800 mb-1">Accepted</h3>
              <p className="text-3xl font-bold text-blue-600">
                {donations.filter(d => d.status === 'accepted' || d.status === 'picked_up').length}
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-green-50 border border-green-100">
            <CardContent className="p-4">
              <h3 className="font-semibold text-gray-800 mb-1">Completed</h3>
              <p className="text-3xl font-bold text-green-600">
                {donations.filter(d => d.status === 'completed').length}
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
                    activeTab === 'active'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  onClick={() => setActiveTab('active')}
                >
                  <List size={18} className="mr-2" />
                  Active Donations
                </button>
                <button
                  className={`flex items-center px-4 py-2 rounded-r-lg ${
                    activeTab === 'past'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  onClick={() => setActiveTab('past')}
                >
                  <History size={18} className="mr-2" />
                  Past Donations
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
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as DonationStatus | 'all')}
                  >
                    <option value="all">All Statuses</option>
                    {activeTab === 'active' ? (
                      <>
                        <option value="pending">Pending</option>
                        <option value="accepted">Accepted</option>
                        <option value="picked_up">In Transit</option>
                      </>
                    ) : (
                      <>
                        <option value="completed">Completed</option>
                        <option value="canceled">Canceled</option>
                      </>
                    )}
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
                  <Utensils size={32} className="text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">No donations found</h3>
                <p className="text-gray-600 mb-6">
                  {activeTab === 'active' 
                    ? 'You don\'t have any active donations. Create one now!' 
                    : 'You don\'t have any past donations yet.'}
                </p>
                {activeTab === 'active' && (
                  <Button variant="primary">
                    <Plus size={18} className="mr-2" />
                    Create Donation
                  </Button>
                )}
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
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDonationStatusColor(donation.status)}`}>
                          {getDonationStatusLabel(donation.status)}
                        </span>
                      </div>
                      
                      <div className="mb-4">
                        {donation.notes && (
                          <p className="text-gray-700 text-sm mb-2">{donation.notes}</p>
                        )}
                        
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="flex items-center">
                            <Calendar size={16} className="text-gray-500 mr-1.5" />
                            <span className="text-gray-700">{formatDate(donation.pickupTime)}</span>
                          </div>
                          <div className="flex items-center">
                            <Clock size={16} className="text-gray-500 mr-1.5" />
                            <span className="text-gray-700">{formatTime(donation.pickupTime)}</span>
                          </div>
                          <div className="flex items-center">
                            <Users size={16} className="text-gray-500 mr-1.5" />
                            <span className="text-gray-700">{donation.servings} servings</span>
                          </div>
                          <div className="flex items-center">
                            <MapPin size={16} className="text-gray-500 mr-1.5" />
                            <span className="text-gray-700">{donation.location.city}</span>
                          </div>
                        </div>
                      </div>
                      
                      {donation.ngoId && (
                        <div className="mb-4 pb-3 border-b border-gray-100">
                          <div className="text-sm">
                            <span className="text-gray-600">
                              {donation.status === 'completed' ? 'Distributed by: ' : 'Accepted by: '}
                            </span>
                            <span className="font-medium text-gray-800">{donation.ngoName}</span>
                          </div>
                        </div>
                      )}
                    </CardContent>
                    
                    <CardFooter className="bg-gray-50 p-4 flex justify-between">
                      {donation.ngoId && donation.status !== 'completed' ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleMessageClick(donation)}
                          className="flex items-center"
                        >
                          <MessageCircle size={16} className="mr-1.5" />
                          Message NGO
                        </Button>
                      ) : (
                        <div /> // Empty div for spacing
                      )}
                      
                      <Button
                        variant={donation.status === 'pending' ? 'outline-secondary' : 'outline'}
                        size="sm"
                      >
                        View Details
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Cancel Confirmation Modal */}
      <Modal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        title="Cancel Donation"
      >
        <div className="p-4">
          <p className="mb-4 text-gray-700">
            Are you sure you want to cancel this donation? This action cannot be undone.
          </p>
          <div className="flex justify-end space-x-3">
            <Button 
              variant="ghost" 
              onClick={() => setShowCancelModal(false)}
            >
              No, Keep It
            </Button>
            <Button 
              variant="primary"
              className="bg-red-600 hover:bg-red-700"
              onClick={handleConfirmCancel}
            >
              Yes, Cancel Donation
            </Button>
          </div>
        </div>
      </Modal>
      
      {/* Chat Modal */}
      <Modal
        isOpen={showChatModal}
        onClose={() => setShowChatModal(false)}
        title="Chat"
      >
        {selectedDonation && (
          <ChatWindow
            chatId={selectedDonation.id}
            recipientName={selectedDonation.ngoName || ''}
            onClose={() => setShowChatModal(false)}
          />
        )}
      </Modal>
      
      {/* Notification Toast */}
      {notification.show && (
        <NotificationToast
          title={notification.title}
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(prev => ({ ...prev, show: false }))}
        />
      )}
    </PageContainer>
  );
};

// Food icon component for empty state
const Utensils = (props: any) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={props.size || 24}
    height={props.size || 24}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
    <path d="M7 2v20" />
    <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
  </svg>
);

export default DonorDashboard;