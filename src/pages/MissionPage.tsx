import React from 'react';
import { Link } from 'react-router-dom';
import PageContainer from '../components/layout/PageContainer';
import Button from '../components/ui/Button';
import { 
  Heart, Target, ArrowRight, Check, Map, 
  BarChart, ShieldCheck, Recycle, Globe 
} from 'lucide-react';

const MissionPage: React.FC = () => {
  return (
    <PageContainer>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto mb-12 text-center">
          <h1 className="text-4xl font-bold mb-6 text-gray-800">Our Mission & Vision</h1>
          <p className="text-xl text-gray-600">
            Guided by a clear mission and inspired by a bold vision, we're working towards a world without food waste and hunger.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-16">
          {/* Mission Section */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-primary-600 py-6 px-8">
              <div className="flex items-center">
                <div className="p-3 bg-white rounded-full mr-4">
                  <Target size={24} className="text-primary-600" />
                </div>
                <h2 className="text-3xl font-bold text-white">Our Mission</h2>
              </div>
            </div>
            
            <div className="p-8">
              <p className="text-lg text-gray-700 mb-6">
                <span className="font-semibold">To connect surplus food with those in need efficiently and sustainably,</span> creating a seamless bridge between food donors and distributors while reducing waste and fighting hunger in our communities.
              </p>
              
              <h3 className="font-bold text-xl mb-4 text-gray-800">We commit to:</h3>
              
              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <Check size={20} className="text-primary-600 mt-1 mr-2 flex-shrink-0" />
                  <span className="text-gray-700">
                    Making food donation simple, efficient, and accessible for all types of donors
                  </span>
                </li>
                <li className="flex items-start">
                  <Check size={20} className="text-primary-600 mt-1 mr-2 flex-shrink-0" />
                  <span className="text-gray-700">
                    Helping NGOs and community organizations find and access surplus food quickly
                  </span>
                </li>
                <li className="flex items-start">
                  <Check size={20} className="text-primary-600 mt-1 mr-2 flex-shrink-0" />
                  <span className="text-gray-700">
                    Reducing food waste and its environmental impact through efficient redistribution
                  </span>
                </li>
                <li className="flex items-start">
                  <Check size={20} className="text-primary-600 mt-1 mr-2 flex-shrink-0" />
                  <span className="text-gray-700">
                    Supporting the hunger relief efforts of our NGO partners with reliable food sources
                  </span>
                </li>
                <li className="flex items-start">
                  <Check size={20} className="text-primary-600 mt-1 mr-2 flex-shrink-0" />
                  <span className="text-gray-700">
                    Creating transparency through our Community Impact Map and Impact Statistics
                  </span>
                </li>
              </ul>
              
              <div className="flex items-center justify-between p-5 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <Map size={24} className="text-primary-600 mr-3" />
                  <div>
                    <h4 className="font-semibold text-gray-800">Community Impact Map</h4>
                    <p className="text-sm text-gray-600">Visualizing our mission in action</p>
                  </div>
                </div>
                <Link to="/impact-map">
                  <Button variant="outline" size="sm" className="whitespace-nowrap">
                    Explore Map
                    <ArrowRight size={16} className="ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
          
          {/* Vision Section */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-secondary-600 py-6 px-8">
              <div className="flex items-center">
                <div className="p-3 bg-white rounded-full mr-4">
                  <Heart size={24} className="text-secondary-600" />
                </div>
                <h2 className="text-3xl font-bold text-white">Our Vision</h2>
              </div>
            </div>
            
            <div className="p-8">
              <p className="text-lg text-gray-700 mb-6">
                <span className="font-semibold">A world with zero food waste where surplus food reaches every hungry individual,</span> creating sustainable communities where resources are shared equitably and no one goes to bed hungry.
              </p>
              
              <h3 className="font-bold text-xl mb-4 text-gray-800">We envision:</h3>
              
              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <Check size={20} className="text-secondary-600 mt-1 mr-2 flex-shrink-0" />
                  <span className="text-gray-700">
                    Communities where food waste is eliminated through efficient sharing
                  </span>
                </li>
                <li className="flex items-start">
                  <Check size={20} className="text-secondary-600 mt-1 mr-2 flex-shrink-0" />
                  <span className="text-gray-700">
                    A world where hunger is not a result of distribution failure but a solved problem
                  </span>
                </li>
                <li className="flex items-start">
                  <Check size={20} className="text-secondary-600 mt-1 mr-2 flex-shrink-0" />
                  <span className="text-gray-700">
                    A network of donors and NGOs collaborating seamlessly to maximize impact
                  </span>
                </li>
                <li className="flex items-start">
                  <Check size={20} className="text-secondary-600 mt-1 mr-2 flex-shrink-0" />
                  <span className="text-gray-700">
                    A significant reduction in greenhouse gas emissions from food waste
                  </span>
                </li>
                <li className="flex items-start">
                  <Check size={20} className="text-secondary-600 mt-1 mr-2 flex-shrink-0" />
                  <span className="text-gray-700">
                    Transparent systems where everyone can see the impact of food sharing
                  </span>
                </li>
              </ul>
              
              <div className="flex items-center justify-between p-5 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <BarChart size={24} className="text-secondary-600 mr-3" />
                  <div>
                    <h4 className="font-semibold text-gray-800">Impact Statistics</h4>
                    <p className="text-sm text-gray-600">Measuring progress toward our vision</p>
                  </div>
                </div>
                <Link to="/">
                  <Button variant="outline-secondary" size="sm" className="whitespace-nowrap">
                    View Stats
                    <ArrowRight size={16} className="ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
        
        <div className="max-w-4xl mx-auto mb-16">
          <h2 className="text-3xl font-bold mb-8 text-gray-800 text-center">Our Core Values</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl shadow-md p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center mx-auto mb-4">
                <Heart size={32} className="text-primary-600" />
              </div>
              <h3 className="font-bold text-lg mb-2 text-gray-800">Compassion</h3>
              <p className="text-gray-700">
                We care deeply about reducing hunger and empowering communities through food sharing.
              </p>
            </div>
            
            <div className="bg-white rounded-xl shadow-md p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-secondary-100 flex items-center justify-center mx-auto mb-4">
                <ShieldCheck size={32} className="text-secondary-600" />
              </div>
              <h3 className="font-bold text-lg mb-2 text-gray-800">Integrity</h3>
              <p className="text-gray-700">
                We operate with transparency, honesty, and a commitment to food safety and quality.
              </p>
            </div>
            
            <div className="bg-white rounded-xl shadow-md p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-accent-100 flex items-center justify-center mx-auto mb-4">
                <Recycle size={32} className="text-accent-600" />
              </div>
              <h3 className="font-bold text-lg mb-2 text-gray-800">Sustainability</h3>
              <p className="text-gray-700">
                We're committed to environmental responsibility by reducing food waste and its impact.
              </p>
            </div>
            
            <div className="bg-white rounded-xl shadow-md p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <Globe size={32} className="text-green-600" />
              </div>
              <h3 className="font-bold text-lg mb-2 text-gray-800">Community</h3>
              <p className="text-gray-700">
                We believe in the power of local connections to create global change, one meal at a time.
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl shadow-lg overflow-hidden">
          <div className="p-8 md:p-12 text-white text-center">
            <h2 className="text-3xl font-bold mb-4">Join Our Mission</h2>
            <p className="text-xl mb-8 max-w-3xl mx-auto">
              Whether you have food to share or people to feed, you can help us build a world where good food feeds people, not landfills.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button 
                  variant="accent" 
                  size="lg" 
                  className="rounded-full w-full sm:w-auto"
                >
                  Register Now
                </Button>
              </Link>
              <Link to="/about">
                <Button 
                  size="lg" 
                  className="bg-white text-primary-700 hover:bg-gray-100 rounded-full w-full sm:w-auto"
                >
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

export default MissionPage;