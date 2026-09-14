const fs = require('fs');
let file = 'frontend/src/pages/Dashboard.jsx';
let content = fs.readFileSync(file, 'utf8');

let searchStr = /const \[statsRes, alertsRes, analyticsRes\] = await Promise\.all\(\[\s*api\.get\('\/dashboard'\),\s*api\.get\('\/alerts\/notifications'\),\s*api\.get\('\/analytics'\)\s*\]\);\s*setStats\(statsRes\.data\);\s*setAlerts\(alertsRes\.data\);\s*setData\(analyticsRes\.data\);/s;

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
          setAlerts(validAlerts);
          setData(analyticsRes.data);`;

content = content.replace(searchStr, replaceStr);

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed Dashboard.jsx');
