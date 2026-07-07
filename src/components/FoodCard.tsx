import React from 'react';
import { motion } from 'framer-motion';
import type { MenuItem } from '../types';
import { useCartStore } from '../store/useCartStore';
import { useToast } from '../contexts/ToastContext';

interface FoodCardProps {
  item: MenuItem;
  restaurantId: string;
  restaurantName: string;
}

export const FoodCard: React.FC<FoodCardProps> = ({ item, restaurantId, restaurantName }) => {
  const { cartItems, addToCart, updateQuantity, removeFromCart } = useCartStore();
  const { showToast } = useToast();

  const cartItem = cartItems.find((i) => i.menuItem.id === item.id);
  const qty = cartItem ? cartItem.quantity : 0;

  const handleAdd = () => {
    addToCart(item, restaurantId, restaurantName);
    showToast(`Added ${item.name} to cart!`);
  };

  const handleIncrement = () => {
    updateQuantity(item.id, qty + 1);
  };

  const handleDecrement = () => {
    if (qty === 1) {
      removeFromCart(item.id);
      showToast(`Removed ${item.name} from cart`, 'info');
    } else {
      updateQuantity(item.id, qty - 1);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-md rounded-2xl border border-outline-variant/10 flex gap-md group hover:shadow-md transition-shadow duration-300"
    >
      {/* Details side */}
      <div className="flex-1">
        <div className="flex items-center gap-1.5 mb-1.5">
          {/* Veg / Non-Veg Indicator */}
          <span 
            className={`w-3.5 h-3.5 border flex items-center justify-center p-[1px] ${
              item.isVeg ? 'border-green-600' : 'border-red-600'
            }`}
          >
            <span className={`w-full h-full rounded-full ${item.isVeg ? 'bg-green-600' : 'bg-red-600'}`}></span>
          </span>
          <span className={`text-[10px] font-bold uppercase tracking-widest ${item.isVeg ? 'text-green-600' : 'text-red-600'}`}>
            {item.isVeg ? 'Veg' : 'Non-Veg'}
          </span>
          {item.popular && (
            <span className="bg-amber-100 text-amber-800 text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ml-2 flex items-center gap-0.5">
              <span className="material-symbols-outlined text-[10px] fill-current">star</span> Popular
            </span>
          )}
        </div>

        <h4 className="font-label-md text-on-surface group-hover:text-primary transition-colors text-sm font-semibold">
          {item.name}
        </h4>

        {item.rating && (
          <div className="flex items-center gap-0.5 mt-0.5 text-xs text-amber-500">
            <span className="material-symbols-outlined text-[14px] fill-current" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
            <span className="font-semibold text-on-surface-variant">{item.rating}</span>
          </div>
        )}

        <p className="font-body-sm text-xs text-on-surface-variant line-clamp-2 mt-1.5 leading-relaxed">
          {item.description}
        </p>

        <p className="font-label-md text-on-surface text-sm font-bold mt-3">₹{item.price}</p>
      </div>

      {/* Image and Add button side */}
      <div className="relative w-28 h-28 shrink-0 bg-gray-50 rounded-xl overflow-hidden self-center border border-gray-100">
        <img
          src={item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400'}
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        {qty === 0 ? (
          <button
            onClick={handleAdd}
            className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 bg-white text-primary border border-primary-container shadow-md px-6 py-1.5 rounded-lg font-bold text-xs hover:bg-primary-fixed hover:border-primary active:scale-95 transition-all"
          >
            ADD
          </button>
        ) : (
          <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 bg-primary text-white shadow-md flex items-center rounded-lg overflow-hidden border border-primary">
            <button
              onClick={handleDecrement}
              className="px-2.5 py-1.5 hover:bg-primary-fixed-variant transition-colors text-xs font-black select-none"
            >
              -
            </button>
            <span className="px-2 font-bold text-xs qty text-center min-w-[14px] select-none">{qty}</span>
            <button
              onClick={handleIncrement}
              className="px-2.5 py-1.5 hover:bg-primary-fixed-variant transition-colors text-xs font-black select-none"
            >
              +
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};
