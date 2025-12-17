// CSV generation logic
export function generateCSV(data) {
    if (!data || !Array.isArray(data) || data.length === 0) {
        return "";
    }

    const escape = (field) => {
        if (field == null) return '';
        const stringField = String(field);
        // Escape quotes, newlines, and the delimiter (semicolon)
        if (stringField.includes('"') || stringField.includes(';') || stringField.includes('\n')) {
            return `"${stringField.replace(/"/g, '""')}"`;
        }
        return stringField;
    };

    return data.map(row => {
        return [
            escape(row.phrase),
            escape(row.translation),
            escape(row.example),
            escape(row.example_translation)
        ].join(';');
    }).join('\n');
}
