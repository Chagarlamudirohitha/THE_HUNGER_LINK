import React from 'react';
import { Link } from 'react-router-dom';
import PageContainer from '../components/layout/PageContainer';
import Button from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { MapPin, Users, BarChart, Award } from 'lucide-react';

const AboutPage: React.FC = () => {
  return (
    <PageContainer>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto mb-12 text-center">
          <h1 className="text-4xl font-bold mb-6 text-gray-800">About The Hunger Link</h1>
          <p className="text-xl text-gray-600">
            We're on a mission to reduce food waste and hunger by connecting those with surplus food to those who need it most.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          <div>
            <h2 className="text-2xl font-bold mb-4 text-gray-800">The Problem We're Solving</h2>
            <p className="text-gray-700 mb-4">
              Every day, tons of perfectly good food goes to waste while millions of people go hungry. Restaurants, event organizers, and households often have surplus food that could feed those in need, but lack an efficient way to connect with organizations that can distribute it.
            </p>
            <p className="text-gray-700 mb-6">
              Meanwhile, NGOs and community organizations that serve the hungry often struggle to find consistent sources of food donations. The disconnect between food donors and distributors leads to unnecessary waste and missed opportunities to help those in need.
            </p>
            
            <div className="bg-gray-100 p-6 rounded-lg mb-6">
              <h3 className="font-bold text-gray-800 mb-2">The Numbers</h3>
              <ul className="space-y-2">
                <li className="flex items-baseline">
                  <span className="text-primary-600 font-bold mr-2">•</span>
                  <span>One-third of all food produced globally is wasted</span>
                </li>
                <li className="flex items-baseline">
                  <span className="text-primary-600 font-bold mr-2">•</span>
                  <span>Food waste generates 8% of global greenhouse gas emissions</span>
                </li>
                <li className="flex items-baseline">
                  <span className="text-primary-600 font-bold mr-2">•</span>
                  <span>Over 800 million people worldwide don't have enough to eat</span>
                </li>
                <li className="flex items-baseline">
                  <span className="text-primary-600 font-bold mr-2">•</span>
                  <span>In the US alone, 40% of food is thrown away while 1 in 8 Americans faces food insecurity</span>
                </li>
              </ul>
            </div>
            
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Our Solution</h2>
            <p className="text-gray-700 mb-4">
              The Hunger Link is a platform that connects food donors with NGOs and community organizations that can redistribute the food to those who need it. By bridging this gap, we're reducing food waste, fighting hunger, and building stronger communities.
            </p>
            <p className="text-gray-700">
              Our platform makes it easy for restaurants, event organizers, and households to donate surplus food, and for NGOs to find and accept donations in their area. With features like the Community Impact Map and real-time impact statistics, we're creating a transparent ecosystem of giving that shows the tangible difference each donation makes.
            </p>
          </div>
          
          <div>
            <div className="mb-6">
              <img 
                src="https://images.pexels.com/photos/6647037/pexels-photo-6647037.jpeg?auto=compress&cs=tinysrgb&w=800" 
                alt="Food donation" 
                className="rounded-lg shadow-lg w-full h-auto"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-primary-50 p-6 rounded-lg">
                <MapPin size={24} className="text-primary-600 mb-2" />
                <h3 className="font-bold text-gray-800 mb-2">Community Impact Map</h3>
                <p className="text-gray-700 text-sm">
                  Visualize real-time donation activity across your community and see the impact firsthand.
                </p>
              </div>
              
              <div className="bg-secondary-50 p-6 rounded-lg">
                <Users size={24} className="text-secondary-600 mb-2" />
                <h3 className="font-bold text-gray-800 mb-2">Direct Connections</h3>
                <p className="text-gray-700 text-sm">
                  Connect directly with donors or NGOs to coordinate food pickups and deliveries.
                </p>
              </div>
              
              <div className="bg-accent-50 p-6 rounded-lg">
                <BarChart size={24} className="text-accent-600 mb-2" />
                <h3 className="font-bold text-gray-800 mb-2">Impact Statistics</h3>
                <p className="text-gray-700 text-sm">
                  Track donations, people fed, and your personal contribution to fighting hunger.
                </p>
              </div>
              
              <div className="bg-green-50 p-6 rounded-lg">
                <Award size={24} className="text-green-600 mb-2" />
                <h3 className="font-bold text-gray-800 mb-2">Community Building</h3>
                <p className="text-gray-700 text-sm">
                  Join a community of like-minded individuals and organizations making a difference.
                </p>
              </div>
            </div>
            
            <div className="mt-8 flex justify-center">
              <Link to="/register">
                <Button variant="primary" size="lg" className="rounded-full">
                  Join the Movement
                </Button>
              </Link>
            </div>
          </div>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">Who We Serve</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-3 text-gray-800">Food Donors</h3>
                <ul className="space-y-2">
                  <li className="flex items-baseline">
                    <span className="text-primary-600 font-bold mr-2">•</span>
                    <span className="text-gray-700">Restaurants & Cafes</span>
                  </li>
                  <li className="flex items-baseline">
                    <span className="text-primary-600 font-bold mr-2">•</span>
                    <span className="text-gray-700">Event Organizers</span>
                  </li>
                  <li className="flex items-baseline">
                    <span className="text-primary-600 font-bold mr-2">•</span>
                    <span className="text-gray-700">Catering Companies</span>
                  </li>
                  <li className="flex items-baseline">
                    <span className="text-primary-600 font-bold mr-2">•</span>
                    <span className="text-gray-700">Hotels & Hostels</span>
                  </li>
                  <li className="flex items-baseline">
                    <span className="text-primary-600 font-bold mr-2">•</span>
                    <span className="text-gray-700">Households</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-3 text-gray-800">Food Distributors</h3>
                <ul className="space-y-2">
                  <li className="flex items-baseline">
                    <span className="text-primary-600 font-bold mr-2">•</span>
                    <span className="text-gray-700">Food Banks</span>
                  </li>
                  <li className="flex items-baseline">
                    <span className="text-primary-600 font-bold mr-2">•</span>
                    <span className="text-gray-700">Homeless Shelters</span>
                  </li>
                  <li className="flex items-baseline">
                    <span className="text-primary-600 font-bold mr-2">•</span>
                    <span className="text-gray-700">Community Kitchens</span>
                  </li>
                  <li className="flex items-baseline">
                    <span className="text-primary-600 font-bold mr-2">•</span>
                    <span className="text-gray-700">Religious Organizations</span>
                  </li>
                  <li className="flex items-baseline">
                    <span className="text-primary-600 font-bold mr-2">•</span>
                    <span className="text-gray-700">Social Service NGOs</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-3 text-gray-800">End Beneficiaries</h3>
                <ul className="space-y-2">
                  <li className="flex items-baseline">
                    <span className="text-primary-600 font-bold mr-2">•</span>
                    <span className="text-gray-700">Homeless Individuals</span>
                  </li>
                  <li className="flex items-baseline">
                    <span className="text-primary-600 font-bold mr-2">•</span>
                    <span className="text-gray-700">Low-Income Families</span>
                  </li>
                  <li className="flex items-baseline">
                    <span className="text-primary-600 font-bold mr-2">•</span>
                    <span className="text-gray-700">At-Risk Youth</span>
                  </li>
                  <li className="flex items-baseline">
                    <span className="text-primary-600 font-bold mr-2">•</span>
                    <span className="text-gray-700">Elderly in Need</span>
                  </li>
                  <li className="flex items-baseline">
                    <span className="text-primary-600 font-bold mr-2">•</span>
                    <span className="text-gray-700">Crisis-Affected Individuals</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
          
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Join Us in Making a Difference</h2>
            <p className="text-lg text-gray-700 mb-6 max-w-3xl mx-auto">
              Whether you're a restaurant with leftover food, an NGO serving the hungry, or an individual passionate about reducing food waste, we invite you to be part of our community. Together, we can build a world where good food feeds people, not landfills.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button 
                  variant="primary" 
                  size="lg" 
                  className="rounded-full w-full sm:w-auto"
                >
                  Register Now
                </Button>
              </Link>
              <Link to="/contact">
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="rounded-full w-full sm:w-auto"
                >
                  Contact Us
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

export default AboutPage;