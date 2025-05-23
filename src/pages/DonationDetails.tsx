import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, Clock, Users, MapPin, ArrowLeft } from 'lucide-react';
import PageContainer from '../components/layout/PageContainer';
import { Card, CardContent, CardHeader, CardFooter } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import ChatWindow from '../components/chat/ChatWindow';
import useAuthStore from '../store/authStore';
import useDonationStore from '../store/donationStore';
import useChatStore from '../store/chatStore';
import type { Donation } from '../types';

const DonationDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { donations, getDonationsByDonor, getDonationsByNGO } = useDonationStore();
  const { createChat } = useChatStore();
  
  const [donation, setDonation] = useState<Donation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showChatModal, setShowChatModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchDonation = async () => {
      if (!user?.id || !id) return;
      
      try {
        let userDonations: Donation[] = [];
        if (user.role === 'donor') {
          userDonations = await getDonationsByDonor(user.id);
        } else if (user.role === 'ngo') {
          userDonations = await getDonationsByNGO(user.id);
        }
        
        const foundDonation = userDonations.find(d => d.id === id);
        if (foundDonation) {
          setDonation(foundDonation);
        } else {
          setError('Donation not found');
        }
      } catch (error) {
        setError('Failed to load donation details');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDonation();
  }, [user, id, getDonationsByDonor, getDonationsByNGO]);
  
  const handleMessageClick = async () => {
    if (!donation || !user) return;
    
    try {
      const participantIds = user.role === 'donor' 
        ? [user.id, donation.ngoId!]
        : [user.id, donation.donorId];
        
      await createChat(participantIds, donation.id);
      setShowChatModal(true);
    } catch (error) {
      setError('Failed to open chat');
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
  
  const getDonationStatusColor = (status: Donation['status']) => {
    const colors = {
      pending: 'bg-orange-100 text-orange-800',
      accepted: 'bg-blue-100 text-blue-800',
      picked_up: 'bg-purple-100 text-purple-800',
      completed: 'bg-green-100 text-green-800',
      canceled: 'bg-red-100 text-red-800'
    };
    return colors[status];
  };
  
  const getDonationStatusLabel = (status: Donation['status']) => {
    const labels = {
      pending: 'Pending',
      accepted: 'Accepted',
      picked_up: 'In Transit',
      completed: 'Completed',
      canceled: 'Canceled'
    };
    return labels[status];
  };
  
  if (isLoading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </PageContainer>
    );
  }
  
  if (error || !donation) {
    return (
      <PageContainer>
        <div className="flex flex-col items-center justify-center min-h-screen">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            {error || 'Donation not found'}
          </h2>
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft size={16} className="mr-2" />
            Go Back
          </Button>
        </div>
      </PageContainer>
    );
  }
  
  return (
    <PageContainer>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft size={16} className="mr-2" />
            Back
          </Button>
        </div>
        
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">
                {donation.foodType.charAt(0).toUpperCase() + donation.foodType.slice(1)} Food Donation
              </h2>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getDonationStatusColor(donation.status)}`}>
                {getDonationStatusLabel(donation.status)}
              </span>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Donation Details */}
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Donation Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center">
                  <Calendar size={20} className="text-gray-500 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Pickup Date</p>
                    <p className="font-medium text-gray-800">{formatDate(donation.pickupTime)}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Clock size={20} className="text-gray-500 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Pickup Time</p>
                    <p className="font-medium text-gray-800">{formatTime(donation.pickupTime)}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Users size={20} className="text-gray-500 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Servings</p>
                    <p className="font-medium text-gray-800">{donation.servings}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Location Details */}
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Pickup Location</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-start">
                  <MapPin size={20} className="text-gray-500 mr-3 mt-1" />
                  <div>
                    <p className="text-gray-800">{donation.location.street}</p>
                    <p className="text-gray-800">
                      {donation.location.city}, {donation.location.state} {donation.location.pincode}
                    </p>
                    <p className="text-gray-800">{donation.location.country}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Additional Notes */}
            {donation.notes && (
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Additional Notes</h3>
                <p className="text-gray-700">{donation.notes}</p>
              </div>
            )}
            
            {/* NGO/Donor Information */}
            {user?.role === 'donor' && donation.ngoId ? (
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-4">NGO Information</h3>
                <p className="text-gray-700">Accepted by: <span className="font-medium">{donation.ngoName}</span></p>
              </div>
            ) : user?.role === 'ngo' ? (
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Donor Information</h3>
                <p className="text-gray-700">Posted by: <span className="font-medium">{donation.donorName}</span></p>
              </div>
            ) : null}
          </CardContent>
          
          <CardFooter className="bg-gray-50">
            <div className="w-full flex justify-end">
              {((user?.role === 'donor' && donation.ngoId) || 
                (user?.role === 'ngo' && donation.status === 'accepted')) && (
                <Button 
                  variant="primary"
                  onClick={handleMessageClick}
                >
                  Open Chat
                </Button>
              )}
            </div>
          </CardFooter>
        </Card>
      </div>
      
      {/* Chat Modal */}
      <Modal
        isOpen={showChatModal}
        onClose={() => setShowChatModal(false)}
        title="Chat"
      >
        {donation && (
          <ChatWindow
            chatId={donation.id}
            recipientName={user?.role === 'donor' ? donation.ngoName! : donation.donorName}
            onClose={() => setShowChatModal(false)}
          />
        )}
      </Modal>
    </PageContainer>
  );
};

export default DonationDetails; 