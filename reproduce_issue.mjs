
import { parseMarkdown } from './src/parser.js';
import fs from 'fs';
import path from 'path';

const filePath = path.resolve('B2 Wörte.md');
console.log(`Reading file: ${filePath}`);

try {
    const content = fs.readFileSync(filePath, 'utf-8');
    // console.log('File content:', content);

    const cards = parseMarkdown(content);
    console.log(`Generated ${cards.length} cards.`);
    console.log(JSON.stringify(cards, null, 2));
} catch (err) {
    console.error('Error:', err);
}
