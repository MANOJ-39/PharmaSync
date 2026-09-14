const fs = require('fs');
let file = 'frontend/src/pages/Dashboard.jsx';
let content = fs.readFileSync(file, 'utf8');

let startIndex = content.indexOf('const [statsRes, alertsRes, analyticsRes] = await Promise.all([');
let endIndex = content.indexOf('setAnalytics(analyticsRes.data);');

if (startIndex !== -1 && endIndex !== -1) {
  let replaceStr = `const [statsRes, alertsRes, analyticsRes, productsRes, batchesRes] = await Promise.all([
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
          setAnalytics(analyticsRes.data);`;

  content = content.substring(0, startIndex) + replaceStr + content.substring(endIndex + 32);
  fs.writeFileSync(file, content, 'utf8');
  console.log('Fixed Dashboard.jsx');
} else {
  console.log('Failed to find bounds');
}
