import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';
import {
  Receipt,
  Search,
  Clock,
  Compass,
} from 'lucide-react';

export const AdminOrders: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('All');

  // Fetch Global Orders list
  const { data: ordersData, isLoading } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: async () => {
      const res = await api.get('/admin/orders');
      return res.data.orders || [];
    },
    refetchInterval: 5000, // Auto-refresh order monitoring page every 5 seconds!
  });

  const orders = ordersData || [];

  // Filter & Search
  const filteredOrders = orders.filter((o: any) => {
    const matchesSearch =
      o._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.restaurantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.deliveryAddress.toLowerCase().includes(searchQuery.toLowerCase());

    if (filterStatus === 'All') return matchesSearch;
    return matchesSearch && o.status === filterStatus;
  });

  const orderStatuses = ['All', 'Pending', 'Accepted', 'Preparing', 'Ready for Pickup', 'Out for Delivery', 'Delivered', 'Cancelled'];

  return (
    <div className="px-gutter py-6 max-w-5xl mx-auto space-y-6 text-left">
      
      {/* Title */}
      <div>
        <h2 className="font-headline-lg text-lg font-black text-on-surface">Order Operations</h2>
        <p className="text-secondary font-body-sm text-[10px]">Real-time logistics monitoring control room. Updates automatically.</p>
      </div>

      {/* Status filter tabs */}
      <div className="flex flex-wrap gap-1.5 border-b border-gray-200 pb-2">
        {orderStatuses.map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-3 py-1.5 rounded-xl text-[10px] font-bold border transition-all ${
              filterStatus === status
                ? 'bg-primary text-white border-primary'
                : 'bg-white text-secondary border-outline-variant/20 hover:bg-gray-50'
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
          placeholder="Search by Order ID, restaurant, or customer coordinates..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white border border-outline-variant/20 rounded-xl pl-10 pr-4 py-2.5 text-xs focus:ring-1 focus:ring-primary focus:outline-none"
        />
      </div>

      {/* Active Orders List */}
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

            return (
              <div
                key={ord._id}
                className="bg-white p-5 rounded-2xl border border-outline-variant/10 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-primary/20 transition-all"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="bg-orange-100 text-primary font-bold text-[9px] px-2.5 py-0.5 rounded-md uppercase">
                      {ord.status}
                    </span>
                    <span className="text-[10px] font-bold text-on-surface">
                      Order #{ord._id.substring(ord._id.length - 8).toUpperCase()}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-on-surface">{ord.restaurantName}</h4>
                  
                  <div className="space-y-1 text-[10px] text-secondary">
                    <p className="flex items-center gap-1">
                      <Compass className="w-3.5 h-3.5 text-primary" />
                      {ord.deliveryAddress}
                    </p>
                    <p className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      Placed on {dateStr}
                    </p>
                  </div>
                </div>

                <div className="text-right space-y-2">
                  <p className="text-xs font-black text-on-surface">Grand Total: ₹{ord.grandTotal}</p>
                  <p className="text-[10px] text-secondary">
                    Payment Method: <span className="font-bold text-on-surface">{ord.paymentMethod}</span>
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-white border border-dashed border-gray-200 rounded-3xl">
          <Receipt className="w-8 h-8 text-gray-300 mx-auto" />
          <h4 className="text-xs font-bold text-on-surface mt-2">No matching orders in tracker</h4>
        </div>
      )}

    </div>
  );
};
