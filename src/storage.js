const fs = require('fs');
const path = require('path');
const os = require('os');

const VAULT_DIR = path.join(os.homedir(), '.snippet-vault');
const VAULT_FILE = path.join(VAULT_DIR, 'snippets.json');

function ensureVaultExists() {
  if (!fs.existsSync(VAULT_DIR)) {
    fs.mkdirSync(VAULT_DIR, { recursive: true });
  }
  if (!fs.existsSync(VAULT_FILE)) {
    fs.writeFileSync(VAULT_FILE, JSON.stringify([], null, 2), 'utf-8');
  }
}

function loadSnippets() {
  ensureVaultExists();
  const raw = fs.readFileSync(VAULT_FILE, 'utf-8');
  return JSON.parse(raw);
}

function saveSnippets(snippets) {
  ensureVaultExists();
  fs.writeFileSync(VAULT_FILE, JSON.stringify(snippets, null, 2), 'utf-8');
}

function addSnippet({ title, code, tags = [], description = '' }) {
  const snippets = loadSnippets();
  const snippet = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    title,
    code,
    tags,
    description,
    createdAt: new Date().toISOString(),
  };
  snippets.push(snippet);
  saveSnippets(snippets);
  return snippet;
}

function removeSnippet(id) {
  const snippets = loadSnippets();
  const filtered = snippets.filter((s) => s.id !== id);
  if (filtered.length === snippets.length) {
    return false;
  }
  saveSnippets(filtered);
  return true;
}

function getSnippetById(id) {
  const snippets = loadSnippets();
  return snippets.find((s) => s.id === id) || null;
}

module.exports = {
  loadSnippets,
  saveSnippets,
  addSnippet,
  removeSnippet,
  getSnippetById,
  VAULT_FILE,
};
