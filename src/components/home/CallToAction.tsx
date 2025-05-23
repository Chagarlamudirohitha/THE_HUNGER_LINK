import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Button from '../ui/Button';

const CallToAction: React.FC = () => {
  return (
    <section className="py-16 bg-gradient-to-br from-accent-600 to-accent-700 text-white">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Join the Movement?
          </h2>
          <p className="text-xl mb-8 text-white/90">
            Whether you're a restaurant with surplus food or an NGO helping those in need, 
            The Hunger Link provides the platform to connect, coordinate, and create impact.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button 
                variant="primary" 
                size="lg" 
                className="bg-white text-accent-600 hover:bg-gray-100 hover:text-accent-700 font-semibold rounded-full w-full sm:w-auto"
              >
                Register Now
              </Button>
            </Link>
            <Link to="/about">
              <Button 
                variant="outline" 
                size="lg" 
                className="border-white text-white hover:bg-white/10 font-semibold rounded-full w-full sm:w-auto"
              >
                Learn More
                <ArrowRight size={18} className="ml-2" />
              </Button>
            </Link>
          </div>
          
          <p className="mt-8 text-white/80">
            Join hundreds of others making a difference in their communities.
          </p>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;