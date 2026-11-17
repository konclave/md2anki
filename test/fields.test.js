import test from 'node:test';
import assert from 'node:assert';
import { FIELD_NAMES, cardToFields, renderTemplate } from '../src/fields.js';

const card = {
    phrase: 'der Hund',
    translation: 'the dog',
    examples: [
        { text: 'Ex1', translation: 'Ex1T' },
        { text: 'Ex2', translation: 'Ex2T' }
    ]
};

test('fields', async (t) => {
    await t.test('should define fields for five examples', () => {
        assert.deepStrictEqual(FIELD_NAMES, [
            'Phrase', 'Translation',
            'Example', 'ExampleTranslation',
            'Example2', 'ExampleTranslation2',
            'Example3', 'ExampleTranslation3',
            'Example4', 'ExampleTranslation4',
            'Example5', 'ExampleTranslation5'
        ]);
    });

    await t.test('should map card to fields, leaving missing examples empty', () => {
        const fields = cardToFields(card);
        assert.strictEqual(fields.Phrase, 'der Hund');
        assert.strictEqual(fields.Translation, 'the dog');
        assert.strictEqual(fields.Example, 'Ex1');
        assert.strictEqual(fields.ExampleTranslation2, 'Ex2T');
        assert.strictEqual(fields.Example3, '');
        assert.deepStrictEqual(Object.keys(fields), FIELD_NAMES);
    });

    await t.test('should swap phrase and translation when reversed', () => {
        const fields = cardToFields(card, true);
        assert.strictEqual(fields.Phrase, 'the dog');
        assert.strictEqual(fields.Translation, 'der Hund');
    });

    await t.test('should render fields and conditional sections', () => {
        const template = '{{Phrase}}{{#Example2}}[{{Example2}}]{{/Example2}}{{#Example3}}[{{Example3}}]{{/Example3}}{{^Example3}}none{{/Example3}}';
        assert.strictEqual(renderTemplate(template, cardToFields(card)), 'der Hund[Ex2]none');
    });
});
