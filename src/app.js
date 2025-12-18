// Main application logic
import 'bulma/css/bulma.css';
import '@fortawesome/fontawesome-free/css/all.css';
import './style.css';
import { parseMarkdown } from './parser.js';
import { downloadAnkiPackage } from './apkg-generator.js';

// State
let cards = [];
let selectedIndex = 0;
let currentTab = 'front';
let templates = {
    front: '',
    back: '',
    css: ''
};

// Local Storage Keys
const DECK_NAME_STORAGE_KEY = 'md2anki_deck_name';

// Elements
const fileInput = document.getElementById('fileInput');
const fileName = document.getElementById('fileName');
const mainContent = document.getElementById('mainContent');
const cardCount = document.getElementById('cardCount');
const cardList = document.getElementById('cardList');
const previewContainer = document.getElementById('previewContainer');
const deckNameInput = document.getElementById('deckNameInput');

const tabs = document.querySelectorAll('.tabs li');

// Init
async function init() {
    try {
        const [frontRes, backRes, cssRes] = await Promise.all([
            fetch('card-template/anki_front.html'),
            fetch('card-template/anki_back.html'),
            fetch('card-template/anki.css')
        ]);
        if (frontRes.ok) templates.front = await frontRes.text();
        if (backRes.ok) templates.back = await backRes.text();
        if (cssRes.ok) templates.css = await cssRes.text();
    } catch (e) {
        console.error('Failed to load templates', e);
        // Fallback or just log. The copy buttons might be empty, and preview unstyled/default.
    }
}
init();

// Deck name persistence
function getDeckName() {
    const savedName = localStorage.getItem(DECK_NAME_STORAGE_KEY);
    return savedName || deckNameInput.value || 'Markdown2Anki Deck';
}

function setDeckNameFromFile(filename) {
    // Remove .md extension to get default deck name
    const defaultName = filename.replace(/\.md$/i, '');

    // Check if we have a saved name in local storage
    const savedName = localStorage.getItem(DECK_NAME_STORAGE_KEY);

    if (savedName) {
        deckNameInput.value = savedName;
    } else {
        deckNameInput.value = defaultName;
    }
}

// Save deck name when changed
deckNameInput.addEventListener('change', () => {
    const name = deckNameInput.value.trim();
    if (name) {
        localStorage.setItem(DECK_NAME_STORAGE_KEY, name);
    }
});

// Also save on input for real-time persistence
deckNameInput.addEventListener('blur', () => {
    const name = deckNameInput.value.trim();
    if (name) {
        localStorage.setItem(DECK_NAME_STORAGE_KEY, name);
    }
});

// File Input
fileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    fileName.textContent = file.name;
    const text = await file.text();
    cards = parseMarkdown(text);

    // Set deck name from file (or use saved value)
    setDeckNameFromFile(file.name);

    cardCount.textContent = cards.length;
    renderList();
    if (cards.length > 0) {
        selectedIndex = 0;
        mainContent.style.display = ''; // Remove display: none (default defaults to block/flex as defined in css or user agent)
        // Actually .columns is flex, so removing inline display: none restores it.
        updateActiveItem();
        renderPreview();
    }
});

function renderList() {
    cardList.innerHTML = '';
    cards.forEach((card, index) => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.textContent = card.phrase || '(No Phrase)';
        a.onclick = () => {
            selectedIndex = index;
            updateActiveItem();
            renderPreview();
        };
        li.appendChild(a);
        cardList.appendChild(li);
    });
}

function updateActiveItem() {
    const items = cardList.querySelectorAll('a');
    items.forEach((item, index) => {
        if (index === selectedIndex) item.classList.add('is-active');
        else item.classList.remove('is-active');
    });
}

// Shadow DOM for Preview
const shadow = previewContainer.attachShadow({ mode: 'open' });

function renderPreview() {
    if (cards.length === 0) return;
    const card = cards[selectedIndex];

    // Inject CSS
    const style = document.createElement('style');
    style.textContent = templates.css;

    // Render HTML
    let html = '';
    const renderFront = (c) => {
        return templates.front.replace(/{{Phrase}}/g, c.phrase || '');
    };

    if (currentTab === 'front') {
        html = renderFront(card);
    } else {
        html = templates.back
            .replace(/{{FrontSide}}/g, renderFront(card))
            .replace(/{{Translation}}/g, card.translation || '')
            .replace(/{{Example}}/g, card.example || '')
            .replace(/{{ExampleTranslation}}/g, card.example_translation || '');
    }

    shadow.innerHTML = '';
    shadow.appendChild(style);
    const wrapper = document.createElement('div');
    // Basic Anki wrapper simulation
    wrapper.innerHTML = html;
    shadow.appendChild(wrapper);
}

// Tabs
tabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
        // Find the li element even if clicked on a child <a>
        const li = e.currentTarget;
        tabs.forEach(t => t.classList.remove('is-active'));
        li.classList.add('is-active');
        currentTab = li.dataset.tab;
        renderPreview();
    });
});

const downloadApkgBtn = document.getElementById('downloadApkgBtn');
downloadApkgBtn.addEventListener('click', async () => {
    if (cards.length === 0) {
        alert('No cards to export!');
        return;
    }
    const originalText = downloadApkgBtn.textContent;
    downloadApkgBtn.textContent = 'Generating...';
    downloadApkgBtn.setAttribute('disabled', 'true');
    try {
        const deckName = deckNameInput.value.trim() || 'Markdown2Anki Deck';
        await downloadAnkiPackage(cards, templates, deckName);
    } catch (e) {
        console.error(e);
        alert('Failed to generate Anki package. Check console for details.');
    } finally {
        downloadApkgBtn.textContent = originalText;
        downloadApkgBtn.removeAttribute('disabled');
    }
});



console.log('App initialized');
