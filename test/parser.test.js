import test from 'node:test';
import assert from 'node:assert';
import { parseMarkdown } from '../public/src/parser.js';

test('parser', async (t) => {
    await t.test('should return empty array for empty string', () => {
        assert.deepStrictEqual(parseMarkdown(''), []);
    });

    await t.test('should parse a single card with phrase and translation', () => {
        const input = `### **Hello** HelloTranslation`;
        const expected = [{
            phrase: 'Hello',
            translation: 'HelloTranslation',
            example: '',
            example_translation: ''
        }];
        assert.deepStrictEqual(parseMarkdown(input), expected);
    });

    await t.test('should parse a card with example', () => {
        const input = `### **Phrase** Translation
Example | ExampleTranslation`;
        const expected = [{
            phrase: 'Phrase',
            translation: 'Translation',
            example: 'Example',
            example_translation: 'ExampleTranslation'
        }];
        assert.deepStrictEqual(parseMarkdown(input), expected);
    });

    await t.test('should parse multiple cards', () => {
        const input = `### **One** OneT
Ex1 | Ex1T

### **Two** TwoT
Ex2 | Ex2T`;
        const expected = [
            { phrase: 'One', translation: 'OneT', example: 'Ex1', example_translation: 'Ex1T' },
            { phrase: 'Two', translation: 'TwoT', example: 'Ex2', example_translation: 'Ex2T' }
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
            example: 'Ex1',
            example_translation: 'Ex1T'
        }];
        assert.deepStrictEqual(parseMarkdown(input), expected);
    });
});
