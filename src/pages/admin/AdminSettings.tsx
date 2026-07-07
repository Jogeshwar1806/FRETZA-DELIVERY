import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { api } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';

interface SettingsFormFields {
  platformFee: number;
  deliveryChargeBase: number;
  deliveryChargePerKm: number;
  freeDeliveryThreshold: number;
  taxRate: number;
  serviceRadius: number;
  maintenanceMode: boolean;
  appVersion: string;
}

export const AdminSettings: React.FC = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  // Fetch Pricing Settings
  const { data: settingsData, isLoading } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: async () => {
      const res = await api.get('/admin/settings');
      return res.data.settings;
    },
  });

  const { register, handleSubmit, reset } = useForm<SettingsFormFields>();

  // Reset form values once query completes
  React.useEffect(() => {
    if (settingsData) {
      reset(settingsData);
    }
  }, [settingsData, reset]);

  // Update Settings Mutation
  const updateMutation = useMutation({
    mutationFn: async (data: SettingsFormFields) => {
      const res = await api.put('/admin/settings', data);
      return res.data.settings;
    },
    onSuccess: () => {
      showToast('Pricing engine configurations saved successfully', 'success');
      queryClient.invalidateQueries({ queryKey: ['admin-settings'] });
    },
    onError: (err: any) => {
      showToast(typeof err === 'string' ? err : 'Could not save configurations', 'error');
    },
  });

  const onSubmit = (data: SettingsFormFields) => {
    updateMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="px-gutter py-24 text-center space-y-4">
        <span className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin inline-block"></span>
        <p className="text-xs text-secondary font-bold">Retrieving pricing variables...</p>
      </div>
    );
  }

  return (
    <div className="px-gutter py-6 max-w-2xl mx-auto space-y-6 text-left">
      
      {/* Title */}
      <div>
        <h2 className="font-headline-lg text-lg font-black text-on-surface">Platform Settings</h2>
        <p className="text-secondary font-body-sm text-[10px]">Configure delivery rates, tax percentages, and platform parameters.</p>
      </div>

      {/* Main settings form */}
      <section className="bg-white p-6 rounded-3xl border border-outline-variant/10 shadow-xs">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-gray-500 uppercase">Platform Convenience Fee (₹)</label>
              <input
                type="number"
                step="any"
                {...register('platformFee', { valueAsNumber: true })}
                className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-3 py-2 text-xs focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-gray-500 uppercase">Tax Rate (Ratio e.g. 0.05)</label>
              <input
                type="number"
                step="any"
                {...register('taxRate', { valueAsNumber: true })}
                className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-3 py-2 text-xs focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-gray-500 uppercase">Base Delivery Charge (₹)</label>
              <input
                type="number"
                {...register('deliveryChargeBase', { valueAsNumber: true })}
                className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-3 py-2 text-xs focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-gray-500 uppercase">Distance Rate Per KM (₹)</label>
              <input
                type="number"
                {...register('deliveryChargePerKm', { valueAsNumber: true })}
                className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-3 py-2 text-xs focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-gray-500 uppercase">Free Delivery Limit (₹)</label>
              <input
                type="number"
                {...register('freeDeliveryThreshold', { valueAsNumber: true })}
                className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-3 py-2 text-xs focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-gray-500 uppercase">Service Radius Scope (KM)</label>
              <input
                type="number"
                {...register('serviceRadius', { valueAsNumber: true })}
                className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-3 py-2 text-xs focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-gray-500 uppercase">Application Version</label>
              <input
                type="text"
                {...register('appVersion')}
                className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-3 py-2 text-xs focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-gray-500 uppercase">System Status Flag</label>
              <select
                {...register('maintenanceMode', {
                  setValueAs: (v) => v === 'true'
                })}
                className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-3 py-2 text-xs focus:outline-none"
              >
                <option value="false">Active (Online Live)</option>
                <option value="true">Maintenance Mode</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="w-full py-3.5 bg-primary text-white font-black rounded-xl text-xs hover:bg-orange-600 transition-colors shadow-md mt-2 disabled:bg-orange-300"
          >
            {updateMutation.isPending ? 'Saving Configurations...' : 'Save Pricing Mappings'}
          </button>

        </form>
      </section>

    </div>
  );
};
