import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area, CartesianGrid } from 'recharts';
import { TrendingUp, TrendingDown, AlertCircle, PackageSearch, Activity } from 'lucide-react';

const AnalyticsAdmin = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get('/analytics');
        setData(res.data);
      } catch (err) {
        console.error("Failed to load analytics", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) return <div className="flex items-center justify-center h-full"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7a8b54]"></div></div>;
  if (!data) return <div className="text-center text-red-500 mt-10">Failed to load analytics data.</div>;

  return (
    <div className="flex flex-col gap-6">
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center hover:shadow-md transition-shadow">
          <div className="p-4 rounded-xl bg-[#7a8b54]/10 text-[#7a8b54]">
            <PackageSearch size={28} />
          </div>
          <div className="ml-5">
            <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Total Products (In)</h4>
            <p className="text-2xl font-bold text-gray-900 mt-1">{data.totalItemsIn} Units</p>
            <p className="text-xs text-gray-400 mt-1">Cost Value: ₹{data.totalInletCost.toFixed(2)}</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center hover:shadow-md transition-shadow">
          <div className="p-4 rounded-xl bg-orange-50 text-orange-600">
            <Activity size={28} />
          </div>
          <div className="ml-5">
            <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Total Dispatched (Out)</h4>
            <p className="text-2xl font-bold text-gray-900 mt-1">{data.totalItemsOut} Units</p>
            <p className="text-xs text-gray-400 mt-1">Sales Volume</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center hover:shadow-md transition-shadow">
          <div className="p-4 rounded-xl bg-green-50 text-green-600">
            <TrendingUp size={28} />
          </div>
          <div className="ml-5">
            <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Total Outlet Revenue</h4>
            <p className="text-2xl font-bold text-gray-900 mt-1">₹{data.totalOutletRevenue.toFixed(2)}</p>
            <p className="text-xs text-gray-400 mt-1">From Sales & Dispatch</p>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mt-6">
        <h3 className="text-lg font-bold text-[#5a6b3c] mb-6 flex items-center gap-2">
          <BarChart size={20} /> Inventory Flow (Inlet vs Outlet Value)
        </h3>
        <div className="h-80">
          {data.chartData && data.chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6B7280'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#6B7280'}} />
                <Tooltip cursor={{fill: '#F3F4F6'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}/>
                <Bar dataKey="inlet" name="Inlet Cost (₹)" fill="#7a8b54" radius={[4, 4, 0, 0]} />
                <Bar dataKey="outlet" name="Outlet Revenue (₹)" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400">Not enough data to render chart</div>
          )}
        </div>
      </div>
      
    </div>
  );
};

export default AnalyticsAdmin;

