import { create } from 'zustand';

interface FavoritesState {
  favoriteRestaurants: string[];
  favoriteFoods: string[];
  toggleFavoriteRestaurant: (id: string) => void;
  toggleFavoriteFood: (id: string) => void;
  isRestaurantFavorite: (id: string) => boolean;
  isFoodFavorite: (id: string) => boolean;
}

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
  favoriteRestaurants: ['rest-1'], // Pre-favorite Saffron Grill
  favoriteFoods: ['food-1-1'],

  toggleFavoriteRestaurant: (id) => {
    const { favoriteRestaurants } = get();
    const exists = favoriteRestaurants.includes(id);
    set({
      favoriteRestaurants: exists
        ? favoriteRestaurants.filter((favId) => favId !== id)
        : [...favoriteRestaurants, id],
    });
  },

  toggleFavoriteFood: (id) => {
    const { favoriteFoods } = get();
    const exists = favoriteFoods.includes(id);
    set({
      favoriteFoods: exists
        ? favoriteFoods.filter((favId) => favId !== id)
        : [...favoriteFoods, id],
    });
  },

  isRestaurantFavorite: (id) => get().favoriteRestaurants.includes(id),
  isFoodFavorite: (id) => get().favoriteFoods.includes(id),
}));
