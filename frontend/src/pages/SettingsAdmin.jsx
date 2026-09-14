import React, { useState, useEffect } from 'react';
import { UserPlus, Moon, Sun, Save, Users, Settings as SettingsIcon } from 'lucide-react';
import api from '../services/api';

const SettingsAdmin = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [darkMode, setDarkMode] = useState(false);
  
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'USER'
  });
  const [status, setStatus] = useState(null);
  
  useEffect(() => {
    // Check if dark mode is active
    if (document.documentElement.classList.contains('dark')) {
      setDarkMode(true);
    }
  }, []);

  const toggleDarkMode = () => {
    if (darkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setDarkMode(true);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setStatus({ type: 'loading', text: 'Creating user...' });
    
    try {
      await api.post('/users', formData);
      setStatus({ type: 'success', text: `Successfully created ${formData.role === 'USER' ? 'Sales Associate' : 'Administrator'}: ${formData.username}` });
      setFormData({ username: '', password: '', role: 'USER' });
      setTimeout(() => setStatus(null), 4000);
    } catch (err) {
      setStatus({ type: 'error', text: err.response?.data || 'Failed to create user' });
      setTimeout(() => setStatus(null), 4000);
    }
  };

  return (
    <div className="h-full flex flex-col space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 tracking-tight">System Settings</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage users, branches, and preferences.</p>
        </div>
      </div>

      <div className="flex gap-6 h-full pb-6">
        {/* Settings Sidebar */}
        <div className="w-64 shrink-0 flex flex-col gap-2">
          <button 
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'users' ? 'bg-[#7a8b54] text-white shadow-md shadow-[#7a8b54]/20' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
          >
            <Users size={18} /> User Management
          </button>
          <button 
            onClick={() => setActiveTab('appearance')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'appearance' ? 'bg-[#7a8b54] text-white shadow-md shadow-[#7a8b54]/20' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
          >
            <SettingsIcon size={18} /> Appearance
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          
          {activeTab === 'users' && (
            <div className="p-8">
              <div className="mb-6 pb-6 border-b border-gray-100 dark:border-gray-700">
                <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">Add New Branch Personnel</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Create login credentials for new warehouse workers or sub-store sales associates.</p>
              </div>

              {status && (
                <div className={`p-4 rounded-xl mb-6 text-sm font-medium ${status.type === 'error' ? 'bg-red-50 text-red-600 border border-red-100' : status.type === 'success' ? 'bg-[#7a8b54]/10 text-[#5a6b3c] border border-[#7a8b54]/20' : 'bg-blue-50 text-blue-600'}`}>
                  {status.text}
                </div>
              )}

              <form onSubmit={handleCreateUser} className="max-w-md space-y-5">
                <div>
                  <label className="block text-xs font-semibold tracking-wider text-gray-500 dark:text-gray-400 uppercase mb-2">Full Name / Username</label>
                  <input 
                    required 
                    type="text" 
                    placeholder="e.g. John Doe"
                    className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100 rounded-xl p-3 outline-none focus:border-[#7a8b54] transition-colors"
                    value={formData.username}
                    onChange={e => setFormData({...formData, username: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-semibold tracking-wider text-gray-500 dark:text-gray-400 uppercase mb-2">Password</label>
                  <input 
                    required 
                    type="password" 
                    placeholder="Enter secure password"
                    className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100 rounded-xl p-3 outline-none focus:border-[#7a8b54] transition-colors"
                    value={formData.password}
                    onChange={e => setFormData({...formData, password: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold tracking-wider text-gray-500 dark:text-gray-400 uppercase mb-2">Role & Access Level</label>
                  <select 
                    required 
                    className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100 rounded-xl p-3 outline-none focus:border-[#7a8b54] transition-colors"
                    value={formData.role}
                    onChange={e => setFormData({...formData, role: e.target.value})}
                  >
                    <option value="USER">Sales Associate (POS Terminal Only)</option>
                    <option value="ADMIN">Administrator (Full Access)</option>
                  </select>
                </div>

                <div className="pt-4">
                  <button type="submit" className="w-full bg-[#7a8b54] text-white px-4 py-3 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-[#6b7b4a] transition-colors">
                    <UserPlus size={18} /> Create Account
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="p-8">
              <div className="mb-6 pb-6 border-b border-gray-100 dark:border-gray-700">
                <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">Theme Preferences</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Customize the visual appearance of the application.</p>
              </div>

              <div className="flex items-center justify-between p-5 border border-gray-100 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 max-w-lg">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-800 text-gray-300' : 'bg-white text-yellow-500 shadow-sm border border-gray-100'}`}>
                    {darkMode ? <Moon size={24} /> : <Sun size={24} />}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 dark:text-gray-100">Dark Mode</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Reduce eye strain in low-light environments.</p>
                  </div>
                </div>
                
                <button 
                  onClick={toggleDarkMode}
                  className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${darkMode ? 'bg-[#7a8b54]' : 'bg-gray-300'}`}
                >
                  <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${darkMode ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default SettingsAdmin;
