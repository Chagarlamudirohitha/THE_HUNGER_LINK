import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Mail, Phone, MapPin, Send, CheckCircle } from 'lucide-react';
import PageContainer from '../components/layout/PageContainer';
import Button from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';

interface ContactFormValues {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const ContactPage: React.FC = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { 
    register, 
    handleSubmit, 
    reset,
    formState: { errors } 
  } = useForm<ContactFormValues>();
  
  const onSubmit = async (data: ContactFormValues) => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('Form data:', data);
    setIsLoading(false);
    setIsSubmitted(true);
    reset();
    
    // Reset success message after 5 seconds
    setTimeout(() => {
      setIsSubmitted(false);
    }, 5000);
  };
  
  return (
    <PageContainer>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto mb-12 text-center">
          <h1 className="text-4xl font-bold mb-6 text-gray-800">Contact Us</h1>
          <p className="text-xl text-gray-600">
            Have questions or suggestions? We'd love to hear from you. Get in touch with our team.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold mb-6 text-gray-800">Send Us a Message</h2>
                
                {isSubmitted && (
                  <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 text-green-700 flex items-start">
                    <CheckCircle size={20} className="mr-2 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Message Sent Successfully!</p>
                      <p className="text-sm">Thank you for reaching out. We'll get back to you as soon as possible.</p>
                    </div>
                  </div>
                )}
                
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="form-label">
                        Your Name
                      </label>
                      <input
                        id="name"
                        type="text"
                        className="input"
                        placeholder="John Doe"
                        {...register('name', { required: 'Name is required' })}
                      />
                      {errors.name && (
                        <p className="form-error">{errors.name.message}</p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="email" className="form-label">
                        Email Address
                      </label>
                      <input
                        id="email"
                        type="email"
                        className="input"
                        placeholder="your@email.com"
                        {...register('email', { 
                          required: 'Email is required',
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: 'Invalid email address'
                          }
                        })}
                      />
                      {errors.email && (
                        <p className="form-error">{errors.email.message}</p>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="subject" className="form-label">
                      Subject
                    </label>
                    <input
                      id="subject"
                      type="text"
                      className="input"
                      placeholder="How can we help you?"
                      {...register('subject', { required: 'Subject is required' })}
                    />
                    {errors.subject && (
                      <p className="form-error">{errors.subject.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="message" className="form-label">
                      Message
                    </label>
                    <textarea
                      id="message"
                      rows={6}
                      className="input resize-none"
                      placeholder="Tell us what you want to know..."
                      {...register('message', { 
                        required: 'Message is required',
                        minLength: {
                          value: 10,
                          message: 'Message should be at least 10 characters'
                        }
                      })}
                    ></textarea>
                    {errors.message && (
                      <p className="form-error">{errors.message.message}</p>
                    )}
                  </div>
                  
                  <Button 
                    type="submit" 
                    variant="primary" 
                    className="w-full sm:w-auto" 
                    isLoading={isLoading}
                  >
                    <Send size={18} className="mr-2" />
                    Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
          
          <div>
            <Card className="mb-6">
              <CardContent className="p-6">
                <h3 className="font-bold text-xl mb-4 text-gray-800">Contact Information</h3>
                
                <div className="space-y-4 mb-6">
                  <div className="flex items-start">
                    <MapPin size={20} className="text-primary-600 mt-1 mr-3 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-gray-800">Address</h4>
                      <p className="text-gray-600">
                        123 Food Street<br />
                        San Francisco, CA 94105<br />
                        United States
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Mail size={20} className="text-primary-600 mt-1 mr-3 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-gray-800">Email</h4>
                      <a href="mailto:info@The Hunger Link.org" className="text-primary-600 hover:text-primary-700">
                        info@The Hunger Link.org
                      </a>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Phone size={20} className="text-primary-600 mt-1 mr-3 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-gray-800">Phone</h4>
                      <a href="tel:+11234567890" className="text-primary-600 hover:text-primary-700">
                        +1 (123) 456-7890
                      </a>
                    </div>
                  </div>
                </div>
                
                <h3 className="font-bold text-xl mb-4 text-gray-800">Office Hours</h3>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex justify-between">
                    <span>Monday - Friday</span>
                    <span className="font-medium">9:00 AM - 6:00 PM</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Saturday</span>
                    <span className="font-medium">10:00 AM - 4:00 PM</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Sunday</span>
                    <span className="font-medium">Closed</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
            
            <div className="bg-white rounded-xl shadow-md overflow-hidden h-64">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d50470.94253899684!2d-122.43195214322077!3d37.774929624224746!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x80858080b9b45679%3A0x75a3919d9f409e90!2sFinancial%20District%2C%20San%20Francisco%2C%20CA!5e0!3m2!1sen!2sus!4v1684977437146!5m2!1sen!2sus" 
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>
        </div>
        
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Frequently Asked Questions</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6 text-left">
              <h3 className="font-semibold text-lg mb-2 text-gray-800">How do I donate food?</h3>
              <p className="text-gray-700">
                Register as a donor, create a donation with details (food type, servings, pickup time), and nearby NGOs will be notified. Once an NGO accepts, you'll coordinate pickup details.
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6 text-left">
              <h3 className="font-semibold text-lg mb-2 text-gray-800">Is there a minimum donation amount?</h3>
              <p className="text-gray-700">
                No, we accept donations of all sizes. Whether you have a single meal or food from a large event, we can help connect it with those in need.
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6 text-left">
              <h3 className="font-semibold text-lg mb-2 text-gray-800">How does the matching process work?</h3>
              <p className="text-gray-700">
                We match donations to nearby NGOs based on location, capacity, and food type. NGOs receive notifications about available donations in their area and can accept those they can distribute.
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6 text-left">
              <h3 className="font-semibold text-lg mb-2 text-gray-800">Is my information kept private?</h3>
              <p className="text-gray-700">
                Yes, we protect your privacy. Only the necessary information is shared between donors and NGOs to facilitate food pickup and delivery.
              </p>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

export default ContactPage;