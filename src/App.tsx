import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';

// Layout Components
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';

// Page Components
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import MissionPage from './pages/MissionPage';
import ImpactMapPage from './pages/ImpactMapPage';
import ContactPage from './pages/ContactPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DonorDashboard from './pages/donor/DonorDashboard';
import NGODashboard from './pages/ngo/NGODashboard';
import CreateDonationForm from './components/donor/CreateDonationForm';
import DonationDetails from './pages/DonationDetails';
import NotificationManager from './components/notifications/NotificationManager';
import ImpactMap from './components/map/ImpactMap';

// Stores
import useAuthStore from './store/authStore';
import useStatsStore from './store/statsStore';

// Protected Route Component
const ProtectedRoute: React.FC<{
  children?: React.ReactNode;
  allowedRoles?: string[];
}> = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, user, isLoading } = useAuthStore();
  
  // Show loading state
  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
    </div>;
  }
  
  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    console.log('Not authenticated, redirecting to login');
    return <Navigate to="/login" replace />;
  }
  
  // Check role access
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    console.log('Invalid role, redirecting to home');
    return <Navigate to="/" replace />;
  }
  
  return children ? <>{children}</> : <Outlet />;
};

function App() {
  const { getStats } = useStatsStore();
  
  useEffect(() => {
    // Fetch initial stats
    getStats();
  }, [getStats]);
  
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/mission" element={<MissionPage />} />
            <Route path="/impact-map" element={<ImpactMapPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            
            {/* Protected Routes - Donor */}
            <Route element={<ProtectedRoute allowedRoles={['donor']} />}>
              <Route path="/donor/dashboard" element={<DonorDashboard />} />
              <Route path="/donor/create-donation" element={<CreateDonationForm />} />
            </Route>
            
            {/* Protected Routes - NGO */}
            <Route element={<ProtectedRoute allowedRoles={['ngo']} />}>
              <Route path="/ngo/dashboard" element={<NGODashboard />} />
            </Route>
            
            {/* Donation Details Route */}
            <Route path="/donations/:id" element={<DonationDetails />} />
            
            {/* Impact Map Route */}
            <Route path="/impact-map" element={<ImpactMap />} />
          </Routes>
        </main>
        <NotificationManager />
        <Footer />
      </div>
    </Router>
  );
}

export default App;