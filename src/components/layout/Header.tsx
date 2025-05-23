import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Menu, X, Bell, User, Home, Info, 
  Heart, BookOpen, Mail, LogOut, MapPin
} from 'lucide-react';
import Button from '../ui/Button';
import useAuthStore from '../../store/authStore';
import useNotificationStore from '../../store/notificationStore';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuthStore();
  const { notifications, unreadCount, markAsRead } = useNotificationStore();
  const navigate = useNavigate();
  const location = useLocation();
  
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);
  const toggleUserMenu = () => setIsUserMenuOpen(!isUserMenuOpen);
  
  const toggleNotifications = () => {
    setIsNotificationsOpen(!isNotificationsOpen);
  };
  
  const handleLogout = () => {
    logout();
    closeMenu();
    setIsUserMenuOpen(false);
    setIsNotificationsOpen(false);
    navigate('/', { replace: true });
  };
  
  const handleNotificationClick = (id: string) => {
    markAsRead(id);
  };
  
  const navLinks = [
    { name: 'Home', path: '/', icon: <Home size={16} /> },
    { name: 'About', path: '/about', icon: <Info size={16} /> },
    { name: 'Mission & Vision', path: '/mission', icon: <Heart size={16} /> },
    { name: 'Impact Map', path: '/impact-map', icon: <MapPin size={16} /> },
    { name: 'Contact', path: '/contact', icon: <Mail size={16} /> },
  ];
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <div className="flex items-center justify-center bg-primary-600 text-white rounded-full w-10 h-10 mr-2">
              <Heart size={20} fill="white" />
            </div>
            <span className="font-display font-bold text-xl md:text-2xl text-primary-600">
              The Hunger Link
            </span>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center text-sm font-medium ${
                  isActive(link.path)
                    ? 'text-primary-600'
                    : 'text-gray-600 hover:text-primary-600'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>
          
          {/* User Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                {/* Notifications */}
                <div className="relative">
                  <button
                    onClick={toggleNotifications}
                    className="p-2 text-gray-600 hover:text-primary-600 rounded-full hover:bg-gray-100"
                    aria-label="Notifications"
                  >
                    <Bell size={20} />
                    {unreadCount > 0 && (
                      <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}
                  </button>
                  
                  {/* Notifications Dropdown */}
                  {isNotificationsOpen && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg z-10 py-2 border border-gray-200">
                      <div className="px-4 py-2 border-b border-gray-200">
                        <h3 className="font-medium">Notifications</h3>
                      </div>
                      {notifications.length === 0 ? (
                        <div className="px-4 py-3 text-sm text-gray-500">
                          No notifications
                        </div>
                      ) : (
                        <div className="max-h-80 overflow-y-auto">
                          {notifications.map((notification) => (
                            <div
                              key={notification.id}
                              className={`px-4 py-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                                !notification.isRead ? 'bg-blue-50' : ''
                              }`}
                              onClick={() => handleNotificationClick(notification.id)}
                            >
                              <div className="font-medium text-sm">
                                {notification.title}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                {notification.message}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                {/* Dashboard */}
                <Link to={user?.role === 'donor' ? '/donor/dashboard' : '/ngo/dashboard'}>
                  <Button variant="primary" size="sm">
                    Dashboard
                  </Button>
                </Link>
                
                {/* User Menu */}
                <div className="relative">
                  <button 
                    onClick={toggleUserMenu}
                    className="flex items-center text-sm font-medium text-gray-700 hover:text-primary-600"
                  >
                    <User size={20} className="mr-1" />
                    <span>{user?.username}</span>
                  </button>
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-10 py-2 border border-gray-200">
                      <div className="px-4 py-2 border-b border-gray-200">
                        <div className="font-medium">{user?.username}</div>
                        <div className="text-xs text-gray-500 mt-1">{user?.email}</div>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                      >
                        <LogOut size={16} className="mr-2" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="outline" size="sm">
                    Log In
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="sm">
                    Register
                  </Button>
                </Link>
              </>
            )}
          </div>
          
          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-md text-gray-700 hover:text-primary-600 hover:bg-gray-100"
            onClick={toggleMenu}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
      
      {/* Mobile Menu */}
      <div
        className={`md:hidden bg-white border-t border-gray-100 ${
          isMenuOpen ? 'block' : 'hidden'
        }`}
      >
        <div className="container mx-auto px-4 py-3">
          <nav className="flex flex-col space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center p-2 text-sm font-medium rounded-md ${
                  isActive(link.path)
                    ? 'text-primary-600 bg-primary-50'
                    : 'text-gray-600 hover:text-primary-600 hover:bg-gray-50'
                }`}
                onClick={closeMenu}
              >
                <span className="mr-2">{link.icon}</span>
                {link.name}
              </Link>
            ))}
            
            {isAuthenticated ? (
              <>
                <Link
                  to={user?.role === 'donor' ? '/donor/dashboard' : '/ngo/dashboard'}
                  className="flex items-center p-2 text-sm font-medium rounded-md text-gray-600 hover:text-primary-600 hover:bg-gray-50"
                  onClick={closeMenu}
                >
                  <User size={16} className="mr-2" />
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center p-2 text-sm font-medium rounded-md text-gray-600 hover:text-primary-600 hover:bg-gray-50 w-full text-left"
                >
                  <LogOut size={16} className="mr-2" />
                  Logout
                </button>
              </>
            ) : (
              <div className="flex flex-col space-y-2 pt-2 border-t border-gray-100 mt-2">
                <Link to="/login" onClick={closeMenu}>
                  <Button variant="outline" className="w-full justify-center">
                    Log In
                  </Button>
                </Link>
                <Link to="/register" onClick={closeMenu}>
                  <Button variant="primary" className="w-full justify-center">
                    Register
                  </Button>
                </Link>
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;