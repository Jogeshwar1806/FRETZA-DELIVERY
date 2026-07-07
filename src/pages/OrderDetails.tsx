import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import { useCartStore } from '../store/useCartStore';
import { MapComponent } from '../components/MapComponent';
import {
  Clock,
  MapPin,
  UtensilsCrossed,
  Receipt,
  RotateCcw,
  XCircle,
  Calendar,
} from 'lucide-react';

const STATUS_STEPS = [
  { status: 'Pending', label: 'Order Placed', desc: 'Waiting for restaurant acceptance' },
  { status: 'Accepted', label: 'Accepted', desc: 'Restaurant confirmed your order' },
  { status: 'Preparing', label: 'Kitchen preparing', desc: 'Chef is preparing your delicacies' },
  { status: 'Ready for Pickup', label: 'Ready for Pickup', desc: 'Food is packed and ready' },
  { status: 'Out for Delivery', label: 'Out for Delivery', desc: 'Delivery partner is on the way' },
  { status: 'Delivered', label: 'Delivered', desc: 'Enjoy your hot meal!' },
];

export const OrderDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const { addToCart } = useCartStore();

  // Fetch Order details
  const { data: order, isLoading, error } = useQuery({
    queryKey: ['order', id],
    queryFn: async () => {
      const res = await api.get(`/orders/${id}`);
      return res.data.order;
    },
    refetchInterval: 5000, // Poll every 5 seconds for status changes! Elegant UX.
  });

  // Cancel Order Mutation
  const cancelMutation = useMutation({
    mutationFn: async () => {
      const res = await api.put(`/orders/${id}/cancel`);
      return res.data.order;
    },
    onSuccess: () => {
      showToast('Order cancelled successfully', 'success');
      queryClient.invalidateQueries({ queryKey: ['order', id] });
    },
    onError: (err: any) => {
      showToast(typeof err === 'string' ? err : 'Cancellation failed', 'error');
    },
  });

  // Reorder helper
  const handleReorder = async () => {
    if (!order) return;
    try {
      showToast('Reordering items into your cart...', 'info');
      // Add each item back to the cart
      for (const item of order.items) {
        // Fetch food item to check availability
        try {
          const res = await api.get(`/restaurants/items/${item.foodItemId}`);
          const food = res.data.item;
          if (food && food.availability) {
            await addToCart(
              {
                id: food._id,
                name: food.name,
                description: food.description,
                price: food.price,
                discountPrice: food.discountPrice,
                image: food.image,
                isVeg: food.isVeg,
                category: food.category,
              },
              order.restaurantId,
              order.restaurantName
            );
          } else {
            showToast(`${item.name} is currently unavailable`, 'warning');
          }
        } catch (e) {
          showToast(`${item.name} could not be loaded`, 'error');
        }
      }
      navigate('/cart');
    } catch (err) {
      showToast('Failed to complete reorder', 'error');
    }
  };

  if (isLoading) {
    return (
      <div className="px-gutter py-24 text-center space-y-4">
        <span className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin inline-block" />
        <p className="text-xs text-secondary font-bold">Locating order details...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="px-gutter py-24 text-center space-y-4">
        <span className="material-symbols-outlined text-5xl text-red-500">error</span>
        <h2 className="font-headline-lg text-lg text-on-surface font-bold">Order Not Found</h2>
        <p className="text-secondary text-xs">This order could not be located in your history.</p>
        <button
          onClick={() => navigate('/profile')}
          className="px-6 py-2.5 bg-primary text-white text-xs font-bold rounded-xl"
        >
          View Order History
        </button>
      </div>
    );
  }

  // Determine current status stage index
  const isTerminal = order.status === 'Cancelled' || order.status === 'Rejected';
  const currentStepIndex = STATUS_STEPS.findIndex((s) => s.status === order.status);

  return (
    <div className="px-gutter py-6 max-w-2xl mx-auto space-y-8 text-left">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/profile')}
            className="w-10 h-10 rounded-full border border-outline-variant/30 flex items-center justify-center text-primary hover:bg-gray-50 active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          </button>
          <div>
            <h2 className="font-headline-lg text-lg font-black text-on-surface">Order ID: #{order._id.substring(order._id.length - 8).toUpperCase()}</h2>
            <p className="text-secondary font-body-sm text-[10px] flex items-center gap-1 mt-0.5">
              <Calendar className="w-3.5 h-3.5" />
              {new Date(order.createdAt).toLocaleString('en-IN', {
                dateStyle: 'medium',
                timeStyle: 'short',
              })}
            </p>
          </div>
        </div>

        {order.status === 'Pending' && (
          <button
            onClick={() => cancelMutation.mutate()}
            disabled={cancelMutation.isPending}
            className="px-4 py-2 border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold rounded-xl"
          >
            {cancelMutation.isPending ? 'Cancelling...' : 'Cancel Order'}
          </button>
        )}
      </div>

      {/* Terminal banner for cancelled/rejected status */}
      {isTerminal && (
        <div className={`p-4 rounded-2xl border flex items-center gap-3 ${
          order.status === 'Cancelled' ? 'bg-red-50 border-red-200 text-red-800' : 'bg-gray-50 border-gray-200 text-secondary'
        }`}>
          <XCircle className="w-5 h-5" />
          <div>
            <h4 className="text-xs font-bold">Order {order.status}</h4>
            <p className="text-[10px] mt-0.5">
              {order.status === 'Cancelled'
                ? 'You cancelled this order. Any payment processing has been voided.'
                : 'This order was declined by the restaurant.'}
            </p>
          </div>
        </div>
      )}

      {/* Interactive Map Component */}
      {!isTerminal && (
        <MapComponent 
          restaurantName={order.restaurantName}
          customerAddress={order.deliveryAddress}
          riderStatus={order.deliveryStatus || 'Pending'}
        />
      )}

      {/* Visual Timeline (if not cancelled/rejected) */}
      {!isTerminal && (
        <section className="bg-white p-6 rounded-3xl border border-outline-variant/10 shadow-xs space-y-6">
          <h3 className="font-headline-md text-xs uppercase font-black text-gray-500 tracking-wider flex items-center gap-1.5 border-b border-outline-variant/10 pb-3">
            <Clock className="w-4 h-4 text-primary" />
            Order Tracker Timeline
          </h3>

          <div className="relative pl-6 space-y-6 border-l-2 border-outline-variant/20 ml-3">
            {STATUS_STEPS.map((step, idx) => {
              const isCompleted = idx <= currentStepIndex;
              const isCurrent = idx === currentStepIndex;
              
              // Try finding timestamp in status history
              const hist = order.statusHistory?.find((h: any) => h.status === step.status);
              const formattedTime = hist
                ? new Date(hist.timestamp).toLocaleTimeString('en-IN', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true,
                  })
                : null;

              return (
                <div key={step.status} className="relative">
                  {/* Point Indicator */}
                  <div className={`absolute -left-[31px] top-0 w-4 h-4 rounded-full border-2 transition-all ${
                    isCurrent
                      ? 'bg-primary border-primary scale-125 animate-pulse'
                      : isCompleted
                      ? 'bg-primary border-primary'
                      : 'bg-white border-outline-variant/30'
                  }`}>
                    {isCompleted && !isCurrent && (
                      <span className="absolute inset-0 flex items-center justify-center text-[8px] text-white">✓</span>
                    )}
                  </div>

                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className={`text-xs font-bold ${isCurrent ? 'text-primary' : isCompleted ? 'text-on-surface' : 'text-gray-400'}`}>
                        {step.label}
                      </h4>
                      <p className="text-[10px] text-secondary mt-0.5">{step.desc}</p>
                    </div>
                    {formattedTime && (
                      <span className="text-[10px] text-secondary font-medium bg-gray-50 px-2 py-0.5 rounded-lg border border-outline-variant/10">
                        {formattedTime}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Restaurant and Delivery info details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <section className="bg-white p-6 rounded-3xl border border-outline-variant/10 shadow-xs space-y-4">
          <h3 className="font-headline-md text-xs uppercase font-black text-gray-500 tracking-wider flex items-center gap-1.5 border-b border-outline-variant/10 pb-3">
            <UtensilsCrossed className="w-4 h-4 text-primary" />
            Kitchen Details
          </h3>
          <div>
            <h4 className="text-xs font-bold text-on-surface">{order.restaurantName}</h4>
            <p className="text-[10px] text-secondary mt-1">Payment via: {order.paymentMethod} ({order.paymentStatus})</p>
          </div>
        </section>

        <section className="bg-white p-6 rounded-3xl border border-outline-variant/10 shadow-xs space-y-4">
          <h3 className="font-headline-md text-xs uppercase font-black text-gray-500 tracking-wider flex items-center gap-1.5 border-b border-outline-variant/10 pb-3">
            <MapPin className="w-4 h-4 text-primary" />
            Delivery Destination
          </h3>
          <p className="text-xs text-on-surface font-medium leading-relaxed">{order.deliveryAddress}</p>
          
          {(order.deliveryInstructions || order.orderNotes) && (
            <div className="pt-2 border-t border-outline-variant/10 space-y-1">
              {order.deliveryInstructions && (
                <p className="text-[10px] text-secondary"><strong className="text-gray-500">Rider Note:</strong> {order.deliveryInstructions}</p>
              )}
              {order.orderNotes && (
                <p className="text-[10px] text-secondary"><strong className="text-gray-500">Kitchen Request:</strong> {order.orderNotes}</p>
              )}
            </div>
          )}
        </section>
      </div>

      {/* Items & Billing Details */}
      <section className="bg-white p-6 rounded-3xl border border-outline-variant/10 shadow-xs space-y-4">
        <h3 className="font-headline-md text-xs uppercase font-black text-gray-500 tracking-wider flex items-center gap-1.5 border-b border-outline-variant/10 pb-3">
          <Receipt className="w-4 h-4 text-primary" />
          Receipt & Bill
        </h3>

        <div className="divide-y divide-outline-variant/10">
          {order.items.map((item: any) => (
            <div key={item.foodItemId} className="py-3 flex justify-between items-center text-xs">
              <div>
                <span className="font-bold text-on-surface">{item.name}</span>
                <span className="text-secondary text-[10px] ml-2">x {item.quantity}</span>
              </div>
              <span className="font-bold text-on-surface">₹{item.price * item.quantity}</span>
            </div>
          ))}

          <div className="pt-4 space-y-2">
            <div className="flex justify-between items-center text-xs text-secondary">
              <span>Subtotal</span>
              <span className="font-medium text-on-surface">₹{order.subtotal}</span>
            </div>

            {order.packagingFee > 0 && (
              <div className="flex justify-between items-center text-xs text-secondary">
                <span>Restaurant Packaging Charge</span>
                <span className="font-medium text-on-surface">₹{order.packagingFee}</span>
              </div>
            )}

            {order.taxes > 0 && (
              <div className="flex justify-between items-center text-xs text-secondary">
                <span>Taxes & GST (5%)</span>
                <span className="font-medium text-on-surface">₹{order.taxes}</span>
              </div>
            )}

            <div className="flex justify-between items-center text-xs text-secondary">
              <span>Delivery Fee</span>
              <span className="font-medium text-on-surface">
                {order.deliveryFee === 0 ? <strong className="text-green-600 font-bold">FREE</strong> : `₹${order.deliveryFee}`}
              </span>
            </div>

            {order.discount > 0 && (
              <div className="flex justify-between items-center text-xs text-green-600 font-bold bg-green-50 px-3 py-2 rounded-xl">
                <span>Coupon ({order.couponCode}) Discount</span>
                <span>-₹{order.discount}</span>
              </div>
            )}

            <div className="border-t border-outline-variant/10 pt-3 flex justify-between items-center">
              <span className="text-xs font-black text-on-surface">Total Bill</span>
              <span className="text-base font-black text-primary">₹{order.grandTotal}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Action Footer */}
      {(order.status === 'Delivered' || isTerminal) && (
        <button
          onClick={handleReorder}
          className="w-full py-4 bg-primary text-white font-black text-sm rounded-2xl shadow-lg hover:bg-orange-600 flex items-center justify-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          Reorder delicacies
        </button>
      )}
    </div>
  );
};
