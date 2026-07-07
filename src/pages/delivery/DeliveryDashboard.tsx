import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import { useAuthStore } from '../../store/useAuthStore';
import {
  IndianRupee,
  ShoppingBag,
  TrendingUp,
  MapPin,
  Clock,
  Compass,
  Search,
  AlertTriangle,
} from 'lucide-react';

export const DeliveryDashboard: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const { currentUser } = useAuthStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'All' | 'Biryani' | 'Pizza' | 'Burgers'>('All');

  // Fetch Dashboard Stats (Active assignment + completed count + earnings)
  const { data: statsData } = useQuery({
    queryKey: ['delivery-dashboard-stats'],
    queryFn: async () => {
      const res = await api.get('/delivery/dashboard');
      return res.data.stats;
    },
    refetchInterval: 5000, // Poll statistics every 5 seconds!
  });

  // Fetch Available Deliveries Pool
  const { data: poolData, isLoading: poolLoading } = useQuery({
    queryKey: ['delivery-available-pool'],
    queryFn: async () => {
      const res = await api.get('/delivery/available');
      return res.data;
    },
    refetchInterval: 5000, // Poll available orders queue
  });

  // Toggle Online Status Mutation
  const toggleOnlineMutation = useMutation({
    mutationFn: async (isOnline: boolean) => {
      const res = await api.put('/delivery/profile', { isOnline });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['delivery-available-pool'] });
      queryClient.invalidateQueries({ queryKey: ['delivery-dashboard-stats'] });
      // Update global auth store state
      useAuthStore.getState().getMe();
      showToast('Availability status updated', 'success');
    },
  });

  // Accept Order Mutation
  const acceptMutation = useMutation({
    mutationFn: async (orderId: string) => {
      const res = await api.post(`/delivery/orders/${orderId}/accept`);
      return res.data.order;
    },
    onSuccess: () => {
      showToast('Delivery accepted! Proceeding to pickup details...', 'success');
      queryClient.invalidateQueries({ queryKey: ['delivery-dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['delivery-available-pool'] });
      navigate(`/delivery/active`);
    },
    onError: (err: any) => {
      showToast(typeof err === 'string' ? err : 'Could not accept order', 'error');
    },
  });

  const stats = statsData || { completedCount: 0, todayEarnings: 0, activeOrderId: null };
  const poolResponse = poolData || { orders: [], offline: false };
  const isOnline = currentUser?.deliveryProfile?.isOnline || false;

  // Filter & Search orders
  const filteredOrders = (poolResponse.orders || []).filter((ord: any) => {
    const matchesSearch =
      ord._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ord.restaurantName.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filterType === 'All') return matchesSearch;
    return matchesSearch && ord.restaurantName.toLowerCase().includes(filterType.toLowerCase());
  });

  return (
    <div className="px-gutter py-6 max-w-4xl mx-auto space-y-6 text-left">
      
      {/* Title */}
      <div>
        <h2 className="font-headline-lg text-lg font-black text-on-surface">Rider Dashboard</h2>
        <p className="text-secondary font-body-sm text-[10px]">Track logistics, available loads, and cash details.</p>
      </div>

      {/* Online/Offline banner */}
      {!isOnline && (
        <div className="p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-5 h-5 mt-0.5 text-amber-600 shrink-0" />
            <div>
              <h4 className="text-xs font-bold">You are currently Offline</h4>
              <p className="text-[10px] mt-0.5">Toggle online status to start receiving restaurant pickup requests in Khunta.</p>
            </div>
          </div>
          <button
            onClick={() => toggleOnlineMutation.mutate(true)}
            className="px-4 py-2 bg-primary text-white text-[10px] font-bold rounded-xl shadow-md hover:bg-orange-600 shrink-0"
          >
            Go Online
          </button>
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-outline-variant/10 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-green-50 text-green-700 rounded-xl">
            <IndianRupee className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-secondary font-bold uppercase tracking-wider">Today's Earnings</span>
            <h3 className="text-lg font-black text-on-surface mt-1">₹{stats.todayEarnings}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-outline-variant/10 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-700 rounded-xl">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-secondary font-bold uppercase tracking-wider">Trips Completed</span>
            <h3 className="text-lg font-black text-on-surface mt-1">{stats.completedCount}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-outline-variant/10 shadow-xs flex items-center gap-4 cursor-pointer" onClick={() => stats.activeOrderId && navigate('/delivery/active')}>
          <div className="p-3 bg-orange-50 text-primary rounded-xl">
            <TrendingUp className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] text-secondary font-bold uppercase tracking-wider">Active Trip</span>
            <h3 className="text-xs font-bold text-primary mt-1">
              {stats.activeOrderId ? '1 Trip Active (View Details)' : 'No active trips'}
            </h3>
          </div>
        </div>
      </div>

      {/* Available orders section */}
      {isOnline && (
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <h3 className="font-headline-md text-xs uppercase font-black text-gray-500 tracking-wider flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-primary" />
              Available Deliveries ({filteredOrders.length})
            </h3>

            {/* Filter buttons */}
            <div className="flex gap-1.5 flex-wrap">
              {(['All', 'Biryani', 'Pizza', 'Burgers'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-3 py-1.5 rounded-lg text-[9px] font-bold border transition-all ${
                    filterType === type
                      ? 'bg-primary text-white border-primary'
                      : 'bg-white text-secondary border-outline-variant/20 hover:bg-gray-50'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-secondary" />
            <input
              type="text"
              placeholder="Search by restaurant name or Order ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-outline-variant/20 rounded-xl pl-10 pr-4 py-2.5 text-xs focus:ring-1 focus:ring-primary focus:outline-none"
            />
          </div>

          {poolLoading ? (
            <div className="space-y-3">
              <div className="h-24 bg-gray-100 rounded-2xl animate-pulse" />
              <div className="h-24 bg-gray-100 rounded-2xl animate-pulse" />
            </div>
          ) : filteredOrders.length > 0 ? (
            <div className="space-y-4">
              {filteredOrders.map((ord: any) => (
                <div
                  key={ord._id}
                  className="bg-white p-5 rounded-2xl border border-outline-variant/10 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-primary/20 transition-all"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="bg-orange-100 text-primary font-bold text-[9px] px-2 py-0.5 rounded-md uppercase">
                        Ready
                      </span>
                      <span className="text-[10px] font-bold text-on-surface">
                        Order #{ord._id.substring(ord._id.length - 8).toUpperCase()}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-on-surface">{ord.restaurantName}</h4>
                    
                    <div className="flex items-center gap-4 text-[10px] text-secondary">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-primary" />
                        {ord.deliveryAddress}
                      </span>
                      <span className="flex items-center gap-1 shrink-0">
                        <Clock className="w-3.5 h-3.5 text-primary" />
                        Est: 20-30m
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => acceptMutation.mutate(ord._id)}
                    disabled={acceptMutation.isPending}
                    className="w-full sm:w-auto px-5 py-2.5 bg-primary text-white font-black text-xs rounded-xl shadow-md hover:bg-orange-600 disabled:bg-orange-300 transition-colors"
                  >
                    {acceptMutation.isPending ? 'Accepting...' : 'Accept Job'}
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white border border-dashed border-gray-200 rounded-3xl">
              <span className="material-symbols-outlined text-4xl text-gray-300">navigation</span>
              <h4 className="text-xs font-bold text-on-surface mt-2">No jobs in queue</h4>
              <p className="text-[10px] text-secondary mt-1">Ready for Pickup orders will appear here automatically.</p>
            </div>
          )}
        </section>
      )}

    </div>
  );
};
