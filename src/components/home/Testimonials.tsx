import React from 'react';
import { Star, Quote } from 'lucide-react';
import { Card, CardContent } from '../ui/Card';

const Testimonials: React.FC = () => {
  const testimonials = [
    {
      id: 1,
      name: 'Sarah Johnson',
      role: 'Restaurant Manager',
      text: 'The Hunger Link has transformed how we handle our surplus food. Instead of throwing away perfectly good meals, we now easily connect with local NGOs who can put them to good use. The platform is intuitive, and the community impact map shows us exactly how we\'re making a difference.',
      rating: 5,
      image: 'https://images.pexels.com/photos/1542085/pexels-photo-1542085.jpeg?auto=compress&cs=tinysrgb&w=800'
    },
    {
      id: 2,
      name: 'Michael Chen',
      role: 'NGO Director',
      text: 'As a small NGO, finding consistent food sources for our community kitchen was always challenging. The Hunger Link has changed that completely. We now receive regular notifications about available donations in our area, and the coordination process is seamless.',
      rating: 5,
      image: 'https://images.pexels.com/photos/307847/pexels-photo-307847.jpeg?auto=compress&cs=tinysrgb&w=800'
    },
    {
      id: 3,
      name: 'Lisa Patel',
      role: 'Event Organizer',
      text: 'After our corporate events, we often had significant amounts of catered food left over. The Hunger Link makes it simple to ensure nothing goes to waste. The platform matches us with local organizations that can collect the food quickly, and the impact statistics give our company valuable CSR metrics.',
      rating: 4,
      image: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=800'
    }
  ];
  
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800">
            What Our Users Say
          </h2>
          <p className="text-lg text-gray-600">
            Hear from donors and NGOs who are making a difference with The Hunger Link.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.id} className="h-full">
              <CardContent className="p-6 flex flex-col h-full">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
                    <img 
                      src={testimonial.image} 
                      alt={testimonial.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">{testimonial.name}</h3>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                  </div>
                </div>
                
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} size={16} className="text-yellow-400 fill-current" />
                  ))}
                </div>
                
                <div className="flex-grow relative">
                  <Quote size={36} className="text-gray-200 absolute -top-2 -left-2 opacity-50" />
                  <p className="text-gray-700 relative z-10 pl-4">
                    "{testimonial.text}"
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;