import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

interface Address {
  street: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

// If you have a UserRole type elsewhere, import it and use UserRole instead of string for 'role'
type UserRole = 'donor' | 'ngo';

interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
  username: string;
  role: UserRole;
  organizationName: string;
  phone: string;
  address: Address;
}

const RegisterForm: React.FC = () => {
  const navigate = useNavigate();
  const { register, isLoading, error, clearError } = useAuthStore();
  
  const [formData, setFormData] = useState<RegisterFormData>({
    email: '',
    password: '',
    confirmPassword: '',
    username: '',
    role: 'donor', // default to donor
    organizationName: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      pincode: '',
      country: 'India'
    }
  });
  
  const [localError, setLocalError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      // Handle nested address fields
      const [parent, child] = name.split('.') as [keyof RegisterFormData, keyof Address];
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof RegisterFormData] as Address,
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const validateForm = () => {
    if (!formData.email || !formData.password || !formData.username) {
      setLocalError('Please fill in all required fields');
      return false;
    }
    if (formData.password.length < 8) {
      setLocalError('Password must be at least 8 characters long');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setLocalError('Passwords do not match');
      return false;
    }
    if (formData.role === 'ngo' && !formData.organizationName) {
      setLocalError('Organization name is required for NGO registration');
      return false;
    }
    if (!formData.phone) {
      setLocalError('Phone number is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    clearError();

    if (!validateForm()) {
      return;
    }

    try {
      const { confirmPassword, ...userData } = formData;
      await register(userData, formData.password);
      // Redirect will happen automatically through auth store
    } catch (err) {
      console.error('Registration error:', err);
      setLocalError('Failed to register. Please try again.');
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Create an Account</h2>
      <p className="text-center text-gray-600 mb-6">
        Join the FoodBridge community and start making a difference.
      </p>
      
      {(error || localError) && (
        <div className="mb-4 p-3 bg-red-100 border-l-4 border-red-500 text-red-700">
          {error || localError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Account Type</label>
          <div className="grid grid-cols-2 gap-4">
            <label className={`flex items-center p-4 border rounded-lg cursor-pointer ${
              formData.role === 'donor' ? 'border-primary-500 bg-primary-50' : 'border-gray-200'
            }`}>
              <input
                type="radio"
                name="role"
                value="donor"
                checked={formData.role === 'donor'}
                onChange={handleChange}
                className="hidden"
              />
              <div>
                <div className="flex items-center mb-1">
                  <span className="text-sm font-medium">I want to donate food</span>
                </div>
                <p className="text-xs text-gray-500">
                  For restaurants, event organizers, households with surplus food
                </p>
              </div>
            </label>

            <label className={`flex items-center p-4 border rounded-lg cursor-pointer ${
              formData.role === 'ngo' ? 'border-primary-500 bg-primary-50' : 'border-gray-200'
            }`}>
              <input
                type="radio"
                name="role"
                value="ngo"
                checked={formData.role === 'ngo'}
                onChange={handleChange}
                className="hidden"
              />
              <div>
                <div className="flex items-center mb-1">
                  <span className="text-sm font-medium">I distribute food</span>
                </div>
                <p className="text-xs text-gray-500">
                  For NGOs and organizations that help feed those in need
                </p>
              </div>
            </label>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              placeholder="johndoe"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="your@email.com"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Create a password"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
              <button
                type="button"
                className="absolute right-2 top-2 text-gray-500"
                onClick={() => setShowPassword((show) => !show)}
                tabIndex={-1}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            {formData.password && formData.password.length < 8 && (
              <p className="text-xs text-red-500 mt-1">Password must be at least 8 characters long.</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                placeholder="Confirm your password"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
              <button
                type="button"
                className="absolute right-2 top-2 text-gray-500"
                onClick={() => setShowConfirmPassword((show) => !show)}
                tabIndex={-1}
              >
                {showConfirmPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            {formData.confirmPassword && formData.password !== formData.confirmPassword && (
              <p className="text-xs text-red-500 mt-1">Passwords do not match.</p>
            )}
          </div>
        </div>

        {formData.role === 'ngo' && (
          <div>
            <label className="block text-sm font-medium text-gray-700">Organization Name</label>
            <input
              type="text"
              name="organizationName"
              value={formData.organizationName}
              onChange={handleChange}
              required
              placeholder="Your NGO name"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700">Phone</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
            placeholder="Your phone number"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Address Information</label>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <input
                type="text"
                name="address.street"
                placeholder="Street Address"
                value={formData.address.street}
                onChange={handleChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            
            <div>
              <input
                type="text"
                name="address.city"
                placeholder="City"
                value={formData.address.city}
                onChange={handleChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            
            <div>
              <input
                type="text"
                name="address.state"
                placeholder="State/Province"
                value={formData.address.state}
                onChange={handleChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            
            <div>
              <input
                type="text"
                name="address.pincode"
                placeholder="ZIP/Postal Code"
                value={formData.address.pincode}
                onChange={handleChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            
            <div>
              <input
                type="text"
                name="address.country"
                placeholder="Country"
                value={formData.address.country}
                onChange={handleChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
        >
          {isLoading ? 'Creating Account...' : 'Create Account'}
        </button>

        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="text-primary-600 hover:text-primary-500 font-medium"
            >
              Log In
            </button>
          </p>
        </div>
      </form>
    </div>
  );
};

export default RegisterForm;