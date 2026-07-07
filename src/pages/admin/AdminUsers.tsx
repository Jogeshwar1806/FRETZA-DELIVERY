import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import {
  Users,
  Search,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react';

export const AdminUsers: React.FC = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<'All' | 'Customer' | 'Restaurant Owner' | 'Delivery Partner'>('All');

  // Fetch Users
  const { data: usersData, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const res = await api.get('/admin/users');
      return res.data.users || [];
    },
  });

  // Update User Role/Verify Mutation
  const updateUserMutation = useMutation({
    mutationFn: async ({ userId, data }: { userId: string; data: any }) => {
      const res = await api.put(`/admin/users/${userId}`, data);
      return res.data.user;
    },
    onSuccess: () => {
      showToast('User preferences modified successfully', 'success');
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: (err: any) => {
      showToast(typeof err === 'string' ? err : 'Profile modification failed', 'error');
    },
  });

  const users = usersData || [];

  // Filter & Search
  const filteredUsers = users.filter((u: any) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.phone.includes(searchQuery);

    if (filterRole === 'All') return matchesSearch;
    return matchesSearch && u.role === filterRole;
  });

  return (
    <div className="px-gutter py-6 max-w-5xl mx-auto space-y-6 text-left">
      
      {/* Title */}
      <div>
        <h2 className="font-headline-lg text-lg font-black text-on-surface">User Control Panel</h2>
        <p className="text-secondary font-body-sm text-[10px]">Verify delivery accounts, adjust permissions, and manage user roles.</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-2">
        {(['All', 'Customer', 'Restaurant Owner', 'Delivery Partner'] as const).map((role) => (
          <button
            key={role}
            onClick={() => setFilterRole(role)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
              filterRole === role
                ? 'bg-primary text-white border-primary'
                : 'bg-white text-secondary border-outline-variant/20 hover:bg-gray-50'
            }`}
          >
            {role === 'All' ? 'All Accounts' : role}
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-secondary" />
        <input
          type="text"
          placeholder="Search by full name or phone number..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white border border-outline-variant/20 rounded-xl pl-10 pr-4 py-2.5 text-xs focus:ring-1 focus:ring-primary focus:outline-none"
        />
      </div>

      {/* Users table */}
      {isLoading ? (
        <div className="space-y-3">
          <div className="h-16 bg-gray-100 rounded-2xl animate-pulse" />
          <div className="h-16 bg-gray-100 rounded-2xl animate-pulse" />
        </div>
      ) : filteredUsers.length > 0 ? (
        <div className="bg-white rounded-3xl border border-outline-variant/10 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low border-b border-outline-variant/10 text-secondary font-bold">
                  <th className="p-4">Name</th>
                  <th className="p-4">Contact Phone</th>
                  <th className="p-4">System Role</th>
                  <th className="p-4">Delivery Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {filteredUsers.map((u: any) => (
                  <tr key={u._id} className="hover:bg-gray-50/50">
                    <td className="p-4 font-bold text-on-surface">{u.name}</td>
                    <td className="p-4 text-secondary">{u.phone}</td>
                    <td className="p-4">
                      <select
                        value={u.role}
                        onChange={(e) => updateUserMutation.mutate({ userId: u._id, data: { role: e.target.value } })}
                        className="bg-surface-container-low border border-outline-variant/20 rounded-lg px-2.5 py-1 focus:outline-none"
                      >
                        <option value="Customer">Customer</option>
                        <option value="Restaurant Owner">Restaurant Owner</option>
                        <option value="Delivery Partner">Delivery Partner</option>
                        <option value="Admin">Admin</option>
                      </select>
                    </td>
                    <td className="p-4">
                      {u.role === 'Delivery Partner' ? (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => updateUserMutation.mutate({
                              userId: u._id,
                              data: { isVerified: !u.deliveryProfile?.isVerified }
                            })}
                            className={`px-2 py-0.5 rounded-md font-bold text-[9px] uppercase tracking-wider flex items-center gap-1 ${
                              u.deliveryProfile?.isVerified
                                ? 'bg-green-100 text-green-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {u.deliveryProfile?.isVerified ? (
                              <>
                                <ShieldCheck className="w-3 h-3" />
                                Verified
                              </>
                            ) : (
                              <>
                                <ShieldAlert className="w-3 h-3" />
                                Verify Account
                              </>
                            )}
                          </button>
                        </div>
                      ) : (
                        <span className="text-[10px] text-gray-400">N/A</span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      {u.role === 'Delivery Partner' && !u.deliveryProfile?.isVerified && (
                        <button
                          onClick={() => updateUserMutation.mutate({ userId: u._id, data: { isVerified: true } })}
                          className="text-primary hover:underline font-bold"
                        >
                          Approve Rider
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-16 bg-white border border-dashed border-gray-200 rounded-3xl">
          <Users className="w-8 h-8 text-gray-300 mx-auto" />
          <h4 className="text-xs font-bold text-on-surface mt-2">No users matching filter</h4>
        </div>
      )}

    </div>
  );
};
