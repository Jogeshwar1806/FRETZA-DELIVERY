import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { SearchBar } from '../components/SearchBar';
import { FoodCard } from '../components/FoodCard';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import type { MenuItem, Restaurant } from '../types';

export const Search: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQuery);

  const [recentSearches, setRecentSearches] = useState<string[]>([
    'Biryani',
    'Burger',
    'The Saffron Grill',
    'Lassi',
  ]);

  // Fetch restaurants from backend
  const { data: restaurants = [], isLoading } = useQuery<Restaurant[]>({
    queryKey: ['restaurants'],
    queryFn: async () => {
      const res = await api.get('/restaurants');
      return res.data.restaurants;
    },
  });

  // Sync state with URL search param
  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  const handleSearchSubmit = (searchVal: string) => {
    setQuery(searchVal);
    setSearchParams(searchVal ? { q: searchVal } : {});
    if (searchVal.trim() && !recentSearches.includes(searchVal)) {
      setRecentSearches((prev) => [searchVal, ...prev.slice(0, 4)]);
    }
  };

  // Aggregate all available food items across all restaurants
  const allFoods = useMemo(() => {
    const foods: { item: MenuItem; restId: string; restName: string }[] = [];
    restaurants.forEach((r) => {
      if (r.menu) {
        const allMenu = [
          ...(r.menu.bestsellers || []),
          ...(r.menu.mains || []),
          ...(r.menu.desserts || []),
          ...(r.menu.beverages || []),
        ];
        allMenu.forEach((item) => {
          // Avoid duplicate items if they exist
          if (!foods.some((f) => f.item.id === item.id)) {
            foods.push({ item, restId: r.id, restName: r.name });
          }
        });
      }
    });
    return foods;
  }, [restaurants]);

  // Perform search matching
  const searchResults = useMemo(() => {
    if (!query.trim()) return { restaurants: [], foods: [] };

    const term = query.toLowerCase().trim();
    const matchedRestaurants = restaurants.filter(
      (r) =>
        r.name.toLowerCase().includes(term) ||
        r.cuisine.toLowerCase().includes(term) ||
        r.tags.some((t) => t.toLowerCase().includes(term))
    );

    const matchedFoods: { item: MenuItem; restId: string; restName: string }[] = [];
    restaurants.forEach((r) => {
      if (r.menu) {
        const allMenu = [
          ...(r.menu.bestsellers || []),
          ...(r.menu.mains || []),
          ...(r.menu.desserts || []),
          ...(r.menu.beverages || []),
        ];
        allMenu.forEach((item) => {
          if (
            item.name.toLowerCase().includes(term) ||
            item.description.toLowerCase().includes(term)
          ) {
            matchedFoods.push({ item, restId: r.id, restName: r.name });
          }
        });
      }
    });

    return {
      restaurants: matchedRestaurants,
      foods: matchedFoods,
    };
  }, [query, restaurants]);

  return (
    <div className="px-gutter py-6 space-y-6">
      <div>
        <h2 className="font-headline-lg text-xl md:text-2xl text-on-surface font-black">Search FRETZA</h2>
        <p className="text-secondary font-body-sm text-xs mt-1">Find your favorite dishes, snacks, or local restaurants in Khunta.</p>
      </div>

      {/* Main Search Bar Component */}
      <SearchBar
        value={query}
        onChange={(val) => {
          setQuery(val);
          setSearchParams(val ? { q: val } : {});
        }}
        onClear={() => {
          setQuery('');
          setSearchParams({});
        }}
      />

      {/* Conditional Rendering: Loading vs Query active vs Empty query page */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : !query.trim() ? (
        <div className="space-y-6 pt-2">
          {/* Recent Searches Section */}
          {recentSearches.length > 0 && (
            <div className="space-y-2.5">
              <h3 className="font-headline-md text-xs font-bold text-gray-400 uppercase tracking-wider">Recent Searches</h3>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSearchSubmit(s)}
                    className="px-4 py-2 rounded-xl bg-surface-container text-xs font-semibold text-on-surface-variant hover:bg-gray-200 active:scale-95 transition-all"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Popular Cuisines Section */}
          <div className="space-y-3">
            <h3 className="font-headline-md text-xs font-bold text-gray-400 uppercase tracking-wider">Popular Tags</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { name: 'Biryani Feast', icon: 'rice_bowl', tag: 'biryani' },
                { name: 'Cheesy Pizzas', icon: 'local_pizza', tag: 'pizza' },
                { name: 'Hot Burgers', icon: 'lunch_dining', tag: 'burgers' },
                { name: 'Thali Meals', icon: 'restaurant', tag: 'thali' },
              ].map((c, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSearchSubmit(c.tag)}
                  className="flex items-center gap-3 p-4 bg-white border border-outline-variant/10 rounded-2xl shadow-xs hover:bg-orange-50/20 hover:border-primary-container text-left transition-all"
                >
                  <span className="material-symbols-outlined text-primary text-[28px]">{c.icon}</span>
                  <div>
                    <span className="block font-bold text-xs text-on-surface">{c.name}</span>
                    <span className="text-[10px] text-secondary">Explore details</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* All Available Dishes Section */}
          {allFoods.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-outline-variant/10">
              <h3 className="font-headline-md text-xs font-bold text-gray-400 uppercase tracking-wider text-left">All Available Dishes</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {allFoods.map(({ item, restId, restName }) => (
                  <div key={item.id} className="relative">
                    <div className="absolute top-2 right-4 z-10">
                      <Link
                        to={`/restaurant/${restId}`}
                        className="bg-gray-100 hover:bg-orange-50 hover:text-primary transition-colors text-[9px] font-extrabold uppercase px-2 py-0.5 rounded text-secondary"
                      >
                        from {restName}
                      </Link>
                    </div>
                    <FoodCard
                      item={item}
                      restaurantId={restId}
                      restaurantName={restName}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6 pt-2">
          {/* Search Result Matches */}
          {searchResults.restaurants.length === 0 && searchResults.foods.length === 0 ? (
            <div className="text-center py-16 text-secondary bg-gray-50 border border-dashed rounded-3xl max-w-md mx-auto">
              <span className="material-symbols-outlined text-5xl text-gray-300">sentiment_dissatisfied</span>
              <p className="text-sm font-semibold mt-2">No matching items found</p>
              <p className="text-xs text-gray-400 mt-1">We couldn't find any dishes or merchants matching "{query}" in Khunta.</p>
            </div>
          ) : (
            <>
              {/* Restaurants Matching */}
              {searchResults.restaurants.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-headline-md text-sm text-on-surface font-black">Restaurants</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {searchResults.restaurants.map((r) => (
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
                </div>
              )}

              {/* Foods Matching */}
              {searchResults.foods.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-headline-md text-sm text-on-surface font-black">Dishes</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {searchResults.foods.map(({ item, restId, restName }) => (
                      <div key={item.id} className="relative">
                        {/* Smaller badge showing Restaurant name context above the food card */}
                        <div className="absolute top-2 right-4 z-10">
                          <Link
                            to={`/restaurant/${restId}`}
                            className="bg-gray-100 hover:bg-orange-50 hover:text-primary transition-colors text-[9px] font-extrabold uppercase px-2 py-0.5 rounded text-secondary"
                          >
                            from {restName}
                          </Link>
                        </div>
                        <FoodCard
                          item={item}
                          restaurantId={restId}
                          restaurantName={restName}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};
