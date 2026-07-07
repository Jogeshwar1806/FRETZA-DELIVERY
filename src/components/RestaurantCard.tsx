import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { Restaurant } from '../types';
import { useFavoritesStore } from '../store/useFavoritesStore';

interface RestaurantCardProps {
  restaurant: Restaurant;
}

export const RestaurantCard: React.FC<RestaurantCardProps> = ({ restaurant }) => {
  const { toggleFavoriteRestaurant, isRestaurantFavorite } = useFavoritesStore();
  const isFav = isRestaurantFavorite(restaurant.id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-2xl shadow-sm border border-outline-variant/10 overflow-hidden flex flex-col group relative hover:shadow-md transition-all"
    >
      {/* Favorite Heart Button */}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toggleFavoriteRestaurant(restaurant.id);
        }}
        className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center shadow-sm text-gray-500 hover:text-red-500 active:scale-90 transition-all"
      >
        <span 
          className="material-symbols-outlined text-[20px]" 
          style={{ fontVariationSettings: isFav ? "'FILL' 1" : "'FILL' 0", color: isFav ? '#ef4444' : undefined }}
        >
          favorite
        </span>
      </button>

      {/* Featured Badge */}
      {restaurant.featured && (
        <span className="absolute top-3 left-3 z-10 px-2.5 py-1 bg-primary text-white text-[10px] font-bold uppercase rounded-md tracking-wider shadow-sm">
          Featured
        </span>
      )}

      {/* Image container */}
      <Link to={`/restaurant/${restaurant.id}`} className="block relative aspect-[16/9] w-full overflow-hidden bg-gray-100">
        <img
          src={restaurant.image}
          alt={restaurant.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        {restaurant.offers && restaurant.offers.length > 0 && (
          <div className="absolute bottom-3 left-3 bg-gradient-to-r from-primary to-primary-container text-white px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider shadow-sm">
            {restaurant.offers[0].text}
          </div>
        )}
      </Link>

      {/* Info container */}
      <div className="p-md flex flex-col flex-1">
        <div className="flex justify-between items-start gap-1 mb-1">
          <Link to={`/restaurant/${restaurant.id}`} className="font-headline-md text-base text-on-surface hover:text-primary transition-colors line-clamp-1 font-bold">
            {restaurant.name}
          </Link>
          <div className="bg-green-600 px-2 py-0.5 rounded-lg flex items-center gap-0.5 text-white shrink-0">
            <span className="font-label-md text-xs font-bold leading-none">{restaurant.rating}</span>
            <span className="material-symbols-outlined text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
          </div>
        </div>

        <p className="text-secondary font-body-sm text-xs line-clamp-1 mb-2">{restaurant.cuisine}</p>

        {/* Footer Metrics */}
        <div className="flex items-center gap-2 text-[10px] uppercase font-bold text-on-surface-variant/80 border-t border-gray-100 pt-3 mt-auto">
          <span className="flex items-center gap-0.5">
            <span className="material-symbols-outlined text-primary text-[14px]">schedule</span>
            {restaurant.deliveryTime}
          </span>
          <span className="w-1 h-1 rounded-full bg-gray-300"></span>
          <span>{restaurant.distance}</span>
          <span className="w-1 h-1 rounded-full bg-gray-300"></span>
          <span>₹{restaurant.costForTwo} for two</span>
        </div>
      </div>
    </motion.div>
  );
};
