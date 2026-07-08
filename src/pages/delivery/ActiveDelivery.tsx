import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import {
  Phone,
  UtensilsCrossed,
  User,
  Compass,
  ArrowRight,
  Shield,
  CreditCard,
} from 'lucide-react';
import { MapComponent } from '../../components/MapComponent';

export const ActiveDelivery: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  // Fetch Dashboard Stats to identify the active assignment ID
  const { data: stats } = useQuery({
    queryKey: ['delivery-dashboard-stats'],
    queryFn: async () => {
      const res = await api.get('/delivery/dashboard');
      return res.data.stats;
    },
  });

  const activeOrderId = stats?.activeOrderId;

  // Fetch details of the active order
  const { data: order, isLoading } = useQuery({
    queryKey: ['delivery-active-order', activeOrderId],
    queryFn: async () => {
      if (!activeOrderId) return null;
      const res = await api.get(`/orders/${activeOrderId}`);
      return res.data.order;
    },
    enabled: !!activeOrderId,
  });

  // Update Delivery Workflow Status Mutation
  const updateStatusMutation = useMutation({
    mutationFn: async (status: string) => {
      const res = await api.post(`/delivery/orders/${activeOrderId}/status`, { status });
      return res.data.order;
    },
    onSuccess: (updatedOrder) => {
      showToast(`Status updated successfully!`, 'success');
      queryClient.invalidateQueries({ queryKey: ['delivery-dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['delivery-active-order', activeOrderId] });
      
      // If delivered, redirect back to dashboard
      if (updatedOrder.deliveryStatus === 'Delivered' || updatedOrder.deliveryStatus === 'Failed') {
        navigate('/delivery');
      }
    },
    onError: (err: any) => {
      showToast(typeof err === 'string' ? err : 'Status update failed', 'error');
    },
  });

  const getNextStatusAction = () => {
    if (!order) return null;
    switch (order.deliveryStatus) {
      case 'Accepted':
        return { target: 'Travelling to Restaurant', label: 'Start Travel to Shop' };
      case 'Travelling to Restaurant':
        return { target: 'Reached Restaurant', label: 'Mark Reached Restaurant' };
      case 'Reached Restaurant':
        return { target: 'Picked Up', label: 'Mark Order Picked Up' };
      case 'Picked Up':
        return { target: 'Travelling to Customer', label: 'Start Travel to Customer' };
      case 'Travelling to Customer':
        return { target: 'Delivered', label: 'Mark Order Delivered' };
      default:
        return null;
    }
  };

  const nextAction = getNextStatusAction();

  // Navigation handlers (Open Maps)
  const openMapsRestaurant = () => {
    if (!order) return;
    const query = encodeURIComponent(`${order.restaurantName}, Khunta, Odisha`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

  const openMapsCustomer = () => {
    if (!order) return;
    const query = encodeURIComponent(`${order.deliveryAddress}`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

  if (isLoading) {
    return (
      <div className="px-gutter py-24 text-center space-y-4">
        <span className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin inline-block"></span>
        <p className="text-xs text-secondary font-bold">Retrieving job parameters...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="px-gutter py-16 text-center space-y-4 max-w-sm mx-auto">
        <span className="material-symbols-outlined text-5xl text-gray-300">navigation</span>
        <h2 className="font-headline-lg text-lg text-on-surface font-bold">No Active Assignment</h2>
        <p className="text-secondary text-xs">Accept a job from the Available pool to view pickup details.</p>
        <button
          onClick={() => navigate('/delivery')}
          className="px-6 py-2.5 bg-primary text-white text-xs font-bold rounded-xl"
        >
          View Jobs Pool
        </button>
      </div>
    );
  }

  return (
    <div className="px-gutter py-6 max-w-2xl mx-auto space-y-6 text-left pb-32">
      
      {/* Title */}
      <div className="flex items-center justify-between pb-3 border-b border-outline-variant/10">
        <div>
          <h2 className="font-headline-lg text-lg font-black text-on-surface">Active Delivery</h2>
          <p className="text-secondary font-body-sm text-[10px]">Order ID: #{order._id.substring(order._id.length - 8).toUpperCase()}</p>
        </div>
        <span className="bg-primary/10 text-primary font-bold text-xs px-3 py-1 rounded-xl">
          {order.deliveryStatus}
        </span>
      </div>

      {/* Map Tracker Preview */}
      <MapComponent 
        restaurantName={order.restaurantName}
        customerAddress={order.deliveryAddress}
        riderStatus={order.deliveryStatus || 'Pending'}
      />

      {/* Restaurant Card */}
      <section className="bg-white p-6 rounded-3xl border border-outline-variant/10 shadow-xs space-y-4">
        <h3 className="font-headline-md text-xs uppercase font-black text-gray-500 tracking-wider flex items-center gap-1.5 border-b border-outline-variant/10 pb-3">
          <UtensilsCrossed className="w-4 h-4 text-primary" />
          Step 1: Restaurant Pickup
        </h3>

        <div className="space-y-3">
          <div>
            <h4 className="text-xs font-bold text-on-surface">{order.restaurantName}</h4>
            <p className="text-[10px] text-secondary mt-1">{order.restaurantAddress || 'Khunta Market, Odisha'}</p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={openMapsRestaurant}
              className="flex-grow py-2.5 border border-outline-variant/20 hover:bg-gray-50 text-[10px] font-bold text-secondary rounded-xl flex items-center justify-center gap-1.5"
            >
              <Compass className="w-3.5 h-3.5" />
              Navigate to Shop
            </button>
            <a
              href={`tel:${order.restaurantPhone || '7978253881'}`}
              className="px-4 py-2.5 border border-outline-variant/20 hover:bg-gray-50 text-secondary rounded-xl flex items-center justify-center"
            >
              <Phone className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </section>

      {/* Customer Card */}
      <section className="bg-white p-6 rounded-3xl border border-outline-variant/10 shadow-xs space-y-4">
        <h3 className="font-headline-md text-xs uppercase font-black text-gray-500 tracking-wider flex items-center gap-1.5 border-b border-outline-variant/10 pb-3">
          <User className="w-4 h-4 text-primary" />
          Step 2: Customer Destination
        </h3>

        <div className="space-y-3">
          <div>
            <h4 className="text-xs font-bold text-on-surface">Deliver to Customer</h4>
            <p className="text-xs text-on-surface font-medium mt-1 leading-relaxed">{order.deliveryAddress}</p>
          </div>

          {order.deliveryInstructions && (
            <div className="p-3 bg-blue-50 border border-blue-100 text-blue-800 rounded-xl text-[10px]">
              <strong>Rider Note:</strong> {order.deliveryInstructions}
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={openMapsCustomer}
              className="flex-grow py-2.5 border border-outline-variant/20 hover:bg-gray-50 text-[10px] font-bold text-secondary rounded-xl flex items-center justify-center gap-1.5"
            >
              <Compass className="w-3.5 h-3.5" />
              Navigate to Customer
            </button>
            <a
              href={`tel:${order.customerPhone || '7978253881'}`}
              className="px-4 py-2.5 border border-outline-variant/20 hover:bg-gray-50 text-secondary rounded-xl flex items-center justify-center"
            >
              <Phone className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </section>

      {/* Receipt & COD collections */}
      <section className="bg-white p-6 rounded-3xl border border-outline-variant/10 shadow-xs space-y-4">
        <h3 className="font-headline-md text-xs uppercase font-black text-gray-500 tracking-wider flex items-center gap-1.5 border-b border-outline-variant/10 pb-3">
          <CreditCard className="w-4 h-4 text-primary" />
          Receipt & Billing
        </h3>

        <div className="divide-y divide-outline-variant/10">
          {order.items.map((item: any, idx: number) => (
            <div key={idx} className="py-2.5 flex justify-between items-center text-xs">
              <span className="font-bold text-on-surface">{item.name} x {item.quantity}</span>
              <span className="text-secondary">₹{item.price * item.quantity}</span>
            </div>
          ))}

          <div className="pt-3 space-y-2 text-xs">
            <div className="flex justify-between items-center text-secondary">
              <span>Payment Type:</span>
              <span className="font-bold text-on-surface">{order.paymentMethod}</span>
            </div>

            {order.paymentMethod === 'Cash on Delivery' ? (
              <div className="p-4 bg-orange-50 border border-primary/20 rounded-2xl flex justify-between items-center text-primary font-black">
                <span className="text-[10px] uppercase">Collect cash from customer</span>
                <span className="text-base">₹{order.grandTotal}</span>
              </div>
            ) : (
              <div className="p-4 bg-green-50 border border-green-200 text-green-800 rounded-2xl flex items-center gap-2 text-[10px]">
                <Shield className="w-4 h-4" />
                <span>Rider Alert: Order already Paid Online! Collect ₹0.</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Sticky Bottom transition button */}
      {nextAction && (
        <div className="fixed bottom-16 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-outline-variant/10 md:bottom-0 z-40">
          <button
            onClick={() => updateStatusMutation.mutate(nextAction.target)}
            disabled={updateStatusMutation.isPending}
            className="w-full py-4 bg-primary text-white font-black text-sm rounded-2xl shadow-lg hover:bg-orange-600 transition-colors flex items-center justify-center gap-2"
          >
            {updateStatusMutation.isPending ? (
              'Updating status...'
            ) : (
              <>
                {nextAction.label}
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      )}

    </div>
  );
};
