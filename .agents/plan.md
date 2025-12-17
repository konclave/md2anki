# Implementation Plan - Markdown to Anki Converter

This application will be a client-side web tool to convert specifically formatted Markdown files into Anki-compatible CSV files.

## Goals
- Parse Markdown files with `###` delimited blocks.
- Extract Phrase, Translation, Example, and Example Translation.
- Generate a CSV export for Anki.
- Provide a preview of the generated cards.
- Provide the HTML/CSS templates for Anki card configuration.

## Proposed Changes

### Project Structure
- `index.html`: Main application interface (loads `src/app.js` as `type="module"`).
- `src/`:
    - `parser.js`: Pure function module for parsing Markdown.
    - `csv-generator.js`: Module for generating CSV content.
    - `app.js`: Main entry point, UI interaction, and orchestration.
- `style.css`: Styles for the web application UI.
- `test/`:
    - `parser.test.js`: Node.js test suite for parsing logic.
- `card-template/anki_front.html` & `card-template/anki_back.html`: Templates for Anki cards.
- `card-template/anki.css`: CSS for Anki cards.

### Parsing Logic (TDD Approach)
1.  **Test First**: Write tests in `test/parser.test.js` covering standard blocks, variable spacing, and edge cases.
2.  **Implementation**: Implement `parseMarkdown` in `src/parser.js` to pass tests.
3.  **Logic**:
    - Split content by `###`.
    - Regex: `^###\s*\*\*(?<phrase>.+?)\*\*\s+(?<translation>.+)$` for headers.
    - Regex: `^(?<example>.+?)\s*\|\s*(?<example_translation>.+)$` for examples.

### UI Design
- **Library**: **Bulma** (via CDN).
    - Modern CSS framework based on Flexbox.
    - No build step required · "Copy and paste" friendly.
- **Header**: Title and simple instructions.
- **Input Area**: File picker for `.md` files.
- **Preview Section**:
    - Display a list of parsed cards.
    - Show a "Card Preview" using the Anki styles (`anki.css`) to simulate how it looks in Anki (scoped styling).
- **Output Section**:
    - "Download CSV" button.
    - "Copy Front Template" / "Copy Back Template" / "Copy CSS" buttons for easy Anki setup.

### Detailed Implementation Steps
1.  **Initialize Files**: Create directory structure (`src`, `test`), `index.html`, `style.css`.
    - **Note**: Add `<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bulma@1.0.0/css/bulma.min.css">` to `index.html`.
2.  **Test Suite**: Create `test/parser.test.js` using `node:test` and `node:assert`.
3.  **Logic Modules**: Implement `src/parser.js` and `src/csv-generator.js`.
4.  **Integration**: Create `src/app.js` to wire up the UI and modules.
5.  **Templates**: Fill `card-template/anki_front.html` and `card-template/anki_back.html`.

## Verification Plan

### Automated Tests
- Run `node --test test/parser.test.js` to verify parsing logic.
- Use `browser` tool relative path checks to ensure ESM modules load correctly in the browser.

### Manual Verification
1.  Open `index.html` in the browser.
2.  Open DevTools to ensure no module loading errors.
3.  Upload `B2 Wörte.md`.
4.  Verify parsed output against the file content.
5.  Download CSV and inspect content.
