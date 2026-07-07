import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { api } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import { Store, Upload, Image as ImageIcon } from 'lucide-react';

interface ProfileFields {
  name: string;
  cuisine: string;
  address: string;
  description: string;
  logo: string;
  coverImage: string;
  openingTime: string;
  closingTime: string;
  deliveryRadius: number;
  deliveryTime: string;
  contactNumber: string;
  status: 'Open' | 'Closed';
  lat: number;
  lng: number;
}

export const MerchantProfile: React.FC = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  
  const [logoUploading, setLogoUploading] = useState(false);
  const [coverUploading, setCoverUploading] = useState(false);

  // Fetch restaurant profile
  const { data: restaurant, isLoading } = useQuery({
    queryKey: ['merchant-profile'],
    queryFn: async () => {
      const res = await api.get('/merchant/profile');
      return res.data.restaurant;
    },
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ProfileFields>();

  // Sync profile data to form on load
  useEffect(() => {
    if (restaurant) {
      reset({
        name: restaurant.name || '',
        cuisine: restaurant.cuisine || '',
        address: restaurant.address || '',
        description: restaurant.description || '',
        logo: restaurant.logo || restaurant.image || '',
        coverImage: restaurant.coverImage || '',
        openingTime: restaurant.openingTime || '09:00 AM',
        closingTime: restaurant.closingTime || '10:00 PM',
        deliveryRadius: restaurant.deliveryRadius || 5,
        deliveryTime: restaurant.deliveryTime || '25-30 min',
        contactNumber: restaurant.contactNumber || '',
        status: restaurant.status || 'Open',
        lat: restaurant.coordinates?.lat || 21.8214,
        lng: restaurant.coordinates?.lng || 86.4251,
      });
    }
  }, [restaurant, reset]);

  // Profile Mutation
  const updateMutation = useMutation({
    mutationFn: async (data: ProfileFields) => {
      const payload = {
        ...data,
        coordinates: { lat: Number(data.lat), lng: Number(data.lng) },
        // Update both image parameters for compatibility
        image: data.logo,
      };
      const res = await api.put('/merchant/profile', payload);
      return res.data;
    },
    onSuccess: (res) => {
      showToast(res.message, 'success');
      queryClient.invalidateQueries({ queryKey: ['merchant-profile'] });
    },
    onError: (err: any) => {
      showToast(typeof err === 'string' ? err : 'Profile update failed', 'error');
    },
  });

  // Handle Image Uploads
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'logo' | 'coverImage') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    if (field === 'logo') setLogoUploading(true);
    else setCoverUploading(true);

    try {
      const res = await api.post('/merchant/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setValue(field, res.data.url);
      showToast(`${field === 'logo' ? 'Logo' : 'Cover'} uploaded successfully! Save profile to store changes.`, 'success');
    } catch (err: any) {
      showToast(typeof err === 'string' ? err : 'Upload failed', 'error');
    } finally {
      if (field === 'logo') setLogoUploading(false);
      else setCoverUploading(false);
    }
  };

  const onSubmit = (data: ProfileFields) => {
    updateMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse text-left">
        <div className="h-44 bg-gray-200 rounded-3xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-10 bg-gray-200 rounded-xl" />
          <div className="h-10 bg-gray-200 rounded-xl" />
          <div className="h-10 bg-gray-200 rounded-xl col-span-2" />
        </div>
      </div>
    );
  }

  const logoUrl = watch('logo');
  const coverUrl = watch('coverImage');
  const activeStatus = watch('status');

  return (
    <div className="max-w-4xl mx-auto space-y-8 text-left">
      <div>
        <h2 className="font-headline-lg text-xl md:text-2xl text-on-surface font-black">Restaurant Profile</h2>
        <p className="text-secondary font-body-sm text-xs mt-1">Configure your business credentials, location coordinates, timings, and delivery scope.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Cover Photo Upload Container */}
        <div className="relative h-48 md:h-64 w-full rounded-3xl bg-gray-100 border border-outline-variant/20 overflow-hidden shadow-xs">
          {coverUrl ? (
            <img src={coverUrl} alt="Cover" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 gap-2">
              <ImageIcon className="w-8 h-8" />
              <span className="text-xs">No Cover Image Configured</span>
            </div>
          )}
          
          <label className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-xs hover:bg-white text-secondary hover:text-on-surface p-2.5 rounded-full cursor-pointer shadow-md transition-all active:scale-95">
            <Upload className="w-4 h-4" />
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleImageUpload(e, 'coverImage')}
              disabled={coverUploading}
            />
          </label>
          
          {coverUploading && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white text-xs font-bold gap-2">
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Uploading Cover...
            </div>
          )}
        </div>

        {/* Logo Upload & Title Block */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 -mt-12 sm:-mt-16 px-6 relative z-10">
          <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-3xl bg-white border border-outline-variant/30 shadow-md overflow-hidden flex items-center justify-center p-1">
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" className="w-full h-full object-cover rounded-2xl" />
            ) : (
              <Store className="w-10 h-10 text-gray-300" />
            )}
            
            <label className="absolute bottom-1 right-1 bg-primary text-white p-1.5 rounded-full cursor-pointer hover:bg-orange-600 shadow-sm transition-colors">
              <Upload className="w-3.5 h-3.5" />
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleImageUpload(e, 'logo')}
                disabled={logoUploading}
              />
            </label>

            {logoUploading && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-[10px] font-bold">
                Uploading...
              </div>
            )}
          </div>

          <div className="pt-12 sm:pt-20 text-center sm:text-left space-y-1">
            <h3 className="font-headline-lg text-lg text-on-surface font-black">
              {watch('name') || 'Your Restaurant Name'}
            </h3>
            <p className="text-secondary text-xs font-semibold">{watch('cuisine') || 'Cuisines separated by dots'}</p>
          </div>
        </div>

        {/* Info Forms */}
        <div className="bg-white p-6 rounded-3xl border border-outline-variant/10 shadow-xs space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            
            {/* Restaurant Name */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-500 uppercase">Restaurant Name</label>
              <input
                type="text"
                {...register('name', { required: 'Restaurant name is required' })}
                className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-primary focus:outline-none"
              />
              {errors.name && <p className="text-[10px] text-red-500 font-semibold">{errors.name.message}</p>}
            </div>

            {/* Timings Toggle Status */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-500 uppercase">Shop Status</label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setValue('status', 'Open')}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-all ${
                    activeStatus === 'Open'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300 shadow-xs'
                      : 'bg-white text-secondary border-outline-variant/20 hover:bg-gray-50'
                  }`}
                >
                  🟢 Open for Deliveries
                </button>
                <button
                  type="button"
                  onClick={() => setValue('status', 'Closed')}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-all ${
                    activeStatus === 'Closed'
                      ? 'bg-red-50 text-red-700 border-red-300 shadow-xs'
                      : 'bg-white text-secondary border-outline-variant/20 hover:bg-gray-50'
                  }`}
                >
                  🔴 Closed
                </button>
              </div>
            </div>

            {/* Cuisine list */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-500 uppercase">Cuisine Specialties</label>
              <input
                type="text"
                placeholder="e.g. Biryani • Fast Food • Desserts"
                {...register('cuisine', { required: 'Cuisine descriptors are required' })}
                className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-primary focus:outline-none"
              />
              {errors.cuisine && <p className="text-[10px] text-red-500 font-semibold">{errors.cuisine.message}</p>}
            </div>

            {/* Contact Phone */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-500 uppercase">Store Contact Number</label>
              <input
                type="text"
                {...register('contactNumber')}
                className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-primary focus:outline-none"
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="block text-xs font-bold text-gray-500 uppercase">Business Description</label>
              <textarea
                rows={3}
                {...register('description')}
                className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-primary focus:outline-none resize-none"
              />
            </div>

            {/* Address */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="block text-xs font-bold text-gray-500 uppercase">Physical Address</label>
              <input
                type="text"
                {...register('address', { required: 'Shop address is required' })}
                className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-primary focus:outline-none"
              />
              {errors.address && <p className="text-[10px] text-red-500 font-semibold">{errors.address.message}</p>}
            </div>

            {/* Timings */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-500 uppercase">Opening Time</label>
              <input
                type="text"
                placeholder="e.g. 09:00 AM"
                {...register('openingTime')}
                className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-primary focus:outline-none"
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-500 uppercase">Closing Time</label>
              <input
                type="text"
                placeholder="e.g. 10:00 PM"
                {...register('closingTime')}
                className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-primary focus:outline-none"
              />
            </div>

            {/* Delivery parameters */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-500 uppercase">Delivery Radius (km)</label>
              <input
                type="number"
                {...register('deliveryRadius', { valueAsNumber: true })}
                className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-primary focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-500 uppercase">Est. Delivery Duration</label>
              <input
                type="text"
                placeholder="e.g. 25-30 min"
                {...register('deliveryTime')}
                className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-primary focus:outline-none"
              />
            </div>

            {/* Coordinates */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-500 uppercase">Location Latitude</label>
              <input
                type="number"
                step="any"
                {...register('lat', { valueAsNumber: true })}
                className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-primary focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-500 uppercase">Location Longitude</label>
              <input
                type="number"
                step="any"
                {...register('lng', { valueAsNumber: true })}
                className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-primary focus:outline-none"
              />
            </div>

          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-outline-variant/10">
            <button
              type="button"
              onClick={() => reset()}
              className="px-6 py-2.5 border border-outline-variant/30 hover:bg-gray-50 font-bold text-xs rounded-xl"
            >
              Reset Changes
            </button>
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="px-6 py-2.5 bg-primary text-white font-bold text-xs hover:bg-orange-600 rounded-xl shadow-md disabled:bg-orange-300"
            >
              {updateMutation.isPending ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
