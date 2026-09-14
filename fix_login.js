const fs = require('fs');
let file = 'frontend/src/pages/Login.jsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
    '<span className="text-xs text-[#7a8b54] font-mono tracking-wide font-bold">admin / admin123</span>',
    '<span className="text-xs text-[#7a8b54] font-mono tracking-wide font-bold">Administrator / admin123</span>'
);

content = content.replace(
    '<span className="text-xs text-[#7a8b54] font-mono tracking-wide font-bold">cashier / admin123</span>',
    '<span className="text-xs text-[#7a8b54] font-mono tracking-wide font-bold">Sales Associate / associate1</span>'
);

content = content.replace(
    '<span className="block text-xs text-gray-500 mb-0.5">Admin</span>',
    '<span className="block text-xs text-gray-500 mb-0.5">Administrator</span>'
);

content = content.replace(
    '<span className="block text-xs text-gray-500 mb-0.5">Cashier</span>',
    '<span className="block text-xs text-gray-500 mb-0.5">Sales Associate</span>'
);

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed Login.jsx');
