import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { MOCK_CATEGORIES, MOCK_OFFERS } from '../constants/mockData';
import { CategoryCard } from '../components/CategoryCard';
import { OfferBanner } from '../components/OfferBanner';
import { RestaurantCard } from '../components/RestaurantCard';
import { FoodCard } from '../components/FoodCard';
import { CardSkeleton, FoodSkeleton } from '../components/LoadingSkeleton';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import type { MenuItem, Restaurant } from '../types';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, addresses } = useAuthStore();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeFilter, setActiveFilter] = useState<'none' | 'flash' | 'rated' | 'budget'>('none');

  const defaultAddr = addresses.find((a) => a.isDefault) || addresses[0];

  // Fetch restaurants from Backend
  const { data: restaurants = [], isLoading } = useQuery<Restaurant[]>({
    queryKey: ['restaurants'],
    queryFn: async () => {
      const res = await api.get('/restaurants');
      return res.data.restaurants;
    },
  });

  // Filter restaurants based on category and active quick filter
  const filteredRestaurants = useMemo(() => {
    let list = [...restaurants];

    // Category filter
    if (selectedCategory !== 'all') {
      list = list.filter((r) => r.tags.includes(selectedCategory));
    }

    // Quick filter
    if (activeFilter === 'flash') {
      // Under 20 mins
      list = list.filter((r) => {
        const mins = parseInt(r.deliveryTime.split('-')[0]);
        return mins <= 20;
      });
    } else if (activeFilter === 'rated') {
      list = list.filter((r) => r.rating >= 4.6);
    } else if (activeFilter === 'budget') {
      list = list.filter((r) => r.costForTwo <= 300);
    }

    return list;
  }, [restaurants, selectedCategory, activeFilter]);

  // Aggregate some bestsellers for recommended section
  const recommendedFoods = useMemo(() => {
    const foods: { item: MenuItem; restId: string; restName: string }[] = [];
    restaurants.forEach((r) => {
      if (r.menu?.bestsellers) {
        r.menu.bestsellers.forEach((f) => {
          foods.push({ item: f, restId: r.id, restName: r.name });
        });
      }
    });
    return foods.slice(0, 4); // Limit to 4 items
  }, [restaurants]);

  return (
    <div className="px-gutter py-4 space-y-6">
      
      {/* Mobile Greeting and Address Bar */}
      <div className="md:hidden flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[24px]">location_on</span>
          <div className="flex flex-col text-left">
            <span className="font-label-md text-xs font-bold text-on-surface">
              {defaultAddr ? defaultAddr.label : 'Deliver to'}
            </span>
            <span className="text-[11px] text-on-surface-variant max-w-[200px] truncate">
              {defaultAddr ? defaultAddr.details : 'Khunta, Odisha'}
            </span>
          </div>
        </div>
        <div className="w-8 h-8 rounded-full bg-primary-container text-white font-bold flex items-center justify-center text-xs overflow-hidden">
          {currentUser ? (
            currentUser.avatar ? (
              <img src={currentUser.avatar} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              currentUser.name[0]
            )
          ) : (
            'U'
          )}
        </div>
      </div>

      {/* Fake Search Bar Redirect Trigger */}
      <div 
        onClick={() => navigate('/search')}
        className="w-full bg-surface-container-low border border-outline-variant/10 rounded-full px-5 py-3 flex items-center gap-3 cursor-pointer hover:bg-white hover:shadow-sm transition-all"
      >
        <span className="material-symbols-outlined text-secondary">search</span>
        <span className="text-secondary text-sm">Search for food, sweets, or groceries...</span>
      </div>

      {/* Offer Carousel Banner */}
      <section className="w-full overflow-x-auto hide-scrollbar flex gap-4 snap-x snap-mandatory py-1 px-0.5">
        {MOCK_OFFERS.map((off) => (
          <div key={off.id} className="min-w-full md:min-w-[60%] snap-center shrink-0">
            <OfferBanner offer={off} />
          </div>
        ))}
      </section>

      {/* Categories Row */}
      <section className="space-y-2">
        <h3 className="font-headline-md text-base text-on-surface font-black">What's on your mind?</h3>
        <div className="flex gap-3 overflow-x-auto hide-scrollbar py-1">
          {MOCK_CATEGORIES.map((cat) => (
            <CategoryCard
              key={cat.id}
              category={cat}
              isActive={selectedCategory === cat.id}
              onClick={() => setSelectedCategory(cat.id)}
            />
          ))}
        </div>
      </section>

      {/* Quick Filters Bento Grid */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div
          onClick={() => setActiveFilter(activeFilter === 'flash' ? 'none' : 'flash')}
          className={`p-3 rounded-2xl flex items-center justify-between cursor-pointer border transition-all ${
            activeFilter === 'flash'
              ? 'bg-orange-50/70 border-primary shadow-sm text-primary'
              : 'bg-white hover:bg-orange-50/20 border-outline-variant/10 shadow-xs'
          }`}
        >
          <div>
            <h4 className="font-headline-md text-xs md:text-sm text-on-surface font-bold">Flash Delivery</h4>
            <p className="text-secondary font-body-sm text-[10px] mt-0.5">Under 20 mins</p>
          </div>
          <span className={`material-symbols-outlined text-2xl ${activeFilter === 'flash' ? 'text-primary' : 'text-secondary'}`}>bolt</span>
        </div>

        <div
          onClick={() => setActiveFilter(activeFilter === 'rated' ? 'none' : 'rated')}
          className={`p-3 rounded-2xl flex items-center justify-between cursor-pointer border transition-all ${
            activeFilter === 'rated'
              ? 'bg-orange-50/70 border-primary shadow-sm text-primary'
              : 'bg-white hover:bg-orange-50/20 border-outline-variant/10 shadow-xs'
          }`}
        >
          <div>
            <h4 className="font-headline-md text-xs md:text-sm text-on-surface font-bold">Top Rated</h4>
            <p className="text-secondary font-body-sm text-[10px] mt-0.5">4.6+ Stars</p>
          </div>
          <span className={`material-symbols-outlined text-2xl ${activeFilter === 'rated' ? 'text-primary' : 'text-secondary'}`}>stars</span>
        </div>

        <div
          onClick={() => setActiveFilter(activeFilter === 'budget' ? 'none' : 'budget')}
          className={`p-3 rounded-2xl flex items-center justify-between cursor-pointer border transition-all ${
            activeFilter === 'budget'
              ? 'bg-orange-50/70 border-primary shadow-sm text-primary'
              : 'bg-white hover:bg-orange-50/20 border-outline-variant/10 shadow-xs'
          }`}
        >
          <div>
            <h4 className="font-headline-md text-xs md:text-sm text-on-surface font-bold">Super Budget</h4>
            <p className="text-secondary font-body-sm text-[10px] mt-0.5">Under ₹300</p>
          </div>
          <span className={`material-symbols-outlined text-2xl ${activeFilter === 'budget' ? 'text-primary' : 'text-secondary'}`}>payments</span>
        </div>

        <div
          onClick={() => {
            setSelectedCategory('all');
            setActiveFilter('none');
          }}
          className="p-3 rounded-2xl flex items-center justify-between bg-white hover:bg-orange-50/20 border border-outline-variant/10 shadow-xs cursor-pointer text-secondary"
        >
          <div>
            <h4 className="font-headline-md text-xs md:text-sm text-on-surface font-bold">Reset Filters</h4>
            <p className="font-body-sm text-[10px] mt-0.5">View all items</p>
          </div>
          <span className="material-symbols-outlined text-2xl">restart_alt</span>
        </div>
      </section>

      {/* Recommended Foods */}
      <section className="space-y-3">
        <h3 className="font-headline-md text-base text-on-surface font-black">Today's Recommendations</h3>
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FoodSkeleton />
            <FoodSkeleton />
            <FoodSkeleton />
            <FoodSkeleton />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendedFoods.map(({ item, restId, restName }) => (
              <FoodCard
                key={item.id}
                item={item}
                restaurantId={restId}
                restaurantName={restName}
              />
            ))}
          </div>
        )}
      </section>

      {/* Restaurant List */}
      <section className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-headline-md text-base text-on-surface font-black">
            {selectedCategory === 'all' ? 'Popular Outlets' : `Best in ${MOCK_CATEGORIES.find((c) => c.id === selectedCategory)?.name}`}
          </h3>
          <span className="text-xs text-primary font-bold hover:underline cursor-pointer" onClick={() => navigate('/restaurants')}>
            See All
          </span>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : filteredRestaurants.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRestaurants.map((restaurant) => (
              <RestaurantCard key={restaurant.id} restaurant={restaurant} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-secondary border border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
            <span className="material-symbols-outlined text-4xl mb-2 text-gray-300">search_off</span>
            <p className="text-xs">No restaurants match your selected filters in Khunta.</p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setActiveFilter('none');
              }}
              className="mt-3 text-xs text-primary font-bold hover:underline"
            >
              Reset Filters
            </button>
          </div>
        )}
      </section>
    </div>
  );
};
