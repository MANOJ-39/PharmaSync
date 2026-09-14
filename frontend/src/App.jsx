import React, { useState, useContext, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ProductsAdmin from './pages/ProductsAdmin';
import BatchesFefoAdmin from './pages/BatchesFefoAdmin';
import ProcurementAdmin from './pages/ProcurementAdmin';
import CashierPOS from './pages/CashierPOS';
import AnalyticsAdmin from './pages/AnalyticsAdmin';
import SettingsAdmin from './pages/SettingsAdmin';

import { LayoutDashboard, PackageSearch, Boxes, Bell, Menu, Settings, LogOut, FileText, ShoppingCart, BarChart3 } from 'lucide-react';

function App() {
  useEffect(() => {
    if (localStorage.getItem('theme') === 'dark') {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-[#7a8b54]">Loading...</div>;
  }

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
      <Route path="/*" element={
        <ProtectedRoute>
          <MainLayout />
        </ProtectedRoute>
      } />
    </Routes>
  );
}

function MainLayout() {
  const { user, logout } = useContext(AuthContext);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/': return 'Analytics Dashboard';
      case '/products': return 'Inventory';
      case '/batches': return 'Batches & FEFO';
      case '/procurement': return 'Procurement';
      case '/analytics': return 'Live Analytics';
      case '/settings': return 'System Settings';
      case '/pos': return 'POS Terminal';
      default: return 'PharmaSync';
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f9f6] flex text-gray-800 selection:bg-[#7a8b54]/30">
      {/* Sidebar - Light Olive Green Style */}
      <aside className={`bg-white shadow-xl shadow-[#7a8b54]/10 border-r border-gray-200 transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-20'} flex flex-col z-20`}>
        <div className="p-5 flex items-center justify-between border-b border-gray-100">
          {sidebarOpen && <span className="font-bold text-2xl tracking-tight text-[#5a6b3c]">PharmaSync</span>}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1.5 text-gray-400 hover:text-[#7a8b54] hover:bg-[#7a8b54]/10 rounded-lg transition-all">
            <Menu size={22} />
          </button>
        </div>
        
        <nav className="flex-1 py-6 flex flex-col gap-2 px-3">
          {user.role === 'ADMIN' && (
            <NavItem icon={<LayoutDashboard size={20}/>} label="Dashboard" active={location.pathname === '/'} onClick={() => navigate('/')} open={sidebarOpen} />
          )}
          
          {(user.role === 'ADMIN' || user.role === 'USER') && (
            <NavItem icon={<ShoppingCart size={20}/>} label="POS Terminal" active={location.pathname === '/pos'} onClick={() => navigate('/pos')} open={sidebarOpen} />
          )}

          {(user.role === 'ADMIN' || user.role === 'USER') && (
            <NavItem icon={<PackageSearch size={20}/>} label="Inventory" active={location.pathname === '/products'} onClick={() => navigate('/products')} open={sidebarOpen} />
          )}

          {user.role === 'ADMIN' && (
            <>
              <NavItem icon={<Boxes size={20}/>} label="Batches & FEFO" active={location.pathname === '/batches'} onClick={() => navigate('/batches')} open={sidebarOpen} />
              <NavItem icon={<FileText size={20}/>} label="Procurement" active={location.pathname === '/procurement'} onClick={() => navigate('/procurement')} open={sidebarOpen} />
              <NavItem icon={<BarChart3 size={20}/>} label="Reports" active={location.pathname === '/analytics'} onClick={() => navigate('/analytics')} open={sidebarOpen} />
              <NavItem icon={<Settings size={20}/>} label="Settings" active={location.pathname === '/settings'} onClick={() => navigate('/settings')} open={sidebarOpen} />
            </>
          )}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Top Header */}
        <header className="bg-white/80 backdrop-blur-md h-16 border-b border-gray-200 flex items-center justify-between px-8 shadow-sm z-10 sticky top-0">
          <h2 className="text-xl font-bold text-[#5a6b3c] tracking-wide">
            {getPageTitle()}
          </h2>
          <div className="flex items-center gap-5">
            <button className="relative p-2 text-gray-400 hover:text-[#7a8b54] transition-all hover:-translate-y-0.5">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#7a8b54] rounded-full animate-pulse"></span>
            </button>
            <div className="flex items-center gap-4 pl-5 border-l border-gray-200">
              <div className="flex flex-col items-end">
                <span className="text-sm font-bold text-gray-700">{user.username}</span>
                <span className="text-[11px] font-semibold tracking-wider text-[#7a8b54] uppercase bg-[#7a8b54]/10 px-2 py-0.5 rounded-full mt-0.5">{user.role}</span>
              </div>
              <button onClick={logout} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all hover:-translate-y-0.5" title="Logout">
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6 md:p-8">
          <Routes>
            <Route path="/" element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/pos" element={
              <ProtectedRoute allowedRoles={['ADMIN', 'USER']}>
                <CashierPOS />
              </ProtectedRoute>
            } />
            <Route path="/products" element={
              <ProtectedRoute allowedRoles={['ADMIN', 'USER']}>
                <ProductsAdmin />
              </ProtectedRoute>
            } />
            <Route path="/batches" element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <BatchesFefoAdmin />
              </ProtectedRoute>
            } />
            <Route path="/procurement" element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <ProcurementAdmin />
              </ProtectedRoute>
            } />
            <Route path="/analytics" element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AnalyticsAdmin />
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <SettingsAdmin />
              </ProtectedRoute>
            } />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function NavItem({ icon, label, active, onClick, open }) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all w-full group ${
        active 
        ? 'bg-[#7a8b54] text-white shadow-md shadow-[#7a8b54]/30 font-medium' 
        : 'text-gray-500 hover:bg-[#7a8b54]/10 hover:text-[#5a6b3c]'
      }`}
    >
      <div className={`${active ? 'text-white' : 'text-gray-400 group-hover:text-[#5a6b3c]'} transition-colors`}>
        {icon}
      </div>
      {open && <span className="whitespace-nowrap tracking-wide">{label}</span>}
    </button>
  );
}

export default App;

