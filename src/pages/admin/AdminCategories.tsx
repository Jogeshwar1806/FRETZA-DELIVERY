import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import { Plus, Edit2, Trash2, X, Folder, AlertCircle } from 'lucide-react';

interface CategoryFields {
  _id?: string;
  name: string;
  icon: string;
  createdAt?: string;
}

export const AdminCategories: React.FC = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCat, setSelectedCat] = useState<CategoryFields | null>(null);
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('restaurant');

  // Fetch Master Categories
  const { data: categoriesData, isLoading } = useQuery<CategoryFields[]>({
    queryKey: ['admin-categories'],
    queryFn: async () => {
      const res = await api.get('/admin/categories');
      return res.data.categories || [];
    },
  });

  // Create Mutation
  const addMutation = useMutation({
    mutationFn: async (data: CategoryFields) => {
      const res = await api.post('/admin/categories', data);
      return res.data;
    },
    onSuccess: (res) => {
      showToast(res.message, 'success');
      setModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
    },
    onError: (err: any) => {
      showToast(typeof err === 'string' ? err : 'Category creation failed', 'error');
    },
  });

  // Edit Mutation
  const updateMutation = useMutation({
    mutationFn: async (data: CategoryFields) => {
      const res = await api.put(`/admin/categories/${data._id}`, { name: data.name, icon: data.icon });
      return res.data;
    },
    onSuccess: (res) => {
      showToast(res.message, 'success');
      setModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
    },
    onError: (err: any) => {
      showToast(typeof err === 'string' ? err : 'Category update failed', 'error');
    },
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/admin/categories/${id}`);
      return res.data;
    },
    onSuccess: (res) => {
      showToast(res.message, 'success');
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
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
    <div className="px-gutter py-6 max-w-5xl mx-auto space-y-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-headline-lg text-lg font-black text-on-surface">Categories Master Data</h2>
          <p className="text-secondary font-body-sm text-[10px]">Create, update, and manage global menu categories across the FRETZA platform.</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-primary text-white font-bold text-xs rounded-xl shadow-md hover:bg-orange-600 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Master Category
        </button>
      </div>

      {/* Info notice */}
      <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl flex gap-3 text-blue-800 text-xs">
        <AlertCircle className="w-5 h-5 shrink-0 text-blue-600" />
        <div>
          <span className="font-bold">Admin Notice:</span> These categories represent master platform data. Merchants can view and assign products to these tags, but only platform administrators have permissions to add, edit, or delete categories.
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          <div className="h-16 bg-gray-100 rounded-2xl animate-pulse" />
          <div className="h-16 bg-gray-100 rounded-2xl animate-pulse" />
        </div>
      ) : categories.length > 0 ? (
        <div className="bg-white rounded-3xl border border-outline-variant/10 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low border-b border-outline-variant/10 text-secondary font-bold">
                  <th className="p-4">Icon</th>
                  <th className="p-4">Category Name</th>
                  <th className="p-4">Created Date</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {categories.map((cat) => (
                  <tr key={cat._id} className="hover:bg-gray-50/50">
                    <td className="p-4">
                      <span className="material-symbols-outlined text-2xl text-primary">{cat.icon}</span>
                    </td>
                    <td className="p-4 font-bold text-on-surface">{cat.name}</td>
                    <td className="p-4 text-secondary">
                      {cat.createdAt ? new Date(cat.createdAt).toLocaleDateString() : 'System Seeded'}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => openEditModal(cat)}
                          className="p-2 border border-outline-variant/20 hover:bg-gray-50 text-secondary rounded-lg"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Are you sure you want to delete the master category "${cat.name}"?`)) {
                              deleteMutation.mutate(cat._id!);
                            }
                          }}
                          className="p-2 border border-outline-variant/20 hover:bg-red-50 text-red-600 rounded-lg"
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
        <div className="text-center py-16 bg-white border border-dashed border-gray-200 rounded-3xl">
          <Folder className="w-8 h-8 text-gray-300 mx-auto" />
          <h4 className="text-xs font-bold text-on-surface mt-2">No categories found</h4>
          <p className="text-[10px] text-gray-400 mt-1">Click "Add Master Category" to get started.</p>
        </div>
      )}

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl w-full max-w-md border border-outline-variant/10 shadow-lg">
            <div className="px-6 py-4 border-b border-outline-variant/10 flex justify-between items-center">
              <h3 className="font-headline-lg text-sm text-on-surface font-black">
                {selectedCat ? 'Modify Category' : 'Create Master Category'}
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
                  placeholder="e.g. Biryani, Pizza, Grocery"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-primary focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-500 uppercase">Google Material Icon Name</label>
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
