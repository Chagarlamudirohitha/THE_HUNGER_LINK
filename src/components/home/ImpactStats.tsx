import React from 'react';
import CountUp from 'react-countup';
import { Utensils, Users, Heart, Clock } from 'lucide-react';
import { Card, CardContent } from '../ui/Card';
import useStatsStore from '../../store/statsStore';

const ImpactStats: React.FC = () => {
  const { stats } = useStatsStore();
  
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800">
            Our Impact at a Glance
          </h2>
          <p className="text-lg text-gray-600">
            Every donation makes a difference. See how our community is helping to reduce food waste and hunger.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Donations */}
          <Card className="text-center transform transition-transform hover:scale-105">
            <CardContent className="flex flex-col items-center py-8">
              <div className="bg-primary-100 p-4 rounded-full mb-4">
                <Utensils size={32} className="text-primary-600" />
              </div>
              <div className="text-4xl font-bold text-primary-600 mb-2">
                <CountUp 
                  end={stats.totalDonations} 
                  duration={2.5} 
                  separator="," 
                />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-1">Donations Shared</h3>
              <p className="text-sm text-gray-600">
                Meals making a difference
              </p>
            </CardContent>
          </Card>
          
          {/* People Fed */}
          <Card className="text-center transform transition-transform hover:scale-105">
            <CardContent className="flex flex-col items-center py-8">
              <div className="bg-secondary-100 p-4 rounded-full mb-4">
                <Users size={32} className="text-secondary-600" />
              </div>
              <div className="text-4xl font-bold text-secondary-600 mb-2">
                <CountUp 
                  end={stats.totalPeopleFed} 
                  duration={2.5} 
                  separator="," 
                />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-1">People Fed</h3>
              <p className="text-sm text-gray-600">
                Hunger addressed across communities
              </p>
            </CardContent>
          </Card>
          
          {/* NGOs Connected */}
          <Card className="text-center transform transition-transform hover:scale-105">
            <CardContent className="flex flex-col items-center py-8">
              <div className="bg-accent-100 p-4 rounded-full mb-4">
                <Heart size={32} className="text-accent-600" />
              </div>
              <div className="text-4xl font-bold text-accent-600 mb-2">
                <CountUp 
                  end={stats.totalNGOs} 
                  duration={2.5} 
                  separator="," 
                />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-1">NGOs Partnered</h3>
              <p className="text-sm text-gray-600">
                Organizations fighting hunger with us
              </p>
            </CardContent>
          </Card>
          
          {/* Active Donations */}
          <Card className="text-center transform transition-transform hover:scale-105">
            <CardContent className="flex flex-col items-center py-8">
              <div className="bg-green-100 p-4 rounded-full mb-4">
                <Clock size={32} className="text-green-600" />
              </div>
              <div className="text-4xl font-bold text-green-600 mb-2">
                <CountUp 
                  end={stats.activeDonations} 
                  duration={2.5} 
                  separator="," 
                />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-1">Active Donations</h3>
              <p className="text-sm text-gray-600">
                Meals waiting to find a home
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default ImpactStats;