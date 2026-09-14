const fs = require('fs');
let file = 'frontend/src/App.jsx';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes("localStorage.getItem('theme')")) {
    let replacement = `
  useEffect(() => {
    if (localStorage.getItem('theme') === 'dark') {
      document.documentElement.classList.add('dark');
    }
  }, []);
`;
    content = content.replace('function App() {', 'function App() {' + replacement);
    fs.writeFileSync(file, content, 'utf8');
    console.log('Added dark mode persistence to App.jsx');
}
