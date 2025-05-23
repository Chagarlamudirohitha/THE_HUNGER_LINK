import React from 'react';
import PageContainer from '../components/layout/PageContainer';
import RegisterForm from '../components/auth/RegisterForm';

const RegisterPage: React.FC = () => {
  return (
    <PageContainer className="bg-gray-50 flex items-center justify-center py-12">
      <div className="container mx-auto px-4 py-8">
        <RegisterForm />
      </div>
    </PageContainer>
  );
};

export default RegisterPage;