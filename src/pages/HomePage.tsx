import React, { useEffect } from 'react';
import PageContainer from '../components/layout/PageContainer';
import HeroSection from '../components/home/HeroSection';
import ImpactStats from '../components/home/ImpactStats';
import HowItWorks from '../components/home/HowItWorks';
import MapPreview from '../components/home/MapPreview';
import Testimonials from '../components/home/Testimonials';
import CallToAction from '../components/home/CallToAction';
import useStatsStore from '../store/statsStore';

const HomePage: React.FC = () => {
  const { getStats } = useStatsStore();
  
  useEffect(() => {
    getStats();
  }, [getStats]);
  
  return (
    <PageContainer>
      <HeroSection />
      <ImpactStats />
      <HowItWorks />
      <MapPreview />
      <Testimonials />
      <CallToAction />
    </PageContainer>
  );
};

export default HomePage;