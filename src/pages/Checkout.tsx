import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { useCartStore } from '../store/useCartStore';
import { useAuthStore } from '../store/useAuthStore';
import { useToast } from '../contexts/ToastContext';
import { api } from '../services/api';
import {
  MapPin,
  Notebook,
  Compass,
  Check,
  Plus,
  Ticket,
  ChevronRight,
  Info,
  CreditCard,
  X,
} from 'lucide-react';

interface AddressFields {
  label: 'Home' | 'Work' | 'Other';
  houseNumber: string;
  street: string;
  village: string;
  landmark: string;
  pincode: string;
  district: string;
  state: string;
}

export const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  
  const { cartItems, pricing, couponCode, applyCoupon, removeCoupon } = useCartStore();
  const { placeOrder } = useAuthStore();

  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [deliveryInstructions, setDeliveryInstructions] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [couponOpen, setCouponOpen] = useState(false);
  const [couponText, setCouponText] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'Cash on Delivery' | 'Razorpay Online'>('Cash on Delivery');
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [placedOrderId, setPlacedOrderId] = useState<string>('');
  const [paymentProcessing, setPaymentProcessing] = useState(false);

  // Fetch Addresses
  const { data: addressesData, isLoading: addressesLoading } = useQuery({
    queryKey: ['addresses'],
    queryFn: async () => {
      const res = await api.get('/addresses');
      const list = res.data.addresses || [];
      // Auto select default address
      const def = list.find((a: any) => a.isDefault) || list[0];
      if (def) setSelectedAddressId(def._id);
      return list;
    },
  });

  // Fetch Available Coupons
  const { data: couponsData } = useQuery({
    queryKey: ['coupons'],
    queryFn: async () => {
      const res = await api.get('/coupons');
      return res.data.coupons;
    },
  });

  const addresses = addressesData || [];
  const coupons = couponsData || [];

  // Address creation form
  const {
    register: addressRegister,
    handleSubmit: handleAddressSubmit,
    reset: resetAddressForm,
    formState: { isSubmitting: addressSubmitting },
  } = useForm<AddressFields>({
    defaultValues: {
      label: 'Home',
      state: 'Odisha',
      district: 'Mayurbhanj',
    },
  });

  // Add Address Mutation
  const addAddressMutation = useMutation({
    mutationFn: async (data: AddressFields) => {
      const res = await api.post('/addresses', data);
      return res.data;
    },
    onSuccess: (data) => {
      showToast('New address saved successfully!', 'success');
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      setAddressModalOpen(false);
      resetAddressForm();
      const newest = data.addresses[data.addresses.length - 1];
      if (newest) setSelectedAddressId(newest._id);
    },
    onError: (err: any) => {
      showToast(typeof err === 'string' ? err : 'Could not add address', 'error');
    },
  });

  // Place Order Mutation
  const checkoutMutation = useMutation({
    mutationFn: async () => {
      const selected = addresses.find((a: any) => a._id === selectedAddressId);
      if (!selected) {
        throw new Error('Please configure a valid delivery address');
      }

      return await placeOrder({
        deliveryAddress: selected.details,
        paymentMethod: paymentMethod,
        deliveryInstructions,
        orderNotes,
      });
    },
    onSuccess: (order) => {
      queryClient.invalidateQueries({ queryKey: ['merchant-orders-pending'] });
      if (paymentMethod === 'Razorpay Online') {
        setPlacedOrderId(order._id);
        setPaymentModalOpen(true);
      } else {
        showToast('FRETZA Order created successfully!', 'success');
        navigate(`/order/${order._id}`);
      }
    },
    onError: (err: any) => {
      showToast(typeof err === 'string' ? err : 'Order placement failed', 'error');
    },
  });

  const handleApplyCoupon = async (code: string) => {
    const success = await applyCoupon(code);
    if (success) {
      setCouponOpen(false);
    }
  };

  const handleCancelPayment = () => {
    showToast('Payment was cancelled. Order remains pending.', 'warning');
    setPaymentModalOpen(false);
    navigate(`/order/${placedOrderId}`);
  };

  const onAddAddressSubmit = (data: AddressFields) => {
    addAddressMutation.mutate(data);
  };

  if (cartItems.length === 0 && !checkoutMutation.isSuccess) {
    return (
      <div className="px-gutter py-16 text-center space-y-4">
        <span className="material-symbols-outlined text-5xl text-gray-300">shopping_cart</span>
        <h2 className="font-headline-lg text-lg text-on-surface font-bold">Your Cart is Empty</h2>
        <p className="text-secondary text-xs">Add delicacies from your local restaurants to place orders.</p>
        <button
          onClick={() => navigate('/home')}
          className="px-6 py-2.5 bg-primary text-white text-xs font-bold rounded-xl"
        >
          Browse Restaurants
        </button>
      </div>
    );
  }


  return (
    <div className="px-gutter py-6 max-w-2xl mx-auto space-y-8 text-left">
      {/* Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full border border-outline-variant/30 flex items-center justify-center text-primary hover:bg-gray-50 active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
        </button>
        <div>
          <h2 className="font-headline-lg text-xl font-black text-on-surface">Secure Checkout</h2>
          <p className="text-secondary font-body-sm text-[10px]">Verify timings, addresses, and fees before billing.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        
        {/* Address Selection Section */}
        <section className="bg-white p-6 rounded-3xl border border-outline-variant/10 shadow-xs space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-outline-variant/10">
            <h3 className="font-headline-md text-xs uppercase font-black text-gray-500 tracking-wider flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-primary" />
              Delivery Address
            </h3>
            <button
              onClick={() => setAddressModalOpen(true)}
              className="text-xs text-primary font-bold hover:underline flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              Add New
            </button>
          </div>

          {addressesLoading ? (
            <div className="h-16 bg-gray-100 rounded-2xl animate-pulse" />
          ) : addresses.length > 0 ? (
            <div className="space-y-3">
              {addresses.map((addr: any) => (
                <div
                  key={addr._id}
                  onClick={() => setSelectedAddressId(addr._id)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                    selectedAddressId === addr._id
                      ? 'border-primary bg-orange-50/15'
                      : 'border-outline-variant/20 bg-white hover:bg-gray-50/30'
                  }`}
                >
                  <div className={`p-2 rounded-lg ${selectedAddressId === addr._id ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-secondary'}`}>
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div className="flex-grow min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-on-surface">{addr.label}</span>
                      {addr.isDefault && (
                        <span className="bg-gray-100 text-[8px] font-black uppercase text-secondary px-1.5 py-0.5 rounded-md">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-secondary mt-1 line-clamp-2">{addr.details}</p>
                  </div>
                  {selectedAddressId === addr._id && (
                    <div className="p-1 bg-primary text-white rounded-full">
                      <Check className="w-3 h-3" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 border border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
              <p className="text-xs text-secondary font-bold">No delivery addresses configured</p>
              <button
                onClick={() => setAddressModalOpen(true)}
                className="mt-2 text-xs text-primary font-bold hover:underline"
              >
                Create Address profile
              </button>
            </div>
          )}
        </section>

        {/* Coupons Trigger bar */}
        <section className="bg-white p-5 rounded-2xl border border-outline-variant/10 shadow-xs flex items-center justify-between cursor-pointer" onClick={() => setCouponOpen(true)}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 text-primary rounded-xl">
              <Ticket className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-on-surface">
                {couponCode ? `Coupon Applied: ${couponCode}` : 'Apply Coupon Code'}
              </h4>
              <p className="text-[10px] text-secondary mt-0.5">
                {couponCode ? 'Click to change coupon' : 'Save up to ₹150 on your dinner order'}
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-secondary" />
        </section>

        {/* Delivery instructions / notes */}
        <section className="bg-white p-6 rounded-3xl border border-outline-variant/10 shadow-xs space-y-4">
          <h3 className="font-headline-md text-xs uppercase font-black text-gray-500 tracking-wider flex items-center gap-1.5">
            <Notebook className="w-4 h-4 text-primary" />
            Add Details
          </h3>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-gray-500 uppercase">Delivery Instructions (Rider Notes)</label>
              <input
                type="text"
                placeholder="e.g. Leave with guard, Call after arrival"
                value={deliveryInstructions}
                onChange={(e) => setDeliveryInstructions(e.target.value)}
                className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-primary focus:outline-none"
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-gray-500 uppercase">Order instructions (Kitchen Notes)</label>
              <input
                type="text"
                placeholder="e.g. Make it extra spicy, No onions please"
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-primary focus:outline-none"
              />
            </div>
          </div>
        </section>

        {/* Payment Options Selection */}
        <section className="bg-white p-6 rounded-3xl border border-outline-variant/10 shadow-xs space-y-4">
          <h3 className="font-headline-md text-xs uppercase font-black text-gray-500 tracking-wider flex items-center gap-1.5 border-b border-outline-variant/10 pb-3">
            <span className="material-symbols-outlined text-[18px] text-primary">credit_card</span>
            Select Payment Method
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <button
              onClick={() => setPaymentMethod('Cash on Delivery')}
              type="button"
              className={`p-4 border rounded-2xl flex flex-col items-start text-left gap-1.5 transition-all ${
                paymentMethod === 'Cash on Delivery'
                  ? 'border-primary bg-primary/5 text-primary'
                  : 'border-outline-variant/20 hover:bg-gray-50 text-secondary'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px]">payments</span>
                <span className="text-xs font-black">Cash on Delivery</span>
              </div>
              <p className="text-[10px] opacity-80">Pay with Cash/UPI when order reaches home.</p>
            </button>

            <button
              onClick={() => setPaymentMethod('Razorpay Online')}
              type="button"
              className={`p-4 border rounded-2xl flex flex-col items-start text-left gap-1.5 transition-all ${
                paymentMethod === 'Razorpay Online'
                  ? 'border-primary bg-primary/5 text-primary'
                  : 'border-outline-variant/20 hover:bg-gray-50 text-secondary'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px]">account_balance_wallet</span>
                <span className="text-xs font-black">Online Payment (Razorpay)</span>
              </div>
              <p className="text-[10px] opacity-80">Pay securely using Cards, UPI, Netbanking.</p>
            </button>
          </div>
        </section>

        {/* Pricing Summary */}
        <section className="bg-white p-6 rounded-3xl border border-outline-variant/10 shadow-xs space-y-4">
          <h3 className="font-headline-md text-xs uppercase font-black text-gray-500 tracking-wider flex items-center gap-1.5">
            <Compass className="w-4 h-4 text-primary" />
            Bill Details
          </h3>

          <div className="space-y-3 pt-1">
            <div className="flex justify-between items-center text-xs text-secondary">
              <span>Items Subtotal</span>
              <span className="font-bold text-on-surface">₹{pricing.subtotal}</span>
            </div>
            
            {pricing.packagingFee > 0 && (
              <div className="flex justify-between items-center text-xs text-secondary">
                <span>Restaurant Packaging Charge</span>
                <span className="font-bold text-on-surface">₹{pricing.packagingFee}</span>
              </div>
            )}
            
            {pricing.platformFee > 0 && (
              <div className="flex justify-between items-center text-xs text-secondary">
                <span>Platform Convenience Fee</span>
                <span className="font-bold text-on-surface">₹{pricing.platformFee}</span>
              </div>
            )}

            <div className="flex justify-between items-center text-xs text-secondary">
              <span>Taxes and GST (5%)</span>
              <span className="font-bold text-on-surface">₹{pricing.taxes}</span>
            </div>

            <div className="flex justify-between items-center text-xs text-secondary">
              <span>Delivery Partner Fee</span>
              <span className="font-bold text-on-surface">
                {pricing.deliveryFee === 0 ? <strong className="text-green-600 font-bold">FREE</strong> : `₹${pricing.deliveryFee}`}
              </span>
            </div>

            {pricing.discount > 0 && (
              <div className="flex justify-between items-center text-xs text-green-600 font-bold bg-green-50 px-3 py-2 rounded-xl">
                <span>Coupon Applied Discount</span>
                <span>-₹{pricing.discount}</span>
              </div>
            )}

            <div className="border-t border-outline-variant/10 pt-3 flex justify-between items-center">
              <span className="text-xs font-black text-on-surface">Grand Total</span>
              <span className="text-base font-black text-primary">₹{pricing.grandTotal}</span>
            </div>
          </div>
        </section>

        {/* Payment selector */}
        <section className="bg-white p-6 rounded-3xl border border-outline-variant/10 shadow-xs space-y-4">
          <h3 className="font-headline-md text-xs uppercase font-black text-gray-500 tracking-wider flex items-center gap-1.5">
            <CreditCard className="w-4 h-4 text-primary" />
            Payment Method
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-4 rounded-2xl border border-primary bg-orange-50/15 flex items-center gap-3">
              <div className="p-2 bg-primary/10 text-primary rounded-lg">
                <Check className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-on-surface">Cash on Delivery</h4>
                <p className="text-[10px] text-secondary mt-0.5">Pay at your doorstep in Khunta</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl border border-outline-variant/20 bg-gray-50 opacity-60 flex items-center gap-3 cursor-not-allowed">
              <div className="p-2 bg-gray-100 text-secondary rounded-lg">
                <Info className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-400">UPI / Card Pay</h4>
                <p className="text-[9px] text-primary font-bold mt-0.5">COMING SOON</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Place Order */}
        <button
          onClick={() => checkoutMutation.mutate()}
          disabled={checkoutMutation.isPending || !selectedAddressId}
          className="w-full py-4 bg-primary text-white font-black text-sm rounded-2xl shadow-lg hover:bg-orange-600 disabled:bg-orange-300 transition-colors flex items-center justify-center gap-2"
        >
          {checkoutMutation.isPending ? (
            <>
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Creating Order...
            </>
          ) : (
            `Place Order (₹${pricing.grandTotal})`
          )}
        </button>
      </div>

      {/* Address creation modal */}
      {addressModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl w-full max-w-md border border-outline-variant/10 shadow-lg overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-outline-variant/10 flex justify-between items-center">
              <h3 className="font-headline-lg text-sm text-on-surface font-black">Configure Delivery Address</h3>
              <button
                onClick={() => setAddressModalOpen(false)}
                className="p-1.5 text-secondary hover:text-on-surface hover:bg-surface-container-low rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddressSubmit(onAddAddressSubmit)} className="p-6 space-y-4 overflow-y-auto flex-grow text-left">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-gray-500 uppercase">Label Name</label>
                <select
                  {...addressRegister('label')}
                  className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-3 py-2 text-xs focus:outline-none"
                >
                  <option value="Home">Home</option>
                  <option value="Work">Work</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase">Flat / House Number</label>
                  <input
                    type="text"
                    required
                    {...addressRegister('houseNumber', { required: true })}
                    className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-3 py-2 text-xs focus:outline-none"
                  />
                </div>
                
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase">Street Details</label>
                  <input
                    type="text"
                    required
                    {...addressRegister('street', { required: true })}
                    className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-3 py-2 text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase">Village / Ward</label>
                  <input
                    type="text"
                    required
                    {...addressRegister('village', { required: true })}
                    className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-3 py-2 text-xs focus:outline-none"
                  />
                </div>
                
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase">Landmark (e.g. Near Bus Stand)</label>
                  <input
                    type="text"
                    {...addressRegister('landmark')}
                    className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-3 py-2 text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase">Pincode</label>
                  <input
                    type="text"
                    required
                    {...addressRegister('pincode', { required: true })}
                    className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-3 py-2 text-xs focus:outline-none"
                  />
                </div>
                
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase">District</label>
                  <input
                    type="text"
                    required
                    {...addressRegister('district', { required: true })}
                    className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-3 py-2 text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-outline-variant/10">
                <button
                  type="button"
                  onClick={() => setAddressModalOpen(false)}
                  className="px-4 py-2 border border-outline-variant/30 hover:bg-gray-50 font-bold text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addressSubmitting}
                  className="px-5 py-2 bg-primary text-white font-bold text-xs hover:bg-orange-600 rounded-xl shadow-md"
                >
                  {addressSubmitting ? 'Saving...' : 'Save Address'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Coupons sidebar modal */}
      {couponOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-end z-50">
          <div className="bg-white rounded-l-3xl w-full max-w-sm border-l border-outline-variant/10 shadow-lg h-screen flex flex-col">
            <div className="px-6 py-4 border-b border-outline-variant/10 flex justify-between items-center">
              <h3 className="font-headline-lg text-sm text-on-surface font-black">Active Checkout Coupons</h3>
              <button
                onClick={() => setCouponOpen(false)}
                className="p-1.5 text-secondary hover:text-on-surface hover:bg-surface-container-low rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto flex-grow text-left">
              {/* Manual input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter custom code..."
                  value={couponText}
                  onChange={(e) => setCouponText(e.target.value.toUpperCase())}
                  className="flex-grow bg-surface-container-low border border-outline-variant/30 rounded-xl px-3 py-2 text-xs focus:outline-none"
                />
                <button
                  onClick={() => handleApplyCoupon(couponText)}
                  className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl"
                >
                  Apply
                </button>
              </div>

              {couponCode && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-xl flex items-center justify-between text-xs text-green-800">
                  <span className="font-bold">Active: {couponCode}</span>
                  <button onClick={() => removeCoupon()} className="text-[10px] text-red-600 font-bold hover:underline">
                    Remove
                  </button>
                </div>
              )}

              {/* Coupons list */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Available offers</h4>
                
                {coupons.length > 0 ? (
                  coupons.map((coupon: any) => (
                    <div
                      key={coupon._id}
                      onClick={() => handleApplyCoupon(coupon.code)}
                      className="p-4 rounded-2xl border border-outline-variant/20 bg-white hover:bg-gray-50/30 cursor-pointer space-y-2 flex flex-col"
                    >
                      <div className="flex justify-between items-center">
                        <span className="bg-orange-100 text-primary font-bold text-xs px-2.5 py-1 rounded-lg">
                          {coupon.code}
                        </span>
                        <span className="text-[10px] font-bold text-green-700">
                          {coupon.isPercentage ? `${coupon.discount * 100}% OFF` : `₹${coupon.discount} OFF`}
                        </span>
                      </div>
                      <p className="text-[10px] text-secondary">
                        Valid on orders above ₹{coupon.minOrder}. Capped at ₹{coupon.maxDiscount}.
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-400">No promo codes active for this branch.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Razorpay Simulation Modal */}
      {paymentModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl w-full max-w-md border border-outline-variant/10 shadow-lg overflow-hidden flex flex-col dark:bg-zinc-900 dark:border-zinc-800">
            {/* Header */}
            <div className="bg-blue-600 px-6 py-5 text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[24px]">account_balance_wallet</span>
                <div>
                  <h3 className="text-sm font-black tracking-wide">Razorpay Secured Checkout</h3>
                  <p className="text-[9px] opacity-75">FRETZA Hyperlocal Logistics, Odisha</p>
                </div>
              </div>
              <span className="text-xs font-black bg-white/20 px-3 py-1 rounded-xl">
                ₹{pricing.grandTotal}
              </span>
            </div>

            {/* Methods Selection */}
            <div className="p-6 space-y-6 text-left">
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-on-surface">Select Payment Channel</h4>
                <p className="text-[10px] text-secondary">Verify transactions safely using simulated gateways.</p>
              </div>

              <div className="space-y-3">
                <div className="p-4 border border-outline-variant/20 rounded-2xl flex items-center justify-between hover:bg-gray-50/50 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-blue-600">qr_code_2</span>
                    <span className="text-xs font-black text-on-surface">UPI (GPay / PhonePe / Paytm)</span>
                  </div>
                  <input type="radio" name="rzp_chan" defaultChecked />
                </div>

                <div className="p-4 border border-outline-variant/20 rounded-2xl flex items-center justify-between hover:bg-gray-50/50 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-blue-600">credit_card</span>
                    <span className="text-xs font-black text-on-surface">Cards (Visa, Mastercard, RuPay)</span>
                  </div>
                  <input type="radio" name="rzp_chan" />
                </div>

                <div className="p-4 border border-outline-variant/20 rounded-2xl flex items-center justify-between hover:bg-gray-50/50 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-blue-600">account_balance</span>
                    <span className="text-xs font-black text-on-surface">Net Banking</span>
                  </div>
                  <input type="radio" name="rzp_chan" />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <button
                  onClick={async () => {
                    setPaymentProcessing(true);
                    setTimeout(async () => {
                      try {
                        const mockPayId = 'pay_' + Math.random().toString(36).substring(7);
                        const mockOrderId = 'rzp_' + Math.random().toString(36).substring(7);
                        await api.post('/payments/verify', {
                          orderId: placedOrderId,
                          razorpayOrderId: mockOrderId,
                          razorpayPaymentId: mockPayId,
                        });
                        showToast('Razorpay payment verified successfully!', 'success');
                        setPaymentModalOpen(false);
                        navigate(`/order/${placedOrderId}`);
                      } catch (err: any) {
                        showToast('Payment verification failed', 'error');
                      } finally {
                        setPaymentProcessing(false);
                      }
                    }, 1500);
                  }}
                  disabled={paymentProcessing}
                  className="w-full py-3.5 bg-blue-600 text-white font-black text-xs rounded-xl shadow-md hover:bg-blue-700 disabled:bg-blue-300 transition-colors flex items-center justify-center gap-2"
                >
                  {paymentProcessing ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Contacting bank gateways...
                    </>
                  ) : (
                    'Verify Successful Payment'
                  )}
                </button>

                <button
                  onClick={handleCancelPayment}
                  disabled={paymentProcessing}
                  className="w-full py-2.5 bg-gray-50 border border-outline-variant/10 text-secondary font-bold text-xs rounded-xl hover:bg-gray-100/50 transition-colors"
                >
                  Cancel / Fail Transaction
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
