const fs = require('fs');

let file = 'frontend/src/pages/ProductsAdmin.jsx';
let s = fs.readFileSync(file, 'utf8');

s = s.replace(/\"(?:₹|\u20B9|\?)\{p\.name\}/g, '\">{p.name}');
s = s.replace(/\"(?:₹|\u20B9|\?)\{p\.sku\}/g, '\">{p.sku}');
s = s.replace(/\"(?:₹|\u20B9|\?)\{p\.categoryName\}/g, '\">{p.categoryName}');
s = s.replace(/wide(?:\"|”)(?:₹|\u20B9|\?)\{isReadOnly/g, 'wide\">{isReadOnly');
s = s.replace(/mt-1(?:\"|”)(?:₹|\u20B9|\?)\{isReadOnly/g, 'mt-1\">{isReadOnly');

fs.writeFileSync(file, s, 'utf8');
console.log('Fixed ProductsAdmin');
