import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { CheckCircle2, Truck, Plus, X } from 'lucide-react';

const ProcurementAdmin = () => {
  const [activeTab, setActiveTab] = useState('orders');
  const [suppliers, setSuppliers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'orders') {
        const res = await api.get('/purchase-orders');
        setOrders(res.data);
      } else {
        const res = await api.get('/suppliers');
        setSuppliers(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch data', err);
    } finally {
      setLoading(false);
    }
  };

  const approveOrder = async (id) => {
    try {
      await api.post(`/purchase-orders/${id}/approve`);
      fetchData();
    } catch (err) {
      alert('Failed to approve order');
    }
  };

  const receiveOrder = async (id) => {
    try {
      await api.post(`/purchase-orders/${id}/receive`);
      fetchData();
    } catch (err) {
      alert('Failed to receive order');
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-gray-200">
        <button 
          className={`pb-3 px-2 font-medium text-sm transition-colors ${activeTab === 'orders' ? 'border-b-2 border-[#7a8b54] text-[#7a8b54]' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('orders')}
        >
          Purchase Orders
        </button>
        <button 
          className={`pb-3 px-2 font-medium text-sm transition-colors ${activeTab === 'suppliers' ? 'border-b-2 border-[#7a8b54] text-[#7a8b54]' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('suppliers')}
        >
          Suppliers
        </button>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center text-gray-400">Loading data...</div>
      ) : activeTab === 'orders' ? (
        <OrdersTab orders={orders} onApprove={approveOrder} onReceive={receiveOrder} />
      ) : (
        <SuppliersTab suppliers={suppliers} reload={fetchData} />
      )}
    </div>
  );
};

