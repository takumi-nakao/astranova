const fs = require('fs');
const path = require('path');

function searchDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.git' && file !== 'docs') {
        searchDir(fullPath);
      }
    } else {
      if (file.endsWith('.js') || file.endsWith('.html') || file.endsWith('.css') || file.endsWith('.json') || file.endsWith('.md')) {
        const content = fs.readFileSync(fullPath, 'utf8');
        if (content.toLowerCase().includes('nexis')) {
          console.log(`Found NEXIS in: ${fullPath}`);
          const lines = content.split('\n');
          lines.forEach((line, idx) => {
            if (line.toLowerCase().includes('nexis')) {
              console.log(`  Line ${idx + 1}: ${line.trim()}`);
            }
          });
        }
      }
    }
  }
}

searchDir(__dirname);
