const { fromJSON, fromMarkdown, importSnippets } = require('./import');
const storage = require('./storage');

jest.mock('./storage');

beforeEach(() => jest.clearAllMocks());

describe('fromJSON', () => {
  it('parses a valid JSON array', () => {
    const raw = JSON.stringify([
      { title: 'Foo', code: 'console.log(1)', description: 'desc', tags: ['js'] },
    ]);
    const result = fromJSON(raw);
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Foo');
    expect(result[0].tags).toContain('js');
  });

  it('throws on invalid JSON', () => {
    expect(() => fromJSON('not json')).toThrow('Invalid JSON');
  });

  it('throws when input is not an array', () => {
    expect(() => fromJSON(JSON.stringify({ title: 'x' }))).toThrow('Expected a JSON array');
  });

  it('throws when a snippet is missing title', () => {
    const raw = JSON.stringify([{ code: 'x' }]);
    expect(() => fromJSON(raw)).toThrow('missing a valid "title"');
  });

  it('throws when a snippet is missing code', () => {
    const raw = JSON.stringify([{ title: 'T' }]);
    expect(() => fromJSON(raw)).toThrow('missing valid "code"');
  });

  it('accepts tags as a comma-separated string', () => {
    const raw = JSON.stringify([{ title: 'T', code: 'x', tags: 'js, node' }]);
    const result = fromJSON(raw);
    expect(result[0].tags).toEqual(expect.arrayContaining(['js', 'node']));
  });
});

describe('fromMarkdown', () => {
  const md = `# Snippets\n\n## Hello World\n**Description:** greet\n**Tags:** js, hello\n\n\`\`\`js\nconsole.log('hi')\n\`\`\`\n`;

  it('parses a markdown block', () => {
    const result = fromMarkdown(md);
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Hello World');
    expect(result[0].code).toBe("console.log('hi')");
    expect(result[0].description).toBe('greet');
    expect(result[0].tags).toContain('js');
  });

  it('returns empty array for markdown with no blocks', () => {
    expect(fromMarkdown('# Nothing here')).toEqual([]);
  });
});

describe('importSnippets', () => {
  const fs = require('fs');
  jest.mock('fs');

  beforeEach(() => {
    storage.loadSnippets.mockReturnValue([]);
    storage.saveSnippets.mockImplementation(() => {});
  });

  it('adds new snippets and returns count', () => {
    const data = JSON.stringify([{ title: 'Snap', code: 'x = 1' }]);
    jest.spyOn(require('fs'), 'readFileSync').mockReturnValue(data);
    const result = importSnippets('snippets.json');
    expect(result.added).toBe(1);
    expect(result.skipped).toBe(0);
    expect(storage.saveSnippets).toHaveBeenCalled();
  });

  it('skips duplicates when overwrite is false', () => {
    storage.loadSnippets.mockReturnValue([{ id: 1, title: 'Snap', code: 'old', tags: [] }]);
    const data = JSON.stringify([{ title: 'Snap', code: 'new' }]);
    jest.spyOn(require('fs'), 'readFileSync').mockReturnValue(data);
    const result = importSnippets('snippets.json');
    expect(result.skipped).toBe(1);
    expect(result.added).toBe(0);
  });

  it('overwrites duplicates when overwrite is true', () => {
    storage.loadSnippets.mockReturnValue([{ id: 1, title: 'Snap', code: 'old', tags: [] }]);
    const data = JSON.stringify([{ title: 'Snap', code: 'new' }]);
    jest.spyOn(require('fs'), 'readFileSync').mockReturnValue(data);
    const result = importSnippets('snippets.json', { overwrite: true });
    expect(result.added).toBe(1);
    expect(result.skipped).toBe(0);
  });
});