const OrdersTab = ({ orders, onApprove, onReceive }) => {
  const [isPOModalOpen, setIsPOModalOpen] = useState(false);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({ supplierId: '', productId: '', quantity: 1, unitPrice: 0 });

  useEffect(() => {
    if (isPOModalOpen) {
      api.get('/suppliers').then(res => setSuppliers(res.data)).catch(console.error);
      api.get('/products').then(res => setProducts(res.data)).catch(console.error);
    }
  }, [isPOModalOpen]);

  const handleCreatePO = async (e) => {
    e.preventDefault();
    try {
      await api.post('/purchase-orders', {
        supplierId: parseInt(formData.supplierId),
        items: [{ 
            productId: parseInt(formData.productId), 
            quantity: parseInt(formData.quantity), 
            unitPrice: parseFloat(formData.unitPrice) 
        }]
      });
      setIsPOModalOpen(false);
      window.location.reload();
    } catch (e) {
      alert("Error creating PO.");
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex-1 flex flex-col relative overflow-hidden">
      <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-xl">
        <h3 className="font-semibold text-gray-700">Purchase Orders</h3>
        <button onClick={() => setIsPOModalOpen(true)} className="bg-[#7a8b54] text-white px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1 hover:bg-[#6b7b4a] transition-colors">
          <Plus size={16} /> New PO
        </button>
      </div>
      
      <div className="p-0 overflow-auto flex-1">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-200 bg-white text-sm text-gray-500">
              <th className="p-4 font-medium">PO Number</th>
              <th className="p-4 font-medium">Supplier</th>
              <th className="p-4 font-medium">Total Amount</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm text-gray-700">
            {orders.map(order => (
              <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="p-4 font-medium text-[#7a8b54]">{order.poNumber}</td>
                <td className="p-4">{order.supplierName}</td>
                <td className="p-4 font-medium">₹{order.totalAmount}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    order.status === 'APPROVED' ? 'bg-[#7a8b54]/10 text-[#5a6b3c]' :
                    order.status === 'RECEIVED' ? 'bg-green-100 text-green-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {order.status}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex gap-2">
                    {order.status === 'DRAFT' && (
                      <button onClick={() => onApprove(order.id)} className="text-xs bg-[#7a8b54]/10 text-[#5a6b3c] px-2 py-1 rounded border border-[#7a8b54]/20 hover:bg-[#7a8b54]/20">Approve</button>
                    )}
                    {order.status === 'APPROVED' && (
                      <button onClick={() => onReceive(order.id)} className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded border border-green-200 hover:bg-green-100 flex items-center gap-1"><Truck size={14}/> Receive</button>
                    )}
                    {order.status === 'RECEIVED' && (
                      <span className="text-xs text-green-600 flex items-center gap-1"><CheckCircle2 size={14}/> Stocked in Batches</span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan="5" className="p-8 text-center text-gray-500">No purchase orders found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isPOModalOpen && (
        <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex justify-end">
          <div className="w-full max-w-md bg-white h-full shadow-2xl border-l border-gray-100 flex flex-col">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-[#f7f9f6]">
              <h3 className="font-bold text-lg text-[#5a6b3c] tracking-wide">Create Purchase Order</h3>
              <button onClick={() => setIsPOModalOpen(false)} className="text-gray-400 hover:text-gray-700 transition-colors"><X size={20}/></button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <form id="poForm" onSubmit={handleCreatePO} className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold tracking-wider text-gray-500 uppercase mb-2">Supplier</label>
                  <select required className="w-full bg-white border border-gray-200 text-gray-800 rounded-xl p-3 outline-none focus:border-[#7a8b54]" value={formData.supplierId} onChange={e => setFormData({...formData, supplierId: e.target.value})}>
                    <option value="" disabled>Select a supplier</option>
                    {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold tracking-wider text-gray-500 uppercase mb-2">Product</label>
                  <select required className="w-full bg-white border border-gray-200 text-gray-800 rounded-xl p-3 outline-none focus:border-[#7a8b54]" value={formData.productId} onChange={e => {
                      const prod = products.find(p => p.id === parseInt(e.target.value));
                      setFormData({...formData, productId: e.target.value, unitPrice: prod ? prod.costPrice : 0})
                  }}>
                    <option value="" disabled>Select a product</option>
                    {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>)}
                  </select>
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-xs font-semibold tracking-wider text-gray-500 uppercase mb-2">Quantity</label>
                    <input required min="1" type="number" className="w-full bg-white border border-gray-200 text-gray-800 rounded-xl p-3 outline-none focus:border-[#7a8b54]" value={formData.quantity} onChange={e => setFormData({...formData, quantity: e.target.value})} />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-semibold tracking-wider text-gray-500 uppercase mb-2">Unit Price (₹)</label>
                    <input required min="0" step="0.01" type="number" className="w-full bg-white border border-gray-200 text-gray-800 rounded-xl p-3 outline-none focus:border-[#7a8b54]" value={formData.unitPrice} onChange={e => setFormData({...formData, unitPrice: e.target.value})} />
                  </div>
                </div>
                <div className="pt-2 text-right">
                  <span className="text-gray-500 text-sm">Total: </span>
                  <span className="font-bold text-lg text-gray-800">₹{(formData.quantity * formData.unitPrice).toFixed(2)}</span>
                </div>
              </form>
            </div>

            <div className="p-6 border-t border-gray-100 bg-[#f7f9f6] flex justify-end gap-4">
              <button onClick={() => setIsPOModalOpen(false)} className="px-5 py-2.5 text-sm font-bold text-gray-500 hover:text-gray-800 hover:bg-gray-200 rounded-xl transition-all">Cancel</button>
              <button type="submit" form="poForm" className="bg-[#7a8b54] hover:bg-[#6b7b4a] text-white px-5 py-2.5 text-sm font-bold rounded-xl transition-all">Place Order</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const SuppliersTab = ({ suppliers, reload }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', contactEmail: '', phone: '', address: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/suppliers', formData);
      setIsModalOpen(false);
      setFormData({ name: '', contactEmail: '', phone: '', address: '' });
      reload();
    } catch (err) {
      alert("Failed to save supplier.");
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex-1 flex flex-col relative overflow-hidden">
      <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-xl">
        <h3 className="font-semibold text-gray-700">Suppliers Directory</h3>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-[#7a8b54] text-white px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1 hover:bg-[#6b7b4a] transition-colors"
        >
          <Plus size={16} /> Add Supplier
        </button>
      </div>
      
      <div className="p-0 overflow-auto flex-1">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-200 bg-white text-sm text-gray-500">
              <th className="p-4 font-medium">Name</th>
              <th className="p-4 font-medium">Email</th>
              <th className="p-4 font-medium">Phone</th>
              <th className="p-4 font-medium">Address</th>
            </tr>
          </thead>
          <tbody className="text-sm text-gray-700">
            {suppliers.map(s => (
              <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="p-4 font-medium">{s.name}</td>
                <td className="p-4 text-gray-500">{s.contactEmail}</td>
                <td className="p-4 text-gray-500">{s.phone}</td>
                <td className="p-4 text-gray-500">{s.address}</td>
              </tr>
            ))}
            {suppliers.length === 0 && (
              <tr>
                <td colSpan="4" className="p-8 text-center text-gray-500">No suppliers found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex justify-end">
          <div className="w-full max-w-md bg-white h-full shadow-2xl border-l border-gray-100 flex flex-col">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-[#f7f9f6]">
              <h3 className="font-bold text-lg text-[#5a6b3c] tracking-wide">Add New Supplier</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-700 transition-colors"><X size={20}/></button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <form id="supplierForm" onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold tracking-wider text-gray-500 uppercase mb-2">Supplier Name</label>
                  <input required type="text" className="w-full bg-white border border-gray-200 text-gray-800 rounded-xl p-3 outline-none focus:border-[#7a8b54] focus:ring-1 focus:ring-[#7a8b54]" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-semibold tracking-wider text-gray-500 uppercase mb-2">Email Address</label>
                  <input type="email" className="w-full bg-white border border-gray-200 text-gray-800 rounded-xl p-3 outline-none focus:border-[#7a8b54] focus:ring-1 focus:ring-[#7a8b54]" value={formData.contactEmail} onChange={e => setFormData({...formData, contactEmail: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-semibold tracking-wider text-gray-500 uppercase mb-2">Phone Number</label>
                  <input type="text" className="w-full bg-white border border-gray-200 text-gray-800 rounded-xl p-3 outline-none focus:border-[#7a8b54] focus:ring-1 focus:ring-[#7a8b54]" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-semibold tracking-wider text-gray-500 uppercase mb-2">Address</label>
                  <textarea className="w-full bg-white border border-gray-200 text-gray-800 rounded-xl p-3 outline-none focus:border-[#7a8b54] focus:ring-1 focus:ring-[#7a8b54] min-h-[100px]" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})}></textarea>
                </div>
              </form>
            </div>

            <div className="p-6 border-t border-gray-100 bg-[#f7f9f6] flex justify-end gap-4">
              <button onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-sm font-bold text-gray-500 hover:text-gray-800 hover:bg-gray-200 rounded-xl transition-all">Cancel</button>
              <button type="submit" form="supplierForm" className="bg-[#7a8b54] hover:bg-[#6b7b4a] text-white px-5 py-2.5 text-sm font-bold rounded-xl transition-all">Save Supplier</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProcurementAdmin;




