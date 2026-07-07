import React from 'react';
import { NavLink } from 'react-router-dom';
import { useCartStore } from '../store/useCartStore';

export const BottomNav: React.FC = () => {
  const cartItems = useCartStore((state) => state.cartItems);
  const cartCount = cartItems.reduce((acc, curr) => acc + curr.quantity, 0);

  const linkStyle = ({ isActive }: { isActive: boolean }) =>
    `flex flex-col items-center justify-center py-2 text-xs transition-colors flex-1 ${
      isActive ? 'text-primary font-semibold' : 'text-secondary hover:text-primary'
    }`;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-outline-variant/30 shadow-lg py-1 px-4 z-50 flex justify-between items-center glass-nav">
      <NavLink to="/home" className={linkStyle}>
        <span className="material-symbols-outlined text-[24px]">explore</span>
        <span className="text-[10px] mt-0.5">Explore</span>
      </NavLink>

      <NavLink to="/search" className={linkStyle}>
        <span className="material-symbols-outlined text-[24px]">search</span>
        <span className="text-[10px] mt-0.5">Search</span>
      </NavLink>

      <NavLink to="/offers" className={linkStyle}>
        <span className="material-symbols-outlined text-[24px]">local_offer</span>
        <span className="text-[10px] mt-0.5">Offers</span>
      </NavLink>

      <NavLink to="/cart" className={`${linkStyle} relative`}>
        <span className="material-symbols-outlined text-[24px]">shopping_bag</span>
        <span className="text-[10px] mt-0.5">Cart</span>
        {cartCount > 0 && (
          <span className="absolute top-1.5 right-[30%] bg-primary text-white font-bold text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center animate-bounce">
            {cartCount}
          </span>
        )}
      </NavLink>

      <NavLink to="/profile" className={linkStyle}>
        <span className="material-symbols-outlined text-[24px]">person</span>
        <span className="text-[10px] mt-0.5">Profile</span>
      </NavLink>
    </nav>
  );
};
