const fs = require('fs');
let file = 'frontend/src/App.jsx';
let content = fs.readFileSync(file, 'utf8');

// Add import
content = content.replace(
    "import AnalyticsAdmin from './pages/AnalyticsAdmin';",
    "import AnalyticsAdmin from './pages/AnalyticsAdmin';\nimport SettingsAdmin from './pages/SettingsAdmin';"
);

// Replace placeholder
let searchStr = `<div className="flex items-center justify-center h-full text-gray-400">
                  Settings module coming soon...
                </div>`;
let replaceStr = `<SettingsAdmin />`;

content = content.replace(searchStr, replaceStr);

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed App.jsx');
