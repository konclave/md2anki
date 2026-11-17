export const MAX_EXAMPLES = 5;

// Markdown parsing logic
export function parseMarkdown(content) {
    const cards = [];
    if (!content) return cards;

    // Split by any markdown header level (# to #####), filtering out empty blocks
    // The regex matches 1-5 # characters at the start of a line
    const headerRegex = /^#{1,5}\s+/gm;
    const blocks = content.split(headerRegex).filter(block => block.trim().length > 0);

    for (const block of blocks) {
        const lines = block.trim().split('\n');
        // First line should contain the phrase and translation
        const firstLine = lines[0].trim();

        // Header Regex: **Phrase** Translation
        const headerRegex = /^\*\*(?<phrase>.+?)\*\*\s+(?<translation>.+)$/;
        const headerMatch = firstLine.match(headerRegex);

        if (headerMatch) {
            const { phrase, translation } = headerMatch.groups;
            const examples = [];

            // Look for examples in remaining lines
            const exampleRegex = /^(?<example>.+?)\s*\|\s*(?<example_translation>.+)$/;

            for (let lineIndex = 1; lineIndex < lines.length; lineIndex++) {
                const line = lines[lineIndex].trim();
                if (!line) continue;
                const exampleMatch = line.match(exampleRegex);
                if (exampleMatch) {
                    examples.push({
                        text: exampleMatch.groups.example.trim(),
                        translation: exampleMatch.groups.example_translation.trim()
                    });
                    if (examples.length === MAX_EXAMPLES) break;
                }
            }

            cards.push({
                phrase: phrase.trim(),
                translation: translation.trim(),
                examples
            });
        }
    }

    return cards;
}
