import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { api } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import { Store, Upload, Image as ImageIcon, Plus, Pencil, Trash2, ArrowLeft, Loader2 } from 'lucide-react';

interface RestaurantDetails {
  _id: string;
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
}

interface FormFields {
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
}

export const MerchantProfile: React.FC = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [logoUploading, setLogoUploading] = useState(false);
  const [coverUploading, setCoverUploading] = useState(false);

  // Fetch all restaurants owned by the merchant
  const { data: restaurants, isLoading } = useQuery<RestaurantDetails[]>({
    queryKey: ['merchant-restaurants'],
    queryFn: async () => {
      const res = await api.get('/merchant/restaurants');
      return res.data.restaurants || [];
    },
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormFields>({
    defaultValues: {
      name: '',
      cuisine: '',
      address: '',
      description: '',
      logo: '',
      coverImage: '',
      openingTime: '09:00 AM',
      closingTime: '10:00 PM',
      deliveryRadius: 5,
      deliveryTime: '25-30 min',
      contactNumber: '',
      status: 'Open',
    },
  });

  // Handle Edit Action
  const handleEditClick = (restaurant: RestaurantDetails) => {
    setEditingId(restaurant._id);
    reset({
      name: restaurant.name || '',
      cuisine: restaurant.cuisine || '',
      address: restaurant.address || '',
      description: restaurant.description || '',
      logo: restaurant.logo || '',
      coverImage: restaurant.coverImage || '',
      openingTime: restaurant.openingTime || '09:00 AM',
      closingTime: restaurant.closingTime || '10:00 PM',
      deliveryRadius: restaurant.deliveryRadius || 5,
      deliveryTime: restaurant.deliveryTime || '25-30 min',
      contactNumber: restaurant.contactNumber || '',
      status: restaurant.status || 'Open',
    });
    setIsFormOpen(true);
  };

  // Handle Add Action
  const handleAddClick = () => {
    setEditingId(null);
    reset({
      name: '',
      cuisine: '',
      address: '',
      description: '',
      logo: '',
      coverImage: '',
      openingTime: '09:00 AM',
      closingTime: '10:00 PM',
      deliveryRadius: 5,
      deliveryTime: '25-30 min',
      contactNumber: '',
      status: 'Open',
    });
    setIsFormOpen(true);
  };

  // Mutations
  const createMutation = useMutation({
    mutationFn: async (data: FormFields) => {
      const res = await api.post('/merchant/restaurants', data);
      return res.data;
    },
    onSuccess: (res) => {
      showToast(res.message || 'Restaurant created successfully', 'success');
      queryClient.invalidateQueries({ queryKey: ['merchant-restaurants'] });
      setIsFormOpen(false);
    },
    onError: (err: any) => {
      showToast(typeof err === 'string' ? err : 'Creation failed', 'error');
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: FormFields) => {
      const res = await api.put(`/merchant/restaurants/${editingId}`, data);
      return res.data;
    },
    onSuccess: (res) => {
      showToast(res.message || 'Restaurant updated successfully', 'success');
      queryClient.invalidateQueries({ queryKey: ['merchant-restaurants'] });
      setIsFormOpen(false);
    },
    onError: (err: any) => {
      showToast(typeof err === 'string' ? err : 'Update failed', 'error');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/merchant/restaurants/${id}`);
      return res.data;
    },
    onSuccess: () => {
      showToast('Restaurant deleted successfully', 'success');
      queryClient.invalidateQueries({ queryKey: ['merchant-restaurants'] });
    },
    onError: (err: any) => {
      showToast(typeof err === 'string' ? err : 'Delete failed', 'error');
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
      showToast(`${field === 'logo' ? 'Logo' : 'Cover'} uploaded successfully!`, 'success');
    } catch (err: any) {
      showToast(typeof err === 'string' ? err : 'Upload failed', 'error');
    } finally {
      if (field === 'logo') setLogoUploading(false);
      else setCoverUploading(false);
    }
  };

  const onSubmit = (data: FormFields) => {
    if (editingId) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-left">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="text-xs text-secondary font-semibold">Loading restaurants list...</p>
      </div>
    );
  }

  const logoUrl = watch('logo');
  const coverUrl = watch('coverImage');
  const activeStatus = watch('status');

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-left">
      {!isFormOpen ? (
        // --- LIST VIEW ---
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div>
              <h2 className="font-headline-lg text-xl md:text-2xl text-on-surface font-black">Store Profiles</h2>
              <p className="text-secondary font-body-sm text-xs mt-1">Manage multiple restaurant profiles and service configurations under your owner account.</p>
            </div>
            <button
              onClick={handleAddClick}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl shadow-md hover:bg-orange-600 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Restaurant
            </button>
          </div>

          {restaurants && restaurants.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {restaurants.map((rest) => (
                <div key={rest._id} className="bg-white rounded-3xl border border-outline-variant/10 shadow-xs overflow-hidden flex flex-col justify-between">
                  {/* Banner & Logo */}
                  <div className="relative h-32 bg-gray-100 border-b border-outline-variant/10">
                    {rest.coverImage ? (
                      <img src={rest.coverImage} alt="Cover" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-surface-container-low" />
                    )}
                    
                    {/* Status Badge */}
                    <span className={`absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      rest.status === 'Open' ? 'bg-emerald-50 text-emerald-700 border border-emerald-300' : 'bg-red-50 text-red-700 border border-red-300'
                    }`}>
                      {rest.status === 'Open' ? '🟢 Open' : '🔴 Closed'}
                    </span>

                    {/* Logo Overlay */}
                    <div className="absolute -bottom-6 left-6 w-16 h-16 bg-white rounded-2xl border border-outline-variant/20 shadow-sm p-0.5">
                      {rest.logo ? (
                        <img src={rest.logo} alt="Logo" className="w-full h-full object-cover rounded-xl" />
                      ) : (
                        <div className="w-full h-full bg-gray-50 flex items-center justify-center rounded-xl text-gray-300">
                          <Store className="w-6 h-6" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-6 pt-8 space-y-3 flex-grow">
                    <h3 className="font-bold text-on-surface text-base">{rest.name}</h3>
                    <p className="text-secondary text-xs line-clamp-1">{rest.cuisine || 'No cuisines specified'}</p>
                    <p className="text-secondary text-[11px] font-medium leading-relaxed line-clamp-2">{rest.address}</p>
                    <div className="flex items-center gap-4 text-[10px] text-gray-400 font-bold pt-2">
                      <span>⏱️ {rest.deliveryTime || '25-30 min'}</span>
                      <span>📍 Radius: {rest.deliveryRadius || 5} km</span>
                    </div>
                  </div>

                  {/* Footer Actions */}
                  <div className="px-6 py-4 bg-surface-container-lowest border-t border-outline-variant/10 flex gap-2">
                    <button
                      onClick={() => handleEditClick(rest)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 border border-outline-variant/30 text-secondary hover:text-on-surface text-xs font-bold rounded-xl hover:bg-gray-50"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      Edit Details
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Are you sure you want to delete ${rest.name}?`)) {
                          deleteMutation.mutate(rest._id);
                        }
                      }}
                      className="px-3 py-2 border border-red-100 hover:border-red-200 text-red-500 hover:bg-red-50 text-xs font-bold rounded-xl"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-outline-variant/10 shadow-xs p-10 text-center space-y-4">
              <Store className="w-12 h-12 text-gray-300 mx-auto" />
              <div className="space-y-1">
                <h4 className="font-bold text-on-surface">No Restaurant Profiles Found</h4>
                <p className="text-xs text-secondary">Get started by creating your first restaurant profile.</p>
              </div>
              <button
                onClick={handleAddClick}
                className="px-5 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:bg-orange-600"
              >
                Add First Restaurant
              </button>
            </div>
          )}
        </div>
      ) : (
        // --- CREATE / EDIT FORM VIEW ---
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="p-2 border border-outline-variant/30 text-secondary hover:text-on-surface hover:bg-gray-50 rounded-xl"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h2 className="font-headline-lg text-xl text-on-surface font-black">
                {editingId ? 'Edit Restaurant Profile' : 'Create Restaurant Profile'}
              </h2>
              <p className="text-secondary font-body-sm text-xs">Specify store details, banners, logos, and operating range parameters.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Cover Banner Image Upload */}
            <div className="relative h-48 md:h-64 w-full rounded-3xl bg-gray-100 border border-outline-variant/20 overflow-hidden shadow-xs">
              {coverUrl ? (
                <img src={coverUrl} alt="Cover" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 gap-2">
                  <ImageIcon className="w-8 h-8" />
                  <span className="text-xs">No Cover Banner Configured</span>
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
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  Uploading Cover Banner...
                </div>
              )}
            </div>

            {/* Logo Upload overlay */}
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
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                  </div>
                )}
              </div>

              <div className="pt-12 sm:pt-20 text-center sm:text-left space-y-1">
                <h3 className="font-headline-lg text-lg text-on-surface font-black">
                  {watch('name') || 'Your Restaurant Name'}
                </h3>
                <p className="text-secondary text-xs font-semibold">{watch('cuisine') || 'Cuisines specialties'}</p>
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

                {/* Status Options */}
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

                {/* Specialties */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-500 uppercase">Cuisine Specialties</label>
                  <input
                    type="text"
                    placeholder="e.g. Biryani • Fast Food • Desserts"
                    {...register('cuisine', { required: 'Cuisine specialties are required' })}
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
                    {...register('address', { required: 'Address is required' })}
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

                {/* Radius parameters */}
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

              </div>

              {/* Form Buttons */}
              <div className="pt-4 flex justify-end gap-3 border-t border-outline-variant/10">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-6 py-2.5 border border-outline-variant/30 hover:bg-gray-50 font-bold text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="px-6 py-2.5 bg-primary text-white font-bold text-xs hover:bg-orange-600 rounded-xl shadow-md disabled:bg-orange-300"
                >
                  {createMutation.isPending || updateMutation.isPending ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
