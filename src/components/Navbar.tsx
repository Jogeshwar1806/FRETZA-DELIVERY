import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/useCartStore';
import { useAuthStore } from '../store/useAuthStore';

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const cartItems = useCartStore((state) => state.cartItems);
  const { currentUser, addresses, setDefaultAddress } = useAuthStore();
  const [showAddressDropdown, setShowAddressDropdown] = useState(false);

  const cartCount = cartItems.reduce((acc, curr) => acc + curr.quantity, 0);
  const activeAddress = addresses.find((a) => a.isDefault) || addresses[0];

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-outline-variant/20 shadow-sm transition-colors duration-300">
      <div className="flex justify-between items-center px-gutter py-md w-full max-w-max-width mx-auto">
        
        {/* Brand & Address Selection */}
        <div className="flex items-center gap-6">
          <Link to="/" className="font-headline-md text-[24px] font-black text-primary tracking-tighter hover:scale-105 transition-transform">
            FRETZA
          </Link>

          {/* Address dropdown */}
          {activeAddress && (
            <div className="relative hidden md:block">
              <button 
                onClick={() => setShowAddressDropdown(!showAddressDropdown)}
                className="flex items-center gap-1 text-left text-on-surface-variant hover:text-primary transition-colors py-1 px-2 rounded-lg hover:bg-gray-100"
              >
                <span className="material-symbols-outlined text-primary text-[20px]">location_on</span>
                <div className="flex flex-col">
                  <span className="font-label-md text-xs leading-none">Deliver to</span>
                  <span className="font-body-sm text-xs font-semibold max-w-[150px] truncate">{activeAddress.label}: {activeAddress.details}</span>
                </div>
                <span className="material-symbols-outlined text-[16px]">keyboard_arrow_down</span>
              </button>

              {showAddressDropdown && (
                <div className="absolute top-full left-0 mt-1 w-64 bg-white rounded-xl shadow-xl border border-outline-variant/30 py-2 z-50">
                  <p className="px-4 py-1 text-[10px] uppercase font-bold text-gray-400 tracking-wider">Select Delivery Address</p>
                  {addresses.map((addr) => (
                    <button
                      key={addr.id}
                      onClick={() => {
                        setDefaultAddress(addr.id);
                        setShowAddressDropdown(false);
                      }}
                      className={`w-full text-left px-4 py-2 hover:bg-orange-50/50 flex items-start gap-2 text-xs transition-colors ${addr.isDefault ? 'text-primary font-semibold' : 'text-on-surface-variant'}`}
                    >
                      <span className="material-symbols-outlined text-sm mt-[2px]">{addr.label === 'Home' ? 'home' : addr.label === 'Work' ? 'work' : 'location_on'}</span>
                      <div className="flex-1 truncate">
                        <span className="block font-semibold">{addr.label}</span>
                        <span className="block truncate opacity-85">{addr.details}</span>
                      </div>
                      {addr.isDefault && (
                        <span className="material-symbols-outlined text-[16px] text-primary">check_circle</span>
                      )}
                    </button>
                  ))}
                  <div className="border-t border-gray-100 mt-1 px-2 pt-1">
                    <button 
                      onClick={() => {
                        setShowAddressDropdown(false);
                        navigate('/profile');
                      }}
                      className="w-full text-center text-primary font-semibold py-1.5 rounded-lg text-xs hover:bg-orange-50 transition-colors"
                    >
                      Manage Addresses
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8">
          <NavLink 
            to="/home" 
            className={({ isActive }) => `flex items-center gap-1.5 font-label-md transition-colors ${isActive ? 'text-primary' : 'text-secondary hover:text-primary'}`}
          >
            <span className="material-symbols-outlined text-[20px]">explore</span>
            <span>Explore</span>
          </NavLink>
          <NavLink 
            to="/offers" 
            className={({ isActive }) => `flex items-center gap-1.5 font-label-md transition-colors ${isActive ? 'text-primary' : 'text-secondary hover:text-primary'}`}
          >
            <span className="material-symbols-outlined text-[20px]">local_offer</span>
            <span>Offers</span>
          </NavLink>
          <NavLink 
            to="/search" 
            className={({ isActive }) => `flex items-center gap-1.5 font-label-md transition-colors ${isActive ? 'text-primary' : 'text-secondary hover:text-primary'}`}
          >
            <span className="material-symbols-outlined text-[20px]">search</span>
            <span>Search</span>
          </NavLink>
          <NavLink 
            to="/cart" 
            className={({ isActive }) => `flex items-center gap-1.5 font-label-md transition-colors relative ${isActive ? 'text-primary' : 'text-secondary hover:text-primary'}`}
          >
            <span className="material-symbols-outlined text-[20px]">shopping_bag</span>
            <span>Cart</span>
            {cartCount > 0 && (
              <span className="absolute -top-2.5 -right-3 bg-primary text-white font-bold text-[10px] w-5 h-5 rounded-full flex items-center justify-center animate-bounce">
                {cartCount}
              </span>
            )}
          </NavLink>
        </nav>

        {/* User Profile / Login */}
        <div className="flex items-center gap-4">
          <Link to="/search" className="p-2 hover:bg-gray-100 rounded-full md:hidden">
            <span className="material-symbols-outlined text-on-surface">search</span>
          </Link>

          {currentUser ? (
            <Link to="/profile" className="flex items-center gap-2 group">
              <div className="w-9 h-9 rounded-full bg-primary-container flex items-center justify-center text-white font-bold border border-outline-variant/30 overflow-hidden group-hover:border-primary transition-all">
                {currentUser.avatar ? (
                  <img src={currentUser.avatar} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  currentUser.name.split(' ').map(n => n[0]).join('')
                )}
              </div>
              <span className="font-label-md text-sm text-on-surface-variant group-hover:text-primary transition-colors hidden lg:block">
                {currentUser.name.split(' ')[0]}
              </span>
            </Link>
          ) : (
            <Link to="/login" className="px-4 py-2 rounded-xl border border-outline font-label-md text-sm hover:bg-gray-50 transition-colors">
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};
