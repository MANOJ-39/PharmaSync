const fs = require('fs');

function fixTags(filePath) {
    let s = fs.readFileSync(filePath, 'utf8');
    
    // Fix all patterns where a class string ends and a tag should close before {
    // Like: className="some-classes"₹{p.name} -> className="some-classes">{p.name}
    s = s.replace(/\"[₹\?]\s*\{/g, '">{');
    s = s.replace(/”[₹\?]\s*\{/g, '">{');

    fs.writeFileSync(filePath, s, 'utf8');
    console.log('Fixed tags in', filePath);
}

fixTags('frontend/src/pages/CashierPOS.jsx');
fixTags('frontend/src/pages/ProductsAdmin.jsx');
fixTags('frontend/src/pages/AnalyticsAdmin.jsx');
fixTags('frontend/src/pages/Dashboard.jsx');
fixTags('frontend/src/pages/ProcurementAdmin.jsx');
