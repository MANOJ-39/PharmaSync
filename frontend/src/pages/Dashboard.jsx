import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Package, AlertTriangle, TrendingDown, Clock, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, alertsRes, analyticsRes, productsRes, batchesRes] = await Promise.all([
            api.get('/dashboard'),
            api.get('/alerts/notifications'),
            api.get('/analytics'),
            api.get('/products'),
            api.get('/batches')
          ]);
          
          let products = productsRes.data;
          let batches = batchesRes.data;
          
          let actualLowStockCount = 0;
          let lowStockProductNames = new Set();
          
          products.forEach(p => {
             let totalStock = batches.filter(b => b.productId === p.id && (b.status === 'ACTIVE' || b.status === 'SAFE')).reduce((sum, b) => sum + b.availableQuantity, 0);
             if (totalStock <= p.reorderLevel) {
                 actualLowStockCount++;
                 lowStockProductNames.add(p.name);
             }
          });
          
          let fixedStats = { ...statsRes.data, lowStockProducts: actualLowStockCount };
          setStats(fixedStats);
          
          let validAlerts = alertsRes.data.filter(alert => {
              if (alert.type === 'LOW_STOCK') {
                  return Array.from(lowStockProductNames).some(name => alert.message.includes(name));
              }
              return true;
          });
          setAlerts(validAlerts.slice(0, 5));
          setAnalytics(analyticsRes.data);
      } catch (error) {
        console.error('Failed to fetch dashboard data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="flex items-center justify-center h-full"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
  if (!stats) return <div className="text-center text-red-500 mt-10">Failed to load system data. Is the backend running?</div>;

  const chartData = analytics?.chartData?.length > 0 ? analytics.chartData : [
    { name: 'General', inlet: 0, outlet: 0 }
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={<Package size={24}/>} title="Total Stock Units" value={stats.totalInventoryUnits} color="blue" />
        <StatCard icon={<TrendingDown size={24}/>} title="Low Stock Items" value={stats.lowStockProducts} color="amber" />
        <StatCard icon={<Clock size={24}/>} title="Expiring < 7 Days" value={stats.expiringWithin7Days} color="orange" />
        <StatCard icon={<AlertTriangle size={24}/>} title="Expired Batches" value={stats.expiredBatches} color="red" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Chart Area */}
        <div className="lg:col-span-2 bg-white shadow-sm border-gray-100 p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-800">Inventory Flow (Inlet vs Outlet Value)</h3>
            <button onClick={() => navigate('/analytics')} className="text-sm text-[#7a8b54] hover:underline">View Report</button>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB"/>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6B7280'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#6B7280'}} />
                <Tooltip cursor={{fill: '#F3F4F6'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}/>
                <Bar dataKey="inlet" name="Stock In Value" fill="#3B82F6" radius={[4, 4, 0, 0]} barSize={30} />
                <Bar dataKey="outlet" name="Stock Out Value" fill="#10B981" radius={[4, 4, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent System Alerts */}
        <div className="bg-white shadow-sm border-gray-100 p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-6">
            <Activity className="text-[#7a8b54]" size={20}/>
            <h3 className="text-lg font-bold text-gray-800">Live System Alerts</h3>
          </div>
          <div className="space-y-4">
            {alerts.length === 0 ? (
              <p className="text-sm text-gray-500 italic">No recent alerts.</p>
            ) : (
              alerts.map((alert, idx) => (
                <div key={idx} className="flex gap-3 items-start pb-4 border-b border-gray-50 last:border-0">
                  <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${alert.severity === 'CRITICAL' ? 'bg-red-500' : 'bg-amber-500'}`}></div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{alert.type}</p>
                    <p className="text-xs text-gray-500 mt-1 leading-snug">{alert.message}</p>
                    <span className="text-[10px] text-gray-400 mt-2 block">{new Date(alert.createdAt).toLocaleString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

function StatCard({ icon, title, value, color }) {
  const colorMap = {
    blue: 'bg-[#7a8b54]/10 text-[#7a8b54]',
    amber: 'bg-amber-50 text-amber-600',
    orange: 'bg-orange-50 text-orange-600',
    red: 'bg-red-50 text-red-600',
  };
  return (
    <div className="bg-white shadow-sm border-gray-100 p-6 rounded-xl shadow-sm border border-gray-100 flex items-center hover:shadow-md transition-shadow">
      <div className={`p-3 rounded-xl ${colorMap[color]}`}>
        {icon}
      </div>
      <div className="ml-4">
        <p className="text-sm text-gray-500 font-medium">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
      </div>
    </div>
  );
}

export default Dashboard;


