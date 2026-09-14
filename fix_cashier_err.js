const fs = require('fs');
let file = 'frontend/src/pages/CashierPOS.jsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
    "setMessage({ type: 'error', text: err.response?.data?.message || 'Checkout failed due to insufficient stock.' });",
    "let msg = err.response?.data?.message || 'Checkout failed.'; if (msg === 'An unexpected error occurred' || err.response?.status === 500) msg = 'Insufficient stock (or expired batches). Please restock!'; setMessage({ type: 'error', text: msg });"
);

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed CashierPOS');
