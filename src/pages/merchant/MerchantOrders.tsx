import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import {
  ShoppingBag,
  Search,
  Calendar,
  Clock,
  MapPin,
  Phone,
  CreditCard,
  CheckCircle2,
  Play,
} from 'lucide-react';

interface OrderItem {
  foodItemId: string;
  name: string;
  price: number;
  quantity: number;
}

interface Order {
  _id: string;
  userId: {
    _id: string;
    name: string;
    phone: string;
  };
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  grandTotal: number;
  status: 'Pending' | 'Accepted' | 'Preparing' | 'Ready for Pickup' | 'Delivered' | 'Cancelled';
  deliveryAddress: string;
  paymentMethod: string;
  createdAt: string;
}

export const MerchantOrders: React.FC = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState('');

  // Fetch Orders
  const { data: ordersData, isLoading } = useQuery<Order[]>({
    queryKey: ['merchant-orders', activeTab, selectedDate],
    queryFn: async () => {
      let url = '/merchant/orders';
      const params: any = {};
      if (activeTab && activeTab !== 'all') {
        params.status = activeTab;
      }
      if (selectedDate) {
        params.date = selectedDate;
      }
      const res = await api.get(url, { params });
      return res.data.orders;
    },
  });

  // Update Status Mutation
  const statusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
      const res = await api.put(`/merchant/orders/${orderId}`, { status });
      return res.data;
    },
    onSuccess: (res) => {
      showToast(res.message, 'success');
      queryClient.invalidateQueries({ queryKey: ['merchant-orders'] });
      queryClient.invalidateQueries({ queryKey: ['merchant-orders-pending'] });
      queryClient.invalidateQueries({ queryKey: ['merchant-analytics'] });
    },
    onError: (err: any) => {
      showToast(typeof err === 'string' ? err : 'Action failed', 'error');
    },
  });

  const orders = ordersData || [];

  // Filter orders locally by customer name or order ID
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchSearch =
        order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.userId?.phone?.includes(searchTerm);
      return matchSearch;
    });
  }, [orders, searchTerm]);

  const tabs = [
    { label: 'All Orders', value: 'all' },
    { label: 'Incoming', value: 'Pending' },
    { label: 'Accepted', value: 'Accepted' },
    { label: 'Preparing', value: 'Preparing' },
    { label: 'Ready', value: 'Ready for Pickup' },
    { label: 'Delivered', value: 'Delivered' },
    { label: 'Cancelled', value: 'Cancelled' },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse';
      case 'Accepted':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Preparing':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Ready for Pickup':
        return 'bg-cyan-50 text-cyan-700 border-cyan-200';
      case 'Delivered':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Cancelled':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="space-y-8 text-left">
      <div>
        <h2 className="font-headline-lg text-xl md:text-2xl text-on-surface font-black">Order Manager</h2>
        <p className="text-secondary font-body-sm text-xs mt-1">Receive orders, update delivery states, and track fulfillment history.</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-outline-variant/10 overflow-x-auto gap-2.5 pb-0.5">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`px-4 py-2.5 font-bold text-xs border-b-2 whitespace-nowrap transition-all ${
              activeTab === tab.value
                ? 'border-primary text-primary'
                : 'border-transparent text-secondary hover:text-on-surface'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by customer name, phone, or order ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-outline-variant/30 rounded-xl pl-10 pr-4 py-2 text-xs focus:ring-1 focus:ring-primary focus:outline-none shadow-xs"
          />
        </div>

        {/* Date Filter */}
        <div className="relative flex items-center gap-2">
          <Calendar className="w-4 h-4 text-secondary" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-white border border-outline-variant/30 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-primary focus:outline-none shadow-xs text-secondary"
          />
          {selectedDate && (
            <button
              onClick={() => setSelectedDate('')}
              className="text-[10px] text-primary font-bold hover:underline"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Orders Stream List */}
      {isLoading ? (
        <div className="space-y-4 animate-pulse">
          <div className="h-32 bg-gray-200 rounded-3xl" />
          <div className="h-32 bg-gray-200 rounded-3xl" />
        </div>
      ) : filteredOrders.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredOrders.map((order) => (
            <div
              key={order._id}
              className="bg-white rounded-3xl border border-outline-variant/10 shadow-xs p-6 flex flex-col justify-between gap-4"
            >
              {/* Header Info */}
              <div className="space-y-3">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <h3 className="text-xs font-black text-on-surface">
                      ORDER: #{order._id.slice(-6).toUpperCase()}
                    </h3>
                    <div className="flex items-center gap-1.5 text-secondary text-[10px] mt-1 font-semibold">
                      <Clock className="w-3 h-3" />
                      {new Date(order.createdAt).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase border ${getStatusBadge(
                      order.status
                    )}`}
                  >
                    {order.status}
                  </span>
                </div>

                {/* Customer Details */}
                <div className="bg-surface-container-low/40 p-3 rounded-2xl space-y-1.5">
                  <div className="flex items-center gap-2 text-xs text-on-surface font-bold">
                    <span className="w-2.5 h-2.5 bg-primary/10 text-primary flex items-center justify-center rounded-full text-[9px] uppercase font-bold p-2.5">
                      {order.userId?.name?.[0] || 'C'}
                    </span>
                    {order.userId?.name || 'Walk-in Customer'}
                  </div>

                  <div className="flex items-center gap-2 text-xs text-secondary font-semibold">
                    <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                    {order.userId?.phone || 'No phone number'}
                  </div>

                  <div className="flex items-start gap-2 text-xs text-secondary font-semibold">
                    <MapPin className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                    <span className="truncate max-w-[280px]" title={order.deliveryAddress}>
                      {order.deliveryAddress}
                    </span>
                  </div>
                </div>

                {/* Ordered Items list */}
                <div className="space-y-1.5 pt-1">
                  <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                    Items List
                  </h4>
                  <div className="space-y-1">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-secondary">
                          {item.name} <strong className="text-on-surface font-bold">x{item.quantity}</strong>
                        </span>
                        <span className="font-bold text-on-surface">₹{item.price * item.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer pricing and trigger buttons */}
              <div className="pt-4 border-t border-outline-variant/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-1 text-[10px] text-secondary font-bold">
                    <CreditCard className="w-3.5 h-3.5" />
                    {order.paymentMethod}
                  </div>
                  <h4 className="text-sm font-black text-on-surface mt-1">₹{order.grandTotal}</h4>
                </div>

                {/* State transition triggers */}
                <div className="flex gap-2 self-end sm:self-center">
                  {order.status === 'Pending' && (
                    <>
                      <button
                        onClick={() =>
                          statusMutation.mutate({ orderId: order._id, status: 'Cancelled' })
                        }
                        className="px-3 py-2 border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold rounded-xl"
                      >
                        Decline
                      </button>
                      <button
                        onClick={() =>
                          statusMutation.mutate({ orderId: order._id, status: 'Accepted' })
                        }
                        className="px-4 py-2 bg-primary text-white hover:bg-orange-600 text-xs font-bold rounded-xl shadow-xs"
                      >
                        Accept
                      </button>
                    </>
                  )}

                  {order.status === 'Accepted' && (
                    <button
                      onClick={() =>
                        statusMutation.mutate({ orderId: order._id, status: 'Preparing' })
                      }
                      className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 text-xs font-bold rounded-xl shadow-xs"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      Start Preparing
                    </button>
                  )}

                  {order.status === 'Preparing' && (
                    <button
                      onClick={() =>
                        statusMutation.mutate({ orderId: order._id, status: 'Ready for Pickup' })
                      }
                      className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 text-white hover:bg-purple-700 text-xs font-bold rounded-xl shadow-xs"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Mark Ready
                    </button>
                  )}

                  {order.status === 'Ready for Pickup' && (
                    <button
                      onClick={() =>
                        statusMutation.mutate({ orderId: order._id, status: 'Delivered' })
                      }
                      className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-bold rounded-xl shadow-xs"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Complete Order
                    </button>
                  )}

                  {order.status === 'Delivered' && (
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
                      Fulfillment Complete
                    </span>
                  )}

                  {order.status === 'Cancelled' && (
                    <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-1 rounded-lg">
                      Order Declined
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-secondary bg-white rounded-3xl border border-outline-variant/10 shadow-xs flex flex-col items-center">
          <ShoppingBag className="w-12 h-12 text-gray-300 mb-2" />
          <p className="text-xs font-bold">No orders found matching search criteria</p>
          <p className="text-[10px] text-gray-400">Order queues will load automatically as customer requests trigger.</p>
        </div>
      )}
    </div>
  );
};
