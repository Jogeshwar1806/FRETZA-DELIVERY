import React, { useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { MOCK_CATEGORIES } from '../constants/mockData';
import { RestaurantCard } from '../components/RestaurantCard';
import { CardSkeleton } from '../components/LoadingSkeleton';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import type { Restaurant } from '../types';

export const Categories: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const activeCategoryId = searchParams.get('c') || 'all';

  const activeCategory = MOCK_CATEGORIES.find((c) => c.id === activeCategoryId);

  // Fetch restaurants from backend
  const { data: restaurants = [], isLoading } = useQuery<Restaurant[]>({
    queryKey: ['restaurants'],
    queryFn: async () => {
      const res = await api.get('/restaurants');
      return res.data.restaurants;
    },
  });

  const filteredRestaurants = useMemo(() => {
    if (activeCategoryId === 'all') return restaurants;
    return restaurants.filter((r) => r.tags.includes(activeCategoryId));
  }, [restaurants, activeCategoryId]);

  return (
    <div className="px-gutter py-6 space-y-6">
      {/* Back button and title */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full border border-outline-variant/30 flex items-center justify-center text-primary hover:bg-gray-50 active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
        </button>
        <div>
          <h2 className="font-headline-lg text-xl md:text-2xl text-on-surface font-black">
            Category: {activeCategory ? activeCategory.name : 'Explore'}
          </h2>
          <p className="text-secondary font-body-sm text-xs mt-1">Showing restaurants under {activeCategory?.name} in Khunta.</p>
        </div>
      </div>

      {/* Categories chips selection horizontal row */}
      <div className="flex gap-2 overflow-x-auto hide-scrollbar py-1">
        {MOCK_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSearchParams({ c: cat.id })}
            className={`px-4 py-2.5 rounded-full text-xs font-semibold flex items-center gap-1.5 border transition-all ${
              activeCategoryId === cat.id
                ? 'bg-orange-50 text-primary border-primary shadow-xs'
                : 'bg-white text-secondary border-outline-variant/30 hover:bg-gray-50'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">{cat.icon}</span>
            {cat.name}
          </button>
        ))}
      </div>

      {/* Grid view */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : filteredRestaurants.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRestaurants.map((r) => (
            <RestaurantCard key={r.id} restaurant={r} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-secondary bg-gray-50 border border-dashed rounded-2xl">
          <span className="material-symbols-outlined text-5xl text-gray-300">restaurant</span>
          <p className="text-sm font-semibold mt-2">No active outlets serving {activeCategory?.name} yet</p>
          <p className="text-xs text-gray-400 mt-1">We are onboarding new merchants every day in Khunta.</p>
        </div>
      )}
    </div>
  );
};
