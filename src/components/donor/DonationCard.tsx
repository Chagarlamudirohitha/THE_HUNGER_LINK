import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, Users, MapPin } from 'lucide-react';
import { Card, CardContent, CardFooter } from '../ui/Card';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import ChatWindow from '../chat/ChatWindow';
import { Donation } from '../../types';
import useAuthStore from '../../store/authStore';
import useChatStore from '../../store/chatStore';

interface DonationCardProps {
  donation: Donation;
  onCancelClick?: (donation: Donation) => void;
}

const DonationCard: React.FC<DonationCardProps> = ({
  donation,
  onCancelClick
}) => {
  const { user } = useAuthStore();
  const { createChat } = useChatStore();
  const [showChatModal, setShowChatModal] = useState(false);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  const handleMessageClick = async () => {
    if (!donation.ngoId) return;
    
    try {
      await createChat([user!.id, donation.ngoId], donation.id);
      setSelectedChatId(donation.id);
      setShowChatModal(true);
    } catch (error) {
      setError('Failed to open chat. Please try again.');
    }
  };

  return (
    <>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <span className={`text-sm font-medium px-2 py-1 rounded-full ${
              donation.status === 'pending' ? 'bg-orange-100 text-orange-800' :
              donation.status === 'accepted' ? 'bg-blue-100 text-blue-800' :
              donation.status === 'completed' ? 'bg-green-100 text-green-800' :
              'bg-red-100 text-red-800'
            }`}>
              {donation.status.charAt(0).toUpperCase() + donation.status.slice(1)}
            </span>
            <span className="text-sm text-gray-500">
              {formatDate(donation.createdAt)}
            </span>
          </div>

          <h3 className="text-lg font-semibold mb-2">
            {donation.foodType.charAt(0).toUpperCase() + donation.foodType.slice(1)} Food
          </h3>

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
          <Link to={`/donations/${donation.id}`}>
            <Button variant="outline" size="sm">
              View Details
            </Button>
          </Link>

          {donation.status === 'pending' && onCancelClick && (
            <Button 
              variant="ghost" 
              size="sm"
              className="text-red-600 hover:bg-red-50"
              onClick={() => onCancelClick(donation)}
            >
              Cancel
            </Button>
          )}

          {donation.status === 'accepted' && (
            <Button 
              variant="outline-secondary" 
              size="sm"
              onClick={handleMessageClick}
            >
              Message NGO
            </Button>
          )}
        </CardFooter>
      </Card>

      {/* Chat Modal */}
      <Modal
        isOpen={showChatModal}
        onClose={() => setShowChatModal(false)}
        title="Chat"
      >
        {selectedChatId && donation.ngoName && (
          <ChatWindow
            chatId={selectedChatId}
            recipientName={donation.ngoName}
            onClose={() => setShowChatModal(false)}
          />
        )}
      </Modal>

      {/* Error Toast */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded shadow-md">
          <div className="flex">
            <div className="py-1">
              <svg
                className="h-6 w-6 text-red-500 mr-4"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div>
              <p className="font-bold">Error</p>
              <p className="text-sm">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="ml-auto pl-3"
            >
              <svg
                className="h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default DonationCard; 