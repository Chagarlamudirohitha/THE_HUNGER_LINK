import React from 'react';
import PageContainer from '../components/layout/PageContainer';
import LoginForm from '../components/auth/LoginForm';

const LoginPage: React.FC = () => {
  return (
    <PageContainer className="bg-gray-50 flex items-center justify-center py-12">
      <div className="container mx-auto px-4">
        <LoginForm />
      </div>
    </PageContainer>
  );
};

export default LoginPage;