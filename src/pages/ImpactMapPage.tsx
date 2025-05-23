import React from 'react';
import { Link } from 'react-router-dom';
import PageContainer from '../components/layout/PageContainer';
import ImpactMap from '../components/map/ImpactMap';
import { Card, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { ArrowLeft } from 'lucide-react';

const ImpactMapPage: React.FC = () => {
  return (
    <PageContainer>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <Link to="/" className="inline-flex items-center text-gray-600 hover:text-primary-600 mb-4">
              <ArrowLeft size={18} className="mr-2" />
              Back to Home
            </Link>
            <h1 className="text-3xl font-bold text-gray-800">Community Impact Map</h1>
            <p className="text-gray-600 mt-2">
              Visualize the real-time impact of food donations in your community.
            </p>
          </div>
          
          <div className="hidden md:block">
            <Link to="/register">
              <Button variant="primary">
                Join the Movement
              </Button>
            </Link>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card className="col-span-1">
            <CardContent className="p-6">
              <h3 className="font-bold text-lg mb-4">About the Map</h3>
              <p className="text-gray-700 mb-4">
                Our Community Impact Map shows the real-time status of food donations across the community. Each pin represents a donation, color-coded by status.
              </p>
              <p className="text-gray-700 mb-4">
                Use the filters at the top to view specific types of donations, and click on any pin to see detailed information about that donation.
              </p>
              <p className="text-gray-700">
                This visualization helps donors and NGOs see where food is being shared and where needs exist, creating a transparent ecosystem of giving.
              </p>
            </CardContent>
          </Card>
          
          <div className="col-span-3 h-[600px]">
            <ImpactMap isFullPage />
          </div>
        </div>
        
        <div className="md:hidden mt-6">
          <Link to="/register">
            <Button variant="primary" className="w-full">
              Join the Movement
            </Button>
          </Link>
        </div>
      </div>
    </PageContainer>
  );
};

export default ImpactMapPage;