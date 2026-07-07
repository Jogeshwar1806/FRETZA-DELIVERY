import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FoodCard } from '../components/FoodCard';
import { useCartStore } from '../store/useCartStore';
import { useFavoritesStore } from '../store/useFavoritesStore';
import { useToast } from '../contexts/ToastContext';
import { FoodSkeleton } from '../components/LoadingSkeleton';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import type { Restaurant } from '../types';

export const RestaurantDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const { cartItems, pricing, updateQuantity, clearCart } = useCartStore();
  const { toggleFavoriteRestaurant, isRestaurantFavorite } = useFavoritesStore();

  const isFav = id ? isRestaurantFavorite(id) : false;

  // Fetch restaurant from backend
  const { data: restaurant, isLoading } = useQuery<Restaurant>({
    queryKey: ['restaurant', id],
    queryFn: async () => {
      const res = await api.get(`/restaurants/${id}`);
      return res.data.restaurant;
    },
    enabled: !!id,
  });

  const [activeCategory, setActiveCategory] = useState('bestsellers');

  if (isLoading) {
    return (
      <div className="w-full relative pb-24 animate-pulse">
        <div className="h-[240px] md:h-[350px] w-full bg-gray-200" />
        <div className="px-gutter py-8 space-y-8 max-w-max-width mx-auto">
          <div className="h-8 w-1/3 bg-gray-200 rounded-md" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FoodSkeleton />
            <FoodSkeleton />
            <FoodSkeleton />
            <FoodSkeleton />
          </div>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="px-gutter py-16 text-center space-y-4">
        <span className="material-symbols-outlined text-5xl text-gray-300">error</span>
        <h2 className="font-headline-lg text-lg text-on-surface font-bold">Restaurant Not Found</h2>
        <p className="text-secondary text-xs">The outlet you are looking for does not exist in Khunta.</p>
        <button
          onClick={() => navigate('/home')}
          className="px-6 py-2 bg-primary text-white text-xs font-bold rounded-xl"
        >
          Go Back Home
        </button>
      </div>
    );
  }

  // Handle section scrolling and category focus
  const scrollToSection = (sectionId: string) => {
    setActiveCategory(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      const headerOffset = 135;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  const handleToggleFavorite = () => {
    if (id) {
      toggleFavoriteRestaurant(id);
      showToast(isFav ? 'Removed from favorites' : 'Added to favorites!', 'success');
    }
  };

  const menuSections = [
    { id: 'bestsellers', name: 'Bestsellers', items: restaurant.menu.bestsellers, icon: 'local_fire_department' },
    { id: 'mains', name: 'Main Course', items: restaurant.menu.mains, icon: 'restaurant_menu' },
    { id: 'desserts', name: 'Desserts', items: restaurant.menu.desserts, icon: 'icecream' },
    { id: 'beverages', name: 'Beverages', items: restaurant.menu.beverages, icon: 'local_bar' },
  ].filter((s) => s.items && s.items.length > 0);

  return (
    <div className="w-full relative pb-24">
      {/* Restaurant Header Banner with Cover */}
      <section className="relative h-[240px] md:h-[350px] w-full overflow-hidden bg-gray-900">
        <img
          src={restaurant.coverImage}
          alt={restaurant.name}
          className="w-full h-full object-cover opacity-85 transition-transform duration-700 hover:scale-103"
        />
        {/* Dark gradient shadow overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/35 to-transparent" />

        {/* Back and Favorite Floating Action Buttons */}
        <div className="absolute top-4 left-4 right-4 flex justify-between z-10">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center shadow-md text-primary hover:bg-white active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          </button>
          <button
            onClick={handleToggleFavorite}
            className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center shadow-md text-gray-500 hover:text-red-500 active:scale-95 transition-all"
          >
            <span
              className="material-symbols-outlined text-[20px]"
              style={{ fontVariationSettings: isFav ? "'FILL' 1" : "'FILL' 0", color: isFav ? '#ef4444' : undefined }}
            >
              favorite
            </span>
          </button>
        </div>

        {/* Glassmorphic overlay Info Card (Mobile Bottom / Desktop Bottom Left) */}
        <div className="absolute bottom-4 left-4 right-4 md:left-6 md:right-auto md:w-[420px] z-10">
          <div className="glass p-5 rounded-2xl shadow-xl border border-white/20 text-on-surface">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h2 className="font-headline-lg text-lg md:text-xl font-bold tracking-tight text-on-surface">
                  {restaurant.name}
                </h2>
                <p className="text-on-surface-variant font-body-sm text-[11px] mt-0.5">{restaurant.cuisine}</p>
              </div>
              <div className="bg-primary px-2.5 py-0.5 rounded-lg flex items-center gap-0.5 text-white shrink-0 shadow-sm">
                <span className="font-label-md text-xs font-bold leading-none">{restaurant.rating}</span>
                <span className="material-symbols-outlined text-[12px] fill-current">star</span>
              </div>
            </div>

            {/* Travel delivery info */}
            <div className="flex items-center justify-between border-t border-outline-variant/30 pt-3 mt-3">
              <div className="flex flex-col items-center flex-1">
                <span className="material-symbols-outlined text-primary text-[18px] mb-0.5">schedule</span>
                <span className="font-label-md text-xs font-bold text-on-surface leading-none">{restaurant.deliveryTime}</span>
                <span className="text-[9px] uppercase tracking-wider text-on-surface-variant mt-1">Delivery</span>
              </div>
              <div className="w-px h-6 bg-outline-variant/30" />
              <div className="flex flex-col items-center flex-1">
                <span className="material-symbols-outlined text-primary text-[18px] mb-0.5">distance</span>
                <span className="font-label-md text-xs font-bold text-on-surface leading-none">{restaurant.distance}</span>
                <span className="text-[9px] uppercase tracking-wider text-on-surface-variant mt-1">Distance</span>
              </div>
              <div className="w-px h-6 bg-outline-variant/30" />
              <div className="flex flex-col items-center flex-1">
                <span className="material-symbols-outlined text-primary text-[18px] mb-0.5">payments</span>
                <span className="font-label-md text-xs font-bold text-on-surface leading-none">₹{restaurant.costForTwo}</span>
                <span className="text-[9px] uppercase tracking-wider text-on-surface-variant mt-1">For Two</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Spacing adjustments for the overlay banner info card */}
      <div className="h-10 md:h-12" />

      {/* Menu Categories Row (Sticky Header Navigation) */}
      <nav className="sticky top-[69px] z-40 bg-white/90 backdrop-blur-md border-b border-outline-variant/20 mb-6 py-2">
        <div className="px-gutter flex gap-3 overflow-x-auto hide-scrollbar">
          {menuSections.map((sec) => (
            <button
              key={sec.id}
              onClick={() => scrollToSection(sec.id)}
              className={`whitespace-nowrap px-5 py-2 rounded-full text-xs font-semibold flex items-center gap-1 transition-all ${
                activeCategory === sec.id
                  ? 'bg-primary-container text-white shadow-sm'
                  : 'bg-surface-container text-on-surface-variant hover:bg-gray-100'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">{sec.icon}</span>
              {sec.name}
            </button>
          ))}
        </div>
      </nav>

      {/* Main Grid: Menu listing left side / Desktop Sidebar Cart right side */}
      <div className="px-gutter grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Menu Items List */}
        <div className="lg:col-span-8 space-y-10">
          {menuSections.map((section) => (
            <section key={section.id} id={section.id} className="space-y-4">
              <h3 className="font-headline-md text-base text-on-surface font-black flex items-center gap-1.5 border-b border-gray-100 pb-2">
                <span className="material-symbols-outlined text-primary">{section.icon}</span>
                {section.name}
                <span className="text-xs text-secondary font-normal ml-1">({section.items.length})</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {section.items.map((item) => (
                  <FoodCard
                    key={item.id}
                    item={item}
                    restaurantId={restaurant.id}
                    restaurantName={restaurant.name}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* Desktop Sidebar Cart Summary */}
        <aside className="hidden lg:block lg:col-span-4 self-start sticky top-[135px]">
          <div className="bg-surface-container/60 backdrop-blur border border-outline-variant/30 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
              <h4 className="font-headline-md text-sm text-on-surface font-black flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">shopping_bag</span>
                Your Basket
              </h4>
              {cartItems.length > 0 && (
                <button
                  onClick={clearCart}
                  className="text-[10px] text-error font-bold uppercase hover:underline"
                >
                  Clear All
                </button>
              )}
            </div>

            {cartItems.length > 0 ? (
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                {cartItems.map((item) => (
                  <div key={item.menuItem.id} className="flex justify-between items-start gap-2 text-xs">
                    <div className="flex-1">
                      <p className="font-semibold text-on-surface line-clamp-1">{item.menuItem.name}</p>
                      <p className="text-[10px] text-secondary mt-0.5">₹{item.menuItem.price} x {item.quantity}</p>
                    </div>
                    {/* Quantity selectors */}
                    <div className="flex items-center border border-outline-variant/30 rounded-lg overflow-hidden bg-white">
                      <button
                        onClick={() => updateQuantity(item.menuItem.id, item.quantity - 1)}
                        className="px-2 py-1 text-primary hover:bg-gray-50 font-bold"
                      >
                        -
                      </button>
                      <span className="px-2 font-bold">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.menuItem.id, item.quantity + 1)}
                        className="px-2 py-1 text-primary hover:bg-gray-50 font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}

                {/* Subtotal strip */}
                <div className="border-t border-outline-variant/20 pt-3 space-y-1 text-xs">
                  <div className="flex justify-between text-secondary">
                    <span>Subtotal</span>
                    <span>₹{pricing.subtotal}</span>
                  </div>
                  <div className="flex justify-between text-secondary text-[10px]">
                    <span>Taxes & charges (5%)</span>
                    <span>₹{pricing.taxes}</span>
                  </div>
                  <div className="flex justify-between font-bold text-on-surface text-sm pt-1 border-t border-dashed border-gray-200 mt-2">
                    <span>Est. Total</span>
                    <span>₹{pricing.grandTotal}</span>
                  </div>
                </div>

                <Link
                  to="/cart"
                  className="block w-full py-3 bg-primary text-white text-center font-bold rounded-xl text-xs hover:bg-orange-600 transition-colors shadow-md mt-4"
                >
                  Proceed to Checkout
                </Link>
              </div>
            ) : (
              <div className="text-center py-8 text-secondary">
                <span className="material-symbols-outlined text-4xl text-gray-300 mb-2">shopping_basket</span>
                <p className="text-xs">Your basket is empty.</p>
                <p className="text-[10px] text-gray-400 mt-1">Add hot items from the menu left to fill it!</p>
              </div>
            )}
          </div>
        </aside>

      </div>
    </div>
  );
};
