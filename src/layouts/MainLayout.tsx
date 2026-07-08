import React, { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { BottomNav } from '../components/BottomNav';
import { FloatingCartButton } from '../components/FloatingCartButton';
import { useAuthStore } from '../store/useAuthStore';

export const MainLayout: React.FC = () => {
  const { currentUser, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && currentUser) {
      const role = currentUser.role?.toLowerCase();
      if (role === 'restaurant_owner' || role === 'restaurant owner') {
        navigate('/merchant');
      } else if (role === 'driver' || role === 'delivery partner') {
        navigate('/delivery');
      } else if (role === 'admin') {
        navigate('/admin');
      }
    }
  }, [currentUser, isAuthenticated, navigate]);

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
