import { describe, it, expect, vi, beforeEach } from 'vitest';
import { toJSON, toMarkdown, exportSnippets } from './export.js';
import * as storage from './storage.js';

const SAMPLE = [
  {
    id: '1',
    title: 'Hello World',
    description: 'Prints hello world',
    code: 'console.log("Hello, world!");',
    language: 'javascript',
    tags: ['js', 'hello'],
    createdAt: '2024-01-15T10:00:00.000Z',
  },
  {
    id: '2',
    title: 'Sum Function',
    description: '',
    code: 'const sum = (a, b) => a + b;',
    language: 'javascript',
    tags: [],
    createdAt: '2024-02-20T12:00:00.000Z',
  },
];

describe('toJSON', () => {
  it('serializes snippets to pretty JSON', () => {
    const result = toJSON(SAMPLE);
    const parsed = JSON.parse(result);
    expect(parsed).toHaveLength(2);
    expect(parsed[0].title).toBe('Hello World');
  });

  it('returns empty array JSON for no snippets', () => {
    expect(toJSON([])).toBe('[]');
  });
});

describe('toMarkdown', () => {
  it('includes a heading and snippet titles', () => {
    const md = toMarkdown(SAMPLE);
    expect(md).toContain('# Snippet Vault Export');
    expect(md).toContain('## Hello World');
    expect(md).toContain('## Sum Function');
  });

  it('includes tags when present', () => {
    const md = toMarkdown(SAMPLE);
    expect(md).toContain('`js`');
    expect(md).toContain('`hello`');
  });

  it('wraps code in fenced code blocks with language', () => {
    const md = toMarkdown(SAMPLE);
    expect(md).toContain('```javascript');
    expect(md).toContain('console.log("Hello, world!");');
  });

  it('returns placeholder for empty snippet list', () => {
    const md = toMarkdown([]);
    expect(md).toContain('_No snippets found._');
  });
});

describe('exportSnippets', () => {
  beforeEach(() => {
    vi.spyOn(storage, 'loadSnippets').mockReturnValue(SAMPLE);
  });

  it('uses provided snippets list without calling loadSnippets', () => {
    const result = exportSnippets('json', [SAMPLE[0]]);
    expect(storage.loadSnippets).not.toHaveBeenCalled();
    expect(JSON.parse(result)).toHaveLength(1);
  });

  it('loads snippets from storage when none provided', () => {
    exportSnippets('markdown');
    expect(storage.loadSnippets).toHaveBeenCalled();
  });

  it('throws on unsupported format', () => {
    expect(() => exportSnippets('csv', [])).toThrow('Unsupported export format');
  });
});
