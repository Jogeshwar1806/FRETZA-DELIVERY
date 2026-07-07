import React, { useState, useMemo } from 'react';
import { RestaurantCard } from '../components/RestaurantCard';
import { CardSkeleton } from '../components/LoadingSkeleton';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import type { Restaurant } from '../types';

export const RestaurantListing: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'rating' | 'delivery' | 'costAsc' | 'costDesc'>('rating');
  const [selectedTag, setSelectedTag] = useState<string>('all');

  // Fetch restaurants from backend
  const { data: restaurants = [], isLoading } = useQuery<Restaurant[]>({
    queryKey: ['restaurants'],
    queryFn: async () => {
      const res = await api.get('/restaurants');
      return res.data.restaurants;
    },
  });

  // Extract all unique tags
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    restaurants.forEach((r) => {
      r.tags.forEach((t) => tags.add(t));
    });
    return ['all', ...Array.from(tags)];
  }, [restaurants]);

  const processedRestaurants = useMemo(() => {
    let list = [...restaurants];

    // Search term matching
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      list = list.filter(
        (r) =>
          r.name.toLowerCase().includes(term) ||
          r.cuisine.toLowerCase().includes(term)
      );
    }

    // Tag filtering
    if (selectedTag !== 'all') {
      list = list.filter((r) => r.tags.includes(selectedTag));
    }

    // Sorting
    list.sort((a, b) => {
      if (sortBy === 'rating') {
        return b.rating - a.rating;
      }
      if (sortBy === 'delivery') {
        const aMins = parseInt(a.deliveryTime.split('-')[0]);
        const bMins = parseInt(b.deliveryTime.split('-')[0]);
        return aMins - bMins;
      }
      if (sortBy === 'costAsc') {
        return a.costForTwo - b.costForTwo;
      }
      if (sortBy === 'costDesc') {
        return b.costForTwo - a.costForTwo;
      }
      return 0;
    });

    return list;
  }, [searchTerm, sortBy, selectedTag]);

  return (
    <div className="px-gutter py-6 space-y-6">
      <div>
        <h2 className="font-headline-lg text-xl md:text-2xl text-on-surface font-black">All Outlets in Khunta</h2>
        <p className="text-secondary font-body-sm text-xs mt-1">Discover fresh local meals delivered directly to your doorstep.</p>
      </div>

      {/* Filter and Search controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex items-center bg-surface-container-low border border-outline-variant/10 rounded-xl px-4 py-2 w-full md:max-w-xs focus-within:bg-white focus-within:border-primary-container transition-all">
          <span className="material-symbols-outlined text-secondary mr-2 text-[20px]">search</span>
          <input
            type="text"
            placeholder="Search by name or food..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-transparent border-none focus:outline-none focus:ring-0 text-xs text-on-surface"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Sorting Dropdown */}
          <div className="flex items-center gap-1 bg-white border border-outline-variant/30 rounded-xl px-3 py-2 text-xs">
            <span className="material-symbols-outlined text-primary text-[18px]">sort</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent border-none focus:outline-none focus:ring-0 text-xs font-semibold text-on-surface cursor-pointer pr-1"
            >
              <option value="rating">Top Rated (Default)</option>
              <option value="delivery">Fastest Delivery</option>
              <option value="costAsc">Price: Low to High</option>
              <option value="costDesc">Price: High to Low</option>
            </select>
          </div>

          {/* Tags */}
          <div className="flex items-center gap-1.5 overflow-x-auto hide-scrollbar">
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                  selectedTag === tag
                    ? 'bg-primary text-white border-primary'
                    : 'bg-white text-secondary hover:text-on-surface border-outline-variant/30'
                }`}
              >
                {tag === 'all' ? 'All Cuisines' : tag.charAt(0).toUpperCase() + tag.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid listing */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : processedRestaurants.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {processedRestaurants.map((r) => (
            <RestaurantCard key={r.id} restaurant={r} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-secondary bg-gray-50 border border-dashed rounded-2xl">
          <span className="material-symbols-outlined text-5xl text-gray-300">search_off</span>
          <p className="text-sm font-semibold mt-2">No matching outlets found</p>
          <p className="text-xs text-gray-400 mt-1">Try adjusting your filters or query</p>
        </div>
      )}
    </div>
  );
};
