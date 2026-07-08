import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { api } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Upload,
  X,
  Filter,
  ToggleLeft,
  ToggleRight,
  TrendingUp,
  Sparkles,
  Award,
  Image as ImageIcon,
} from 'lucide-react';

interface FoodItemFields {
  _id?: string;
  name: string;
  description: string;
  price: number;
  discountPrice?: number;
  image: string;
  category: string;
  preparationTime: string;
  availableQuantity: number;
  availability: boolean;
  isVeg: boolean;
  isNonVeg: boolean;
  bestSeller: boolean;
  recommended: boolean;
  todaySpecial: boolean;
  restaurantId?: string;
}

export const MerchantMenu: React.FC = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<FoodItemFields | null>(null);
  const [imageUploading, setImageUploading] = useState(false);

  // Fetch Menu
  const { data: menuData, isLoading: menuLoading } = useQuery({
    queryKey: ['merchant-menu'],
    queryFn: async () => {
      const res = await api.get('/merchant/menu');
      return res.data.menu;
    },
  });

  // Fetch Categories
  const { data: catData } = useQuery({
    queryKey: ['merchant-categories'],
    queryFn: async () => {
      const res = await api.get('/merchant/categories');
      return res.data.categories;
    },
  });

  // Fetch Restaurants
  const { data: restaurantsData } = useQuery({
    queryKey: ['merchant-restaurants'],
    queryFn: async () => {
      const res = await api.get('/merchant/restaurants');
      return res.data.restaurants || [];
    },
  });

  const categories = catData || [];
  const restaurantsList = restaurantsData || [];

  // Register Form
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FoodItemFields>({
    defaultValues: {
      isVeg: true,
      availability: true,
      bestSeller: false,
      recommended: false,
      todaySpecial: false,
      price: 0,
      availableQuantity: 50,
      preparationTime: '20 min',
    },
  });

  // Add Item Mutation
  const addMutation = useMutation({
    mutationFn: async (data: FoodItemFields) => {
      const res = await api.post('/merchant/menu', data);
      return res.data;
    },
    onSuccess: (res) => {
      showToast(res.message, 'success');
      setModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['merchant-menu'] });
    },
    onError: (err: any) => {
      showToast(typeof err === 'string' ? err : 'Failed to add item', 'error');
    },
  });

  // Update Item Mutation
  const updateMutation = useMutation({
    mutationFn: async (data: FoodItemFields) => {
      const res = await api.put(`/merchant/menu/${data._id}`, data);
      return res.data;
    },
    onSuccess: (res) => {
      showToast(res.message, 'success');
      setModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['merchant-menu'] });
    },
    onError: (err: any) => {
      showToast(typeof err === 'string' ? err : 'Failed to update item', 'error');
    },
  });

  // Toggle Availability Mutation (Optimistic Update)
  const toggleMutation = useMutation({
    mutationFn: async ({ itemId, availability }: { itemId: string; availability: boolean }) => {
      const res = await api.put(`/merchant/menu/${itemId}`, { availability });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['merchant-menu'] });
    },
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async (itemId: string) => {
      const res = await api.delete(`/merchant/menu/${itemId}`);
      return res.data;
    },
    onSuccess: (res) => {
      showToast(res.message, 'success');
      queryClient.invalidateQueries({ queryKey: ['merchant-menu'] });
    },
    onError: (err: any) => {
      showToast(typeof err === 'string' ? err : 'Failed to delete item', 'error');
    },
  });

  // Image Upload Trigger
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    setImageUploading(true);
    try {
      const res = await api.post('/merchant/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setValue('image', res.data.url);
      showToast('Image uploaded successfully!', 'success');
    } catch (err: any) {
      showToast(typeof err === 'string' ? err : 'Upload failed', 'error');
    } finally {
      setImageUploading(false);
    }
  };

  const openAddModal = () => {
    setSelectedItem(null);
    reset({
      name: '',
      description: '',
      price: 0,
      discountPrice: undefined,
      image: '',
      category: categories[0]?.name.toLowerCase() || 'mains',
      preparationTime: '20 min',
      availableQuantity: 50,
      availability: true,
      isVeg: true,
      isNonVeg: false,
      bestSeller: false,
      recommended: false,
      todaySpecial: false,
      restaurantId: '',
    });
    setModalOpen(true);
  };

  const openEditModal = (item: FoodItemFields) => {
    setSelectedItem(item);
    reset(item);
    setModalOpen(true);
  };

  const onSubmit = (data: FoodItemFields) => {
    // If veg toggle is unchecked, make sure isNonVeg is correct
    const payload = {
      ...data,
      isNonVeg: !data.isVeg,
    };
    if (selectedItem) {
      updateMutation.mutate(payload);
    } else {
      addMutation.mutate(payload);
    }
  };

  const menu = menuData || [];

  // Filter menu items locally
  const filteredMenu = useMemo(() => {
    return menu.filter((item: any) => {
      const matchSearch =
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCategory =
        selectedCategory === 'all' || item.category.toLowerCase() === selectedCategory.toLowerCase();
      return matchSearch && matchCategory;
    });
  }, [menu, searchTerm, selectedCategory]);

  const imageUrl = watch('image');
  const isVegWatch = watch('isVeg');

  return (
    <div className="space-y-8 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-headline-lg text-xl md:text-2xl text-on-surface font-black">Menu Management</h2>
          <p className="text-secondary font-body-sm text-xs mt-1">Configure your food offerings, pricing tags, and daily recommendation lists.</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-primary text-white font-bold text-xs rounded-xl shadow-md hover:bg-orange-600 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Food Item
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search menu items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-outline-variant/30 rounded-xl pl-10 pr-4 py-2 text-xs focus:ring-1 focus:ring-primary focus:outline-none shadow-xs"
          />
        </div>

        {/* Category Selector */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-secondary" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-white border border-outline-variant/30 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-primary focus:outline-none shadow-xs"
          >
            <option value="all">All Categories</option>
            {categories.map((c: any) => (
              <option key={c._id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Menu Table */}
      {menuLoading ? (
        <div className="bg-white rounded-3xl border border-outline-variant/10 shadow-xs p-6 space-y-4">
          <div className="h-10 bg-gray-200 rounded-lg animate-pulse" />
          <div className="h-20 bg-gray-200 rounded-lg animate-pulse" />
          <div className="h-20 bg-gray-200 rounded-lg animate-pulse" />
        </div>
      ) : filteredMenu.length > 0 ? (
        <div className="bg-white rounded-3xl border border-outline-variant/10 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low border-b border-outline-variant/10 text-secondary text-[10px] uppercase font-bold tracking-wider">
                  <th className="px-6 py-4">Item Details</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Price</th>
                  <th className="px-6 py-4">Stock</th>
                  <th className="px-6 py-4">Highlights</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {filteredMenu.map((item: any) => (
                  <tr key={item._id} className="hover:bg-surface-container-low/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c'}
                          alt={item.name}
                          className="w-12 h-12 rounded-xl object-cover border border-outline-variant/20"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`w-3.5 h-3.5 border-2 flex items-center justify-center flex-shrink-0 ${
                                item.isVeg ? 'border-green-600' : 'border-red-600'
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  item.isVeg ? 'bg-green-600' : 'bg-red-600'
                                }`}
                              />
                            </span>
                            <h4 className="text-xs font-bold text-on-surface truncate">{item.name}</h4>
                          </div>
                          <p className="text-[10px] text-secondary truncate max-w-[180px] mt-0.5">
                            {item.description || 'No description'}
                          </p>
                          {item.restaurantId && (
                            <span className="text-[9px] text-primary bg-orange-50 px-1.5 py-0.5 rounded-md font-bold mt-1 inline-block">
                              🏪 {restaurantsList.find((r: any) => r._id === item.restaurantId)?.name || 'Linked Restaurant'}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold text-secondary uppercase">
                      {item.category}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-xs">
                        {item.discountPrice ? (
                          <>
                            <span className="font-bold text-on-surface">₹{item.discountPrice}</span>
                            <span className="text-secondary line-through font-semibold text-[10px]">
                              ₹{item.price}
                            </span>
                          </>
                        ) : (
                          <span className="font-bold text-on-surface">₹{item.price}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-secondary font-semibold">
                      {item.availableQuantity} qty
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-1.5">
                        {item.bestSeller && (
                          <span
                            className="p-1 bg-amber-50 text-amber-600 rounded-lg hover:title-tooltip"
                            title="Bestseller"
                          >
                            <TrendingUp className="w-3.5 h-3.5" />
                          </span>
                        )}
                        {item.recommended && (
                          <span
                            className="p-1 bg-blue-50 text-blue-600 rounded-lg"
                            title="Recommended"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                          </span>
                        )}
                        {item.todaySpecial && (
                          <span
                            className="p-1 bg-purple-50 text-purple-600 rounded-lg"
                            title="Today's Special"
                          >
                            <Award className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() =>
                          toggleMutation.mutate({ itemId: item._id, availability: !item.availability })
                        }
                        className="text-secondary hover:text-on-surface transition-colors"
                      >
                        {item.availability ? (
                          <ToggleRight className="w-6 h-6 text-primary" />
                        ) : (
                          <ToggleLeft className="w-6 h-6 text-gray-400" />
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(item)}
                          className="p-1.5 text-secondary hover:text-primary hover:bg-orange-50 rounded-lg transition-all"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Are you sure you want to delete ${item.name}?`)) {
                              deleteMutation.mutate(item._id);
                            }
                          }}
                          className="p-1.5 text-secondary hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-16 text-secondary bg-white rounded-3xl border border-outline-variant/10 shadow-xs flex flex-col items-center">
          <span className="material-symbols-outlined text-5xl text-gray-300 mb-2">search_off</span>
          <p className="text-xs font-bold">No food items found matching searches</p>
          <p className="text-[10px] text-gray-400">Click "Add Food Item" to expand your kitchen menu list.</p>
        </div>
      )}

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-2xl border border-outline-variant/10 shadow-lg max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="px-6 py-4 border-b border-outline-variant/10 flex justify-between items-center">
              <h3 className="font-headline-lg text-sm text-on-surface font-black">
                {selectedItem ? 'Edit Menu Item Details' : 'Add Food Item to Menu'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 text-secondary hover:text-on-surface hover:bg-surface-container-low rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Image Upload Block */}
                <div className="sm:col-span-2 flex items-center gap-4">
                  <div className="relative w-20 h-20 bg-gray-50 border border-outline-variant/20 rounded-2xl overflow-hidden flex items-center justify-center">
                    {imageUrl ? (
                      <img src={imageUrl} alt="preview" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-gray-300" />
                    )}
                    {imageUploading && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white text-[9px] font-bold">
                        Uploading...
                      </div>
                    )}
                  </div>
                  <div className="space-y-1.5 text-left flex-1">
                    <label className="block text-[10px] font-bold text-gray-500 uppercase">Item Image Banner</label>
                    <label className="flex items-center gap-1.5 px-4 py-2 border border-outline-variant/30 hover:bg-gray-50 text-xs font-bold rounded-xl cursor-pointer w-fit text-secondary hover:text-on-surface transition-colors">
                      <Upload className="w-3.5 h-3.5" />
                      Choose File
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                        disabled={imageUploading}
                      />
                    </label>
                  </div>
                </div>

                {/* Name */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase">Dish Name</label>
                  <input
                    type="text"
                    {...register('name', { required: 'Dish name is required' })}
                    className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-primary focus:outline-none"
                  />
                  {errors.name && <p className="text-[10px] text-red-500 font-semibold">{errors.name.message}</p>}
                </div>

                {/* Category */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase">Section Category</label>
                  <select
                    {...register('category', { required: true })}
                    className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-primary focus:outline-none"
                  >
                    {categories.map((c: any) => (
                      <option key={c._id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Link to Restaurant */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase">Link to Restaurant</label>
                  <select
                    {...register('restaurantId')}
                    className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-primary focus:outline-none"
                  >
                    <option value="">None (General menu item)</option>
                    {restaurantsList.map((r: any) => (
                      <option key={r._id} value={r._id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Price */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase">Retail Price (₹)</label>
                  <input
                    type="number"
                    {...register('price', { required: 'Retail price is required', valueAsNumber: true })}
                    className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-primary focus:outline-none"
                  />
                  {errors.price && <p className="text-[10px] text-red-500 font-semibold">{errors.price.message}</p>}
                </div>

                {/* Discount Price */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase">Discount Offer Price (₹)</label>
                  <input
                    type="number"
                    {...register('discountPrice', { valueAsNumber: true })}
                    className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-primary focus:outline-none"
                  />
                </div>

                {/* Stock Quantity */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase">Available Quantity (Stock)</label>
                  <input
                    type="number"
                    {...register('availableQuantity', { valueAsNumber: true })}
                    className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-primary focus:outline-none"
                  />
                </div>

                {/* Prep Time */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase">Preparation Duration</label>
                  <input
                    type="text"
                    placeholder="e.g. 20 min"
                    {...register('preparationTime')}
                    className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-primary focus:outline-none"
                  />
                </div>

                {/* Description */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase">Dish Description</label>
                  <textarea
                    rows={2}
                    {...register('description')}
                    className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-primary focus:outline-none resize-none"
                  />
                </div>

                {/* Diet Classification */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase">Diet Category</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setValue('isVeg', true)}
                      className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-all ${
                        isVegWatch
                          ? 'bg-green-50 text-green-700 border-green-300'
                          : 'bg-white text-secondary border-outline-variant/20 hover:bg-gray-50'
                      }`}
                    >
                      🟢 Pure Veg
                    </button>
                    <button
                      type="button"
                      onClick={() => setValue('isVeg', false)}
                      className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-all ${
                        !isVegWatch
                          ? 'bg-red-50 text-red-700 border-red-300'
                          : 'bg-white text-secondary border-outline-variant/20 hover:bg-gray-50'
                      }`}
                    >
                      🔴 Non-Veg
                    </button>
                  </div>
                </div>

                {/* Toggle Highlights */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase">Promotional Badges</label>
                  <div className="flex flex-wrap gap-2.5 pt-1">
                    <label className="flex items-center gap-1.5 px-3 py-1.5 border border-outline-variant/35 rounded-xl text-xs font-bold text-secondary cursor-pointer select-none">
                      <input type="checkbox" {...register('bestSeller')} className="accent-primary" />
                      Bestseller
                    </label>
                    <label className="flex items-center gap-1.5 px-3 py-1.5 border border-outline-variant/35 rounded-xl text-xs font-bold text-secondary cursor-pointer select-none">
                      <input type="checkbox" {...register('recommended')} className="accent-primary" />
                      Recommended
                    </label>
                    <label className="flex items-center gap-1.5 px-3 py-1.5 border border-outline-variant/35 rounded-xl text-xs font-bold text-secondary cursor-pointer select-none">
                      <input type="checkbox" {...register('todaySpecial')} className="accent-primary" />
                      Today's Special
                    </label>
                  </div>
                </div>

              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-outline-variant/10">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-5 py-2.5 border border-outline-variant/30 hover:bg-gray-50 font-bold text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addMutation.isPending || updateMutation.isPending}
                  className="px-5 py-2.5 bg-primary text-white font-bold text-xs hover:bg-orange-600 rounded-xl shadow-md disabled:bg-orange-300"
                >
                  {addMutation.isPending || updateMutation.isPending ? 'Saving...' : 'Save Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
