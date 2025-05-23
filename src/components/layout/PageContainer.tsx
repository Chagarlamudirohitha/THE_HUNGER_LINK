import React from 'react';

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
}

const PageContainer: React.FC<PageContainerProps> = ({ children, className = '' }) => {
  return (
    <main className={`min-h-[calc(100vh-160px)] ${className}`}>
      {children}
    </main>
  );
};

export default PageContainer;