import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Calendar, Clock, MapPin, Info } from 'lucide-react';
import Button from '../ui/Button';
import { Card, CardHeader, CardContent, CardFooter } from '../ui/Card';
import PageContainer from '../layout/PageContainer';
import useAuthStore from '../../store/authStore';
import useDonationStore from '../../store/donationStore';
import type { FoodType } from '../../types';

interface CreateDonationFormValues {
  foodType: FoodType;
  servings: number;
  pickupTime: string;
  expiryDate: string;
  notes?: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

const CreateDonationForm: React.FC = () => {
  const { user } = useAuthStore();
  const { createDonation, error, clearError } = useDonationStore();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { 
    register, 
    handleSubmit,
    formState: { errors } 
  } = useForm<CreateDonationFormValues>();
  
  const onSubmit = async (data: CreateDonationFormValues) => {
    if (!user) return;
    
    setIsSubmitting(true);
    clearError();
    
    try {
      await createDonation({
        donorId: user.id,
        donorName: user.username,
        foodType: data.foodType,
        servings: data.servings,
        pickupTime: data.pickupTime,
        expiryDate: data.expiryDate,
        notes: data.notes,
        location: {
          street: data.street,
          city: data.city,
          state: data.state,
          pincode: data.pincode,
          country: data.country
        }
      });
      
      // Navigate back to dashboard after successful creation
      navigate('/donor/dashboard');
    } catch (err) {
      // Error is handled by the store
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <PageContainer>
      <div className="container mx-auto px-4 py-8">
        <Card className="w-full max-w-2xl mx-auto">
          <CardHeader>
            <h2 className="text-2xl font-bold text-gray-800">Create New Donation</h2>
            <p className="text-gray-600 mt-2">
              Fill in the details about the food you want to donate
            </p>
          </CardHeader>
          
          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="space-y-6">
              {/* Food Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-700">Food Details</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="foodType" className="block text-sm font-medium text-gray-700">
                      Food Type
                    </label>
                    <select
                      id="foodType"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                      {...register('foodType', { required: 'Food type is required' })}
                    >
                      <option value="">Select food type</option>
                      <option value="cooked">Cooked Food</option>
                      <option value="packaged">Packaged Food</option>
                      <option value="perishable">Perishable Items</option>
                      <option value="non-perishable">Non-Perishable Items</option>
                      <option value="other">Other</option>
                    </select>
                    {errors.foodType && (
                      <p className="mt-1 text-sm text-red-600">{errors.foodType.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="servings" className="block text-sm font-medium text-gray-700">
                      Number of Servings
                    </label>
                    <input
                      type="number"
                      id="servings"
                      min="1"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                      {...register('servings', { 
                        required: 'Number of servings is required',
                        min: {
                          value: 1,
                          message: 'Must be at least 1 serving'
                        }
                      })}
                    />
                    {errors.servings && (
                      <p className="mt-1 text-sm text-red-600">{errors.servings.message}</p>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="pickupTime" className="block text-sm font-medium text-gray-700">
                      Pickup Time
                    </label>
                    <input
                      type="datetime-local"
                      id="pickupTime"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                      {...register('pickupTime', { required: 'Pickup time is required' })}
                    />
                    {errors.pickupTime && (
                      <p className="mt-1 text-sm text-red-600">{errors.pickupTime.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700">
                      Expiry Date
                    </label>
                    <input
                      type="datetime-local"
                      id="expiryDate"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                      {...register('expiryDate', { required: 'Expiry date is required' })}
                    />
                    {errors.expiryDate && (
                      <p className="mt-1 text-sm text-red-600">{errors.expiryDate.message}</p>
                    )}
                  </div>
                </div>
                
                <div>
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                    Additional Notes
                  </label>
                  <textarea
                    id="notes"
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    placeholder="Any special instructions or details about the food..."
                    {...register('notes')}
                  />
                </div>
              </div>
              
              {/* Pickup Location */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-700">Pickup Location</h3>
                
                <div>
                  <label htmlFor="street" className="block text-sm font-medium text-gray-700">
                    Street Address
                  </label>
                  <input
                    type="text"
                    id="street"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    {...register('street', { required: 'Street address is required' })}
                  />
                  {errors.street && (
                    <p className="mt-1 text-sm text-red-600">{errors.street.message}</p>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                      City
                    </label>
                    <input
                      type="text"
                      id="city"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                      {...register('city', { required: 'City is required' })}
                    />
                    {errors.city && (
                      <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="state" className="block text-sm font-medium text-gray-700">
                      State
                    </label>
                    <input
                      type="text"
                      id="state"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                      {...register('state', { required: 'State is required' })}
                    />
                    {errors.state && (
                      <p className="mt-1 text-sm text-red-600">{errors.state.message}</p>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="pincode" className="block text-sm font-medium text-gray-700">
                      PIN Code
                    </label>
                    <input
                      type="text"
                      id="pincode"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                      {...register('pincode', { 
                        required: 'PIN code is required',
                        pattern: {
                          value: /^[0-9]{6}$/,
                          message: 'Please enter a valid 6-digit PIN code'
                        }
                      })}
                    />
                    {errors.pincode && (
                      <p className="mt-1 text-sm text-red-600">{errors.pincode.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="country" className="block text-sm font-medium text-gray-700">
                      Country
                    </label>
                    <input
                      type="text"
                      id="country"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                      {...register('country', { required: 'Country is required' })}
                    />
                    {errors.country && (
                      <p className="mt-1 text-sm text-red-600">{errors.country.message}</p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => navigate('/donor/dashboard')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Creating...' : 'Create Donation'}
              </Button>
            </CardFooter>
          </form>
          
          {error && (
            <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
              <div className="flex">
                <Info size={20} className="mr-2" />
                <p>{error}</p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </PageContainer>
  );
};

export default CreateDonationForm; 