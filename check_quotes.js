
const fs = require('fs');
const path = require('path');

const files = ['main.ts', 'constants.ts'];
const dir = process.argv[2] || '.';

files.forEach(file => {
    const filePath = path.join(dir, file);
    if (!fs.existsSync(filePath)) return;
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    let inBacktick = false;
    
    lines.forEach((line, i) => {
        let inSingle = false;
        let inDouble = false;
        
        for (let j = 0; j < line.length; j++) {
            const char = line[j];
            const prev = j > 0 ? line[j-1] : '';
            
            if (char === '`' && prev !== '\\') {
                inBacktick = !inBacktick;
            } else if (!inBacktick) {
                if (char === "'" && prev !== '\\' && !inDouble) {
                    inSingle = !inSingle;
                } else if (char === '"' && prev !== '\\' && !inSingle) {
                    inDouble = !inDouble;
                }
            }
        }
        
        // If we end a line with an unclosed single or double quote, it's likely an error (unless it's a multi-line string which TS doesn't support for ' or ")
        if (inSingle || inDouble) {
            console.log(`Unclosed quote in ${file} at line ${i + 1}: ${line.trim()}`);
        }
    });
    
    if (inBacktick) {
        console.log(`Unclosed backtick at end of file ${file}`);
    }
});
