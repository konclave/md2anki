// Markdown parsing logic
export function parseMarkdown(content) {
    const cards = [];
    if (!content) return cards;

    // Split by ###, filtering out empty blocks typical at start of file
    const blocks = content.split('###').filter(b => b.trim().length > 0);

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

            // Look for example in remaining lines
            const exampleRegex = /^(?<example>.+?)\s*\|\s*(?<example_translation>.+)$/;
            for (let i = 1; i < lines.length; i++) {
                const line = lines[i].trim();
                if (!line) continue;
                const exMatch = line.match(exampleRegex);
                if (exMatch) {
                    example = exMatch.groups.example;
                    example_translation = exMatch.groups.example_translation;
                    break;
                }
            }

            cards.push({
                phrase: phrase.trim(),
                translation: translation.trim(),
                example: example.trim(),
                example_translation: example_translation.trim()
            });
        }
    }

    return cards;
}
