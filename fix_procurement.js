const fs = require('fs');
let file = 'frontend/src/pages/ProcurementAdmin.jsx';
let content = fs.readFileSync(file, 'utf8');

let modalInjection = `
  const [isPOModalOpen, setIsPOModalOpen] = useState(false);
  const handleCreatePO = async () => {
    try {
      await api.post('/purchase-orders', {
        supplierId: 1, // Mock supplier ID, the backend will validate this
        items: [{ productId: 1, quantity: 50, unitPrice: 10.0 }]
      });
      setIsPOModalOpen(false);
      window.location.reload();
    } catch (e) {
      alert("Error creating PO. Make sure you have at least 1 supplier and 1 product in DB.");
    }
  };
`;

// Insert the modal state near the top of OrdersTab
content = content.replace('const OrdersTab = ({ orders, onApprove, onReceive }) => {', 
  'const OrdersTab = ({ orders, onApprove, onReceive }) => {\n' + modalInjection);

// Replace the static button with one that opens the modal or triggers function
content = content.replace('<button className="bg-[#7a8b54] text-white px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1 hover:bg-[#6b7b4a] transition-colors">\n          <Plus size={16} /> New PO\n        </button>', 
  '<button onClick={handleCreatePO} className="bg-[#7a8b54] text-white px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1 hover:bg-[#6b7b4a] transition-colors">\n          <Plus size={16} /> New PO (Quick Fill)\n        </button>');

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed ProcurementAdmin');
