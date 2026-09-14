import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Search, ShoppingCart, Plus, Minus, CreditCard, X } from 'lucide-react';

const CashierPOS = () => {
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get('/products');
        setProducts(res.data);
      } catch (err) {
        console.error("Failed to load products for POS", err);
      }
    };
    fetchProducts();
  }, []);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const addToCart = (product) => {
    const existing = cart.find(item => item.product.id === product.id);
    if (existing) {
      setCart(cart.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
    } else {
      setCart([...cart, { product, quantity: 1 }]);
    }
  };

  const updateQuantity = (productId, delta) => {
    setCart(cart.map(item => {
      if (item.product.id === productId) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : item;
      }
      return item;
    }));
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.product.id !== productId));
  };

  const totalAmount = cart.reduce((sum, item) => sum + ((item.product.sellingPrice || item.product.price || 0) * item.quantity), 0);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setLoading(true);
    setMessage(null);
    try {
      for (const item of cart) {
        await api.post('/inventory/stock-out', {
          productId: item.product.id,
          quantity: item.quantity,
          notes: "POS Sale"
        });
      }
      setMessage({ type: 'success', text: 'Checkout complete! FEFO deduction applied.' });
      setCart([]);
    } catch (err) {
      let msg = err.response?.data?.message || 'Checkout failed.'; if (msg === 'An unexpected error occurred' || err.response?.status === 500) msg = 'Insufficient stock (or expired batches). Please restock!'; setMessage({ type: 'error', text: msg });
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(null), 5000);
    }
  };

  return (
    <div className="h-full flex gap-6">
      {/* Left side: Product Search */}
      <div className="w-2/3 flex flex-col gap-6">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 flex items-center gap-4 transition-all focus-within:shadow-[#7a8b54]/10 focus-within:border-[#7a8b54]">
          <Search className="text-gray-400" size={24} />
          <input 
            type="text" 
            placeholder="Scan barcode or search by name / SKU..."
            className="flex-1 bg-transparent outline-none text-lg text-gray-800 placeholder-gray-400"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 overflow-y-auto pr-2 pb-4">
          {filteredProducts.map(p => (
            <div key={p.id} onClick={() => addToCart(p)} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:border-[#7a8b54]/50 hover:shadow-[#7a8b54]/10 cursor-pointer transition-all duration-300 flex flex-col items-center text-center gap-3 hover:-translate-y-1">
              <div className="w-16 h-16 bg-[#f7f9f6] rounded-2xl flex items-center justify-center text-[#7a8b54] mb-2 shadow-sm border border-gray-50">
                <ShoppingCart size={24} />
              </div>
              <div className="w-full">
                <h3 className="font-semibold text-gray-800 line-clamp-1">{p.name}</h3>
                <p className="text-[11px] text-gray-500 font-mono mt-1 bg-gray-50 py-0.5 px-2 rounded-md border border-gray-100 inline-block">{p.sku}</p>
              </div>
              <p className="font-bold text-[#7a8b54] text-lg">₹{(p.sellingPrice || p.price || 0).toFixed(2)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right side: Cart */}
      <div className="w-1/3 bg-white rounded-2xl shadow-lg border border-gray-100 flex flex-col hover:-translate-y-1 transition-transform duration-500">
        <div className="p-5 border-b border-gray-100 bg-[#f7f9f6] rounded-t-2xl flex items-center justify-between">
          <h2 className="font-bold text-[#5a6b3c] flex items-center gap-3 text-lg">
            <ShoppingCart size={22} className="text-[#7a8b54]" /> Current Order
          </h2>
          <span className="bg-[#7a8b54]/10 text-[#7a8b54] border border-[#7a8b54]/20 text-xs font-bold px-3 py-1 rounded-full">{cart.length} items</span>
        </div>

        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
          {cart.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 gap-4">
              <ShoppingCart size={64} className="opacity-20" />
              <p className="tracking-wide font-medium">Cart is empty</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.product.id} className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-800 text-sm">{item.product.name}</h4>
                  <p className="text-[#7a8b54] font-medium text-sm mt-1">₹{(item.product.sellingPrice || item.product.price || 0).toFixed(2)}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-1 border border-gray-200">
                    <button onClick={() => updateQuantity(item.product.id, -1)} className="p-1.5 hover:bg-white rounded-lg text-gray-500 shadow-sm transition-colors"><Minus size={14}/></button>
                    <span className="w-6 text-center text-sm font-bold text-gray-800">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.product.id, 1)} className="p-1.5 hover:bg-white rounded-lg text-gray-500 shadow-sm transition-colors"><Plus size={14}/></button>
                  </div>
                  <button onClick={() => removeFromCart(item.product.id)} className="text-red-400 p-2 hover:bg-red-50 rounded-xl transition-colors"><X size={18}/></button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-6 border-t border-gray-100 bg-[#f7f9f6] rounded-b-2xl">
          <div className="flex justify-between items-center mb-6">
            <span className="text-gray-500 font-medium tracking-wide">Total Amount</span>
            <span className="text-3xl font-bold text-gray-800">₹{totalAmount.toFixed(2)}</span>
          </div>

          {message && (
            <div className={`mb-5 p-4 rounded-xl text-sm font-medium border ${message.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
              {message.text}
            </div>
          )}

          <button 
            onClick={handleCheckout}
            disabled={cart.length === 0 || loading}
            className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all duration-300 ${
              cart.length === 0 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-[#7a8b54] hover:bg-[#6b7b4a] text-white shadow-md shadow-[#7a8b54]/20 hover:shadow-[#7a8b54]/40 hover:-translate-y-1 active:translate-y-0'
            }`}
          >
            {loading ? 'Processing Transaction...' : (
              <>
                <CreditCard size={24} /> Pay ₹{totalAmount.toFixed(2)}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CashierPOS;



