const fs = require('fs');

// 1. Fix Dashboard.jsx
let dash = fs.readFileSync('frontend/src/pages/Dashboard.jsx', 'utf8');
dash = dash.replace('title="Total Products" value={stats.totalProducts}', 'title="Total Stock Units" value={stats.totalInventoryUnits}');
fs.writeFileSync('frontend/src/pages/Dashboard.jsx', dash, 'utf8');

// 2. Fix AnalyticsAdmin.jsx
let an = fs.readFileSync('frontend/src/pages/AnalyticsAdmin.jsx', 'utf8');
an = an.replace('api.get(\'/analytics/dashboard\')', 'api.get(\'/analytics\')');
fs.writeFileSync('frontend/src/pages/AnalyticsAdmin.jsx', an, 'utf8');

console.log('Fixed UI components');
