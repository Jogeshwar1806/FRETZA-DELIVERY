import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '../store/useCartStore';

export const FloatingCartButton: React.FC = () => {
  const location = useLocation();
  const { cartItems, pricing } = useCartStore();

  const count = cartItems.reduce((acc, curr) => acc + curr.quantity, 0);

  // Hide button on the cart/checkout page itself and landing page
  const hideButton = location.pathname === '/cart' || location.pathname === '/' || count === 0;

  return (
    <AnimatePresence>
      {!hideButton && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          className="fixed bottom-20 md:bottom-6 left-4 right-4 z-40 max-w-md mx-auto pointer-events-auto"
        >
          <Link
            to="/cart"
            className="flex items-center justify-between p-4 bg-primary text-white rounded-2xl shadow-xl hover:bg-orange-800 transition-colors duration-300 font-label-md"
          >
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined">shopping_bag</span>
              <div className="flex flex-col text-left">
                <span className="text-[10px] font-bold uppercase leading-none opacity-85">{count} item{count > 1 ? 's' : ''} added</span>
                <span className="text-sm font-black leading-tight">₹{pricing.subtotal}</span>
              </div>
            </div>

            <div className="flex items-center gap-1 font-bold text-sm">
              <span>View Cart</span>
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </div>
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
