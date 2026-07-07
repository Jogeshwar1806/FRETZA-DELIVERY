import React from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import { useAuthStore } from '../../store/useAuthStore';
import {
  ShieldCheck,
  Bike,
  Activity,
  CheckCircle,
} from 'lucide-react';

interface ProfileFields {
  vehicleType: string;
  vehicleNumber: string;
}

export const DeliveryProfile: React.FC = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const { currentUser } = useAuthStore();

  const profile = currentUser?.deliveryProfile || {
    vehicleType: '',
    vehicleNumber: '',
    isVerified: false,
    isOnline: false,
  };

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<ProfileFields>({
    defaultValues: {
      vehicleType: profile.vehicleType || 'Motorcycle',
      vehicleNumber: profile.vehicleNumber || '',
    },
  });

  // Update Profile Mutation
  const updateMutation = useMutation({
    mutationFn: async (data: Partial<ProfileFields & { isOnline: boolean }>) => {
      const res = await api.put('/delivery/profile', data);
      return res.data.profile;
    },
    onSuccess: () => {
      showToast('Rider profile updated successfully!', 'success');
      // Update global auth user state
      useAuthStore.getState().getMe();
      queryClient.invalidateQueries({ queryKey: ['delivery-dashboard-stats'] });
    },
    onError: (err: any) => {
      showToast(typeof err === 'string' ? err : 'Profile update failed', 'error');
    },
  });

  const onSubmit = (data: ProfileFields) => {
    updateMutation.mutate(data);
  };

  const handleOnlineToggle = () => {
    updateMutation.mutate({ isOnline: !profile.isOnline });
  };

  return (
    <div className="px-gutter py-6 max-w-2xl mx-auto space-y-6 text-left">
      
      {/* Title */}
      <div>
        <h2 className="font-headline-lg text-lg font-black text-on-surface">Rider Profile</h2>
        <p className="text-secondary font-body-sm text-[10px]">Manage your vehicle details and shift availability.</p>
      </div>

      {/* Online/Offline status card */}
      <section className="bg-white p-6 rounded-3xl border border-outline-variant/10 shadow-xs space-y-4">
        <h3 className="font-headline-md text-xs uppercase font-black text-gray-500 tracking-wider flex items-center gap-1.5 border-b border-outline-variant/10 pb-3">
          <Activity className="w-4 h-4 text-primary" />
          Shift Status
        </h3>

        <div className="flex justify-between items-center">
          <div>
            <h4 className="text-xs font-bold text-on-surface">
              Duty State: {profile.isOnline ? 'Online' : 'Offline'}
            </h4>
            <p className="text-[10px] text-secondary mt-0.5">
              {profile.isOnline
                ? 'You are active in Khunta zone. Keep dashboard open to fetch Ready orders.'
                : 'You are off-duty. Change to online to accept customer deliveries.'}
            </p>
          </div>

          <button
            onClick={handleOnlineToggle}
            className={`px-4 py-2 text-[10px] font-bold rounded-xl transition-all shadow-md ${
              profile.isOnline
                ? 'bg-red-50 hover:bg-red-100 text-red-600 border border-red-200'
                : 'bg-primary hover:bg-orange-600 text-white'
            }`}
          >
            {profile.isOnline ? 'Go Offline' : 'Go Online'}
          </button>
        </div>
      </section>

      {/* Verification status */}
      <section className="bg-white p-6 rounded-3xl border border-outline-variant/10 shadow-xs space-y-4">
        <h3 className="font-headline-md text-xs uppercase font-black text-gray-500 tracking-wider flex items-center gap-1.5 border-b border-outline-variant/10 pb-3">
          <ShieldCheck className="w-4 h-4 text-primary" />
          Identity Verification
        </h3>

        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl ${profile.isVerified ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-on-surface">
              Rider Account: {profile.isVerified ? 'Verified' : 'Verification Pending'}
            </h4>
            <p className="text-[10px] text-secondary mt-0.5">
              {profile.isVerified
                ? 'Mayurbhanj district administrative verification checks completed.'
                : 'Verification checks are running. Contact support with driving license.'}
            </p>
          </div>
        </div>
      </section>

      {/* Profile/Vehicle configuration form */}
      <section className="bg-white p-6 rounded-3xl border border-outline-variant/10 shadow-xs space-y-4">
        <h3 className="font-headline-md text-xs uppercase font-black text-gray-500 tracking-wider flex items-center gap-1.5 border-b border-outline-variant/10 pb-3">
          <Bike className="w-4 h-4 text-primary" />
          Vehicle Details
        </h3>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-gray-500 uppercase">Vehicle Type</label>
            <select
              {...register('vehicleType')}
              className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-primary focus:bg-white focus:outline-none"
            >
              <option value="Bicycle">Bicycle / Cycle</option>
              <option value="Motorcycle">Motorcycle / Scooty</option>
              <option value="Three-Wheeler">Auto / Electric Cargo</option>
              <option value="Other">Other / Walk</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-gray-500 uppercase">Vehicle Plate / Registration Number</label>
            <input
              type="text"
              placeholder="e.g. OD-11-A-1234"
              {...register('vehicleNumber')}
              className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-primary focus:bg-white focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting || updateMutation.isPending}
            className="w-full py-3 bg-primary text-white font-black rounded-xl text-xs hover:bg-orange-600 transition-colors shadow-md mt-2 disabled:bg-orange-300"
          >
            {isSubmitting || updateMutation.isPending ? 'Saving Details...' : 'Save Configuration'}
          </button>
        </form>
      </section>

    </div>
  );
};
