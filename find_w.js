
const fs = require('fs');
const path = require('path');

const files = ['main.ts', 'constants.ts', 'types.ts'];
const dir = process.argv[2] || '.';

files.forEach(file => {
    const filePath = path.join(dir, file);
    if (!fs.existsSync(filePath)) return;
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    lines.forEach((line, i) => {
        // Look for isolated 'w' or 'W' characters
        const matches = line.match(/\bw\b/g);
        if (matches) {
            // Check if it's inside a string
            let inString = false;
            let quote = '';
            for (let j = 0; j < line.length; j++) {
                if ((line[j] === "'" || line[j] === '"' || line[j] === '`') && (j === 0 || line[j-1] !== '\\')) {
                    if (!inString) {
                        inString = true;
                        quote = line[j];
                    } else if (line[j] === quote) {
                        inString = false;
                    }
                }
                if (line[j] === 'w' && !inString && (j === 0 || !/[a-zA-Z0-9_$]/.test(line[j-1])) && (j === line.length - 1 || !/[a-zA-Z0-9_$]/.test(line[j+1]))) {
                    console.log(`Potential stray 'w' in ${file} at line ${i + 1}: ${line.trim()}`);
                }
            }
        }
    });
});
