import React, { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { Plus, Search, MoreVertical, X, Trash2 } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const ProductsAdmin = () => {
  const { user } = useContext(AuthContext);
  const [products, setProducts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', sku: '', description: '', costPrice: '', sellingPrice: '', reorderLevel: '' });

  const isReadOnly = user?.role === 'USER';

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products');
      setProducts(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isReadOnly) return;
    try {
      await api.post('/products', { ...formData, categoryId: 1, unit: 'Unit', reorderQuantity: parseInt(formData.reorderLevel) * 2 });
      setIsModalOpen(false);
      setFormData({ name: '', sku: '', description: '', costPrice: '', sellingPrice: '', reorderLevel: '' });
      fetchProducts();
    } catch (err) {
      alert("Failed to save product. Ensure SKU is unique.");
    }
  };

  const handleDelete = async (id) => {
    if (isReadOnly) return;
    if (window.confirm("Are you sure you want to deactivate this product?")) {
      try {
        await api.delete(`/products/${id}`);
        fetchProducts();
      } catch (err) {
        alert("Failed to delete product.");
      }
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 h-full flex flex-col relative transition-all duration-300">
      
      {/* Header */}
      <div className="p-6 border-b border-gray-100 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-[#5a6b3c] tracking-wide">{isReadOnly ? 'Inventory Status' : 'Product Catalog'}</h2>
          <p className="text-sm text-gray-500 mt-1">{isReadOnly ? 'Read-only view of current stock levels and pricing.' : 'Manage all inventory items and pricing.'}</p>
        </div>
        {!isReadOnly && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-[#7a8b54] hover:bg-[#6b7b4a] shadow-sm text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2"
          >
            <Plus size={18} /> Add Product
          </button>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto flex-1 p-6">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500">
              <th className="pb-4 font-semibold">Product Name</th>
              <th className="pb-4 font-semibold">SKU</th>
              <th className="pb-4 font-semibold">Category</th>
              <th className="pb-4 font-semibold">Cost Price (₹)</th>
              <th className="pb-4 font-semibold">Selling Price (₹)</th>
              {!isReadOnly && <th className="pb-4 font-semibold text-right">Actions</th>}
            </tr>
          </thead>
          <tbody className="text-sm text-gray-700">
            {products.map((p) => (
              <tr key={p.id} className="border-b border-gray-50 hover:bg-[#f7f9f6] transition-colors">
                <td className="py-4 font-medium text-gray-800">{p.name}</td>
                <td className="py-4"><span className="bg-gray-100 border border-gray-200 text-gray-600 px-2.5 py-1 rounded-md text-xs font-mono">{p.sku}</span></td>
                <td className="py-4">{p.categoryName}</td>
                <td className="py-4 text-gray-600">₹{p.costPrice.toFixed(2)}</td>
                <td className="py-4 font-bold text-[#7a8b54]">₹{p.sellingPrice.toFixed(2)}</td>
                {!isReadOnly && (
                  <td className="py-4 text-right">
                    <button onClick={() => handleDelete(p.id)} className="text-gray-400 hover:text-red-500 transition-colors" title="Remove Product"><Trash2 size={18}/></button>
                  </td>
                )}
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={isReadOnly ? "5" : "6"} className="text-center py-12 text-gray-500 italic">No products found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Slide-out Panel / Modal */}
      {isModalOpen && !isReadOnly && (
        <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex justify-end">
          <div className="w-full max-w-md bg-white h-full shadow-2xl border-l border-gray-100 flex flex-col">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-[#f7f9f6]">
              <h3 className="font-bold text-lg text-[#5a6b3c] tracking-wide">Create New Product</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-700 transition-colors"><X size={20}/></button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <form id="productForm" onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold tracking-wider text-gray-500 uppercase mb-2">Product Name</label>
                  <input required type="text" className="w-full bg-white border border-gray-200 text-gray-800 rounded-xl p-3 outline-none focus:border-[#7a8b54] focus:ring-1 focus:ring-[#7a8b54] transition-all" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-semibold tracking-wider text-gray-500 uppercase mb-2">SKU (Barcode)</label>
                  <input required type="text" className="w-full bg-white border border-gray-200 text-gray-800 rounded-xl p-3 outline-none focus:border-[#7a8b54] focus:ring-1 focus:ring-[#7a8b54] transition-all font-mono" value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-semibold tracking-wider text-gray-500 uppercase mb-2">Cost Price (₹)</label>
                    <input required type="number" step="0.01" className="w-full bg-white border border-gray-200 text-gray-800 rounded-xl p-3 outline-none focus:border-[#7a8b54] focus:ring-1 focus:ring-[#7a8b54] transition-all font-mono" value={formData.costPrice} onChange={e => setFormData({...formData, costPrice: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold tracking-wider text-gray-500 uppercase mb-2">Selling Price (₹)</label>
                    <input required type="number" step="0.01" className="w-full bg-white border border-gray-200 text-gray-800 rounded-xl p-3 outline-none focus:border-[#7a8b54] focus:ring-1 focus:ring-[#7a8b54] transition-all font-mono" value={formData.sellingPrice} onChange={e => setFormData({...formData, sellingPrice: e.target.value})} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold tracking-wider text-gray-500 uppercase mb-2">Reorder Level</label>
                  <input required type="number" className="w-full bg-white border border-gray-200 text-gray-800 rounded-xl p-3 outline-none focus:border-[#7a8b54] focus:ring-1 focus:ring-[#7a8b54] transition-all font-mono" value={formData.reorderLevel} onChange={e => setFormData({...formData, reorderLevel: e.target.value})} />
                </div>
              </form>
            </div>

            <div className="p-6 border-t border-gray-100 bg-[#f7f9f6] flex justify-end gap-4">
              <button onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-sm font-bold text-gray-500 hover:text-gray-800 hover:bg-gray-200 rounded-xl transition-all">Cancel</button>
              <button type="submit" form="productForm" className="bg-[#7a8b54] hover:bg-[#6b7b4a] text-white px-5 py-2.5 text-sm font-bold rounded-xl transition-all">Save Product</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ProductsAdmin;



