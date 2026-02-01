
import { Model, Deck, Package, Note } from 'genanki-js';
import initSqlJs from 'sql.js';
import sqlWasm from 'sql.js/dist/sql-wasm.wasm';
import JSZip from 'jszip';

const APKG_SCHEMA = `
PRAGMA foreign_keys=OFF;
BEGIN TRANSACTION;

CREATE TABLE col (
    id              integer primary key,
    crt             integer not null,
    mod             integer not null,
    scm             integer not null,
    ver             integer not null,
    dty             integer not null,
    usn             integer not null,
    ls              integer not null,
    conf            text not null,
    models          text not null,
    decks           text not null,
    dconf           text not null,
    tags            text not null
);
CREATE TABLE notes (
    id              integer primary key,   /* 0 */
    guid            text not null,         /* 1 */
    mid             integer not null,      /* 2 */
    mod             integer not null,      /* 3 */
    usn             integer not null,      /* 4 */
    tags            text not null,         /* 5 */
    flds            text not null,         /* 6 */
    sfld            integer not null,      /* 7 */
    csum            integer not null,      /* 8 */
    flags           integer not null,      /* 9 */
    data            text not null          /* 10 */
);
CREATE TABLE cards (
    id              integer primary key,   /* 0 */
    nid             integer not null,      /* 1 */
    did             integer not null,      /* 2 */
    ord             integer not null,      /* 3 */
    mod             integer not null,      /* 4 */
    usn             integer not null,      /* 5 */
    type            integer not null,      /* 6 */
    queue           integer not null,      /* 7 */
    due             integer not null,      /* 8 */
    ivl             integer not null,      /* 9 */
    factor          integer not null,      /* 10 */
    reps            integer not null,      /* 11 */
    lapses          integer not null,      /* 12 */
    left            integer not null,      /* 13 */
    odue            integer not null,      /* 14 */
    odid            integer not null,      /* 15 */
    flags           integer not null,      /* 16 */
    data            text not null          /* 17 */
);
CREATE TABLE revlog (
    id              integer primary key,
    cid             integer not null,
    usn             integer not null,
    ease            integer not null,
    ivl             integer not null,
    lastIvl         integer not null,
    factor          integer not null,
    time            integer not null,
    type            integer not null
);
CREATE TABLE graves (
    usn             integer not null,
    oid             integer not null,
    type            integer not null
);
CREATE INDEX ix_notes_usn on notes (usn);
CREATE INDEX ix_cards_usn on cards (usn);
CREATE INDEX ix_revlog_usn on revlog (usn);
CREATE INDEX ix_cards_nid on cards (nid);
CREATE INDEX ix_cards_sched on cards (did, queue, due);
CREATE INDEX ix_revlog_cid on revlog (cid);
CREATE INDEX ix_notes_csum on notes (csum);
COMMIT;
`;

async function generateDeckId(deckName) {
    const encoder = new TextEncoder();
    const data = encoder.encode(deckName);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashView = new DataView(hashBuffer);
    // Use first 4 bytes for a positive 32-bit integer
    let deckId = hashView.getUint32(0);
    // Ensure non-zero
    if (deckId === 0) deckId = 1;
    return deckId;
}

export async function downloadAnkiPackage(cards, templates, deckName = 'Markdown2Anki Deck', generateReversed = false) {
    // Ensure SQL.js is initialized and available globally
    if (!window.SQL) {
        try {
            const sqlPromise = initSqlJs({
                locateFile: file => sqlWasm
            });
            window.SQL = await sqlPromise;
        } catch (e) {
            console.error("Failed to load SQL.js", e);
            alert("Failed to initialize database engine. Please check console.");
            return;
        }
    }

    const ankiPackage = new Package();
    const db = new window.SQL.Database();
    ankiPackage.setSqlJs(db);

    try {
        const frontTemplate = {
            name: "Card 1",
            qfmt: templates.front,
            afmt: templates.back
        };

        const ankiModel = new Model({
            id: 13371337,
            name: "Markdown2Anki Model",
            flds: [
                { name: "Phrase" },
                { name: "Translation" },
                { name: "Example" },
                { name: "ExampleTranslation" },
                { name: "Example2" },
                { name: "ExampleTranslation2" }
            ],
            req: [
                [0, "all", [0]] // Card 1: Phrase is required
            ],
            css: templates.css,
            tmpls: [frontTemplate]
        });

        const reversedModel = new Model({
            id: 13371338, // Different ID for the reversed model
            name: "Markdown2Anki Model (Reversed)",
            flds: [
                { name: "Phrase" },
                { name: "Translation" },
                { name: "Example" },
                { name: "ExampleTranslation" },
                { name: "Example2" },
                { name: "ExampleTranslation2" }
            ],
            req: [
                [0, "all", [1]] // Card 1: Translation is required
            ],
            css: templates.css,
            tmpls: [{
                name: "Card 1 (Reversed)",
                qfmt: "{{Translation}}",
                afmt: `{{FrontSide}}\n\n<hr id=answer>\n\n{{Phrase}}`
            }]
        });

        const selectedModel = generateReversed ? reversedModel : ankiModel;
        const currentDeckName = deckName;
        const deckId = await generateDeckId(currentDeckName);
        const ankiDeck = new Deck(deckId, currentDeckName);

        cards.forEach(card => {
            const ankiNote = new Note(selectedModel, [
                (reversedModel ? card.translation : card.phrase) || "",
                (reversedModel ? card.phrase : card.translation) || "",
                card.example || "",
                card.exampleTranslation || "",
                card.example2 || "",
                card.exampleTranslation2 || ""
            ]);
            ankiDeck.addNote(ankiNote);
        });

        ankiPackage.addDeck(ankiDeck);

        // Run Schema
        db.run(APKG_SCHEMA);

        // Write package data to DB
        console.log("Writing to DB...");
        ankiPackage.write(db);

        // Verification logs variables
        const resultNotes = db.exec("SELECT count(*) FROM notes");
        const noteCount = resultNotes[0].values[0][0];
        const resultCards = db.exec("SELECT count(*) FROM cards");
        const cardCount = resultCards[0].values[0][0];
        console.log(`DB Stats: ${noteCount} notes, ${cardCount} cards`);


        // Export DB and create Zip
        const zip = new JSZip();
        const data = db.export();
        zip.file("collection.anki2", data);

        const media_info = {};

        if (ankiPackage.media && Array.isArray(ankiPackage.media)) {
            ankiPackage.media.forEach((mediaItem, i) => {
                if (mediaItem.filename != null) {
                    zip.file(i.toString(), mediaItem.filename);
                } else {
                    zip.file(i.toString(), mediaItem.data);
                }
                media_info[i] = mediaItem.name;
            });
        }

        zip.file('media', JSON.stringify(media_info));

        // Generate Zip
        const zipBlob = await zip.generateAsync({ type: "blob", mimeType: "application/apkg" });

        // Trigger Download
        const url = URL.createObjectURL(zipBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${currentDeckName}.apkg`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

    } catch (e) {
        console.error("Anki package generation failed", e);
        throw e;
    } finally {
        db.close();
    }
}
