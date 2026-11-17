import test from 'node:test';
import assert from 'node:assert';
import { parseMarkdown } from '../src/parser.js';

test('parser', async (t) => {
    await t.test('should return empty array for empty string', () => {
        assert.deepStrictEqual(parseMarkdown(''), []);
    });

    await t.test('should parse a single card with phrase and translation', () => {
        const input = `### **Hello** HelloTranslation`;
        const expected = [{
            phrase: 'Hello',
            translation: 'HelloTranslation',
            examples: []
        }];
        assert.deepStrictEqual(parseMarkdown(input), expected);
    });

    await t.test('should parse a card with example', () => {
        const input = `### **Phrase** Translation
Example | ExampleTranslation`;
        const expected = [{
            phrase: 'Phrase',
            translation: 'Translation',
            examples: [{ text: 'Example', translation: 'ExampleTranslation' }]
        }];
        assert.deepStrictEqual(parseMarkdown(input), expected);
    });

    await t.test('should parse a card with two examples', () => {
        const input = `### **Phrase** Translation
Ex1 | Ex1T
Ex2 | Ex2T`;
        const expected = [{
            phrase: 'Phrase',
            translation: 'Translation',
            examples: [
                { text: 'Ex1', translation: 'Ex1T' },
                { text: 'Ex2', translation: 'Ex2T' }
            ]
        }];
        assert.deepStrictEqual(parseMarkdown(input), expected);
    });

    await t.test('should parse up to five examples and ignore the rest', () => {
        const input = `### **Phrase** Translation
Ex1 | Ex1T
Ex2 | Ex2T
Ex3 | Ex3T
Ex4 | Ex4T
Ex5 | Ex5T
Ex6 | Ex6T`;
        const [card] = parseMarkdown(input);
        assert.deepStrictEqual(card.examples, [
            { text: 'Ex1', translation: 'Ex1T' },
            { text: 'Ex2', translation: 'Ex2T' },
            { text: 'Ex3', translation: 'Ex3T' },
            { text: 'Ex4', translation: 'Ex4T' },
            { text: 'Ex5', translation: 'Ex5T' }
        ]);
    });

    await t.test('should parse multiple cards', () => {
        const input = `### **One** OneT
Ex1 | Ex1T

### **Two** TwoT
Ex2 | Ex2T`;
        const expected = [
            { phrase: 'One', translation: 'OneT', examples: [{ text: 'Ex1', translation: 'Ex1T' }] },
            { phrase: 'Two', translation: 'TwoT', examples: [{ text: 'Ex2', translation: 'Ex2T' }] }
        ];
        assert.deepStrictEqual(parseMarkdown(input), expected);
    });

    await t.test('should handle whitespace flexibly', () => {
        const input = `
### ** One **   OneT  
   Ex1   |   Ex1T   
`;
        const expected = [{
            phrase: 'One',
            translation: 'OneT',
            examples: [{ text: 'Ex1', translation: 'Ex1T' }]
        }];
        assert.deepStrictEqual(parseMarkdown(input), expected);
    });
});
