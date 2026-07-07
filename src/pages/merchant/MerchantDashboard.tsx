import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import {
  ShoppingBag,
  IndianRupee,
  Star,
  Users,
  ChevronRight,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface AnalyticsData {
  todayOrders: number;
  todayRevenue: number;
  weeklyRevenue: number;
  monthlyRevenue: number;
  totalCustomers: number;
  averageRating: number;
  bestSellers: Array<{ name: string; qty: number; revenue: number }>;
}

export const MerchantDashboard: React.FC = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  // Fetch Analytics
  const { data: analytics, isLoading: analyticsLoading } = useQuery<AnalyticsData>({
    queryKey: ['merchant-analytics'],
    queryFn: async () => {
      const res = await api.get('/merchant/analytics');
      return res.data.analytics;
    },
  });

  // Fetch Incoming/Pending Orders
  const { data: ordersData, isLoading: ordersLoading } = useQuery({
    queryKey: ['merchant-orders-pending'],
    queryFn: async () => {
      const res = await api.get('/merchant/orders?status=Pending');
      return res.data.orders;
    },
  });

  // Fetch Restaurant Profile to check shop name & status
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['merchant-profile'],
    queryFn: async () => {
      const res = await api.get('/merchant/profile');
      return res.data.restaurant;
    },
  });

  // Update Status mutation
  const statusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
      const res = await api.put(`/merchant/orders/${orderId}`, { status });
      return res.data;
    },
    onSuccess: (data) => {
      showToast(data.message, 'success');
      queryClient.invalidateQueries({ queryKey: ['merchant-orders-pending'] });
      queryClient.invalidateQueries({ queryKey: ['merchant-analytics'] });
    },
    onError: (err: any) => {
      showToast(typeof err === 'string' ? err : 'Action failed', 'error');
    },
  });

  const isLoading = analyticsLoading || ordersLoading || profileLoading;

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        {/* Welcome Block Skeleton */}
        <div className="h-28 bg-gray-200 rounded-3xl" />
        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="h-24 bg-gray-200 rounded-2xl" />
          <div className="h-24 bg-gray-200 rounded-2xl" />
          <div className="h-24 bg-gray-200 rounded-2xl" />
          <div className="h-24 bg-gray-200 rounded-2xl" />
        </div>
        {/* Lists Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-[300px] bg-gray-200 rounded-2xl lg:col-span-2" />
          <div className="h-[300px] bg-gray-200 rounded-2xl" />
        </div>
      </div>
    );
  }

  const pendingOrders = ordersData || [];
  const statCards = [
    {
      title: "Today's Orders",
      value: analytics?.todayOrders ?? 0,
      icon: ShoppingBag,
      color: 'bg-blue-50 text-blue-600',
    },
    {
      title: "Today's Revenue",
      value: `₹${analytics?.todayRevenue ?? 0}`,
      icon: IndianRupee,
      color: 'bg-emerald-50 text-emerald-600',
    },
    {
      title: 'Average Rating',
      value: analytics?.averageRating ?? '4.0',
      icon: Star,
      color: 'bg-amber-50 text-amber-500',
    },
    {
      title: 'Total Customers',
      value: analytics?.totalCustomers ?? 0,
      icon: Users,
      color: 'bg-purple-50 text-purple-600',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome banner */}
      <div className="p-6 md:p-8 bg-white border border-outline-variant/10 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div>
          <h1 className="font-headline-lg text-xl md:text-2xl text-on-surface font-black tracking-tight">
            Namaskar, {profile?.name || 'Partner'}!
          </h1>
          <p className="text-secondary font-body-sm text-xs mt-1">
            Here's what's happening at your restaurant in Khunta today.
          </p>
        </div>

        {/* Live status badge */}
        <div className="flex items-center gap-2.5">
          <span className="text-xs text-secondary font-bold">Store Status:</span>
          <span
            className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 border ${
              profile?.status === 'Open'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-red-50 text-red-700 border-red-200'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                profile?.status === 'Open' ? 'bg-emerald-600 animate-pulse' : 'bg-red-500'
              }`}
            />
            {profile?.status || 'Closed'}
          </span>
        </div>
      </div>

      {/* Analytics counter cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="bg-white p-5 rounded-2xl border border-outline-variant/10 shadow-xs flex items-center justify-between"
            >
              <div className="space-y-1">
                <p className="text-secondary font-body-sm text-[10px] uppercase font-bold tracking-wider">
                  {card.title}
                </p>
                <h3 className="font-headline-lg text-lg md:text-xl text-on-surface font-black">
                  {card.value}
                </h3>
              </div>
              <div className={`p-3 rounded-xl ${card.color}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Grid: Pending orders & Bestsellers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Orders Stream */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-outline-variant/10 shadow-xs p-6 space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-outline-variant/10">
            <h3 className="font-headline-md text-sm text-on-surface font-black flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-primary rounded-full animate-ping" />
              New Incoming Orders ({pendingOrders.length})
            </h3>
            <Link
              to="/merchant/orders"
              className="text-xs text-primary font-bold hover:underline flex items-center gap-0.5"
            >
              Order Manager <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {pendingOrders.length > 0 ? (
            <div className="divide-y divide-outline-variant/10">
              {pendingOrders.map((order: any) => (
                <div key={order._id} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1.5 text-left">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xs font-black text-on-surface">
                        ID: {order._id.slice(-6).toUpperCase()}
                      </span>
                      <span className="text-[10px] font-bold text-gray-400">
                        {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-secondary">
                      Customer: {order.userId?.name || 'Guest'} ({order.userId?.phone || order.deliveryAddress.split(',')[0]})
                    </p>
                    <p className="text-xs text-on-surface font-bold">
                      {order.items.map((it: any) => `${it.name} x${it.quantity}`).join(', ')}
                    </p>
                    <p className="text-[10px] text-primary font-bold">
                      Total: ₹{order.grandTotal} | {order.paymentMethod}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      onClick={() =>
                        statusMutation.mutate({ orderId: order._id, status: 'Cancelled' })
                      }
                      className="px-3 py-1.5 border border-red-200 text-red-600 hover:bg-red-50 text-[10px] font-bold rounded-xl"
                    >
                      Decline
                    </button>
                    <button
                      onClick={() =>
                        statusMutation.mutate({ orderId: order._id, status: 'Accepted' })
                      }
                      className="px-4 py-1.5 bg-primary text-white hover:bg-orange-600 text-[10px] font-bold rounded-xl shadow-xs"
                    >
                      Accept Order
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-secondary flex flex-col items-center">
              <span className="material-symbols-outlined text-4xl text-gray-300 mb-2">inbox</span>
              <p className="text-xs font-bold">No pending incoming orders</p>
              <p className="text-[10px] text-gray-400">Any customer requests will show up here in real time.</p>
            </div>
          )}
        </div>

        {/* Bestsellers Side panel */}
        <div className="bg-white rounded-2xl border border-outline-variant/10 shadow-xs p-6 space-y-4 text-left">
          <h3 className="font-headline-md text-sm text-on-surface font-black flex items-center gap-1.5">
            <TrendingUp className="w-4.5 h-4.5 text-emerald-600" />
            Top Selling Dishes
          </h3>

          {analytics?.bestSellers && analytics.bestSellers.length > 0 ? (
            <div className="space-y-4 pt-2">
              {analytics.bestSellers.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-on-surface truncate">{item.name}</h4>
                    <p className="text-[10px] text-secondary mt-0.5">{item.qty} units sold</p>
                  </div>
                  <span className="text-xs font-bold text-emerald-700">₹{item.revenue}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-secondary">
              <AlertCircle className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-xs font-bold">No sales records yet</p>
              <p className="text-[10px] text-gray-400">Add food items and accept orders to populate analytics.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
