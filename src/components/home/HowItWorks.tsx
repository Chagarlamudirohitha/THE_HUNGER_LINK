import React from 'react';
import { 
  UserPlus, Utensils, Search, 
  Truck, MessageSquare, BarChart 
} from 'lucide-react';

const HowItWorks: React.FC = () => {
  const steps = [
    {
      icon: <UserPlus size={28} className="text-white" />,
      title: 'Register as a Donor or NGO',
      description: 'Sign up and create your profile to join the The Hunger Link community.',
      color: 'bg-primary-600'
    },
    {
      icon: <Utensils size={28} className="text-white" />,
      title: 'Post Available Donations',
      description: 'If you\'re a donor, list your surplus food with details like type, servings, and pickup time.',
      color: 'bg-secondary-600'
    },
    {
      icon: <Search size={28} className="text-white" />,
      title: 'Find Nearby Donations',
      description: 'NGOs can browse available donations in their area and accept what they can distribute.',
      color: 'bg-accent-600'
    },
    {
      icon: <MessageSquare size={28} className="text-white" />,
      title: 'Coordinate Pickup',
      description: 'Chat directly with donors or NGOs to arrange the logistics of food pickup.',
      color: 'bg-green-600'
    },
    {
      icon: <Truck size={28} className="text-white" />,
      title: 'Complete the Donation',
      description: 'NGOs pick up the food and mark the donation as completed in the system.',
      color: 'bg-purple-600'
    },
    {
      icon: <BarChart size={28} className="text-white" />,
      title: 'Track Your Impact',
      description: 'See your contribution on the Community Impact Map and in the Impact Stats.',
      color: 'bg-blue-600'
    }
  ];
  
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800">
            How The Hunger Link Works
          </h2>
          <p className="text-lg text-gray-600">
            Our platform makes it easy to donate surplus food and help those in need. Here's how it works:
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {steps.map((step, index) => (
            <div key={index} className="bg-white rounded-xl shadow-md overflow-hidden transition-all hover:shadow-lg">
              <div className="p-1 bg-gradient-to-r from-gray-200 via-white to-gray-200">
                <div className={`${step.color} p-6 rounded-t-lg`}>
                  <div className="flex items-center">
                    <div className="flex items-center justify-center bg-white bg-opacity-20 rounded-full w-12 h-12">
                      {step.icon}
                    </div>
                    <span className="ml-auto text-white font-bold text-xl">0{index + 1}</span>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <h3 className="font-bold text-lg mb-2 text-gray-800">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;