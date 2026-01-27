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
            let example = '';
            let exampleTranslation = '';
            let example2 = '';
            let exampleTranslation2 = '';

            // Look for example in remaining lines
            const exampleRegex = /^(?<example>.+?)\s*\|\s*(?<example_translation>.+)$/;
            let exampleCount = 0;

            for (let lineIndex = 1; lineIndex < lines.length; lineIndex++) {
                const line = lines[lineIndex].trim();
                if (!line) continue;
                const exampleMatch = line.match(exampleRegex);
                if (exampleMatch) {
                    if (exampleCount === 0) {
                        example = exampleMatch.groups.example;
                        exampleTranslation = exampleMatch.groups.example_translation;
                        exampleCount++;
                    } else if (exampleCount === 1) {
                        example2 = exampleMatch.groups.example;
                        exampleTranslation2 = exampleMatch.groups.example_translation;
                        exampleCount++;
                        break; // Stop after 2 examples
                    }
                }
            }

            cards.push({
                phrase: phrase.trim(),
                translation: translation.trim(),
                example: example.trim(),
                exampleTranslation: exampleTranslation.trim(),
                example2: example2.trim(),
                exampleTranslation2: exampleTranslation2.trim()
            });
        }
    }

    return cards;
}
