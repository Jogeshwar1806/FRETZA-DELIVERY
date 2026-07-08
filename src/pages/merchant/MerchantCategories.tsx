import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';
import { Folder } from 'lucide-react';

interface CategoryFields {
  _id?: string;
  name: string;
  icon: string;
}

export const MerchantCategories: React.FC = () => {
  // Fetch Categories
  const { data: categoriesData, isLoading } = useQuery<CategoryFields[]>({
    queryKey: ['merchant-categories'],
    queryFn: async () => {
      const res = await api.get('/merchant/categories');
      return res.data.categories;
    },
  });

  const categories = categoriesData || [];

  return (
    <div className="space-y-8 text-left">
      <div>
        <h2 className="font-headline-lg text-xl md:text-2xl text-on-surface font-black">Food Categories</h2>
        <p className="text-secondary font-body-sm text-xs mt-1">
          Browse the master list of dietary tags and menu classifications defined by the Fretza platform.
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 animate-pulse">
          <div className="h-20 bg-gray-200 rounded-2xl" />
          <div className="h-20 bg-gray-200 rounded-2xl" />
          <div className="h-20 bg-gray-200 rounded-2xl" />
        </div>
      ) : categories.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <div
              key={cat._id}
              className="bg-white p-4 rounded-2xl border border-outline-variant/10 shadow-xs flex items-center gap-3"
            >
              <span className="material-symbols-outlined text-2xl text-primary">{cat.icon}</span>
              <span className="text-xs font-bold text-on-surface">{cat.name}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-secondary bg-white rounded-3xl border border-outline-variant/10 shadow-xs flex flex-col items-center">
          <Folder className="w-12 h-12 text-gray-300 mb-2" />
          <p className="text-xs font-bold">No food categories configured</p>
          <p className="text-[10px] text-gray-400">Master categories list is empty.</p>
        </div>
      )}
    </div>
  );
};
