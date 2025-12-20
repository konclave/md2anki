// Markdown parsing logic
export function parseMarkdown(content) {
    const cards = [];
    if (!content) return cards;

    // Split by any markdown header level (# to #####), filtering out empty blocks
    // The regex matches 1-5 # characters at the start of a line
    const headerRegex = /^#{1,5}\s+/gm;
    const blocks = content.split(headerRegex).filter(b => b.trim().length > 0);

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
            let example_translation = '';
            let example2 = '';
            let example_translation2 = '';

            // Look for example in remaining lines
            const exampleRegex = /^(?<example>.+?)\s*\|\s*(?<example_translation>.+)$/;
            let exampleCount = 0;

            for (let i = 1; i < lines.length; i++) {
                const line = lines[i].trim();
                if (!line) continue;
                const exMatch = line.match(exampleRegex);
                if (exMatch) {
                    if (exampleCount === 0) {
                        example = exMatch.groups.example;
                        example_translation = exMatch.groups.example_translation;
                        exampleCount++;
                    } else if (exampleCount === 1) {
                        example2 = exMatch.groups.example;
                        example_translation2 = exMatch.groups.example_translation;
                        exampleCount++;
                        break; // Stop after 2 examples
                    }
                }
            }

            cards.push({
                phrase: phrase.trim(),
                translation: translation.trim(),
                example: example.trim(),
                example_translation: example_translation.trim(),
                example2: example2.trim(),
                example_translation2: example_translation2.trim()
            });
        }
    }

    return cards;
}
