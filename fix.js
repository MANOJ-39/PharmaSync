const fs = require('fs');
const path = require('path');

function replaceInFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    
    // Replace corrupted '?' or ',1' or ',1'
    content = content.replace(/\(\?\)/g, '(₹)'); // Cost Price (?) -> Cost Price (₹)
    content = content.replace(/Cost Value: \?\{/g, 'Cost Value: ₹{');
    content = content.replace(/Inlet Cost \(\?\)/g, 'Inlet Cost (₹)');
    content = content.replace(/Outlet Revenue \(\?\)/g, 'Outlet Revenue (₹)');
    content = content.replace(/mt-1\"(?:>|&gt;)\?\{/g, 'mt-1\">₹{');
    
    // Fix messed up JSX tags in ProductsAdmin
    content = content.replace(/wide\",1\{/g, 'wide\">{');
    content = content.replace(/mt-1\",1\{/g, 'mt-1\">{');
    content = content.replace(/wide\"\?\{/g, 'wide\">{');
    content = content.replace(/mt-1\"\?\{/g, 'mt-1\">{');
    
    // Any remaining ',1' -> ₹
    content = content.replace(/,1/g, '₹');

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Fixed:', filePath);
    }
}

function walkDir(dir) {
    fs.readdirSync(dir).forEach(file => {
        let fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walkDir(fullPath);
        } else if (fullPath.endsWith('.jsx')) {
            replaceInFile(fullPath);
        }
    });
}

walkDir('frontend/src/pages');
