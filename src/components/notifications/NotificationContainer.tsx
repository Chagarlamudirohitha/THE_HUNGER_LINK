import React, { useState } from 'react';
import { User } from '../../types';
import NotificationBell from './NotificationBell';
import NotificationPanel from './NotificationPanel';

interface NotificationContainerProps {
  currentUser: User;
}

const NotificationContainer: React.FC<NotificationContainerProps> = ({ currentUser }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <NotificationBell
        currentUser={currentUser}
        onClick={() => setIsOpen(!isOpen)}
      />
      {isOpen && (
        <NotificationPanel
          currentUser={currentUser}
          onClose={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default NotificationContainer; 