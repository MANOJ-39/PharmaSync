const fs = require('fs');
const path = require('path');

function fix(dir) {
    fs.readdirSync(dir).forEach(file => {
        let fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            fix(fullPath);
        } else if (fullPath.endsWith('.jsx')) {
            let original = fs.readFileSync(fullPath, 'utf8');
            let content = original;
            
            // Revert global ₹ replacement back to ?
            // Since JS files are UTF-8, we can use unicode escapes to be safe
            content = content.replace(/\u20B9/g, '?');
            content = content.replace(/\u00E2\u201A\u00B9/g, '?'); // â‚¹
            content = content.replace(/,1/g, '?');
            
            // Now, selectively put the Rupee symbol back using \u20B9
            content = content.replace(/Cost Price \(\?\)/g, 'Cost Price (\u20B9)');
            content = content.replace(/Selling Price \(\?\)/g, 'Selling Price (\u20B9)');
            content = content.replace(/Inlet Cost \(\?\)/g, 'Inlet Cost (\u20B9)');
            content = content.replace(/Outlet Revenue \(\?\)/g, 'Outlet Revenue (\u20B9)');
            
            // Revert '?{' back to '₹{' for string templates representing currency
            content = content.replace(/\?\{/g, '\u20B9{');
            
            // Fix HTML tags in ProductsAdmin where 'wide"{' got messed up
            content = content.replace(/wide\"\u20B9\{/g, 'wide\">{');
            content = content.replace(/mt-1\"\u20B9\{/g, 'mt-1\">{');

            if (content !== original) {
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log('Fixed: ' + fullPath);
            }
        }
    });
}
fix('frontend/src/pages');
