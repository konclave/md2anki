import { MAX_EXAMPLES } from './parser.js';

// Anki note field names. The first example keeps the unsuffixed names for compatibility.
const exampleField = (index) => `Example${index === 0 ? '' : index + 1}`;
const exampleTranslationField = (index) => `ExampleTranslation${index === 0 ? '' : index + 1}`;

export const FIELD_NAMES = [
    'Phrase',
    'Translation',
    ...Array.from({ length: MAX_EXAMPLES }, (_, i) => [exampleField(i), exampleTranslationField(i)]).flat()
];

// Map a parsed card to { fieldName: value }
export function cardToFields(card, reversed = false) {
    const fields = {
        Phrase: (reversed ? card.translation : card.phrase) || '',
        Translation: (reversed ? card.phrase : card.translation) || ''
    };
    for (let i = 0; i < MAX_EXAMPLES; i++) {
        const example = card.examples?.[i];
        fields[exampleField(i)] = example?.text || '';
        fields[exampleTranslationField(i)] = example?.translation || '';
    }
    return fields;
}

// Minimal Anki template renderer for the preview: {{#Field}}...{{/Field}}, {{^Field}}...{{/Field}}, {{Field}}
export function renderTemplate(template, fields) {
    const withSections = template.replace(
        /{{([#^])(\w+)}}([\s\S]*?){{\/\2}}/g,
        (_, type, name, inner) => {
            const hasValue = Boolean(fields[name]?.trim());
            return (type === '#') === hasValue ? inner : '';
        }
    );
    return withSections.replace(/{{(\w+)}}/g, (match, name) => (name in fields ? fields[name] : match));
}
