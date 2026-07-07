import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import { Plus, Edit2, Trash2, X, FolderPlus } from 'lucide-react';

interface CategoryFields {
  _id?: string;
  name: string;
  icon: string;
}

export const MerchantCategories: React.FC = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCat, setSelectedCat] = useState<CategoryFields | null>(null);
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('restaurant');

  // Fetch Categories
  const { data: categoriesData, isLoading } = useQuery<CategoryFields[]>({
    queryKey: ['merchant-categories'],
    queryFn: async () => {
      const res = await api.get('/merchant/categories');
      return res.data.categories;
    },
  });

  // Create Mutation
  const addMutation = useMutation({
    mutationFn: async (data: CategoryFields) => {
      const res = await api.post('/merchant/categories', data);
      return res.data;
    },
    onSuccess: (res) => {
      showToast(res.message, 'success');
      setModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['merchant-categories'] });
    },
    onError: (err: any) => {
      showToast(typeof err === 'string' ? err : 'Category creation failed', 'error');
    },
  });

  // Edit Mutation
  const updateMutation = useMutation({
    mutationFn: async (data: CategoryFields) => {
      const res = await api.put(`/merchant/categories/${data._id}`, { name: data.name, icon: data.icon });
      return res.data;
    },
    onSuccess: (res) => {
      showToast(res.message, 'success');
      setModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['merchant-categories'] });
    },
    onError: (err: any) => {
      showToast(typeof err === 'string' ? err : 'Category update failed', 'error');
    },
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/merchant/categories/${id}`);
      return res.data;
    },
    onSuccess: (res) => {
      showToast(res.message, 'success');
      queryClient.invalidateQueries({ queryKey: ['merchant-categories'] });
    },
    onError: (err: any) => {
      showToast(typeof err === 'string' ? err : 'Category deletion failed', 'error');
    },
  });

  const openAddModal = () => {
    setSelectedCat(null);
    setName('');
    setIcon('restaurant');
    setModalOpen(true);
  };

  const openEditModal = (cat: CategoryFields) => {
    setSelectedCat(cat);
    setName(cat.name);
    setIcon(cat.icon);
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (selectedCat) {
      updateMutation.mutate({ _id: selectedCat._id, name, icon });
    } else {
      addMutation.mutate({ name, icon });
    }
  };

  const categories = categoriesData || [];

  return (
    <div className="space-y-8 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-headline-lg text-xl md:text-2xl text-on-surface font-black">Food Categories</h2>
          <p className="text-secondary font-body-sm text-xs mt-1">Manage dietary tags and menus categorization folders.</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-primary text-white font-bold text-xs rounded-xl shadow-md hover:bg-orange-600 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Category
        </button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 animate-pulse">
          <div className="h-20 bg-gray-200 rounded-2xl" />
          <div className="h-20 bg-gray-200 rounded-2xl" />
          <div className="h-20 bg-gray-200 rounded-2xl" />
        </div>
      ) : categories.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <div
              key={cat._id}
              className="bg-white p-4 rounded-2xl border border-outline-variant/10 shadow-xs flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-2xl text-primary">{cat.icon}</span>
                <span className="text-xs font-bold text-on-surface">{cat.name}</span>
              </div>

              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                <button
                  onClick={() => openEditModal(cat)}
                  className="p-1 hover:bg-orange-50 text-secondary hover:text-primary rounded-lg"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => {
                    if (window.confirm(`Are you sure you want to delete the ${cat.name} category?`)) {
                      deleteMutation.mutate(cat._id!);
                    }
                  }}
                  className="p-1 hover:bg-red-50 text-secondary hover:text-red-600 rounded-lg"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-secondary bg-white rounded-3xl border border-outline-variant/10 shadow-xs flex flex-col items-center">
          <FolderPlus className="w-12 h-12 text-gray-300 mb-2" />
          <p className="text-xs font-bold">No food categories configured</p>
          <p className="text-[10px] text-gray-400">Click "Add Category" to set up your primary cuisine classifications.</p>
        </div>
      )}

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl w-full max-w-md border border-outline-variant/10 shadow-lg">
            <div className="px-6 py-4 border-b border-outline-variant/10 flex justify-between items-center">
              <h3 className="font-headline-lg text-sm text-on-surface font-black">
                {selectedCat ? 'Edit Category' : 'Create New Category'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 text-secondary hover:text-on-surface hover:bg-surface-container-low rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-500 uppercase">Category Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Biryani"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-primary focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-500 uppercase">Google Font Material Icon Name</label>
                <input
                  type="text"
                  placeholder="e.g. local_pizza, lunch_dining, coffee"
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-primary focus:outline-none"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-outline-variant/30 hover:bg-gray-50 font-bold text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addMutation.isPending || updateMutation.isPending}
                  className="px-5 py-2 bg-primary text-white font-bold text-xs hover:bg-orange-600 rounded-xl shadow-md"
                >
                  {addMutation.isPending || updateMutation.isPending ? 'Saving...' : 'Save Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
