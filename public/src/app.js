// Main application logic
import { parseMarkdown } from './parser.js';
import { generateCSV } from './csv-generator.js';

// State
let cards = [];
let selectedIndex = 0;
let currentTab = 'front';
let templates = {
    front: '',
    back: '',
    css: ''
};

// Elements
const fileInput = document.getElementById('fileInput');
const fileName = document.getElementById('fileName');
const mainContent = document.getElementById('mainContent');
const cardCount = document.getElementById('cardCount');
const cardList = document.getElementById('cardList');
const previewContainer = document.getElementById('previewContainer');
const downloadBtn = document.getElementById('downloadBtn');
const copyFrontBtn = document.getElementById('copyFrontBtn');
const copyBackBtn = document.getElementById('copyBackBtn');
const copyCssBtn = document.getElementById('copyCssBtn');
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

// File Input
fileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    fileName.textContent = file.name;
    const text = await file.text();
    cards = parseMarkdown(text);

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

// Download
downloadBtn.addEventListener('click', () => {
    const csv = generateCSV(cards);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'anki_cards.csv';
    a.click();
    URL.revokeObjectURL(url);
});

// Copy Buttons
const copyToClipboard = async (text, btn) => {
    if (!text) {
        alert('Nothing to copy. Templates might not be loaded.');
        return;
    }
    try {
        await navigator.clipboard.writeText(text);
        const originalText = btn.textContent;
        btn.textContent = 'Copied!';
        setTimeout(() => btn.textContent = originalText, 2000);
    } catch (err) {
        console.error('Failed to copy', err);
        alert('Failed to copy to clipboard');
    }
};

copyFrontBtn.onclick = () => copyToClipboard(templates.front, copyFrontBtn);
copyBackBtn.onclick = () => copyToClipboard(templates.back, copyBackBtn);
copyCssBtn.onclick = () => copyToClipboard(templates.css, copyCssBtn);

console.log('App initialized');
