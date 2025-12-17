# Markdown to Anki Converter

A lightweight, client-side web application designed to convert formatted Markdown files written in a specific format into Anki-compatible CSV files. This tool streamlines the process of creating language learning flashcards from your notes.

## 🚀 Features

-   **Privacy Focused**: Runs entirely in your browser. No data is uploaded to any server.
-   **Instant Preview**: Visual preview of your cards before exporting.
-   **Smart Parsing**: Automatically extracts phrases, translations, and examples from formatted Markdown.
-   **Anki Ready**: Generates CSV files optimized for Anki import.
-   **Template Support**: Includes ready-to-use HTML and CSS templates for your Anki card styling.

## 📝 Markdown Format

The converter expects your Markdown file to follow a specific structure for each card:

```markdown
### **Phrase/Word** Translation

Example Sentence | Translation of Example
```

-   **Header**: Starts with `###`, followed by the bolded phrase/word, and then the translation.
-   **Body**: The example sentence followed by a pipe `|` and its translation.

**Example:**

```markdown
### **der Hund** the dog

Der Hund bellt laut. | The dog barks loudly.
```

## 🛠️ Installation & Usage

Since this is a static web application, no complex installation is required.

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd md2anki
    ```
2.  **Run the application:**
    Simply open the `index.html` file in your web browser.
    *   *Note: For strict browser security settings regarding ES modules, you may need to run a local server (e.g., `npx serve` or using the VS Code Live Server extension).*

3.  **Importing into Anki:**
    -   Generate and download the CSV file from the web app.
    -   Open Anki and choose **File > Import**.
    -   Select the downloaded CSV file.
    -   Map the fields accordingly (Phrase, Translation, Example, Example Translation).
    -   (Optional) Use the provided HTML/CSS templates in the `card-template` folder to style your cards.

## 📂 Project Structure

-   `public/src/`: Core JavaScript logic (Parser, CSV Generator, App Controller).
-   `card-template/`: HTML and CSS templates for Anki.
-   `test/`: Unit tests for the parsing logic.
-   `index.html`: Main entry point.

## 💻 Technologies

-   **HTML5 & CSS3**
-   **JavaScript (ES Modules)**
-   **Bulma CSS Framework** (via CDN)
