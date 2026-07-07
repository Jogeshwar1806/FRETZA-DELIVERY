import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';
import {
  History,
  Search,
  Calendar,
  MapPin,
  IndianRupee,
  Clock,
  Compass,
} from 'lucide-react';

export const DeliveryHistory: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'All' | 'Delivered' | 'Failed' | 'Cancelled'>('All');

  // Fetch Delivery History
  const { data: historyData, isLoading } = useQuery({
    queryKey: ['delivery-history'],
    queryFn: async () => {
      const res = await api.get('/delivery/history');
      return res.data.orders || [];
    },
  });

  const orders = historyData || [];

  // Filter lists
  const filteredOrders = orders.filter((ord: any) => {
    const matchesSearch =
      ord._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ord.restaurantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ord.deliveryAddress.toLowerCase().includes(searchQuery.toLowerCase());

    const isFailed = ord.deliveryStatus === 'Failed' || ord.deliveryStatus === 'Cancelled';
    const isDelivered = ord.deliveryStatus === 'Delivered';

    if (filterStatus === 'All') return matchesSearch;
    if (filterStatus === 'Delivered') return matchesSearch && isDelivered;
    if (filterStatus === 'Failed') return matchesSearch && isFailed;
    return matchesSearch;
  });

  return (
    <div className="px-gutter py-6 max-w-4xl mx-auto space-y-6 text-left">
      
      {/* Title */}
      <div>
        <h2 className="font-headline-lg text-lg font-black text-on-surface">Delivery History</h2>
        <p className="text-secondary font-body-sm text-[10px]">Track completed, failed, and canceled jobs.</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex border-b border-gray-200">
        {(['All', 'Delivered', 'Failed'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`pb-2.5 px-4 text-xs font-bold capitalize transition-all border-b-2 -mb-[2px] ${
              filterStatus === status
                ? 'border-primary text-primary'
                : 'border-transparent text-secondary hover:text-on-surface'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-secondary" />
        <input
          type="text"
          placeholder="Search by restaurant, customer address or Order ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white border border-outline-variant/20 rounded-xl pl-10 pr-4 py-2.5 text-xs focus:ring-1 focus:ring-primary focus:outline-none"
        />
      </div>

      {isLoading ? (
        <div className="space-y-3">
          <div className="h-24 bg-gray-100 rounded-2xl animate-pulse" />
          <div className="h-24 bg-gray-100 rounded-2xl animate-pulse" />
        </div>
      ) : filteredOrders.length > 0 ? (
        <div className="space-y-4">
          {filteredOrders.map((ord: any) => {
            const dateStr = new Date(ord.createdAt).toLocaleDateString('en-IN', {
              dateStyle: 'medium',
            });
            const timeStr = new Date(ord.createdAt).toLocaleTimeString('en-IN', {
              hour: 'numeric',
              minute: '2-digit',
              hour12: true,
            });

            // Mock delivery fee payout: ₹40 base + ₹12 distance
            const payout = 52;

            return (
              <div
                key={ord._id}
                className="bg-white p-5 rounded-2xl border border-outline-variant/10 shadow-xs space-y-3"
              >
                <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-on-surface">
                      Order #{ord._id.substring(ord._id.length - 8).toUpperCase()}
                    </span>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                    ord.deliveryStatus === 'Delivered'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {ord.deliveryStatus}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="space-y-1 text-secondary">
                    <p className="flex items-center gap-1.5 text-on-surface font-bold">
                      <Compass className="w-3.5 h-3.5 text-primary" />
                      {ord.restaurantName}
                    </p>
                    <p className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-primary" />
                      {ord.deliveryAddress}
                    </p>
                  </div>

                  <div className="space-y-1 text-secondary sm:text-right">
                    <p className="flex items-center gap-1.5 sm:justify-end">
                      <Calendar className="w-3.5 h-3.5" />
                      {dateStr}
                    </p>
                    <p className="flex items-center gap-1.5 sm:justify-end">
                      <Clock className="w-3.5 h-3.5" />
                      {timeStr}
                    </p>
                  </div>
                </div>

                <div className="flex justify-between items-center border-t border-gray-100 pt-3 text-xs">
                  <span className="text-secondary flex items-center gap-1">
                    <IndianRupee className="w-3.5 h-3.5" />
                    Payout Payout (COD)
                  </span>
                  <span className="font-black text-green-700 text-sm">₹{payout}</span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-white border border-dashed border-gray-200 rounded-3xl">
          <History className="w-8 h-8 text-gray-300 mx-auto" />
          <h4 className="text-xs font-bold text-on-surface mt-2">No matching trips</h4>
          <p className="text-[10px] text-secondary mt-1">Try modifying your search query or filter options.</p>
        </div>
      )}

    </div>
  );
};
