import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { api } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import {
  Percent,
  Plus,
  Trash2,
  Calendar,
} from 'lucide-react';

interface CouponFormFields {
  code: string;
  discount: number;
  isPercentage: boolean;
  minOrder: number;
  maxDiscount: number;
  expiry: string;
}

export const AdminCoupons: React.FC = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const [createModalOpen, setCreateModalOpen] = useState(false);

  // Fetch Coupons
  const { data: couponsData, isLoading } = useQuery({
    queryKey: ['admin-coupons'],
    queryFn: async () => {
      const res = await api.get('/admin/coupons');
      return res.data.coupons || [];
    },
  });

  const { register, handleSubmit, reset } = useForm<CouponFormFields>({
    defaultValues: {
      isPercentage: true,
      minOrder: 150,
      maxDiscount: 100,
    },
  });

  // Create Coupon Mutation
  const createCouponMutation = useMutation({
    mutationFn: async (data: CouponFormFields) => {
      const res = await api.post('/admin/coupons', data);
      return res.data;
    },
    onSuccess: () => {
      showToast('New coupon created successfully', 'success');
      queryClient.invalidateQueries({ queryKey: ['admin-coupons'] });
      setCreateModalOpen(false);
      reset();
    },
    onError: (err: any) => {
      showToast(typeof err === 'string' ? err : 'Could not create coupon', 'error');
    },
  });

  // Toggle Coupon Status Mutation
  const toggleStatusMutation = useMutation({
    mutationFn: async ({ couponId, status }: { couponId: string; status: 'Active' | 'Inactive' }) => {
      const res = await api.put(`/admin/coupons/${couponId}`, { status });
      return res.data;
    },
    onSuccess: () => {
      showToast('Coupon status updated', 'success');
      queryClient.invalidateQueries({ queryKey: ['admin-coupons'] });
    },
  });

  // Delete Coupon Mutation
  const deleteCouponMutation = useMutation({
    mutationFn: async (couponId: string) => {
      await api.delete(`/admin/coupons/${couponId}`);
    },
    onSuccess: () => {
      showToast('Coupon promo deleted successfully', 'success');
      queryClient.invalidateQueries({ queryKey: ['admin-coupons'] });
    },
  });

  const coupons = couponsData || [];

  const onSubmit = (data: CouponFormFields) => {
    createCouponMutation.mutate(data);
  };

  return (
    <div className="px-gutter py-6 max-w-5xl mx-auto space-y-6 text-left">
      
      {/* Title */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="font-headline-lg text-lg font-black text-on-surface">Coupon Management</h2>
          <p className="text-secondary font-body-sm text-[10px]">Create, review, and delete customer checkout discount codes.</p>
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="px-4 py-2.5 bg-primary text-white font-black text-xs rounded-xl shadow-md hover:bg-orange-600 flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          New Promo Code
        </button>
      </div>

      {/* Coupons List */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="h-28 bg-gray-100 rounded-2xl animate-pulse" />
          <div className="h-28 bg-gray-100 rounded-2xl animate-pulse" />
        </div>
      ) : coupons.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {coupons.map((c: any) => {
            const exp = new Date(c.expiry).toLocaleDateString('en-IN', {
              dateStyle: 'medium',
            });

            return (
              <div
                key={c._id}
                className="bg-white p-5 rounded-2xl border border-outline-variant/10 shadow-xs flex flex-col justify-between gap-4"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="bg-orange-100 text-primary font-bold text-xs px-2.5 py-1 rounded-lg">
                      {c.code}
                    </span>
                    <h4 className="text-xs font-black text-on-surface mt-2.5">
                      {c.isPercentage ? `${c.discount * 100}% Off` : `₹${c.discount} Off`}
                    </h4>
                    <p className="text-[10px] text-secondary mt-1">
                      Min order: ₹{c.minOrder} | Max discount: ₹{c.maxDiscount}
                    </p>
                  </div>

                  <div className="flex flex-col gap-2 items-end">
                    <button
                      onClick={() => toggleStatusMutation.mutate({
                        couponId: c._id,
                        status: c.status === 'Active' ? 'Inactive' : 'Active'
                      })}
                      className={`px-2 py-0.5 rounded-md font-bold text-[9px] uppercase tracking-wider ${
                        c.status === 'Active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-secondary'
                      }`}
                    >
                      {c.status}
                    </button>

                    <button
                      onClick={() => deleteCouponMutation.mutate(c._id)}
                      className="text-red-500 hover:text-red-700 p-1 rounded-lg hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-3 flex items-center gap-1.5 text-[10px] text-secondary">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Expires on {exp}</span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-white border border-dashed border-gray-200 rounded-3xl">
          <Percent className="w-8 h-8 text-gray-300 mx-auto" />
          <h4 className="text-xs font-bold text-on-surface mt-2">No promotional codes found</h4>
        </div>
      )}

      {/* Coupon creation modal */}
      {createModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl w-full max-w-md border border-outline-variant/10 shadow-lg overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-outline-variant/10 flex justify-between items-center">
              <h3 className="font-headline-lg text-sm text-on-surface font-black">Configure Promotion Coupon</h3>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="text-xs text-secondary hover:underline"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4 overflow-y-auto flex-grow text-left">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-gray-500 uppercase">Coupon Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. MONSOON50"
                  {...register('code', { required: true })}
                  className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-3 py-2 text-xs focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase">Discount Rate</label>
                  <input
                    type="number"
                    step="any"
                    required
                    {...register('discount', { required: true, valueAsNumber: true })}
                    className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-3 py-2 text-xs focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase">Discount Type</label>
                  <select
                    {...register('isPercentage')}
                    className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-3 py-2 text-xs focus:outline-none"
                  >
                    <option value="true">Percentage (%)</option>
                    <option value="false">Flat Cash (₹)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase">Min Order Limit</label>
                  <input
                    type="number"
                    required
                    {...register('minOrder', { required: true, valueAsNumber: true })}
                    className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-3 py-2 text-xs focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase">Max Discount Limit</label>
                  <input
                    type="number"
                    required
                    {...register('maxDiscount', { required: true, valueAsNumber: true })}
                    className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-3 py-2 text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-gray-500 uppercase">Expiry Date</label>
                <input
                  type="date"
                  required
                  {...register('expiry', { required: true })}
                  className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-3 py-2 text-xs focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={createCouponMutation.isPending}
                className="w-full py-3.5 bg-primary text-white font-black rounded-xl text-xs hover:bg-orange-600 transition-colors shadow-md mt-2"
              >
                {createCouponMutation.isPending ? 'Creating Promo...' : 'Save Promotion Code'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
