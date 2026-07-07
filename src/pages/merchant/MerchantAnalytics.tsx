import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';
import {
  TrendingUp,
  ShoppingBag,
  IndianRupee,
  Users,
  Star,
  ArrowUpRight,
  Award,
} from 'lucide-react';

interface BestSellerItem {
  name: string;
  qty: number;
  revenue: number;
}

interface AnalyticsData {
  todayOrders: number;
  todayRevenue: number;
  weeklyRevenue: number;
  monthlyRevenue: number;
  totalCustomers: number;
  averageRating: number;
  bestSellers: BestSellerItem[];
}

export const MerchantAnalytics: React.FC = () => {
  // Fetch Analytics
  const { data: analytics, isLoading } = useQuery<AnalyticsData>({
    queryKey: ['merchant-analytics'],
    queryFn: async () => {
      const res = await api.get('/merchant/analytics');
      return res.data.analytics;
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse text-left">
        <div className="h-10 w-1/3 bg-gray-200 rounded-xl" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="h-24 bg-gray-200 rounded-2xl" />
          <div className="h-24 bg-gray-200 rounded-2xl" />
          <div className="h-24 bg-gray-200 rounded-2xl" />
          <div className="h-24 bg-gray-200 rounded-2xl" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-[250px] bg-gray-200 rounded-2xl" />
          <div className="h-[250px] bg-gray-200 rounded-2xl" />
        </div>
      </div>
    );
  }

  // Fallback structures if empty
  const bestSellers = analytics?.bestSellers || [];

  const statCards = [
    {
      label: "Today's Orders",
      value: analytics?.todayOrders ?? 0,
      sub: "Active customer queues",
      icon: ShoppingBag,
      color: 'text-blue-600 bg-blue-50',
    },
    {
      label: "Today's Revenue",
      value: `₹${analytics?.todayRevenue ?? 0}`,
      sub: "Completed order totals",
      icon: IndianRupee,
      color: 'text-emerald-600 bg-emerald-50',
    },
    {
      label: "Weekly Revenue",
      value: `₹${analytics?.weeklyRevenue ?? 0}`,
      sub: "Last 7 days sales",
      icon: TrendingUp,
      color: 'text-purple-600 bg-purple-50',
    },
    {
      label: "Monthly Revenue",
      value: `₹${analytics?.monthlyRevenue ?? 0}`,
      sub: "Last 30 days summary",
      icon: ArrowUpRight,
      color: 'text-cyan-600 bg-cyan-50',
    },
  ];

  // Dummy monthly points for inline SVG line chart rendering
  const monthlyTrendPoints = [
    { label: 'Week 1', val: Math.round((analytics?.monthlyRevenue ?? 0) * 0.15) },
    { label: 'Week 2', val: Math.round((analytics?.monthlyRevenue ?? 0) * 0.25) },
    { label: 'Week 3', val: Math.round((analytics?.monthlyRevenue ?? 0) * 0.35) },
    { label: 'Week 4', val: Math.round((analytics?.monthlyRevenue ?? 0) * 0.25) },
  ];

  const maxWeeklyPoint = Math.max(...monthlyTrendPoints.map((p) => p.val), 100);

  return (
    <div className="space-y-8 text-left">
      <div>
        <h2 className="font-headline-lg text-xl md:text-2xl text-on-surface font-black">Business Analytics</h2>
        <p className="text-secondary font-body-sm text-xs mt-1">Track financial reports, revenue indexes, and high-demand food rankings.</p>
      </div>

      {/* Counters */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="bg-white p-5 rounded-2xl border border-outline-variant/10 shadow-xs flex items-center justify-between"
            >
              <div className="space-y-1">
                <span className="text-[9px] font-bold text-secondary uppercase tracking-widest block">
                  {card.label}
                </span>
                <h3 className="font-headline-lg text-lg md:text-xl text-on-surface font-black">
                  {card.value}
                </h3>
                <span className="text-[10px] text-gray-400 block font-semibold">{card.sub}</span>
              </div>
              <div className={`p-3 rounded-xl ${card.color}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Graph Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Chart (Lightweight Responsive Inline SVG Layout) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-outline-variant/10 shadow-xs space-y-6">
          <div>
            <h3 className="font-headline-md text-sm text-on-surface font-black">Monthly Revenue Trends</h3>
            <p className="text-secondary font-body-sm text-[10px]">Sales progress across current week segments.</p>
          </div>

          {/* SVG Line Graph */}
          <div className="relative h-44 w-full flex items-end justify-between gap-4 pt-4 px-2">
            {monthlyTrendPoints.map((point, idx) => {
              const heightPct = (point.val / maxWeeklyPoint) * 75; // Cap at 75% height for markers
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group z-10">
                  {/* Tooltip value */}
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-on-surface text-surface-container-lowest text-[9px] px-2 py-0.5 rounded-lg shadow-sm font-bold -translate-y-1">
                    ₹{point.val}
                  </span>
                  
                  {/* Bar */}
                  <div className="w-8 sm:w-12 bg-orange-100 group-hover:bg-primary/20 rounded-t-lg transition-all relative overflow-hidden flex items-end justify-center" style={{ height: `${Math.max(heightPct, 5)}px` }}>
                    <div className="w-full bg-primary hover:bg-orange-600 transition-all rounded-t-lg" style={{ height: '35%' }} />
                  </div>

                  <span className="text-[9px] font-bold text-secondary uppercase tracking-wider">
                    {point.label}
                  </span>
                </div>
              );
            })}

            {/* Back grid line helper */}
            <div className="absolute inset-x-0 bottom-6 border-b border-outline-variant/15 pointer-events-none" />
            <div className="absolute inset-x-0 top-12 border-b border-outline-variant/10 border-dashed pointer-events-none" />
          </div>
        </div>

        {/* Rating and Customers Summary */}
        <div className="bg-white p-6 rounded-3xl border border-outline-variant/10 shadow-xs flex flex-col justify-between gap-6">
          <div className="space-y-6">
            <div>
              <h3 className="font-headline-md text-sm text-on-surface font-black">Shop Status metrics</h3>
              <p className="text-secondary font-body-sm text-[10px]">General quality rankings for this branch.</p>
            </div>

            {/* Rating card */}
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-amber-50/60 border border-amber-100">
              <div className="p-3 bg-amber-500 text-white rounded-xl">
                <Star className="w-6 h-6 fill-current" />
              </div>
              <div>
                <h4 className="font-headline-lg text-lg font-black text-on-surface">
                  {analytics?.averageRating ?? '4.8'} / 5.0
                </h4>
                <p className="text-[10px] text-amber-800 font-bold mt-0.5">Average customer feedback score</p>
              </div>
            </div>

            {/* Total customer counts */}
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-blue-50/60 border border-blue-100">
              <div className="p-3 bg-blue-600 text-white rounded-xl">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-headline-lg text-lg font-black text-on-surface">
                  {analytics?.totalCustomers ?? 0}
                </h4>
                <p className="text-[10px] text-blue-800 font-bold mt-0.5">Unique customers served</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Best Seller tables */}
      <div className="bg-white p-6 rounded-3xl border border-outline-variant/10 shadow-xs space-y-4">
        <h3 className="font-headline-md text-sm text-on-surface font-black flex items-center gap-1.5">
          <Award className="w-4.5 h-4.5 text-primary" />
          Detailed Food Demand Ranking
        </h3>

        {bestSellers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-outline-variant/10 text-secondary text-[10px] uppercase font-bold tracking-wider">
                  <th className="pb-3">Rank</th>
                  <th className="pb-3">Item Name</th>
                  <th className="pb-3 text-center">Units Sold</th>
                  <th className="pb-3 text-right">Revenue Generated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10 text-xs">
                {bestSellers.map((item, index) => (
                  <tr key={index} className="hover:bg-surface-container-low/20 transition-colors">
                    <td className="py-3.5 font-bold text-secondary">#{index + 1}</td>
                    <td className="py-3.5 font-bold text-on-surface">{item.name}</td>
                    <td className="py-3.5 text-center font-bold text-secondary">{item.qty} units</td>
                    <td className="py-3.5 text-right font-black text-emerald-700">₹{item.revenue}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-secondary">
            <p className="text-xs font-bold">No best selling items calculated yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};
