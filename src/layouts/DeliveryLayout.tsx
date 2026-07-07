import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useToast } from '../contexts/ToastContext';
import {
  LayoutDashboard,
  LogOut,
  Bell,
  Navigation,
  History,
  User,
  Activity,
} from 'lucide-react';

export const DeliveryLayout: React.FC = () => {
  const { currentUser, isAuthenticated, logout, isLoading } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();

  React.useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        showToast('Please login to access Rider Portal', 'warning');
        navigate('/login');
      } else if (currentUser?.role !== 'Delivery Partner') {
        showToast('Unauthorized. Riders only.', 'error');
        navigate('/home');
      }
    }
  }, [isAuthenticated, currentUser, isLoading, navigate, showToast]);

  const handleLogout = async () => {
    await logout();
    showToast('Logged out from Rider Portal', 'info');
    navigate('/login');
  };

  if (isLoading || !isAuthenticated || currentUser?.role !== 'Delivery Partner') {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-4">
          <span className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin inline-block"></span>
          <p className="text-xs text-secondary font-bold">Verifying Rider authorization...</p>
        </div>
      </div>
    );
  }

  const menuItems = [
    { path: '/delivery', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/delivery/history', label: 'History', icon: History },
    { path: '/delivery/profile', label: 'Rider Profile', icon: User },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row dark:bg-zinc-950 transition-colors">
      
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-outline-variant/10 p-6 space-y-8 dark:bg-zinc-900 dark:border-zinc-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white">
            <Navigation className="w-4 h-4" />
          </div>
          <div>
            <h1 className="font-headline-lg text-sm font-black text-on-surface">FRETZA Logistics</h1>
            <p className="text-[9px] text-primary font-bold uppercase tracking-widest">Rider Portal</p>
          </div>
        </div>

        <div className="flex-grow flex flex-col justify-between">
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-secondary hover:text-on-surface hover:bg-surface-container-low'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 transition-all text-left"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Panel */}
      <div className="flex-grow flex flex-col min-w-0">
        
        {/* Top Header */}
        <header className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-outline-variant/10 px-gutter py-4 flex items-center justify-between z-30 dark:bg-zinc-900/80 dark:border-zinc-800">
          <div className="flex items-center gap-2 md:hidden">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center text-white">
              <Navigation className="w-3.5 h-3.5" />
            </div>
            <div>
              <h1 className="font-headline-md text-xs font-black text-on-surface">FRETZA Rider</h1>
            </div>
          </div>

          <div className="hidden md:block">
            <h2 className="text-xs font-black text-on-surface flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-primary animate-pulse" />
              Mayurbhanj Area Logistics Active
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative w-8 h-8 rounded-full border border-outline-variant/20 flex items-center justify-center hover:bg-gray-50">
              <Bell className="w-4 h-4 text-secondary" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
            </button>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-primary font-bold text-xs uppercase border border-primary/20">
                {currentUser?.name.substring(0, 2)}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-[10px] font-bold text-on-surface leading-none">{currentUser?.name}</p>
                <p className="text-[8px] text-secondary mt-0.5 uppercase tracking-wider">
                  {currentUser?.deliveryProfile?.isOnline ? 'Online' : 'Offline'}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Outlet */}
        <main className="flex-grow pb-24 md:pb-6">
          <Outlet />
        </main>

        {/* Mobile Bottom navigation bar */}
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-outline-variant/10 px-gutter py-3 flex justify-around items-center z-40 md:hidden dark:bg-zinc-900 dark:border-zinc-800">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center gap-1 text-[10px] font-bold transition-all ${
                  isActive ? 'text-primary' : 'text-secondary hover:text-on-surface'
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

      </div>
    </div>
  );
};
