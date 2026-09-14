import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { PackageMinus, Activity, AlertCircle, CheckCircle2, Trash2 } from 'lucide-react';

const BatchesFefoAdmin = () => {
  const [activeTab, setActiveTab] = useState('fefo'); // 'fefo' or 'directory'
  const [products, setProducts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const [stockOutForm, setStockOutForm] = useState({
    productId: '',
    quantity: ''
  });

  useEffect(() => {
    fetchInitialData();
  }, [activeTab]);

  const fetchInitialData = async () => {
    try {
      if (activeTab === 'fefo') {
        const [prodRes, transRes] = await Promise.all([
          api.get('/products'),
          api.get('/inventory/transactions')
        ]);
        setProducts(prodRes.data);
        setTransactions(transRes.data);
      } else {
        const res = await api.get('/batches');
        setBatches(res.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleStockOut = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const payload = {
        productId: parseInt(stockOutForm.productId),
        quantity: parseInt(stockOutForm.quantity),
        notes: "Manual FEFO Dispatch"
      };
      const res = await api.post('/inventory/stock-out', payload);
      setMessage({ type: 'success', text: `Successfully dispatched ${stockOutForm.quantity} units via FEFO logic across ${res.data.length} batch(es).` });
      setStockOutForm({ productId: '', quantity: '' });
      fetchInitialData(); // refresh transactions
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || "Failed to dispatch stock. Insufficient quantity or error." });
    } finally {
      setLoading(false);
    }
  };

  const handleDispose = async (batchId) => {
    if(!window.confirm("Are you sure you want to dispose of this batch's remaining stock?")) return;
    try {
      await api.post(`/inventory/dispose-expired/${batchId}?notes=Manager disposed`);
      fetchInitialData();
    } catch (err) {
      alert("Failed to dispose stock.");
    }
  }

  return (
    <div className="h-full flex flex-col gap-6">
      <div className="flex gap-4 border-b border-gray-200">
        <button 
          className={`pb-3 px-2 font-medium text-sm transition-colors ${activeTab === 'fefo' ? 'border-b-2 border-blue-600 text-[#7a8b54]' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('fefo')}
        >
          FEFO Operations
        </button>
        <button 
          className={`pb-3 px-2 font-medium text-sm transition-colors ${activeTab === 'directory' ? 'border-b-2 border-blue-600 text-[#7a8b54]' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('directory')}
        >
          Batches Directory (Expiry Mgmt)
        </button>
      </div>

      {activeTab === 'fefo' ? (
        <div className="flex flex-col lg:flex-row gap-6 flex-1">
          {/* Left Column: FEFO Engine Action */}
          <div className="lg:w-1/3 flex flex-col gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex-1">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-50">
                <div className="bg-[#7a8b54]/10 text-[#7a8b54] p-2 rounded-lg"><PackageMinus size={20}/></div>
                <div>
                  <h2 className="font-bold text-gray-800 text-lg">FEFO Dispatch Engine</h2>
                  <p className="text-xs text-gray-500">First-Expired, First-Out Auto-Deduction</p>
                </div>
              </div>

              <form onSubmit={handleStockOut} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Select Product</label>
                  <select required className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-blue-500" 
                    value={stockOutForm.productId} onChange={e => setStockOutForm({...stockOutForm, productId: e.target.value})}>
                    <option value="" disabled>-- Choose Product --</option>
                    {products.map(p => <option key={p.id} value={p.id}>{p.name} (SKU: {p.sku})</option>)}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantity to Dispatch</label>
                  <input required type="number" min="1" className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-blue-500" 
                    value={stockOutForm.quantity} onChange={e => setStockOutForm({...stockOutForm, quantity: e.target.value})} />
                </div>

                <button disabled={loading} type="submit" className="w-full bg-[#7a8b54] hover:bg-[#6b7b4a] text-white font-medium py-3 rounded-lg transition-colors flex justify-center items-center gap-2 mt-6">
                  {loading ? "Processing..." : "Process Sale (FEFO)"}
                </button>

                {message && (
                  <div className={`mt-4 p-4 rounded-lg flex items-start gap-3 text-sm ${message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-100' : 'bg-red-50 text-red-800 border border-red-100'}`}>
                    {message.type === 'success' ? <CheckCircle2 size={18} className="mt-0.5 text-green-600"/> : <AlertCircle size={18} className="mt-0.5 text-red-600"/>}
                    <p>{message.text}</p>
                  </div>
                )}
              </form>
            </div>
          </div>

          {/* Right Column: Transaction History */}
          <div className="lg:w-2/3 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col">
            <div className="p-6 border-b border-gray-100 flex items-center gap-2">
              <Activity className="text-[#7a8b54]" size={20}/>
              <h2 className="text-lg font-bold text-gray-800">Live Transaction Log</h2>
            </div>
            
            <div className="overflow-x-auto p-6 flex-1">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 text-sm text-gray-500">
                    <th className="pb-3 font-medium">Time</th>
                    <th className="pb-3 font-medium">Type</th>
                    <th className="pb-3 font-medium">Product</th>
                    <th className="pb-3 font-medium">Batch No</th>
                    <th className="pb-3 font-medium">Qty</th>
                    <th className="pb-3 font-medium">Notes</th>
                  </tr>
                </thead>
                <tbody className="text-sm text-gray-700">
                  {transactions.map((t) => (
                    <tr key={t.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-3 text-xs text-gray-500">{new Date(t.createdAt).toLocaleString()}</td>
                      <td className="py-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${t.type === 'STOCK_IN' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                          {t.type}
                        </span>
                      </td>
                      <td className="py-3 font-medium">{t.productName}</td>
                      <td className="py-3"><span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">{t.batchNumber}</span></td>
                      <td className={`py-3 font-bold ${t.type === 'STOCK_IN' ? 'text-green-600' : 'text-amber-600'}`}>
                        {t.type === 'STOCK_IN' ? '+' : '-'}{t.quantity}
                      </td>
                      <td className="py-3 text-gray-500 text-xs">{t.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex-1 flex flex-col">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-xl">
            <h3 className="font-semibold text-gray-700">All Batches</h3>
          </div>
          
          <div className="p-0 overflow-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 bg-white text-sm text-gray-500">
                  <th className="p-4 font-medium">Batch No</th>
                  <th className="p-4 font-medium">Product</th>
                  <th className="p-4 font-medium">Available Qty</th>
                  <th className="p-4 font-medium">Expiry Date</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm text-gray-700">
                {batches.map(b => (
                  <tr key={b.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="p-4 font-medium">{b.batchNumber}</td>
                    <td className="p-4">{b.productName}</td>
                    <td className="p-4 font-bold">{b.availableQuantity}</td>
                    <td className="p-4">{b.expiryDate}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        b.status === 'SAFE' ? 'bg-green-100 text-green-700' :
                        b.status === 'EXPIRED' ? 'bg-red-100 text-red-700' :
                        'bg-orange-100 text-orange-700'
                      }`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="p-4">
                      {(b.status === 'EXPIRED' || b.status.includes('EXPIRING')) && b.availableQuantity > 0 && (
                        <button onClick={() => handleDispose(b.id)} className="text-xs bg-red-50 text-red-700 px-2 py-1 rounded border border-red-200 hover:bg-red-100 flex items-center gap-1">
                          <Trash2 size={14}/> Dispose
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default BatchesFefoAdmin;
