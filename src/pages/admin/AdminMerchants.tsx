import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import {
  UtensilsCrossed,
  Search,
  Star,
} from 'lucide-react';

export const AdminMerchants: React.FC = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');

  // Fetch Restaurants
  const { data: restaurantsData, isLoading } = useQuery({
    queryKey: ['admin-restaurants'],
    queryFn: async () => {
      const res = await api.get('/admin/restaurants');
      return res.data.restaurants || [];
    },
  });

  // Update Merchant Settings Mutation
  const updateMerchantMutation = useMutation({
    mutationFn: async ({ restaurantId, data }: { restaurantId: string; data: any }) => {
      const res = await api.put(`/admin/restaurants/${restaurantId}`, data);
      return res.data.restaurant;
    },
    onSuccess: () => {
      showToast('Outlet settings modified successfully', 'success');
      queryClient.invalidateQueries({ queryKey: ['admin-restaurants'] });
    },
    onError: (err: any) => {
      showToast(typeof err === 'string' ? err : 'Could not modify outlet details', 'error');
    },
  });

  const restaurants = restaurantsData || [];

  // Filter & Search
  const filteredRestaurants = restaurants.filter((r: any) =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.cuisine.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="px-gutter py-6 max-w-5xl mx-auto space-y-6 text-left">
      
      {/* Title */}
      <div>
        <h2 className="font-headline-lg text-lg font-black text-on-surface">Merchants Queue</h2>
        <p className="text-secondary font-body-sm text-[10px]">Approve new local outlets, toggle open hours, and manage spotlight features.</p>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-secondary" />
        <input
          type="text"
          placeholder="Search by restaurant name or cuisine type..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white border border-outline-variant/20 rounded-xl pl-10 pr-4 py-2.5 text-xs focus:ring-1 focus:ring-primary focus:outline-none"
        />
      </div>

      {/* Restaurants list */}
      {isLoading ? (
        <div className="space-y-3">
          <div className="h-16 bg-gray-100 rounded-2xl animate-pulse" />
          <div className="h-16 bg-gray-100 rounded-2xl animate-pulse" />
        </div>
      ) : filteredRestaurants.length > 0 ? (
        <div className="bg-white rounded-3xl border border-outline-variant/10 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low border-b border-outline-variant/10 text-secondary font-bold">
                  <th className="p-4">Restaurant</th>
                  <th className="p-4">Cuisine</th>
                  <th className="p-4">Spotlight Featured</th>
                  <th className="p-4">Verification Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {filteredRestaurants.map((r: any) => (
                  <tr key={r._id} className="hover:bg-gray-50/50">
                    <td className="p-4">
                      <div>
                        <h4 className="font-bold text-on-surface">{r.name}</h4>
                        <p className="text-[10px] text-secondary mt-0.5">{r.address}</p>
                      </div>
                    </td>
                    <td className="p-4 text-secondary">{r.cuisine}</td>
                    <td className="p-4">
                      <button
                        onClick={() => updateMerchantMutation.mutate({
                          restaurantId: r._id,
                          data: { featured: !r.featured }
                        })}
                        className={`flex items-center gap-1 text-[10px] font-bold ${
                          r.featured ? 'text-amber-500' : 'text-gray-300 hover:text-amber-400'
                        }`}
                      >
                        <Star className="w-4 h-4 fill-current" />
                        {r.featured ? 'Featured' : 'Standard'}
                      </button>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-0.5 rounded-full font-bold text-[9px] uppercase tracking-wider ${
                        r.status === 'Open'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex gap-2 justify-end">
                        {r.status === 'Closed' ? (
                          <button
                            onClick={() => updateMerchantMutation.mutate({ restaurantId: r._id, data: { status: 'Open' } })}
                            className="px-3 py-1 bg-green-50 text-green-700 font-bold border border-green-200 rounded-lg"
                          >
                            Open Outlet
                          </button>
                        ) : (
                          <button
                            onClick={() => updateMerchantMutation.mutate({ restaurantId: r._id, data: { status: 'Closed' } })}
                            className="px-3 py-1 bg-red-50 text-red-700 font-bold border border-red-200 rounded-lg"
                          >
                            Close Outlet
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-16 bg-white border border-dashed border-gray-200 rounded-3xl">
          <UtensilsCrossed className="w-8 h-8 text-gray-300 mx-auto" />
          <h4 className="text-xs font-bold text-on-surface mt-2">No merchant outlets listed</h4>
        </div>
      )}

    </div>
  );
};
