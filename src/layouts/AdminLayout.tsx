import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useToast } from '../contexts/ToastContext';
import {
  LayoutDashboard,
  Users,
  Utensils,
  Receipt,
  Ticket,
  Percent,
  Settings,
  LogOut,
  Bell,
  Activity,
  ShieldCheck,
  Folders,
} from 'lucide-react';

export const AdminLayout: React.FC = () => {
  const { currentUser, isAuthenticated, logout, isLoading } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();

  React.useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        showToast('Please login to access Admin portal', 'warning');
        navigate('/login');
      } else {
        const normalizedRole = currentUser?.role?.toLowerCase();
        if (normalizedRole !== 'admin') {
          showToast('Unauthorized. Admins only.', 'error');
          navigate('/home');
        }
      }
    }
  }, [isAuthenticated, currentUser, isLoading, navigate, showToast]);

  const handleLogout = async () => {
    await logout();
    showToast('Logged out from Admin portal', 'info');
    navigate('/login');
  };

  const normalizedRole = currentUser?.role?.toLowerCase();
  if (isLoading || !isAuthenticated || normalizedRole !== 'admin') {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-4">
          <span className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin inline-block"></span>
          <p className="text-xs text-secondary font-bold">Verifying Administrator role credentials...</p>
        </div>
      </div>
    );
  }

  const menuItems = [
    { path: '/admin', label: 'Overview', icon: LayoutDashboard },
    { path: '/admin/users', label: 'User Controls', icon: Users },
    { path: '/admin/merchants', label: 'Merchants Queue', icon: Utensils },
    { path: '/admin/orders', label: 'Global Orders', icon: Receipt },
    { path: '/admin/coupons', label: 'Coupons Manager', icon: Percent },
    { path: '/admin/categories', label: 'Categories Manager', icon: Folders },
    { path: '/admin/support', label: 'Support Tickets', icon: Ticket },
    { path: '/admin/settings', label: 'Fee Configurations', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row dark:bg-zinc-950 transition-colors">
      
      {/* Desktop Admin Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-zinc-900 border-r border-zinc-800 p-6 space-y-8 text-white">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-headline-lg text-sm font-black tracking-wide">FRETZA Control</h1>
            <p className="text-[9px] text-primary font-bold uppercase tracking-widest">Platform Admin</p>
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
                      ? 'bg-primary text-white'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
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
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold text-red-400 hover:bg-red-950/20 transition-all text-left"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Admin Content Container */}
      <div className="flex-grow flex flex-col min-w-0">
        
        {/* Top admin bar */}
        <header className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-outline-variant/10 px-gutter py-4 flex items-center justify-between z-30 dark:bg-zinc-900/80 dark:border-zinc-800">
          <div className="flex items-center gap-2 md:hidden">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center text-white">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h1 className="font-headline-md text-xs font-black text-on-surface">FRETZA Admin</h1>
            </div>
          </div>

          <div className="hidden md:block">
            <h2 className="text-xs font-black text-on-surface flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-primary animate-pulse" />
              Central Platform Operations Dashboard
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative w-8 h-8 rounded-full border border-outline-variant/20 flex items-center justify-center hover:bg-gray-50">
              <Bell className="w-4 h-4 text-secondary" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
            </button>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs uppercase border border-blue-200">
                AD
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-[10px] font-bold text-on-surface leading-none">FRETZA Administrator</p>
                <p className="text-[8px] text-secondary mt-0.5 uppercase tracking-wider">Level 1 Admin</p>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic content rendering outlet */}
        <main className="flex-grow pb-24 md:pb-6">
          <Outlet />
        </main>

        {/* Bottom Menu Navigation Bar for Admin on Mobile */}
        <nav className="fixed bottom-0 left-0 right-0 bg-zinc-900 border-t border-zinc-800 px-2 py-3 flex justify-around items-center z-40 md:hidden text-zinc-400">
          {menuItems.slice(0, 5).map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center gap-1 text-[9px] font-bold transition-all ${
                  isActive ? 'text-primary' : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Icon className="w-4.5 h-4.5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

      </div>
    </div>
  );
};
