const fs = require('fs');
const path = require('path');
const os = require('os');

// Override vault paths before requiring storage
const TEST_DIR = path.join(os.tmpdir(), 'snippet-vault-test-' + Date.now());
const TEST_FILE = path.join(TEST_DIR, 'snippets.json');

jest.mock('os', () => ({
  ...jest.requireActual('os'),
  homedir: () => TEST_DIR,
}));

const storage = require('./storage');

beforeEach(() => {
  if (fs.existsSync(TEST_FILE)) {
    fs.unlinkSync(TEST_FILE);
  }
  if (fs.existsSync(TEST_DIR)) {
    fs.rmdirSync(TEST_DIR, { recursive: true });
  }
});

afterAll(() => {
  if (fs.existsSync(TEST_DIR)) {
    fs.rmdirSync(TEST_DIR, { recursive: true });
  }
});

describe('storage', () => {
  test('loadSnippets returns empty array on fresh vault', () => {
    const snippets = storage.loadSnippets();
    expect(Array.isArray(snippets)).toBe(true);
    expect(snippets.length).toBe(0);
  });

  test('addSnippet persists a snippet with required fields', () => {
    const snippet = storage.addSnippet({
      title: 'Hello World',
      code: 'console.log("Hello");',
      tags: ['js', 'log'],
      description: 'A simple log',
    });
    expect(snippet).toHaveProperty('id');
    expect(snippet.title).toBe('Hello World');
    expect(snippet.tags).toEqual(['js', 'log']);

    const snippets = storage.loadSnippets();
    expect(snippets.length).toBe(1);
    expect(snippets[0].id).toBe(snippet.id);
  });

  test('addSnippet uses defaults for optional fields', () => {
    const snippet = storage.addSnippet({ title: 'Minimal', code: 'x = 1' });
    expect(snippet.tags).toEqual([]);
    expect(snippet.description).toBe('');
  });

  test('getSnippetById returns correct snippet', () => {
    const added = storage.addSnippet({ title: 'Find Me', code: 'let x = 42;' });
    const found = storage.getSnippetById(added.id);
    expect(found).not.toBeNull();
    expect(found.title).toBe('Find Me');
  });

  test('getSnippetById returns null for unknown id', () => {
    const result = storage.getSnippetById('nonexistent');
    expect(result).toBeNull();
  });

  test('removeSnippet deletes an existing snippet', () => {
    const snippet = storage.addSnippet({ title: 'Delete Me', code: 'rm -rf /' });
    const success = storage.removeSnippet(snippet.id);
    expect(success).toBe(true);
    expect(storage.loadSnippets().length).toBe(0);
  });

  test('removeSnippet returns false for unknown id', () => {
    const result = storage.removeSnippet('ghost-id');
    expect(result).toBe(false);
  });
});
