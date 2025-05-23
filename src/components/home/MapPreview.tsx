import React from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';
import Button from '../ui/Button';

const MapPreview: React.FC = () => {
  return (
    <section className="py-16 bg-gradient-to-br from-secondary-50 to-secondary-100">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          <div className="lg:w-1/2 order-2 lg:order-1">
            <div className="relative rounded-xl overflow-hidden shadow-xl border-4 border-white">
              <img 
                src="https://images.pexels.com/photos/14914098/pexels-photo-14914098.jpeg?auto=compress&cs=tinysrgb&w=800" 
                alt="Community Impact Map Preview" 
                className="w-full h-auto"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-6">
                <h4 className="text-white text-xl font-bold mb-2">Community Impact Map</h4>
                <p className="text-white text-sm mb-4">
                  Visualize real-time donation activity across locations
                </p>
                <Link to="/impact-map">
                  <Button variant="accent" size="sm" className="inline-flex items-center">
                    <span>Explore Full Map</span>
                    <ExternalLink size={16} className="ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
          
          <div className="lg:w-1/2 order-1 lg:order-2">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-800">
              See Your Impact in Real-Time
            </h2>
            <p className="text-lg text-gray-700 mb-6">
              Our Community Impact Map is a powerful visualization tool that shows how your donations are making a difference across your community and beyond.
            </p>
            
            <div className="space-y-4 mb-8">
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1 h-6 w-6 rounded-full bg-green-500"></div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-800">Completed Donations</h3>
                  <p className="text-gray-600">See where food has been successfully shared</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1 h-6 w-6 rounded-full bg-blue-500"></div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-800">Accepted Donations</h3>
                  <p className="text-gray-600">Track donations currently in transit to recipients</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1 h-6 w-6 rounded-full bg-yellow-500"></div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-800">Pending Donations</h3>
                  <p className="text-gray-600">Discover donations waiting to be accepted</p>
                </div>
              </div>
            </div>
            
            <Link to="/impact-map">
              <Button 
                variant="secondary" 
                size="lg" 
                className="rounded-full font-medium inline-flex items-center"
              >
                Explore the Community Impact Map
                <ExternalLink size={18} className="ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MapPreview;