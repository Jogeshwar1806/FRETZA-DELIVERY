import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../store/useAuthStore';
import { useFavoritesStore } from '../store/useFavoritesStore';
import { MOCK_RESTAURANTS } from '../constants/mockData';
import { useToast } from '../contexts/ToastContext';
import { Modal } from '../components/Modal';
import { api } from '../services/api';

export const Profile: React.FC = () => {
  const { showToast } = useToast();

  const { isAuthenticated, currentUser, addresses, logout, updateProfile, deleteAddress, addAddress } = useAuthStore();

  const { data: orderHistoryData } = useQuery({
    queryKey: ['orders-history'],
    queryFn: async () => {
      const res = await api.get('/orders');
      return res.data.orders;
    },
    enabled: isAuthenticated,
  });
  const orderHistory = orderHistoryData || [];

  const { favoriteRestaurants } = useFavoritesStore();

  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'orders' | 'addresses' | 'favorites'>('orders');

  // Form states
  const [editName, setEditName] = useState(currentUser?.name || '');
  const [editEmail, setEditEmail] = useState(currentUser?.email || '');
  const [editPhone, setEditPhone] = useState(currentUser?.phone || '');
  
  const [addrLabel, setAddrLabel] = useState<'Home' | 'Work' | 'Other'>('Home');
  const [addrDetails, setAddrDetails] = useState('');

  // Settings states
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const toggleDarkMode = () => {
    const isDark = !darkMode;
    setDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
      showToast('Dark mode enabled (Demo)', 'info');
    } else {
      document.documentElement.classList.remove('dark');
      showToast('Light mode enabled (Demo)', 'info');
    }
  };

  const handleEditProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim() || !editEmail.trim() || !editPhone.trim()) {
      showToast('Please fill all fields', 'warning');
      return;
    }
    updateProfile({
      name: editName,
      email: editEmail,
      phone: editPhone,
    });
    showToast('Profile updated successfully!');
    setIsEditProfileOpen(false);
  };

  const handleAddAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addrDetails.trim()) {
      showToast('Address details cannot be empty', 'warning');
      return;
    }
    addAddress({
      label: addrLabel,
      details: addrDetails,
      houseNumber: addrDetails,
      isDefault: addresses.length === 0,
    });
    showToast('Address added!');
    setAddrDetails('');
    setIsAddressModalOpen(false);
  };

  // Get favorite restaurant profiles
  const favRestaurantsList = MOCK_RESTAURANTS.filter((r) =>
    favoriteRestaurants.includes(r.id)
  );

  // If not logged in, render a fallback CTA to login
  if (!isAuthenticated || !currentUser) {
    return (
      <div className="px-gutter py-16 text-center space-y-4 max-w-sm mx-auto">
        <span className="material-symbols-outlined text-5xl text-gray-300">account_circle</span>
        <h2 className="font-headline-lg text-lg text-on-surface font-bold">Access Your Profile</h2>
        <p className="text-secondary text-xs">Login or register to manage your addresses, favorites, and view order history.</p>
        <div className="pt-2 flex flex-col gap-2">
          <Link
            to="/login"
            className="block w-full py-3 bg-primary text-white text-center font-bold rounded-xl text-xs hover:bg-orange-600 transition-all shadow-md"
          >
            Log In
          </Link>
          <Link
            to="/register"
            className="block w-full py-3 bg-white border border-outline text-on-surface text-center font-bold rounded-xl text-xs hover:bg-gray-50 transition-all"
          >
            Sign Up
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="px-gutter py-6 max-w-4xl mx-auto space-y-6">
      
      {/* Title */}
      <div>
        <h2 className="font-headline-lg text-xl md:text-2xl text-on-surface font-black">My Account</h2>
        <p className="text-secondary font-body-sm text-xs mt-1">Manage orders, delivery options, and account configurations.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* Left Column - User Info card & Settings */}
        <div className="md:col-span-4 space-y-6">
          
          {/* User profile card */}
          <div className="bg-white border border-outline-variant/10 rounded-2xl p-5 shadow-xs text-center space-y-3 relative overflow-hidden">
            <button
              onClick={() => {
                setEditName(currentUser.name);
                setEditEmail(currentUser.email);
                setEditPhone(currentUser.phone);
                setIsEditProfileOpen(true);
              }}
              className="absolute top-3 right-3 text-secondary hover:text-primary transition-colors p-1"
            >
              <span className="material-symbols-outlined text-[18px]">edit</span>
            </button>

            <div className="w-16 h-16 rounded-full bg-primary-container text-white text-xl font-bold flex items-center justify-center mx-auto border border-outline-variant/20 overflow-hidden shadow-sm">
              {currentUser.avatar ? (
                <img src={currentUser.avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                currentUser.name[0]
              )}
            </div>

            <div>
              <h3 className="font-bold text-sm text-on-surface">{currentUser.name}</h3>
              <p className="text-[10px] text-secondary mt-0.5">{currentUser.email}</p>
              <p className="text-[10px] text-secondary">{currentUser.phone}</p>
            </div>
          </div>

          {/* Settings panel */}
          <div className="bg-white border border-outline-variant/10 rounded-2xl p-5 shadow-xs space-y-4">
            <h4 className="font-headline-md text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 pb-2">Settings</h4>
            
            <div className="space-y-3 text-xs">
              {/* Dark mode */}
              <div className="flex justify-between items-center">
                <span className="font-bold text-on-surface-variant">Dark Theme</span>
                <button
                  onClick={toggleDarkMode}
                  className={`w-10 h-6 rounded-full p-1 transition-colors duration-200 focus:outline-none ${
                    darkMode ? 'bg-primary' : 'bg-gray-200'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform duration-200 ${
                      darkMode ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Notifications */}
              <div className="flex justify-between items-center">
                <span className="font-bold text-on-surface-variant">Push Notifications</span>
                <button
                  onClick={() => setNotifications(!notifications)}
                  className={`w-10 h-6 rounded-full p-1 transition-colors duration-200 focus:outline-none ${
                    notifications ? 'bg-primary' : 'bg-gray-200'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform duration-200 ${
                      notifications ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            <div className="pt-2 border-t border-gray-100">
              <Link
                to="/feedback-help"
                className="w-full py-2.5 bg-gray-50 hover:bg-gray-100 text-secondary hover:text-on-surface font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 border border-outline-variant/30"
              >
                <span className="material-symbols-outlined text-[16px]">help_outline</span>
                Feedback &amp; Help Center
              </Link>
            </div>

            <button
              onClick={() => {
                logout();
                showToast('Logged out successfully', 'info');
              }}
              className="w-full py-2.5 bg-red-50 text-red-700 hover:bg-red-100 border border-red-100 font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 mt-4"
            >
              <span className="material-symbols-outlined text-[16px]">logout</span>
              Log Out
            </button>
          </div>

        </div>

        {/* Right Column - Navigation Tabs content (Orders / Addresses / Favorites) */}
        <div className="md:col-span-8 space-y-4">
          
          {/* Tabs bar */}
          <div className="flex border-b border-gray-200">
            {(['orders', 'addresses', 'favorites'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-2.5 px-4 text-xs font-bold capitalize transition-all border-b-2 -mb-[2px] ${
                  activeTab === tab
                    ? 'border-primary text-primary'
                    : 'border-transparent text-secondary hover:text-on-surface'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab contents */}
          <div className="pt-2">
            
            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div className="space-y-4">
                {orderHistory.length > 0 ? (
                  orderHistory.map((ord: any) => (
                    <div
                      key={ord._id}
                      className="bg-white border border-outline-variant/10 rounded-2xl p-5 shadow-xs space-y-3 text-left"
                    >
                      <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                        <div>
                          <h4 className="font-bold text-xs text-on-surface">{ord.restaurantName}</h4>
                          <p className="text-[10px] text-secondary mt-0.5">
                            Order #{ord._id.substring(ord._id.length - 8).toUpperCase()} • {new Date(ord.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </p>
                        </div>
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                          ord.status === 'Delivered'
                            ? 'bg-green-100 text-green-800'
                            : ord.status === 'Pending' || ord.status === 'Accepted' || ord.status === 'Preparing' || ord.status === 'Ready for Pickup'
                            ? 'bg-amber-100 text-amber-800 animate-pulse'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {ord.status}
                        </span>
                      </div>

                      {/* Items */}
                      <div className="space-y-1.5 text-xs text-on-surface-variant">
                        {ord.items.map((it: any, idx: number) => (
                          <div key={idx} className="flex justify-between">
                            <span>{it.name} x {it.quantity}</span>
                            <span>₹{it.price * it.quantity}</span>
                          </div>
                        ))}
                      </div>

                      {/* Total & Tracker */}
                      <div className="flex justify-between items-center border-t border-gray-100 pt-3 text-xs">
                        <span className="text-secondary">Grand Total paid via {ord.paymentMethod}</span>
                        <div className="flex items-center gap-3">
                          <Link
                            to={`/order/${ord._id}`}
                            className="text-primary font-bold hover:underline"
                          >
                            Track Order
                          </Link>
                          <span className="font-black text-on-surface text-sm">₹{ord.grandTotal}</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 text-secondary bg-gray-50 border border-dashed border-gray-200 rounded-2xl">
                    <span className="material-symbols-outlined text-4xl text-gray-300">receipt_long</span>
                    <p className="text-xs mt-1">You haven't placed any orders yet in Khunta.</p>
                  </div>
                )}
              </div>
            )}

            {/* Addresses Tab */}
            {activeTab === 'addresses' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-1">
                  <h4 className="font-bold text-xs text-gray-400 uppercase tracking-wider">My Saved Places</h4>
                  <button
                    onClick={() => setIsAddressModalOpen(true)}
                    className="text-xs text-primary font-bold flex items-center gap-0.5 hover:underline"
                  >
                    <span className="material-symbols-outlined text-[14px]">add</span> Add Place
                  </button>
                </div>

                {addresses.length > 0 ? (
                  <div className="space-y-3">
                    {addresses.map((addr) => (
                      <div
                        key={addr.id}
                        className="bg-white border border-outline-variant/10 rounded-2xl p-4 shadow-xs flex justify-between items-start gap-4"
                      >
                        <div className="flex items-start gap-2.5">
                          <span className="material-symbols-outlined text-primary text-[20px] mt-[2px]">
                            {addr.label === 'Home' ? 'home' : addr.label === 'Work' ? 'work' : 'location_on'}
                          </span>
                          <div>
                            <span className="font-bold text-xs text-on-surface">{addr.label}</span>
                            <p className="text-[11px] text-on-surface-variant leading-relaxed mt-1">{addr.details}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            deleteAddress(addr.id);
                            showToast('Address deleted');
                          }}
                          className="text-gray-400 hover:text-red-500 transition-colors p-1"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-secondary bg-gray-50 border border-dashed border-gray-200 rounded-2xl">
                    <span className="material-symbols-outlined text-4xl text-gray-300">location_off</span>
                    <p className="text-xs mt-1">No saved addresses. Add your location for fast delivery checkout.</p>
                  </div>
                )}
              </div>
            )}

            {/* Favorites Tab */}
            {activeTab === 'favorites' && (
              <div className="space-y-4">
                <h4 className="font-bold text-xs text-gray-400 uppercase tracking-wider mb-1">Favorite Restaurants</h4>
                {favRestaurantsList.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {favRestaurantsList.map((r) => (
                      <Link
                        key={r.id}
                        to={`/restaurant/${r.id}`}
                        className="flex gap-4 p-3 bg-white border border-outline-variant/10 rounded-2xl shadow-xs hover:border-primary-container transition-all"
                      >
                        <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-gray-100">
                          <img src={r.image} alt={r.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-xs md:text-sm text-on-surface truncate">{r.name}</h4>
                          <p className="text-[10px] text-secondary truncate mt-0.5">{r.cuisine}</p>
                          <div className="flex items-center gap-2 text-[10px] text-on-surface-variant font-semibold mt-1">
                            <span className="flex items-center gap-0.5 text-green-600">
                              <span className="material-symbols-outlined text-[12px] fill-current">star</span>
                              {r.rating}
                            </span>
                            <span>•</span>
                            <span>{r.deliveryTime}</span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-secondary bg-gray-50 border border-dashed border-gray-200 rounded-2xl">
                    <span className="material-symbols-outlined text-4xl text-gray-300">favorite</span>
                    <p className="text-xs mt-1">No favorite outlets selected.</p>
                    <p className="text-[10px] text-gray-400 mt-1">Click the heart button on restaurants to save them here.</p>
                  </div>
                )}
              </div>
            )}

          </div>

        </div>

      </div>

      {/* Edit Profile Modal */}
      <Modal isOpen={isEditProfileOpen} onClose={() => setIsEditProfileOpen(false)} title="Edit Profile Details">
        <form onSubmit={handleEditProfileSubmit} className="space-y-4 text-left">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-500 uppercase">Full Name</label>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-primary focus:bg-white focus:outline-none"
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-500 uppercase">Email Address</label>
            <input
              type="email"
              value={editEmail}
              onChange={(e) => setEditEmail(e.target.value)}
              className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-primary focus:bg-white focus:outline-none"
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-500 uppercase">Phone Number</label>
            <input
              type="text"
              value={editPhone}
              onChange={(e) => setEditPhone(e.target.value)}
              className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-primary focus:bg-white focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-primary text-white font-bold rounded-xl text-xs hover:bg-orange-600 transition-colors shadow-md mt-4"
          >
            Save Profile
          </button>
        </form>
      </Modal>

      {/* Add Address Modal */}
      <Modal isOpen={isAddressModalOpen} onClose={() => setIsAddressModalOpen(false)} title="Save Location">
        <form onSubmit={handleAddAddressSubmit} className="space-y-4 text-left">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-500 uppercase">Label</label>
            <div className="flex gap-2">
              {(['Home', 'Work', 'Other'] as const).map((lbl) => (
                <button
                  key={lbl}
                  type="button"
                  onClick={() => setAddrLabel(lbl)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                    addrLabel === lbl
                      ? 'bg-primary text-white border-primary'
                      : 'bg-white text-secondary border-outline-variant/30 hover:bg-gray-50'
                  }`}
                >
                  {lbl}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-500 uppercase">Details</label>
            <textarea
              rows={3}
              placeholder="Khunta Main Road, Mayurbhanj, Odisha - 757019"
              value={addrDetails}
              onChange={(e) => setAddrDetails(e.target.value)}
              className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-primary focus:bg-white focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-primary text-white font-bold rounded-xl text-xs hover:bg-orange-600 transition-colors shadow-md mt-4"
          >
            Save Address
          </button>
        </form>
      </Modal>

    </div>
  );
};
