const fs = require('fs');

function replaceInFile(file, replacements) {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;
    for (let r of replacements) {
        content = content.replace(r.search, r.replace);
    }
    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        console.log('Updated ' + file);
    }
}

replaceInFile('frontend/src/App.jsx', [
    { search: "return 'Smart Inventory'", replace: "return 'PharmaSync'" },
    { search: ">SmartInv<", replace: ">PharmaSync<" }
]);

replaceInFile('frontend/src/pages/Login.jsx', [
    { search: ">Smart Inventory<", replace: ">PharmaSync<" }
]);

replaceInFile('frontend/index.html', [
    { search: "<title>Smart Inventory System</title>", replace: "<title>PharmaSync</title>" }
]);

