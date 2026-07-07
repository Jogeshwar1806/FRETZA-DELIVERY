import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCartStore } from '../store/useCartStore';
import { useAuthStore } from '../store/useAuthStore';
import { useToast } from '../contexts/ToastContext';
import { Modal } from '../components/Modal';

export const Cart: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const { cartItems, pricing, updateQuantity, removeFromCart, couponCode, applyCoupon, removeCoupon, restaurantId, restaurantName } = useCartStore();
  const { addresses, addAddress, setDefaultAddress } = useAuthStore();

  const [promoInput, setPromoInput] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  
  // Address form fields
  const [addrLabel, setAddrLabel] = useState<'Home' | 'Work' | 'Other'>('Home');
  const [addrDetails, setAddrDetails] = useState('');

  const handleApplyPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoInput.trim()) return;
    const success = await applyCoupon(promoInput);
    if (success) {
      showToast(`Promo code "${promoInput.toUpperCase()}" applied!`, 'success');
      setPromoInput('');
    } else {
      showToast('Invalid promo code. Try "FRETZABIRYANI" or "ROYAL50"!', 'error');
    }
  };

  const handleAddAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addrDetails.trim()) {
      showToast('Please fill address details', 'warning');
      return;
    }
    addAddress({
      label: addrLabel,
      details: addrDetails,
      isDefault: addresses.length === 0,
    });
    showToast('Address added successfully!');
    setAddrDetails('');
    setIsAddressModalOpen(false);
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      showToast('Your cart is empty', 'warning');
      return;
    }
    navigate('/checkout');
  };

  if (cartItems.length === 0) {
    return (
      <div className="px-gutter py-16 text-center space-y-4 max-w-sm mx-auto">
        <span className="material-symbols-outlined text-5xl text-gray-300">shopping_basket</span>
        <h2 className="font-headline-lg text-lg text-on-surface font-bold">Your Cart is Empty</h2>
        <p className="text-secondary text-xs">Explore restaurants near you in Khunta and add hot meals to checkout.</p>
        <Link
          to="/home"
          className="block w-full py-3 bg-primary text-white text-center font-bold rounded-xl text-xs hover:bg-orange-600 transition-all shadow-md"
        >
          Explore Restaurants
        </Link>
      </div>
    );
  }

  return (
    <div className="px-gutter py-6 max-w-4xl mx-auto space-y-6">
      
      {/* Back to restaurant link */}
      {restaurantId && (
        <div className="flex items-center gap-2">
          <Link
            to={`/restaurant/${restaurantId}`}
            className="flex items-center gap-1 text-xs text-primary font-bold hover:underline"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            Back to {restaurantName}
          </Link>
        </div>
      )}

      <div>
        <h2 className="font-headline-lg text-xl md:text-2xl text-on-surface font-black">Checkout Basket</h2>
        <p className="text-secondary font-body-sm text-xs mt-1">Review items from {restaurantName} and finalize delivery.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Columns - Cart Details */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Order Summary */}
          <section className="bg-white rounded-2xl border border-outline-variant/10 p-5 shadow-xs space-y-4">
            <h3 className="font-headline-md text-sm text-on-surface font-bold border-b border-gray-100 pb-2">Order Items</h3>
            
            <div className="divide-y divide-gray-100">
              {cartItems.map((item) => (
                <div key={item.menuItem.id} className="py-4 flex gap-4 items-start group">
                  <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-gray-50 border border-gray-100">
                    <img src={item.menuItem.image} alt={item.menuItem.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-1">
                      <h4 className="font-bold text-xs text-on-surface truncate">{item.menuItem.name}</h4>
                      <span className="font-bold text-xs text-on-surface shrink-0">₹{item.menuItem.price * item.quantity}</span>
                    </div>
                    <p className="text-[10px] text-secondary mt-0.5">₹{item.menuItem.price} each</p>
                    
                    <div className="mt-3 flex items-center gap-4">
                      {/* Quantity Selector */}
                      <div className="flex items-center border border-outline-variant/30 rounded-lg overflow-hidden bg-gray-50">
                        <button
                          onClick={() => updateQuantity(item.menuItem.id, item.quantity - 1)}
                          className="px-2 py-1 text-primary hover:bg-gray-100 text-xs font-black"
                        >
                          -
                        </button>
                        <span className="px-2 font-bold text-xs">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.menuItem.id, item.quantity + 1)}
                          className="px-2 py-1 text-primary hover:bg-gray-100 text-xs font-black"
                        >
                          +
                        </button>
                      </div>

                      <button
                        onClick={() => {
                          removeFromCart(item.menuItem.id);
                          showToast(`Removed ${item.menuItem.name}`);
                        }}
                        className="text-error font-semibold text-[10px] flex items-center gap-0.5 hover:underline"
                      >
                        <span className="material-symbols-outlined text-[14px]">delete</span>
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {restaurantId && (
              <Link
                to={`/restaurant/${restaurantId}`}
                className="block text-center text-xs text-primary font-bold py-3 bg-orange-50/50 hover:bg-orange-50 rounded-xl transition-all"
              >
                + Add More Items
              </Link>
            )}
          </section>

          {/* Delivery Address selection */}
          <section className="bg-white rounded-2xl border border-outline-variant/10 p-5 shadow-xs space-y-4">
            <div className="flex justify-between items-center border-b border-gray-100 pb-2">
              <h3 className="font-headline-md text-sm text-on-surface font-bold">Delivery Address</h3>
              <button
                onClick={() => setIsAddressModalOpen(true)}
                className="text-xs text-primary font-bold flex items-center gap-0.5 hover:underline"
              >
                <span className="material-symbols-outlined text-[14px]">add</span> Add New
              </button>
            </div>

            {addresses.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {addresses.map((addr) => (
                  <div
                    key={addr.id}
                    onClick={() => setDefaultAddress(addr.id)}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      addr.isDefault
                        ? 'border-primary bg-orange-50/20'
                        : 'border-outline-variant/30 bg-white hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className={`material-symbols-outlined text-[18px] ${addr.isDefault ? 'text-primary' : 'text-secondary'}`}>
                        {addr.label === 'Home' ? 'home' : addr.label === 'Work' ? 'work' : 'location_on'}
                      </span>
                      <span className="font-bold text-xs text-on-surface">{addr.label}</span>
                      {addr.isDefault && (
                        <span className="material-symbols-outlined text-[16px] text-primary ml-auto" style={{ fontVariationSettings: "'FILL' 1" }}>
                          check_circle
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-on-surface-variant leading-relaxed line-clamp-2">
                      {addr.details}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-secondary">
                <p className="text-xs">No saved addresses found. Please add a delivery address.</p>
              </div>
            )}
          </section>

          {/* Payment Method Selector */}
          <section className="bg-white rounded-2xl border border-outline-variant/10 p-5 shadow-xs space-y-4">
            <h3 className="font-headline-md text-sm text-on-surface font-bold border-b border-gray-100 pb-2">Payment Method</h3>
            
            <div className="space-y-2">
              {[
                { id: 'cod', name: 'Cash / Card on Delivery (COD)', desc: 'Pay via cash or card during delivery', icon: 'payments' },
                { id: 'upi', name: 'Instant UPI (PhonePe / GPay)', desc: 'Simulated UPI portal link', icon: 'account_balance_wallet' },
              ].map((pm) => (
                <label
                  key={pm.id}
                  className={`flex items-center justify-between p-3.5 border rounded-xl cursor-pointer hover:bg-gray-50 transition-all ${
                    paymentMethod === pm.id ? 'border-primary bg-orange-50/5' : 'border-outline-variant/20'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                      paymentMethod === pm.id ? 'bg-primary-fixed text-primary' : 'bg-surface-container text-secondary'
                    }`}>
                      <span className="material-symbols-outlined text-[20px]">{pm.icon}</span>
                    </div>
                    <div className="text-left">
                      <span className="block font-bold text-xs text-on-surface">{pm.name}</span>
                      <span className="block text-[10px] text-secondary mt-0.5">{pm.desc}</span>
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="payment"
                    value={pm.id}
                    checked={paymentMethod === pm.id}
                    onChange={() => setPaymentMethod(pm.id)}
                    className="w-4 h-4 text-primary focus:ring-primary border-gray-300"
                  />
                </label>
              ))}
            </div>
          </section>

        </div>

        {/* Right Column - Bill Summary & Coupons */}
        <aside className="lg:col-span-4 space-y-6 self-start">
          
          {/* Coupon / Promo section */}
          <section className="bg-white rounded-2xl border border-outline-variant/10 p-5 shadow-xs space-y-3">
            <h4 className="font-headline-md text-xs font-black text-gray-400 uppercase tracking-wider">Apply Coupon</h4>
            {couponCode ? (
              <div className="flex items-center justify-between p-3 bg-green-50 text-green-800 border border-green-200 rounded-xl text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-green-600">check_circle</span>
                  <span className="font-bold">"{couponCode}" Applied</span>
                </div>
                <button
                  onClick={() => {
                    removeCoupon();
                    showToast('Coupon removed');
                  }}
                  className="text-[10px] font-black text-red-600 uppercase hover:underline"
                >
                  Remove
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyPromo} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter code: FRETZABIRYANI"
                  value={promoInput}
                  onChange={(e) => setPromoInput(e.target.value)}
                  className="flex-1 bg-surface-container-low border border-outline-variant/30 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-primary-container focus:bg-white focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white font-bold rounded-xl text-xs hover:bg-orange-600 transition-colors"
                >
                  Apply
                </button>
              </form>
            )}
            <p className="text-[9px] text-secondary leading-normal pt-1">
              *Tip: Enter <span className="font-bold">FRETZABIRYANI</span> for 50% discount or <span className="font-bold">ROYAL100</span> for flat ₹100 Off.
            </p>
          </section>

          {/* Pricing Details summary */}
          <section className="bg-white rounded-2xl border border-outline-variant/10 p-5 shadow-xs space-y-4">
            <h4 className="font-headline-md text-xs font-black text-gray-400 uppercase tracking-wider border-b border-gray-100 pb-2">Price Details</h4>
            
            <div className="space-y-2.5 text-xs text-on-surface-variant">
              <div className="flex justify-between">
                <span>Basket Subtotal</span>
                <span className="font-semibold text-on-surface">₹{pricing.subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Partner Fee</span>
                {pricing.deliveryFee === 0 ? (
                  <span className="text-green-600 font-bold uppercase text-[10px]">Free Delivery</span>
                ) : (
                  <span className="font-semibold text-on-surface">₹{pricing.deliveryFee}</span>
                )}
              </div>
              <div className="flex justify-between">
                <span>Restaurant Packaging Fee</span>
                <span className="font-semibold text-on-surface">₹{pricing.packagingFee}</span>
              </div>
              <div className="flex justify-between">
                <span>Taxes & GST (5%)</span>
                <span className="font-semibold text-on-surface">₹{pricing.taxes}</span>
              </div>
              
              {pricing.discount > 0 && (
                <div className="flex justify-between text-green-600 font-bold border-t border-dashed border-gray-100 pt-2.5">
                  <span>Coupon Discount</span>
                  <span>- ₹{pricing.discount}</span>
                </div>
              )}

              <div className="flex justify-between text-sm font-black text-on-surface border-t border-gray-100 pt-3 mt-3">
                <span>Grand Total</span>
                <span className="text-primary text-base">₹{pricing.grandTotal}</span>
              </div>
            </div>

            {/* Place order CTA */}
            <button
              onClick={handleCheckout}
              className="w-full py-4 bg-primary text-white font-black rounded-2xl shadow-lg hover:bg-orange-600 transition-all active:scale-[0.98] mt-4 flex items-center justify-center gap-2"
            >
              Proceed to Checkout
              <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </button>
          </section>

        </aside>

      </div>

      {/* Address Form modal overlay */}
      <Modal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        title="Add Delivery Address"
      >
        <form onSubmit={handleAddAddressSubmit} className="space-y-4 text-left">
          {/* Label selector */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-500 uppercase">Address Type</label>
            <div className="flex gap-2">
              {(['Home', 'Work', 'Other'] as const).map((lbl) => (
                <button
                  key={lbl}
                  type="button"
                  onClick={() => setAddrLabel(lbl)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                    addrLabel === lbl
                      ? 'bg-primary text-white border-primary'
                      : 'bg-white text-secondary border-outline-variant/30 hover:bg-gray-50'
                  }`}
                >
                  {lbl}
                </button>
              ))}
            </div>
          </div>

          {/* Details input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-500 uppercase">Full Address Details</label>
            <textarea
              rows={3}
              placeholder="House/Flat No, Street, Landmark, Khunta, Odisha - 757019"
              value={addrDetails}
              onChange={(e) => setAddrDetails(e.target.value)}
              className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-primary focus:bg-white focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-primary text-white font-bold rounded-xl text-xs hover:bg-orange-600 transition-colors shadow-md mt-4"
          >
            Save Address
          </button>
        </form>
      </Modal>

    </div>
  );
};
