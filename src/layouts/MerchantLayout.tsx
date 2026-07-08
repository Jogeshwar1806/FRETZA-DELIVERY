import React, { useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useToast } from '../contexts/ToastContext';
import {
  LayoutDashboard,
  Store,
  UtensilsCrossed,
  Folders,
  ShoppingBag,
  BarChart3,
  LogOut,
  Bell,
  HelpCircle,
} from 'lucide-react';

export const MerchantLayout: React.FC = () => {
  const { currentUser, isAuthenticated, isLoading, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();

  useEffect(() => {
    // Wait until loading completes to check auth
    if (!isLoading) {
      if (!isAuthenticated) {
        navigate('/login');
      } else if (currentUser) {
        const normalizedRole = currentUser.role?.toLowerCase();
        if (normalizedRole !== 'restaurant_owner' && normalizedRole !== 'restaurant owner') {
          showToast('Unauthorized access. Redirected to the Home Page.', 'error');
          navigate('/home');
        }
      }
    }
  }, [isAuthenticated, currentUser, isLoading, navigate]);

  const handleLogout = async () => {
    await logout();
    showToast('Logged out from Merchant Portal', 'info');
    navigate('/login');
  };

  const normalizedRole = currentUser?.role?.toLowerCase();
  if (isLoading || !currentUser || (normalizedRole !== 'restaurant_owner' && normalizedRole !== 'restaurant owner')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-container-lowest">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-secondary font-semibold">Verifying Portal Access...</p>
        </div>
      </div>
    );
  }

  const menuItems = [
    { label: 'Dashboard', path: '/merchant', icon: LayoutDashboard },
    { label: 'Store Profile', path: '/merchant/profile', icon: Store },
    { label: 'Menu List', path: '/merchant/menu', icon: UtensilsCrossed },
    { label: 'Categories', path: '/merchant/categories', icon: Folders },
    { label: 'Orders', path: '/merchant/orders', icon: ShoppingBag },
    { label: 'Analytics', path: '/merchant/analytics', icon: BarChart3 },
    { label: 'Help & Support', path: '/feedback-help', icon: HelpCircle },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#FAF9F6]">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-outline-variant/20 shadow-xs h-screen sticky top-0">
        {/* Brand */}
        <div className="p-6 border-b border-outline-variant/10 flex items-center justify-between">
          <div>
            <h1 className="font-headline-lg text-lg text-primary font-black tracking-tighter">FRETZA</h1>
            <p className="text-[10px] text-secondary uppercase font-bold tracking-widest mt-0.5">Merchant Portal</p>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.label}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-orange-500 text-white shadow-md'
                    : 'text-secondary hover:text-on-surface hover:bg-surface-container-low'
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer info & Logout */}
        <div className="p-4 border-t border-outline-variant/10">
          <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-surface-container-low/60 mb-3">
            {currentUser.avatar ? (
              <img
                src={currentUser.avatar}
                alt="profile"
                className="w-8 h-8 rounded-full object-cover border border-outline"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs uppercase">
                {currentUser.name[0]}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-bold text-on-surface truncate">{currentUser.name}</h4>
              <p className="text-[9px] text-secondary truncate">{currentUser.email || currentUser.phone}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Panel Viewport */}
      <div className="flex-grow flex flex-col min-w-0 pb-20 md:pb-0">
        {/* Header bar */}
        <header className="bg-white border-b border-outline-variant/20 shadow-xs h-16 px-4 md:px-8 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-3">
            {/* Mobile menu trigger */}
            <div className="md:hidden">
              <h1 className="font-headline-lg text-lg text-primary font-black tracking-tighter">FRETZA</h1>
            </div>
            <h2 className="hidden md:block font-headline-md text-sm text-on-surface font-bold">
              {menuItems.find((m) => m.path === location.pathname)?.label || 'Merchant Portal'}
            </h2>
          </div>

          {/* User actions / notifications */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => showToast('No new notifications', 'info')}
              className="p-2 text-secondary hover:text-on-surface hover:bg-surface-container-low rounded-full relative transition-colors"
            >
              <Bell className="w-4.5 h-4.5" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-primary rounded-full"></span>
            </button>

            <div className="md:hidden flex items-center gap-2">
              <button
                onClick={handleLogout}
                className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        {/* Dashboard Child Viewports */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-outline-variant/20 shadow-lg flex items-center justify-around py-2 px-1 z-40">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.label}
              to={item.path}
              className={`flex flex-col items-center justify-center flex-1 py-1 text-[9px] font-bold transition-all ${
                isActive ? 'text-primary scale-105' : 'text-secondary hover:text-on-surface'
              }`}
            >
              <Icon className="w-4 h-4 mb-0.5" />
              <span className="truncate max-w-[55px]">{item.label.split(' ')[0]}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};
