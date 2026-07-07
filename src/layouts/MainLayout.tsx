import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { BottomNav } from '../components/BottomNav';
import { FloatingCartButton } from '../components/FloatingCartButton';

export const MainLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background text-on-background pb-16 md:pb-0">
      <Navbar />
      <main className="flex-grow w-full max-w-max-width mx-auto pb-12">
        <Outlet />
      </main>
      <BottomNav />
      <FloatingCartButton />
    </div>
  );
};
