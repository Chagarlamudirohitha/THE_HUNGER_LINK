import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Users, ArrowRight } from 'lucide-react';
import Button from '../ui/Button';

const HeroSection: React.FC = () => {
  return (
    <section className="relative bg-gradient-to-br from-primary-600 to-primary-800 text-white overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path 
            d="M0,0 L100,0 L100,100 L0,100 Z" 
            fill="url(#grid-pattern)" 
          />
          <defs>
            <pattern 
              id="grid-pattern" 
              patternUnits="userSpaceOnUse" 
              width="10" 
              height="10"
              x="0" 
              y="0"
            >
              <path 
                d="M0,0 L10,0 L10,10 L0,10 Z" 
                fill="none" 
                stroke="white" 
                strokeWidth="0.5"
              />
            </pattern>
          </defs>
        </svg>
      </div>
      
      <div className="container mx-auto px-4 py-16 md:py-24 lg:py-32 relative z-10">
        <div className="flex flex-col lg:flex-row items-center">
          <div className="lg:w-1/2 mb-8 lg:mb-0 lg:pr-12">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Bridging the Gap Between Surplus Food and Hunger
            </h1>
            <p className="text-lg md:text-xl mb-8 text-gray-100">
              The Hunger Link connects restaurants, event organizers, and households with surplus food to NGOs that can distribute it to those in need. Join our mission to reduce food waste and fight hunger.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/register">
                <Button 
                  variant="accent" 
                  size="lg" 
                  className="font-medium rounded-full"
                >
                  Register Now
                </Button>
              </Link>
              <Link to="/impact-map">
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="font-medium rounded-full border-white text-white hover:bg-white hover:text-primary-700"
                >
                  <MapPin size={18} className="mr-2" /> 
                  Explore Impact Map
                </Button>
              </Link>
            </div>
            <div className="mt-8 flex items-center">
              <Link to="/about" className="flex items-center text-gray-100 hover:text-white group">
                <span className="mr-2 font-medium">Learn How It Works</span>
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
          
          <div className="lg:w-1/2">
            <div className="relative">
              <div className="rounded-2xl overflow-hidden shadow-2xl">
                <img 
                  src="https://images.pexels.com/photos/6646864/pexels-photo-6646864.jpeg?auto=compress&cs=tinysrgb&w=800" 
                  alt="Food donation" 
                  className="w-full h-auto" 
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white rounded-lg shadow-xl p-4 max-w-xs">
                <div className="flex items-center mb-2">
                  <div className="bg-accent-500 p-2 rounded-full mr-3">
                    <Users size={20} className="text-white" />
                  </div>
                  <h3 className="font-bold text-gray-800">Make a Difference</h3>
                </div>
                <p className="text-gray-600 text-sm">
                  Your surplus food can feed hungry people in your community. Every donation counts!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;