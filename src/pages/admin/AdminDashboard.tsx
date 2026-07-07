import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';
import {
  IndianRupee,
  Users,
  UtensilsCrossed,
  ShoppingBag,
  TrendingUp,
  Clock,
  Download,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  // Fetch platform aggregated metrics
  const { data: statsData, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const res = await api.get('/admin/stats');
      return res.data.stats;
    },
  });

  const stats = statsData || {
    totalCustomers: 0,
    totalRestaurants: 0,
    totalDeliveryPartners: 0,
    ordersToday: 0,
    ordersThisWeek: 0,
    revenueToday: 0,
    revenueThisMonth: 0,
    cancellationRate: 0,
    averageDeliveryTime: '24 min',
    topRestaurants: [],
    topFoods: [],
  };

  const handleExportCSV = (reportType: string) => {
    // Generate simulated CSV payload
    const csvContent = 'data:text/csv;charset=utf-8,ID,Date,Metrics,Total\n1,2026-07-06,Simulated ' + reportType + ',4500\n2,2026-07-05,Simulated Data,3800';
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `FRETZA_${reportType}_Report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <div className="px-gutter py-24 text-center space-y-4">
        <span className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin inline-block"></span>
        <p className="text-xs text-secondary font-bold">Aggregating FRETZA platform logs...</p>
      </div>
    );
  }

  return (
    <div className="px-gutter py-6 max-w-5xl mx-auto space-y-6 text-left">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="font-headline-lg text-lg font-black text-on-surface">Platform Overview</h2>
          <p className="text-secondary font-body-sm text-[10px]">Real-time operational monitoring & revenue indexes in Khunta.</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => handleExportCSV('Sales')}
            className="px-4 py-2 border border-outline-variant/20 hover:bg-gray-100 text-[10px] font-bold text-secondary rounded-xl flex items-center gap-1.5 bg-white transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Aggregate Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-outline-variant/10 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-700 rounded-xl">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[9px] text-secondary font-bold uppercase tracking-wider">Total Users</span>
            <h3 className="text-base font-black text-on-surface mt-0.5">
              {stats.totalCustomers + stats.totalDeliveryPartners}
            </h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-outline-variant/10 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-purple-50 text-purple-700 rounded-xl">
            <UtensilsCrossed className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[9px] text-secondary font-bold uppercase tracking-wider">Restaurants</span>
            <h3 className="text-base font-black text-on-surface mt-0.5">{stats.totalRestaurants}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-outline-variant/10 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-green-50 text-green-700 rounded-xl">
            <IndianRupee className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[9px] text-secondary font-bold uppercase tracking-wider">Today's Revenue</span>
            <h3 className="text-base font-black text-on-surface mt-0.5">₹{stats.revenueToday}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-outline-variant/10 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-orange-50 text-primary rounded-xl">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[9px] text-secondary font-bold uppercase tracking-wider">Today's Orders</span>
            <h3 className="text-base font-black text-on-surface mt-0.5">{stats.ordersToday}</h3>
          </div>
        </div>
      </div>

      {/* Analytics & Listings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left/Middle Column (Metrics chart + Top products list) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Growth visual box */}
          <section className="bg-white p-6 rounded-3xl border border-outline-variant/10 shadow-xs space-y-4">
            <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1.5 border-b border-gray-100 pb-3">
              <TrendingUp className="w-4 h-4 text-primary" />
              Weekly Sales Volume (Simulated Graph)
            </h4>

            {/* Simple Inline SVG Line Chart */}
            <div className="pt-2">
              <svg viewBox="0 0 400 100" className="w-full h-32 stroke-primary fill-orange-50/30">
                <path
                  d="M 10 90 Q 70 80, 130 50 T 250 30 T 380 15 L 380 90 L 10 90 Z"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <circle cx="130" cy="50" r="4" fill="#ea580c" />
                <circle cx="250" cy="30" r="4" fill="#ea580c" />
                <circle cx="380" cy="15" r="4" fill="#ea580c" />
              </svg>
              <div className="flex justify-between text-[9px] text-secondary font-bold px-2.5 mt-2">
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span>Sat</span>
                <span>Sun</span>
              </div>
            </div>
          </section>

          {/* Top Selling Food Items */}
          <section className="bg-white p-6 rounded-3xl border border-outline-variant/10 shadow-xs space-y-4">
            <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1.5 border-b border-gray-100 pb-3">
              <ShoppingBag className="w-4 h-4 text-primary" />
              Top Selling Delicacies
            </h4>

            <div className="divide-y divide-gray-100">
              {stats.topFoods.length > 0 ? (
                stats.topFoods.map((food: any, idx: number) => (
                  <div key={idx} className="py-2.5 flex justify-between items-center text-xs">
                    <span className="font-bold text-on-surface">{food.name}</span>
                    <span className="text-secondary font-medium">{food.quantity} units sold</span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-secondary py-4">No sales recorded yet.</p>
              )}
            </div>
          </section>
        </div>

        {/* Right Column (Side Metrics) */}
        <div className="space-y-6">
          
          {/* Operations Card */}
          <section className="bg-white p-6 rounded-3xl border border-outline-variant/10 shadow-xs space-y-4">
            <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1.5 border-b border-gray-100 pb-3">
              <Clock className="w-4 h-4 text-primary" />
              Service Performance
            </h4>

            <div className="space-y-4 pt-1">
              <div className="flex justify-between items-center text-xs">
                <span className="text-secondary">Average Delivery Time</span>
                <span className="font-black text-on-surface">{stats.averageDeliveryTime}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-secondary">Cancellation Rate</span>
                <span className="font-black text-red-600">{stats.cancellationRate}%</span>
              </div>
            </div>
          </section>

          {/* Top Outlets card */}
          <section className="bg-white p-6 rounded-3xl border border-outline-variant/10 shadow-xs space-y-4">
            <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1.5 border-b border-gray-100 pb-3">
              <UtensilsCrossed className="w-4 h-4 text-primary" />
              Top Outlets By Sales
            </h4>

            <div className="space-y-3 pt-1">
              {stats.topRestaurants.length > 0 ? (
                stats.topRestaurants.map((res: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-center text-xs">
                    <span className="font-bold text-on-surface">{res.name}</span>
                    <span className="text-green-700 font-black">₹{res.sales}</span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-secondary py-2">No outlet sales recorded yet.</p>
              )}
            </div>
          </section>

        </div>
      </div>

    </div>
  );
};
