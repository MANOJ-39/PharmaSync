import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { ShieldCheck, AlertCircle } from 'lucide-react';

const Login = () => {
  const { login } = useContext(AuthContext);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const result = await login(username, password);
    if (!result.success) {
      setError(result.message);
    }
    setLoading(false);
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 selection:bg-[#7a8b54]/30 relative bg-cover bg-center"
      style={{ backgroundImage: "url('/img/login_img.jpg')" }}
    >
      {/* Dark overlay to ensure the login card stands out against the image */}
      <div className="absolute inset-0 bg-black/40 z-0"></div>
      
      <div className="max-w-md w-full bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-100 p-10 z-10 relative">
        <div className="flex flex-col items-center mb-8 relative">
          <div className="bg-[#eaf0e6] text-[#7a8b54] p-4 rounded-2xl mb-5 shadow-sm border border-[#d5e0cd]">
            <ShieldCheck size={36} />
          </div>
          <h1 className="text-3xl font-bold text-[#5a6b3c] tracking-tight">PharmaSync</h1>
          <p className="text-gray-500 text-sm mt-2 font-medium tracking-wide uppercase">Secure Gateway</p>
        </div>

        {error && (
          <div className="mb-6 flex items-center gap-3 bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-100">
            <AlertCircle size={20} className="flex-shrink-0" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 relative">
          <div className="group">
            <label className="block text-xs font-semibold tracking-wider text-gray-500 uppercase mb-2 group-focus-within:text-[#7a8b54] transition-colors">Username</label>
            <input 
              required
              type="text" 
              className="w-full px-5 py-3.5 bg-gray-50 rounded-xl border border-gray-200 text-gray-800 placeholder-gray-400 focus:border-[#7a8b54] focus:ring-1 focus:ring-[#7a8b54] outline-none transition-all duration-300"
              placeholder="Enter your ID"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          
          <div className="group">
            <label className="block text-xs font-semibold tracking-wider text-gray-500 uppercase mb-2 group-focus-within:text-[#7a8b54] transition-colors">Password</label>
            <input 
              required
              type="password" 
              className="w-full px-5 py-3.5 bg-gray-50 rounded-xl border border-gray-200 text-gray-800 placeholder-gray-400 focus:border-[#7a8b54] focus:ring-1 focus:ring-[#7a8b54] outline-none transition-all duration-300"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[#7a8b54] hover:bg-[#6b7b4a] text-white font-bold py-3.5 rounded-xl transition-all duration-300 mt-4 shadow-md shadow-[#7a8b54]/20 hover:shadow-[#7a8b54]/40"
          >
            {loading ? "Authenticating..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
